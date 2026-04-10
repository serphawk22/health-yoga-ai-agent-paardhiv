// Appointment Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { extractAppointmentDetails } from '@/lib/ai';
import { Prisma } from '@prisma/client';
import { applyRateLimit, getClientIdentifierFromHeaders } from '@/lib/security/rate-limit';
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns';

// ==================== TYPES ====================

export interface AppointmentActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

function generateSecureMeetingId(): string {
  return randomBytes(6).toString('hex').toUpperCase();
}

// ==================== GET DOCTORS ====================

export async function getDoctors(specialization?: string): Promise<AppointmentActionResult> {
  try {
    const where: any = { isActive: true };
    if (specialization) {
      where.specialization = specialization;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        availability: true,
      },
      orderBy: { rating: 'desc' },
    });

    return { success: true, data: doctors };
  } catch (error) {
    console.error('Get doctors error:', error);
    return { success: false, error: 'Failed to get doctors' };
  }
}

// ==================== GET DOCTOR AVAILABILITY ====================

export async function getDoctorAvailability(
  doctorId: string,
  date: string
): Promise<AppointmentActionResult> {
  try {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get doctor's availability for this day
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (availability.length === 0) {
      return { success: true, data: { slots: [], message: 'No availability on this day' } };
    }

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledDate: selectedDate,
        status: { notIn: ['CANCELLED'] },
      },
      select: { scheduledTime: true },
    });

    const bookedTimes = new Set(existingAppointments.map((a: any) => a.scheduledTime));

    // Generate available slots
    const slots: { time: string; available: boolean }[] = [];

    for (const avail of availability) {
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

        slots.push({
          time: timeStr,
          available: !bookedTimes.has(timeStr),
        });

        // Add slot duration
        currentMin += avail.slotDuration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    }

    return { success: true, data: { slots } };
  } catch (error) {
    console.error('Get availability error:', error);
    return { success: false, error: 'Failed to get availability' };
  }
}

// ==================== EXTRACT APPOINTMENT FROM NATURAL LANGUAGE ====================

export async function extractAppointmentFromText(
  text: string
): Promise<AppointmentActionResult> {
  try {
    const extraction = await extractAppointmentDetails(text);

    // Validate extracted date
    const extractedDate = new Date(extraction.date);
    const today = startOfDay(new Date());

    if (isBefore(extractedDate, today)) {
      return {
        success: false,
        error: 'Cannot book appointments in the past',
        data: extraction,
      };
    }

    // Try to find matching doctor if name provided
    let doctor = null;
    if (extraction.doctorName) {
      doctor = await prisma.doctor.findFirst({
        where: {
          name: { contains: extraction.doctorName, mode: 'insensitive' },
          isActive: true,
        },
      });
    }

    return {
      success: true,
      data: {
        ...extraction,
        doctor,
      },
    };
  } catch (error) {
    console.error('Extract appointment error:', error);
    return { success: false, error: 'Failed to extract appointment details' };
  }
}

// ==================== CREATE APPOINTMENT ====================

