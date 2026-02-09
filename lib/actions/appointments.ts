// Appointment Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { extractAppointmentDetails } from '@/lib/ai';
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns';

// ==================== TYPES ====================

export interface AppointmentActionResult {
  success: boolean;
  error?: string;
  data?: any;
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

    // Parse date
    const appointmentDate = new Date(scheduledDate);
    if (!isValid(appointmentDate)) {
      return { success: false, error: 'Invalid date' };
    }

    // Check if slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledDate: appointmentDate,
        scheduledTime,
        status: { notIn: ['CANCELLED'] },
      },
    });

    if (existingAppointment) {
      return { success: false, error: 'This time slot is no longer available' };
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
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
      },
      include: {
        doctor: true,
      },
    });

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
