
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            const hashedPassword = await hashPassword(password);
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
        }

        const token = await createSession(user.id, user.email, user.name);

        // Return the token so the test script can use it as a cookie
        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error('Test setup error:', error);
        return NextResponse.json({ success: false, error: 'Setup failed' }, { status: 500 });
    }
}