export async function createAppointment(formData: FormData): Promise<AppointmentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const incomingHeaders = await headers();
    const identifier = getClientIdentifierFromHeaders(incomingHeaders);
    const rateLimit = await applyRateLimit({
      key: `appointments:create:${user.id}:${identifier}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return { success: false, error: 'Too many appointment requests. Please try again later.' };
    }

    const doctorId = formData.get('doctorId') as string;
    const scheduledDate = formData.get('scheduledDate') as string;
    const scheduledTime = formData.get('scheduledTime') as string;
    const reason = formData.get('reason') as string;
    const type = formData.get('type') as any || 'CONSULTATION';
    const originalQuery = formData.get('originalQuery') as string;
    const extractedIntent = formData.get('extractedIntent') as string;

    // Validate inputs
    if (!doctorId || !scheduledDate || !scheduledTime) {
      return { success: false, error: 'Missing required fields' };
    }

    if (reason && reason.length > 1000) {
      return { success: false, error: 'Reason is too long.' };
    }

    if (originalQuery && originalQuery.length > 2000) {
      return { success: false, error: 'Original query is too long.' };
    }

    if (extractedIntent && extractedIntent.length > 2000) {
      return { success: false, error: 'Extracted intent is too long.' };
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(scheduledTime)) {
      return { success: false, error: 'Invalid time format.' };
    }

    // Parse date
    const appointmentDate = new Date(scheduledDate);
    if (!isValid(appointmentDate)) {
      return { success: false, error: 'Invalid date' };
    }

    if (isBefore(startOfDay(appointmentDate), startOfDay(new Date()))) {
      return { success: false, error: 'Cannot create appointments in the past.' };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, isActive: true },
    });

    if (!doctor || !doctor.isActive) {
      return { success: false, error: 'Selected doctor is not available.' };
    }

    // Create appointment with serializable transaction to reduce slot race conditions
    // and collision-safe meeting ID generation.
    let appointment: any = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const meetingId = generateSecureMeetingId();

      try {
        appointment = await prisma.$transaction(async (tx) => {
          const existingAppointment = await tx.appointment.findFirst({
            where: {
              doctorId,
              scheduledDate: appointmentDate,
              scheduledTime,
              status: { notIn: ['CANCELLED'] },
            },
            select: { id: true },
          });

          if (existingAppointment) {
            throw new Error('SLOT_TAKEN');
          }

          return tx.appointment.create({
            data: {
              userId: user.id,
              doctorId,
              scheduledDate: appointmentDate,
              scheduledTime,
              reason,
              type,
              originalQuery,
              extractedIntent,
              status: 'CONFIRMED',
              meetingId,
            },
            include: {
              doctor: true,
            },
          });
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
        break;
      } catch (error) {
        if (error instanceof Error && error.message === 'SLOT_TAKEN') {
          return { success: false, error: 'This time slot is no longer available' };
        }

        const isMeetingIdCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          (error.meta?.target as string[]).includes('meetingId');

        const isSerializationConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        if (!isMeetingIdCollision && !isSerializationConflict) {
          throw error;
        }
      }
    }

    if (!appointment) {
      return { success: false, error: 'Failed to create a secure meeting ID. Please retry.' };
    }

    revalidatePath('/appointments');
    revalidatePath('/dashboard');

    return { success: true, data: appointment };
  } catch (error) {
    console.error('Create appointment error:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}

// ==================== GET USER APPOINTMENTS ====================

export async function getUserAppointments(): Promise<AppointmentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: { doctor: true },
      orderBy: { scheduledDate: 'desc' },
    });

    return { success: true, data: appointments };
  } catch (error) {
    console.error('Get appointments error:', error);
    return { success: false, error: 'Failed to get appointments' };
  }
}

// ==================== CANCEL APPOINTMENT ====================

export async function cancelAppointment(appointmentId: string): Promise<AppointmentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: user.id,
      },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return { success: false, error: 'Failed to cancel appointment' };
  }
}

// ==================== COMPLETE APPOINTMENT ====================

export async function completeAppointment(appointmentId: string): Promise<AppointmentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if appointment exists and involves the current user (doctor or patient)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true }
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    revalidatePath('/appointments');
    revalidatePath('/doctor');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Complete appointment error:', error);
    return { success: false, error: 'Failed to complete appointment' };
  }
}

// ==================== GET BY MEETING ID ====================

export async function getAppointmentByMeetingId(meetingId: string): Promise<AppointmentActionResult> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { meetingId },
      include: {
        doctor: true,
        user: true
      },
    });

    if (!appointment) {
      return { success: false, error: 'Meeting not found' };
    }

    return { success: true, data: appointment };
  } catch (error) {
    console.error('Get by meeting ID error:', error);
    return { success: false, error: 'Failed to find meeting' };
  }
}

// ==================== GET SPECIALIZATIONS ====================

export async function getSpecializations(): Promise<AppointmentActionResult> {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      select: { specialization: true },
      distinct: ['specialization'],
    });

    const specializations = doctors.map((d: any) => d.specialization);
    return { success: true, data: specializations };
  } catch (error) {
    console.error('Get specializations error:', error);
    return { success: false, error: 'Failed to get specializations' };
  }
}
