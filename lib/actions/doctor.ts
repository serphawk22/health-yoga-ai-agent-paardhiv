'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export interface DoctorActionResult {
    success: boolean;
    error?: string;
    data?: any;
}

// ==================== DOCTOR PROFILE ====================

export async function getDoctorProfile(): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
            include: { availability: true },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        return { success: true, data: doctor };
    } catch (error) {
        console.error('Get doctor profile error:', error);
        return { success: false, error: 'Failed to get doctor profile' };
    }
}

export async function updateDoctorProfile(data: any): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                specialization: data.specialization,
                bio: data.bio,
                consultationFee: parseFloat(data.consultationFee),
                experience: parseInt(data.experience),
            },
        });

        revalidatePath('/dashboard/doctor');
        return { success: true, data: updatedDoctor };
    } catch (error) {
        console.error('Update doctor profile error:', error);
        return { success: false, error: 'Failed to update doctor profile' };
    }
}

export async function updateUserIdentity(data: { name: string; email: string; role: string; location?: string }): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        // For this demo, we'll update the User's name/email/role. 
        // Realistically, Role changes might need stricter security checks.
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role as any, // assuming PATIENT|DOCTOR|YOGA_INSTRUCTOR
            }
        });

        revalidatePath('/doctor/profile');
        return { success: true };
    } catch (error) {
        console.error('Update user identity error:', error);
        return { success: false, error: 'Failed to update user identity' };
    }
}

// ==================== AVAILABILITY ====================

export async function getDoctorAvailability(): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        const availability = await prisma.doctorAvailability.findMany({
            where: { doctorId: doctor.id },
            orderBy: { dayOfWeek: 'asc' },
        });

        return { success: true, data: availability };
    } catch (error) {
        console.error('Get availability error:', error);
        return { success: false, error: 'Failed to get availability' };
    }
}

export async function updateDoctorAvailability(availabilityData: any[]): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        // Use transaction to update all availability slots
        await prisma.$transaction(async (tx) => {
            // Delete existing availability
            await tx.doctorAvailability.deleteMany({
                where: { doctorId: doctor.id },
            });

            // Create new availability
            if (availabilityData.length > 0) {
                await tx.doctorAvailability.createMany({
                    data: availabilityData.map((slot) => ({
                        doctorId: doctor.id,
                        dayOfWeek: slot.dayOfWeek,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isActive: slot.isActive,
                    })),
                });
            }
        });

        revalidatePath('/dashboard/doctor');
        return { success: true };
    } catch (error) {
        console.error('Update availability error:', error);
        return { success: false, error: 'Failed to update availability' };
    }
}
// ==================== DASHBOARD STATS ====================

export async function getDoctorStats(): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [upcomingCount, totalPatients, patientsTreatedToday] = await Promise.all([
            // Upcoming Appointments (PENDING or CONFIRMED from now onwards)
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    scheduledDate: { gte: today },
                },
            }),
            // Total Unique Patients ever
            prisma.appointment.findMany({
                where: { doctorId: doctor.id },
                select: { userId: true },
                distinct: ['userId'],
            }).then(res => res.length),
            // Patients Treated Today (COMPLETED today)
            prisma.appointment.count({
                where: {
                    doctorId: doctor.id,
                    status: 'COMPLETED',
                    scheduledDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
        ]);

        return {
            success: true,
            data: {
                upcomingAppointments: upcomingCount,
                totalPatients: totalPatients,
                patientsTreatedToday: patientsTreatedToday,
            },
        };

    } catch (error) {
        console.error('Get doctor stats error:', error);
        return { success: false, error: 'Failed to get doctor stats' };
    }
}

export async function getDoctorTodayAppointments(): Promise<DoctorActionResult> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const doctor = await prisma.doctor.findFirst({
            where: { userId: user.id },
        });

        if (!doctor) {
            return { success: false, error: 'Doctor profile not found' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,
                scheduledDate: {
                    gte: today,
                    lt: tomorrow,
                },
                status: 'CONFIRMED'
            },
            include: {
                user: true
            },
            orderBy: {
                scheduledTime: 'asc'
            }
        });

        return { success: true, data: appointments };
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        return { success: false, error: 'Failed to get doctor appointments' };
    }
}
