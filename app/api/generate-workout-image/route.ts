import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type VisualExercise = {
    name: string;
    sets?: number;
    reps?: string;
    duration?: string;
    targetMuscle?: string;
    targetArea?: string;
    englishName?: string;
    sanskritName?: string;
    description?: string;
    instructions?: string[];
};

export async function POST(request: NextRequest) {
    try {
        const identifier = getClientIdentifier(request);
        const rateLimit = await applyRateLimit({
            key: `generate-workout-image:${identifier}`,
            limit: 5,
            windowMs: 10 * 60 * 1000,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimit.retryAfterSeconds),
                        'X-RateLimit-Limit': String(rateLimit.limit),
                        'X-RateLimit-Remaining': String(rateLimit.remaining),
                        'X-RateLimit-Reset': String(rateLimit.resetAt),
                    },
                }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Image generation is not configured' }, { status: 503 });
        }

        const body = await request.json();
        const { exercises, type } = body as {
            exercises: VisualExercise[];
            type: 'WORKOUT' | 'YOGA';
        };

        if (!exercises || exercises.length === 0) {
            return NextResponse.json({ error: 'No exercises provided' }, { status: 400 });
        }

        if (exercises.length > 20) {
            return NextResponse.json({ error: 'Too many exercises in one request' }, { status: 400 });
        }

        // The app renders readable labels below the image. The generated image
        // should focus on accurate body position instead of tiny text.
        const exerciseLines = exercises.map((ex, i) => {
            if (type === 'YOGA') {
                const name = ex.englishName || ex.name;
                const meta = ex.duration ? `${ex.duration}` : '1 min hold';
                const area = ex.targetArea || '';
                const cue = ex.instructions?.slice(0, 2).join(' ') || area || 'show the final yoga posture clearly';
                return `Panel ${i + 1}: ${name}${area ? ` for ${area}` : ''}. Hold: ${meta}. Body cues: ${cue}`;
            }

            const sets = ex.sets || 3;
            const reps = ex.reps || '10-12';
            const muscle = ex.targetMuscle ? ` targeting ${ex.targetMuscle}` : '';
            const cue = ex.description || 'show the start-to-finish movement with clear limb placement';
            return `Panel ${i + 1}: ${ex.name}${muscle}. Prescription: ${sets} sets x ${reps} reps. Body cues: ${cue}`;
        });

        const exerciseCount = exercises.length;
        const cols = exerciseCount <= 4 ? 2 : exerciseCount <= 6 ? 3 : 4;
        const planType = type === 'YOGA' ? 'yoga poses' : 'gym exercises';
        const styleNote = type === 'YOGA'
            ? 'serene, clean yoga guide style. Show realistic human silhouettes in each exact pose with calm white and blue tones on a dark background.'
            : 'high-contrast gym movement guide style. Show athletic figures performing each exact exercise with clear posture and subtle red highlights on the target muscles.';

        const prompt = `Create a professional fitness visual guide showing ${exerciseCount} ${planType} arranged in a ${cols}-column grid.

Each grid cell must show:
- A clear full-body illustration of a person performing the exact exercise or yoga pose
- Accurate joint position, limb direction, and body alignment for the named movement
- Simple motion arrows only when the exercise needs movement direction

Exercises to show:
${exerciseLines.join('\n')}

Visual style: ${styleNote}
Layout: Neat equal-sized cells in a ${cols} x ${Math.ceil(exerciseCount / cols)} grid, dark #111 background, thin divider lines between cells.
Do not render words, captions, letters, logos, watermarks, or small text inside the image. The app will show labels separately.
Overall look: A clean professional movement poster with accurate visuals, high quality illustration, and no embedded text.`;

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard',
            response_format: 'url',
        });

        const imageUrl = response.data?.[0]?.url;
        if (!imageUrl) {
            return NextResponse.json({ error: 'No image returned from OpenAI' }, { status: 500 });
        }

        return NextResponse.json({ imageUrl });
    } catch (error: any) {
        console.error('Workout image generation error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate image' },
            { status: 500 }
        );
    }
}
