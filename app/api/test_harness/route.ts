
import { NextRequest, NextResponse } from 'next/server';
import * as ChatActions from '@/lib/actions/chat';
import * as AppointmentActions from '@/lib/actions/appointments';
import * as RecommendationActions from '@/lib/actions/recommendations';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

const isTestEndpointEnabled = process.env.NODE_ENV !== 'production' || process.env.ALLOW_TEST_ENDPOINTS === 'true';

export async function POST(req: NextRequest) {
    if (!isTestEndpointEnabled) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    try {
        const identifier = getClientIdentifier(req);
        const rateLimit = await applyRateLimit({
            key: `test-harness:${identifier}`,
            limit: 30,
            windowMs: 60 * 1000,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
        }

        const body = await req.json();
        const { module, action, payload } = body;

        let result;

        if (module === 'chat') {
            if (action === 'sendChatMessage') {
                result = await ChatActions.sendChatMessage(payload.message, payload.sessionId);
            }
        } else if (module === 'appointments') {
            if (action === 'extractAppointmentFromText') {
                result = await AppointmentActions.extractAppointmentFromText(payload.text);
            } else if (action === 'getDoctors') {
                result = await AppointmentActions.getDoctors(payload.specialization);
            } else if (action === 'getDoctorAvailability') {
                result = await AppointmentActions.getDoctorAvailability(payload.doctorId, payload.date);
            }
        } else if (module === 'recommendations') {
            if (action === 'getDietRecommendation') {
                result = await RecommendationActions.getDietRecommendation(payload.specificRequest);
            } else if (action === 'getExerciseRecommendation') {
                result = await RecommendationActions.getExerciseRecommendation(payload.bodyPart, payload.specificRequest);
            } else if (action === 'getYogaRecommendation') {
                result = await RecommendationActions.getYogaRecommendation(payload.bodyPart, payload.condition, payload.specificRequest);
            } else if (action === 'getDiseaseRecommendation') {
                result = await RecommendationActions.getDiseaseRecommendation(payload.condition);
            } else if (action === 'getGoalRecommendation') {
                result = await RecommendationActions.getGoalRecommendation(payload.goal, payload.duration);
            }
        }

        if (result) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ success: false, error: 'Action not found' }, { status: 400 });
        }

    } catch (error) {
        console.error('Test harness error:', error);
        return NextResponse.json({ success: false, error: 'Harness execution failed', details: String(error) }, { status: 500 });
    }
}
