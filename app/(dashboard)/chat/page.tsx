'use client';

// Health Chat Page

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory, getChatSessions, deleteChatSession } from '@/lib/actions/chat';
import { Send, Loader2, Bot, User, Plus, MessageCircle, Trash2, AlertCircle, Download, FileText } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadSessions() {
    const result = await getChatSessions();
    if (result.success) {
      setSessions(result.data || []);
    }
  }

  async function loadSessionHistory(sid: string) {
    setSessionId(sid);
    const result = await getChatHistory(sid);
    if (result.success && result.data) {
      setMessages(result.data.map((m: any) => ({
        id: m.id,
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
        createdAt: m.createdAt,
      })));
    }
  }

  function startNewChat() {
    setSessionId(null);
    setMessages([]);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const result = await sendChatMessage(userMessage, sessionId || undefined);

      if (result.success && result.data) {
        if (!sessionId) {
          setSessionId(result.data.sessionId);
          loadSessions();
        }

        // Add assistant message
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: result.data.response,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // Show error
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `❌ ${result.error || 'Sorry, I encountered an error. Please try again.'}`,
          createdAt: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.',
        createdAt: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const handleExport = () => {
    if (messages.length === 0) return;

    const chatContent = messages.map(m => `[${m.role.toUpperCase()}] ${m.createdAt.toLocaleString()}\n${m.content}\n`).join('\n---\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!sessionId) return;

    if (confirm('Are you sure you want to delete this conversation?')) {
      const result = await deleteChatSession(sessionId);
      if (result.success) {
        startNewChat();
        loadSessions();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex gap-6 pb-20 lg:pb-0">
      {/* Chat Sessions Sidebar (Desktop) */}
      <div className="hidden lg:flex flex-col w-64 shrink-0">
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-health-border">
            <GradientButton
              onClick={startNewChat}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </GradientButton>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {sessions.length > 0 ? (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => loadSessionHistory(session.sessionId)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      sessionId === session.sessionId
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'hover:bg-white/5 text-health-text'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">{session.content.slice(0, 30)}...</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-health-muted text-center py-4">
                No chat history yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-health-border bg-health-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-health-text">Health Assistant</h1>
              <p className="text-sm text-health-muted">Ask me anything about health & wellness</p>
            </div>
          </div>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleExport}
                className="p-2 text-health-muted hover:text-health-text hover:bg-white/5 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {sessionId && (
              <button
                onClick={handleDelete}
                className="p-2 text-health-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold text-health-text mb-2">
                Hello! I&apos;m your Health Assistant
              </h2>
              <p className="text-health-muted max-w-md mb-6">
                I can help you with health questions, diet advice, exercise tips, and more.
                My responses are personalized based on your health profile.
              </p>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-md">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-400 text-left">
                  <strong>Important:</strong> I provide general wellness information only.
                  This is not medical advice. Always consult healthcare professionals for medical concerns.
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  'What foods help with energy?',
                  'Tips for better sleep',
                  'How to reduce stress?',
                  'Simple home exercises',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 rounded-full border border-health-border text-sm text-health-text hover:bg-white/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary-500" />
                    </div>
                  )}
                  <div
                    className={`${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                      } animate-fadeIn`}
                  >
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-health-muted" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="chat-bubble-assistant">
                    <div className="flex items-center gap-2 text-health-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-health-border bg-health-card">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about health, diet, exercise..."
              className="input flex-1 resize-none min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <GradientButton
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 h-auto"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </GradientButton>
          </form>
        </div>
      </div>
    </div>
  );
}
