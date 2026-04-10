
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

const isTestEndpointEnabled = process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_ENDPOINTS === 'true';

export async function POST(req: NextRequest) {
    if (!isTestEndpointEnabled) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    try {
        const identifier = getClientIdentifier(req);
        const rateLimit = await applyRateLimit({
            key: `test-setup:${identifier}`,
            limit: 10,
            windowMs: 60 * 1000,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
        }

        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

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
