// Chat Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { healthChat, ChatMessage } from '@/lib/ai';
import { applyRateLimit, getClientIdentifierFromHeaders } from '@/lib/security/rate-limit';

// ==================== TYPES ====================

export interface ChatActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

const MAX_CHAT_MESSAGE_LENGTH = 4000;
const MAX_ATTACHMENT_NAME_LENGTH = 160;
const MAX_ATTACHMENT_TEXT_LENGTH = 20_000;
const MAX_ATTACHMENT_BASE64_LENGTH = 6_000_000;

function validateChatInput(
  message: string,
  attachment?: { type: string; name: string; mimeType: string; base64?: string; content?: string }
): string | null {
  const normalizedMessage = message.trim();

  if (!normalizedMessage && !attachment) {
    return 'Please enter a message.';
  }

  if (normalizedMessage.length > MAX_CHAT_MESSAGE_LENGTH) {
    return `Message is too long. Please keep it under ${MAX_CHAT_MESSAGE_LENGTH} characters.`;
  }

  if (!attachment) {
    return null;
  }

  if (!attachment.name || attachment.name.length > MAX_ATTACHMENT_NAME_LENGTH) {
    return 'Attachment name is invalid or too long.';
  }

  if (attachment.content && attachment.content.length > MAX_ATTACHMENT_TEXT_LENGTH) {
    return 'Attached text content is too large.';
  }

  if (attachment.base64 && attachment.base64.length > MAX_ATTACHMENT_BASE64_LENGTH) {
    return 'Attached file is too large.';
  }

  return null;
}

async function enforceChatRateLimit(userId: string, hasAttachment: boolean): Promise<string | null> {
  const incomingHeaders = await headers();
  const identifier = getClientIdentifierFromHeaders(incomingHeaders);

  const messageRateLimit = await applyRateLimit({
    key: `chat:messages:${userId}:${identifier}`,
    limit: 40,
    windowMs: 60 * 1000,
  });

  if (!messageRateLimit.allowed) {
    return 'Too many messages sent in a short time. Please wait and try again.';
  }

  if (hasAttachment) {
    const attachmentRateLimit = await applyRateLimit({
      key: `chat:attachments:${userId}:${identifier}`,
      limit: 10,
      windowMs: 60 * 1000,
    });

    if (!attachmentRateLimit.allowed) {
      return 'Too many attachment messages sent. Please wait and try again.';
    }
  }

  return null;
}

// ==================== SEND MESSAGE ====================

export async function sendChatMessage(
  message: string,
  sessionId?: string,
  attachment?: { type: string, name: string, mimeType: string, base64?: string, content?: string }
): Promise<ChatActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const inputError = validateChatInput(message, attachment);
    if (inputError) {
      return { success: false, error: inputError };
    }

    const rateLimitError = await enforceChatRateLimit(user.id, !!attachment);
    if (rateLimitError) {
      return { success: false, error: rateLimitError };
    }

    const normalizedMessage = message.trim() || 'Please analyze this report.';

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
    let storageContent = normalizedMessage;
    if (attachment) {
      storageContent += `\n\n[ATTACHED ${attachment.type.toUpperCase()}: ${attachment.name}]`;
    }

    await prisma.chatHistory.create({
      data: {
        userId: user.id,
        sessionId: chatSessionId,
        role: 'USER',
        content: storageContent,
      },
    });

    // Generate AI response
    const aiResponse = await healthChat(normalizedMessage, chatHistory, healthProfile, attachment);

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
  return `chat_${Date.now()}_${randomUUID().slice(0, 8)}`;
}
