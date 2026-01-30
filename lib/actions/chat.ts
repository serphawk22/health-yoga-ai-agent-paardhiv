// Chat Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { healthChat, ChatMessage } from '@/lib/ai/gemini';

// ==================== TYPES ====================

export interface ChatActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ==================== SEND MESSAGE ====================

export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Generate or use existing session ID
    const chatSessionId = sessionId || generateSessionId();

    // Get chat history for this session
    const historyRecords = await prisma.chatHistory.findMany({
      where: {
        userId: user.id,
        sessionId: chatSessionId,
      },
      orderBy: { createdAt: 'asc' },
      take: 20, // Limit context window
    });

    const chatHistory: ChatMessage[] = historyRecords.map((record: any) => ({
      role: record.role === 'USER' ? 'user' : 'assistant',
      content: record.content,
    }));

    // Get user's health profile
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    // Save user message
    await prisma.chatHistory.create({
      data: {
        userId: user.id,
        sessionId: chatSessionId,
        role: 'USER',
        content: message,
      },
    });

    // Generate AI response
    const aiResponse = await healthChat(message, chatHistory, healthProfile);

    // Save AI response
    await prisma.chatHistory.create({
      data: {
        userId: user.id,
        sessionId: chatSessionId,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    });

    return {
      success: true,
      data: {
        response: aiResponse,
        sessionId: chatSessionId,
      },
    };
  } catch (error) {
    console.error('Chat error:', error);
    return { success: false, error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== GET CHAT HISTORY ====================

export async function getChatHistory(sessionId?: string): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const where: any = { userId: user.id };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const history = await prisma.chatHistory.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, data: history };
  } catch (error) {
    console.error('Get history error:', error);
    return { success: false, error: 'Failed to get chat history' };
  }
}

// ==================== GET CHAT SESSIONS ====================

export async function getChatSessions(): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get unique sessions with their first message
    const sessions = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      distinct: ['sessionId'],
      orderBy: { createdAt: 'desc' },
      select: {
        sessionId: true,
        content: true,
        createdAt: true,
      },
    });

    return { success: true, data: sessions };
  } catch (error) {
    console.error('Get sessions error:', error);
    return { success: false, error: 'Failed to get chat sessions' };
  }
}

// ==================== DELETE CHAT SESSION ====================

export async function deleteChatSession(sessionId: string): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await prisma.chatHistory.deleteMany({
      where: {
        userId: user.id,
        sessionId,
      },
    });

    revalidatePath('/chat');
    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}

// ==================== CLEAR ALL CHAT HISTORY ====================

export async function clearAllChatHistory(): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await prisma.chatHistory.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath('/chat');
    return { success: true };
  } catch (error) {
    console.error('Clear history error:', error);
    return { success: false, error: 'Failed to clear history' };
  }
}

// ==================== HELPER ====================

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
