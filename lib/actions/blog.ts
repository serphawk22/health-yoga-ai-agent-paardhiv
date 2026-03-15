'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36);
}

export async function generateBlogFromChat(
  userQuery: string,
  aiResponse: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Generate a blog title from the query
    const title = generateBlogTitle(userQuery);
    const slug = generateSlug(title);

    // Parse the AI response into structured sections
    const sections = parseSections(aiResponse, userQuery);

    const blog = await prisma.blog.create({
      data: {
        userId: user.id,
        slug,
        title,
        seoTitle: `${title} - Health Guide`,
        metaDescription: `Learn about ${title.toLowerCase()}. Expert health advice including symptoms, causes, diet recommendations, and lifestyle improvements.`,
        sourceQuery: userQuery,
        symptoms: sections.symptoms,
        possibleCauses: sections.possibleCauses,
        dietRecs: sections.dietRecs,
        lifestyleRecs: sections.lifestyleRecs,
        fullContent: aiResponse,
      },
    });

    revalidatePath('/blogs');
    return { success: true, data: blog };
  } catch (error) {
    console.error('Blog generation error:', error);
    return { success: false, error: 'Failed to generate blog' };
  }
}

export async function getBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true } },
      },
    });
    return { success: true, data: blogs };
  } catch (error) {
    console.error('Get blogs error:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true } },
      },
    });
    if (!blog) return { success: false, error: 'Blog not found' };
    return { success: true, data: blog };
  } catch (error) {
    console.error('Get blog error:', error);
    return { success: false, error: 'Failed to fetch blog' };
  }
}

export async function getUserBlogs() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const blogs = await prisma.blog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: blogs };
  } catch (error) {
    console.error('Get user blogs error:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

function generateBlogTitle(query: string): string {
  const q = query.toLowerCase().trim();

  if (q.includes('tired') || q.includes('low energy') || q.includes('fatigue')) {
    return 'Reasons for Low Energy and Natural Ways to Improve It';
  }
  if (q.includes('headache') || q.includes('head pain')) {
    return 'Understanding Headaches and Natural Relief Methods';
  }
  if (q.includes('sleep') || q.includes('insomnia')) {
    return 'Better Sleep Strategies for Restful Nights';
  }
  if (q.includes('stress') || q.includes('anxiety')) {
    return 'Managing Stress and Anxiety Through Holistic Approaches';
  }
  if (q.includes('weight') || q.includes('lose weight') || q.includes('diet')) {
    return 'Healthy Weight Management Through Balanced Nutrition';
  }
  if (q.includes('back pain') || q.includes('pain')) {
    return 'Natural Approaches to Pain Relief and Recovery';
  }
  if (q.includes('digest') || q.includes('stomach') || q.includes('bloat')) {
    return 'Improving Digestive Health Through Diet and Lifestyle';
  }
  if (q.includes('immunity') || q.includes('immune')) {
    return 'Strengthening Your Immune System Naturally';
  }
  if (q.includes('skin') || q.includes('acne')) {
    return 'Achieving Healthy Skin Through Natural Care';
  }

  // Generic title from query
  const words = query.split(' ').slice(0, 8).join(' ');
  return `Health Insights: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
}

function parseSections(aiResponse: string, query: string) {
  // Extract meaningful content from AI response for blog sections
  const lines = aiResponse.split('\n').filter(l => l.trim());

  let symptoms = '';
  let possibleCauses = '';
  let dietRecs = '';
  let lifestyleRecs = '';

  let currentSection = '';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('symptom') || lower.includes('sign')) {
      currentSection = 'symptoms';
    } else if (lower.includes('cause') || lower.includes('reason') || lower.includes('why')) {
      currentSection = 'causes';
    } else if (lower.includes('diet') || lower.includes('food') || lower.includes('nutrition') || lower.includes('eat')) {
      currentSection = 'diet';
    } else if (lower.includes('lifestyle') || lower.includes('sleep') || lower.includes('exercise') || lower.includes('hydrat') || lower.includes('tip')) {
      currentSection = 'lifestyle';
    }

    switch (currentSection) {
      case 'symptoms': symptoms += line + '\n'; break;
      case 'causes': possibleCauses += line + '\n'; break;
      case 'diet': dietRecs += line + '\n'; break;
      case 'lifestyle': lifestyleRecs += line + '\n'; break;
    }
  }

  // Fallback: if no sections detected, use the full content
  if (!symptoms && !possibleCauses && !dietRecs && !lifestyleRecs) {
    const third = Math.ceil(lines.length / 4);
    symptoms = lines.slice(0, third).join('\n');
    possibleCauses = lines.slice(third, third * 2).join('\n');
    dietRecs = lines.slice(third * 2, third * 3).join('\n');
    lifestyleRecs = lines.slice(third * 3).join('\n');
  }

  return { symptoms, possibleCauses, dietRecs, lifestyleRecs };
}
