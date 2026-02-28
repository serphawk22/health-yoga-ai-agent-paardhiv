'use client';

// Health Chat Page
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory, getChatSessions, deleteChatSession } from '@/lib/actions/chat';
import { Send, Loader2, Bot, User, Plus, MessageCircle, Trash2, Download, Sparkles, History } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ColorBends from '@/components/ui/ColorBends';

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
  const [showSidebar, setShowSidebar] = useState(false);
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
      setShowSidebar(false);
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

        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: result.data.response,
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
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
    <div className="relative min-h-[calc(100vh-6rem)] w-full text-zinc-100 overflow-hidden pb-12 lg:pb-0 font-sans">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto h-[calc(100vh-8rem)] mt-2 lg:mt-6 px-4 lg:px-6 flex gap-6">

        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Panel */}
        <div className={cn(
          "fixed lg:relative z-50 w-[280px] lg:w-[320px] h-full flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden",
          showSidebar ? "translate-x-0 left-4" : "-translate-x-[120%] lg:translate-x-0"
        )}>
          {/* Sidebar Header */}
          <div className="p-6 pb-2 border-b border-zinc-800">
            <GradientButton
              variant="variant"
              onClick={startNewChat}
              className="w-full justify-center shadow-lg active:scale-95 transition-all text-sm font-semibold py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Conversation
            </GradientButton>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            <p className="px-3 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Chat History</p>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  key={session.sessionId}
                  onClick={() => loadSessionHistory(session.sessionId)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl text-sm transition-all duration-300 flex items-center gap-3 relative overflow-hidden group",
                    sessionId === session.sessionId
                      ? 'bg-zinc-800/80 text-white font-medium border border-zinc-700 shadow-inner'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent hover:border-zinc-800'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-colors shrink-0",
                    sessionId === session.sessionId
                      ? "bg-primary-500/20 text-primary-400"
                      : "bg-zinc-900 text-zinc-500 group-hover:text-zinc-400 group-hover:bg-zinc-800"
                  )}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="truncate flex-1 relative z-10 leading-tight">{session.content || 'New Conversation'}</span>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <History className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-sm font-medium opacity-50">No chat history</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Panel */}
        <div className="flex-1 h-full rounded-3xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">

          {/* Header */}
          <div className="h-20 border-b border-white/10 px-6 sm:px-8 flex items-center justify-between bg-white/[0.02] backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-colors"
              >
                <History className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 p-[1px] shadow-lg shadow-primary-500/20">
                  <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="font-semibold text-xl text-white flex items-center gap-2 leading-tight tracking-tight">
                    Health Agent
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h1>
                  <p className="text-sm text-zinc-400 font-medium">AI Wellness Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleExport}
                  className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                  title="Export Chat"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              {sessionId && (
                <button
                  onClick={handleDelete}
                  className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 scroll-smooth will-change-scroll">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 animate-fadeIn">
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Bot className="w-10 h-10 text-primary-500 relative z-10" />
                </div>

                <h2 className="text-3xl font-medium tracking-tight text-white mb-4">
                  How can I guide you today?
                </h2>
                <p className="text-zinc-400 text-base mb-12 leading-relaxed max-w-md mx-auto">
                  I can analyze your health data, build workout routines, suggest diet plans, and answer wellness queries in detail.
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                  {[
                    'Design a high protein diet for me',
                    'Give me a 15-min core workout',
                    'How can I improve my sleep?',
                    'Suggest yoga poses for posture',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="p-5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.1] hover:text-white hover:border-white/20 transition-all text-left font-medium hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 pb-8">
                {messages.map((message) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={message.id}
                    className={cn(
                      "flex gap-4 sm:gap-6",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <Bot className="w-5 h-5 text-primary-400" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[90%] sm:max-w-[80%] px-6 py-5 shadow-2xl text-[15px] leading-relaxed",
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-3xl rounded-tr-lg border border-white/10 shadow-lg'
                          : 'bg-white/5 backdrop-blur-md border border-white/10 text-zinc-100 rounded-3xl rounded-tl-lg shadow-md'
                      )}
                    >
                      <div className="prose prose-invert prose-p:leading-relaxed prose-sm max-w-none whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className={cn(
                        "text-[10px] mt-4 font-bold uppercase tracking-widest",
                        message.role === 'user' ? 'text-primary-200' : 'text-zinc-500'
                      )}>
                        {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <User className="w-5 h-5 text-zinc-300" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 sm:gap-6 animate-pulse pt-2">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl rounded-tl-lg px-6 py-6 flex items-center gap-2.5 shadow-xl h-[68px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Input Box Area */}
          <div className="p-4 sm:p-6 bg-white/[0.01] backdrop-blur-xl sticky bottom-0 z-30 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative flex items-end gap-3 bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-xl transition-all hover:border-white/20 focus-within:bg-white/[0.08] focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/10">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-500 resize-none min-h-[48px] max-h-32 py-3 px-4 text-[15px] custom-scrollbar"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-12 h-12 rounded-[14px] transition-all duration-300 flex items-center justify-center shrink-0 font-medium",
                    !input.trim() || isLoading
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/25 active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-1" />
                  )}
                </button>
              </form>
              <p className="text-center text-xs text-zinc-600 mt-4 font-medium tracking-wide pb-1">
                AI responses are generated based on available knowledge. Always verify critical advice with a professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
