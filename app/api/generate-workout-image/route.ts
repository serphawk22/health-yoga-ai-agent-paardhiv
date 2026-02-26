import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { exercises, type } = body as {
            exercises: Array<{
                name: string;
                sets?: number;
                reps?: string;
                duration?: string;
                targetMuscle?: string;
                targetArea?: string;
                englishName?: string;
                sanskritName?: string;
            }>;
            type: 'WORKOUT' | 'YOGA';
        };

        if (!exercises || exercises.length === 0) {
            return NextResponse.json({ error: 'No exercises provided' }, { status: 400 });
        }

        // Build a descriptive list of each exercise
        const exerciseLines = exercises.map((ex, i) => {
            if (type === 'YOGA') {
                const name = ex.englishName || ex.name;
                const meta = ex.duration ? `${ex.duration}` : '1 min hold';
                const area = ex.targetArea || '';
                return `${i + 1}. ${name}${area ? ` (${area})` : ''} — ${meta}`;
            } else {
                const sets = ex.sets || 3;
                const reps = ex.reps || '10-12';
                const muscle = ex.targetMuscle ? ` — ${ex.targetMuscle}` : '';
                return `${i + 1}. ${ex.name}${muscle} — ${sets} sets × ${reps} reps`;
            }
        });

        const exerciseCount = exercises.length;
        const cols = exerciseCount <= 4 ? 2 : exerciseCount <= 6 ? 3 : 4;
        const planType = type === 'YOGA' ? 'yoga poses' : 'gym exercises';
        const styleNote = type === 'YOGA'
            ? 'serene, clean yoga infographic style. Show human silhouettes in each yoga pose with calm white/blue tones on a dark background.'
            : 'high-contrast gym workout poster style. Show muscular anatomical figures performing each exercise with red muscle highlights on a dark background.';

        const prompt = `Create a professional fitness infographic image showing ${exerciseCount} ${planType} arranged in a ${cols}-column grid. 

Each grid cell must show:
- A clear illustration of a person performing the exercise
- The exercise name as a bold label at the top of the cell
- The sets and reps (or duration) as smaller text at the bottom

Exercises to show:
${exerciseLines.join('\n')}

Visual style: ${styleNote}
Layout: Neat equal-sized cells in a ${cols}×${Math.ceil(exerciseCount / cols)} grid, dark (#111) background, white text labels, thin divider lines between cells. 
Overall look: Similar to professional workout poster designs found in gyms. Clear, readable text, high quality illustration.`;

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
