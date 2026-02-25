'use client';

// Health Chat Page
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory, getChatSessions, deleteChatSession } from '@/lib/actions/chat';
import { Send, Loader2, Bot, User, Plus, MessageCircle, Trash2, AlertCircle, Download, Sparkles, ChevronLeft, History } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle
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
        createdAt: new Date(m.createdAt),
      })));
      setShowSidebar(false); // Close sidebar on mobile after selection
    }
  }

  function startNewChat() {
    setSessionId(null);
    setMessages([]);
    setShowSidebar(false);
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
          // Refresh sessions list to show the new one
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
      // Focus back on input after delay to allow mobile keyboard to settle
      setTimeout(() => inputRef.current?.focus(), 100);
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
    <div className="h-[calc(100vh-6rem)] bg-black flex overflow-hidden relative">

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="lg:hidden absolute inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "absolute lg:relative z-50 w-80 h-full bg-zinc-950/50 backdrop-blur-3xl border-r border-zinc-800 transition-transform duration-300 ease-in-out flex flex-col transform",
        showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 pt-8 bg-transparent sticky top-0 z-20">
          <GradientButton
            variant="variant"
            onClick={startNewChat}
            className="w-full text-sm py-4 h-auto min-w-0 shadow-lg shadow-black/40 border border-white/5 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </GradientButton>
        </div>

        {/* Sessions List Label */}
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Recent Conversations</p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-1">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => loadSessionHistory(session.sessionId)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl text-sm transition-all duration-300 group relative",
                  sessionId === session.sessionId
                    ? 'bg-primary-500/10 text-primary-400 font-semibold'
                    : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                    sessionId === session.sessionId
                      ? "bg-primary-500/20 text-primary-400"
                      : "bg-zinc-900/50 text-zinc-600 group-hover:bg-zinc-800 group-hover:text-zinc-400"
                  )}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="truncate flex-1">{session.content.slice(0, 35) || 'New Conversation'}...</span>
                </div>
                {sessionId === session.sessionId && (
                  <motion.div
                    layoutId="active-session"
                    className="absolute inset-0 border border-primary-500/20 rounded-2xl z-0"
                  />
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <History className="w-10 h-10 mb-3 opacity-10" />
              <p className="text-sm font-medium opacity-50">No chats yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-black">

        {/* Chat Header */}
        <div className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <History className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-900/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-zinc-100 flex items-center gap-2">
                  Health Assistant
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h1>
                <p className="text-xs text-zinc-500 font-medium">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleExport}
                className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Export Chat"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {sessionId && (
              <button
                onClick={handleDelete}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl shadow-black/50 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Bot className="w-10 h-10 text-primary-500" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Hello! How can I help you today?
              </h2>
              <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
                I can help you with health questions, diet advice, workout plans, and more.
                My responses are personalized based on your health profile.
              </p>


              {/* Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  '🥗 What foods boost energy?',
                  '😴 Tips for better sleep',
                  '🧘 How to reduce stress?',
                  '💪 Simple home exercises',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion.substring(2).trim())} // Remove emoji for input
                    className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all text-left flex items-center gap-2"
                  >
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 animate-slideUp",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] p-4 shadow-md",
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm'
                    )}
                  >
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div className={cn(
                      "text-[10px] mt-2 opacity-50",
                      message.role === 'user' ? 'text-primary-100' : 'text-zinc-500'
                    )}>
                      {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-black via-black to-transparent pt-10 sticky bottom-0 z-30">
          <div className="max-w-3xl mx-auto relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500" />

            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2 shadow-2xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about health, diet, exercise..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-500 resize-none min-h-[44px] max-h-32 py-3 px-3 custom-scrollbar"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 flex items-center justify-center mb-0.5",
                  !input.trim() || isLoading
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/30"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-zinc-600 mt-3">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
