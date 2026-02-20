import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const meteredDomain = process.env.NEXT_PUBLIC_METERED_DOMAIN;
        const apiKey = process.env.METERED_API_KEY;

        // 1. Try fetching dynamic credentials from Metered if possible
        if (meteredDomain && apiKey) {
            try {
                // Try v1 API
                const response = await fetch(
                    `https://${meteredDomain}/api/v1/turn/credentials?apiKey=${apiKey}`,
                    { next: { revalidate: 3600 } }
                );

                if (response.ok) {
                    const iceServers = await response.json();
                    if (Array.isArray(iceServers) && iceServers.length > 0) {
                        return NextResponse.json({ iceServers });
                    }
                }
            } catch (e) {
                console.warn('Metered dynamic API failed:', e);
            }
        }

        // 2. Fallback to Open Relay Project (Free TURN servers by Metered)
        // These are public and work without a specific account plan for testing
        const iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:80?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
            {
                urls: 'turns:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject',
            },
        ];

        return NextResponse.json({ iceServers });
    } catch (error) {
        console.error('Error in turn-credentials API:', error);
        return NextResponse.json({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
            ]
        }, { status: 500 });
    }
}
