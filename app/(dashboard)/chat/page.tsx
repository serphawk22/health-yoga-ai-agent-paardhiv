'use client';

// Health Chat Page
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory, getChatSessions, deleteChatSession } from '@/lib/actions/chat';
import { MessageCircle, Plus, History, Paperclip, BrainCircuit, Download, Trash2, ChevronLeft, Loader2, X, HeartPulse } from 'lucide-react';
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
  const [attachment, setAttachment] = useState<{ file: File, preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
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
      let attachmentData = null;
      if (currentAttachment) {
        if (currentAttachment.file.type.startsWith('image/')) {
          // Convert to base64 for vision processing
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(currentAttachment.file);
          });
          attachmentData = {
            type: 'image',
            name: currentAttachment.file.name,
            mimeType: currentAttachment.file.type,
            base64: await base64Promise
          };
        } else {
          // Send as text if simple text file
          const textPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsText(currentAttachment.file);
          });
          attachmentData = {
            type: 'file',
            name: currentAttachment.file.name,
            mimeType: currentAttachment.file.type,
            content: await textPromise
          };
        }
      }

      const result = await sendChatMessage(userMessage, sessionId || undefined, attachmentData);

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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setAttachment({ file, preview });
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
    <div className="w-full max-w-4xl mx-auto bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[32px] p-[24px_28px_20px] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 focus-within:shadow-[0_20px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] focus-within:border-white/[0.15] relative z-20 group/dock ring-1 ring-white/[0.05]">
      {attachment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-2.5 bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-2xl w-fit group/attach relative h-16"
        >
          {attachment.file.type.startsWith('image/') ? (
            <img src={attachment.preview} alt="Attachment" className="w-11 h-11 object-cover rounded-xl border border-white/10 shadow-lg" />
          ) : (
            <div className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
              <Paperclip className="w-5 h-5 text-zinc-400" />
            </div>
          )}
          <div className="flex flex-col pr-4">
            <span className="text-[11px] font-medium text-white/90 truncate max-w-[150px]">{attachment.file.name}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{(attachment.file.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            onClick={() => {
              setAttachment(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.txt"
      />
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          autoResize(e.target);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or attach a report…"
        rows={1}
        disabled={isLoading}
        className="w-full bg-transparent border-none outline-none text-white/95 font-sans text-[16px] font-light resize-none min-h-[44px] max-h-[140px] leading-[1.6] placeholder:text-white/30 caret-[#10b981] custom-scrollbar focus:ring-0 px-1"
      />
      <div className="flex items-center justify-between mt-2 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-xl transition-all active:scale-90"
            title="Attach a report or image"
          >
            <Paperclip className="w-[18px] h-[18px]" />
          </button>
        </div>
        <motion.button
          type="button"
          onClick={() => handleSubmit()}
          disabled={(!input.trim() && !attachment) || isLoading}
          whileHover={(!input.trim() && !attachment) || isLoading ? {} : { scale: 1.02 }}
          whileTap={(!input.trim() && !attachment) || isLoading ? {} : { scale: 0.98 }}
          className={cn(
            "h-10 px-6 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden",
            (!input.trim() && !attachment) || isLoading
              ? "bg-white/[0.05] text-white/20 cursor-not-allowed"
              : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {/* Glow Effect */}
              {(!(!input.trim() && !attachment) && !isLoading) && (
                <motion.div
                  className="absolute inset-0 bg-white/20 blur-xl pointer-events-none"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </>
          )}
        </motion.button>
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
      <div className="fixed inset-0 z-[-1] bg-black/75 backdrop-blur-[5px] pointer-events-none" />

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
              className="w-full max-w-5xl"
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

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 pt-4 pb-40 flex flex-col gap-7 items-center">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  key={message.id}
                  className={cn(
                    "w-full max-w-5xl flex gap-[20px]",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-[36px] h-[36px] rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(16,185,129,0.05)] ring-1 ring-white/5"
                    >
                      <HeartPulse className="w-5 h-5 text-emerald-400/80" />
                    </motion.div>
                  )}

                  <div className="flex flex-col flex-1 max-w-[95%] gap-2">
                    <div
                      className={cn(
                        "w-fit max-w-[100%] sm:max-w-[90%] px-[28px] py-[20px] text-[15.5px] font-light leading-[1.85] tracking-wide rounded-[28px] shadow-2xl transition-all duration-500 hover:shadow-white/[0.02]",
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-[30px] border border-white/[0.12] text-white/95 rounded-tr-[4px] self-end'
                          : 'bg-zinc-950/30 backdrop-blur-[30px] border border-white/[0.05] text-white/90 rounded-tl-[4px] self-start ring-1 ring-white/[0.02]'
                      )}
                    >
                      <div className="prose prose-sm prose-p:leading-[1.75] max-w-none whitespace-pre-wrap" style={{ color: "inherit" }}>
                        {message.content}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-[10px] mt-2 opacity-40 font-light tracking-[0.06em] uppercase",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}
                    >
                      {timeStr(message.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="w-full max-w-5xl flex gap-[20px]">
                  <div className="w-[34px] h-[34px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    <BrainCircuit className="w-4 h-4 text-[#10b981]" />
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
            <div className="px-6 lg:px-12 pb-[40px] pt-10 w-full flex justify-center shrink-0">
              {renderInputCard()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
