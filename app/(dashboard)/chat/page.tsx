'use client';

// Health Chat Page
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory, getChatSessions, deleteChatSession } from '@/lib/actions/chat';
import { MessageCircle, Plus, History, Paperclip, BrainCircuit, Download, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
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

  function autoResize(target: HTMLTextAreaElement) {
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 140) + 'px';
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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

  const timeStr = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Input Card Content Generator
  const renderInputCard = () => (
    <div className="w-full max-w-[850px] mx-auto bg-black/[0.75] bg-gradient-to-b from-black/[0.60] to-black/[0.85] backdrop-blur-[80px] saturate-[1.5] border border-white/[0.15] rounded-[24px] p-[22px_24px_18px] shadow-[0_8px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 focus-within:shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] focus-within:border-white/[0.25] relative z-20">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          autoResize(e.target);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or make a request…"
        rows={2}
        disabled={isLoading}
        className="w-full bg-transparent border-none outline-none text-white/95 font-sans text-[15px] font-medium resize-none min-h-[52px] max-h-[140px] leading-[1.6] placeholder:text-white/70 caret-[#10b981] custom-scrollbar focus:ring-0"
      />
      <div className="flex items-center justify-end mt-3.5">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#047857] border-none cursor-pointer flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.45)] transition-all hover:scale-105 hover:shadow-[0_6px_24px_rgba(10,185,129,0.6)] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
        >
          {isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px] translate-y-[-1px]">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full overflow-hidden font-sans z-10 flex">
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

      {/* Dark overlay for improved text contrast */}
      <div className="fixed inset-0 z-[-1] bg-black/55 backdrop-blur-[3px] pointer-events-none" />

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col relative w-full">

        {messages.length === 0 ? (
          // Hero state
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[13px] font-normal tracking-[0.08em] text-[rgba(255,255,255,0.55)] mb-5"
            >
              Health AI Assistant
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[clamp(60px,8vw,96px)] font-thin leading-none text-center text-[rgba(255,255,255,0.95)] tracking-[-0.01em] mb-1"
            >
              Namaste,
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[clamp(44px,6vw,70px)] font-thin italic text-center text-[rgba(255,255,255,0.75)] tracking-[0.01em] mb-[52px]"
            >
              How are you?
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[850px]"
            >
              {renderInputCard()}
            </motion.div>
          </div>
        ) : (
          // Chat View
          <div className="flex-1 flex flex-col overflow-hidden pb-8 lg:pb-0">
            {/* Topbar inside chat view */}
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              {messages.length > 0 && (
                <button onClick={handleExport} className="text-white/60 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors" title="Export Chat">
                  <Download className="w-[18px] h-[18px]" />
                </button>
              )}
              {sessionId && (
                <button onClick={handleDelete} className="text-white/60 hover:text-red-400 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors" title="Delete Chat">
                  <Trash2 className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 pt-4 pb-24 flex flex-col gap-7 items-center">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  key={message.id}
                  className={cn(
                    "w-full max-w-[850px] flex gap-[14px]",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#10b981] to-[#047857] border border-white/25 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                      <svg width="15" height="15" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.5" /><circle cx="18" cy="18" r="4" stroke="white" strokeWidth="1.5" /><line x1="18" y1="8" x2="18" y2="14" stroke="white" strokeWidth="1.5" /><line x1="18" y1="22" x2="18" y2="28" stroke="white" strokeWidth="1.5" /><line x1="8" y1="18" x2="14" y2="18" stroke="white" strokeWidth="1.5" /><line x1="22" y1="18" x2="28" y2="18" stroke="white" strokeWidth="1.5" /></svg>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "max-w-[100%] sm:max-w-[82%] px-[22px] py-[16px] text-[14.5px] leading-[1.75] rounded-[20px]",
                        message.role === 'user'
                          ? 'bg-white/[0.22] backdrop-blur-[20px] border border-white/[0.32] text-white/95 rounded-tr-[4px] shadow-lg self-end'
                          : 'bg-white/[0.16] backdrop-blur-[20px] border border-white/[0.25] text-[rgba(255,255,255,0.92)] rounded-tl-[4px] shadow-lg self-start'
                      )}
                    >
                      <div className="prose prose-sm prose-p:leading-[1.75] max-w-none whitespace-pre-wrap" style={{ color: "inherit" }}>
                        {message.content}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-[10px] mt-2 opacity-40 font-medium tracking-[0.06em] uppercase",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}
                    >
                      {timeStr(message.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="w-full max-w-[850px] flex gap-[14px]">
                  <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#10b981] to-[#047857] border border-white/25 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <svg width="15" height="15" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.5" /><circle cx="18" cy="18" r="4" stroke="white" strokeWidth="1.5" /><line x1="18" y1="8" x2="18" y2="14" stroke="white" strokeWidth="1.5" /><line x1="18" y1="22" x2="18" y2="28" stroke="white" strokeWidth="1.5" /><line x1="8" y1="18" x2="14" y2="18" stroke="white" strokeWidth="1.5" /><line x1="22" y1="18" x2="28" y2="18" stroke="white" strokeWidth="1.5" /></svg>
                  </div>
                  <div className="bg-white/[0.16] backdrop-blur-[20px] border border-white/[0.25] rounded-[20px] rounded-tl-[4px] px-[22px] py-[16px] flex items-center gap-[5px] shadow-lg">
                    <span className="w-[7px] h-[7px] rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                    <span className="w-[7px] h-[7px] rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1.2s' }} />
                    <span className="w-[7px] h-[7px] rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1.2s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Sticky Input Area */}
            <div className="px-6 lg:px-12 pb-[28px] pt-4 w-full flex justify-center shrink-0">
              {renderInputCard()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
