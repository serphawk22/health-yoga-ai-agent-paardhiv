import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const meteredDomain = process.env.NEXT_PUBLIC_METERED_DOMAIN;
        const apiKey = process.env.METERED_API_KEY;

        // 1. Try fetching dynamic TURN credentials from Metered
        // This is the RECOMMENDED path — dynamic credentials are time-limited and always valid.
        if (meteredDomain && apiKey) {
            try {
                const response = await fetch(
                    `https://${meteredDomain}/api/v1/turn/credentials?apiKey=${apiKey}`,
                    { cache: 'no-store' } // Always fetch fresh credentials
                );

                if (response.ok) {
                    const meteredServers = await response.json();
                    if (Array.isArray(meteredServers) && meteredServers.length > 0) {
                        // Prepend STUN servers + append the dynamic TURN credentials
                        const iceServers: RTCIceServer[] = [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:global.stun.twilio.com:3478' },
                            ...meteredServers,
                        ];
                        console.log(`[TURN] Fetched ${meteredServers.length} dynamic TURN servers from Metered`);
                        return NextResponse.json({ iceServers });
                    }
                } else {
                    console.warn(`[TURN] Metered API returned ${response.status}: ${response.statusText}`);
                }
            } catch (e) {
                console.warn('[TURN] Metered dynamic API failed:', e);
            }
        } else {
            console.warn('[TURN] NEXT_PUBLIC_METERED_DOMAIN or METERED_API_KEY not set — TURN relay will NOT work across different networks!');
        }

        // 2. Fallback: STUN-only (works on same network, fails across NAT/firewalls)
        // To fix cross-network calls, sign up at https://www.metered.ca/
        // and set NEXT_PUBLIC_METERED_DOMAIN + METERED_API_KEY env vars.
        const iceServers: RTCIceServer[] = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
        ];

        return NextResponse.json({ iceServers, turnMissing: true });
    } catch (error) {
        console.error('[TURN] Error in turn-credentials API:', error);
        return NextResponse.json({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
            ],
            turnMissing: true,
        }, { status: 500 });
    }
}
