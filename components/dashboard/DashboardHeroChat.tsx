'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '@/lib/actions/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, HeartPulse, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateBlogFromChat } from '@/lib/actions/blog';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const SUGGESTIONS = [
  'How can I improve my sleep?',
  'Best diet for weight management',
  'Yoga for back pain relief',
  'How to reduce daily stress',
];

export function DashboardHeroChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generatingBlogFor, setGeneratingBlogFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSubmit(messageText?: string) {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const result = await sendChatMessage(text, sessionId || undefined);

      if (result.success && result.data) {
        if (!sessionId) setSessionId(result.data.sessionId);

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
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          createdAt: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        createdAt: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateBlog(message: Message) {
    const messageIndex = messages.findIndex(m => m.id === message.id);
    const userMsg = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
    if (!userMsg) return;

    setGeneratingBlogFor(message.id);
    try {
      const result = await generateBlogFromChat(userMsg.content, message.content);
      if (result.success && result.data) {
        toast.success('Blog article generated', {
          description: `"${result.data.title}" has been created`,
          action: {
            label: 'View',
            onClick: () => window.location.href = `/blogs/${result.data!.slug}`,
          },
        });
      } else {
        toast.error('Failed to generate blog');
      }
    } catch {
      toast.error('Failed to generate blog');
    } finally {
      setGeneratingBlogFor(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function autoResize(target: HTMLTextAreaElement) {
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  }

  return (
    <div className="relative mt-16 mb-20 px-4 md:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-extralight uppercase tracking-tight text-white mb-2">
          Health <span className="text-primary-400 font-light">AI Companion</span>
        </h2>
        <p className="text-zinc-400 font-light">Your personal wellness guide, always here to help.</p>
      </div>

      {/* Main Glass Container - Integrated Avatar & Chat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-[85vh] min-h-[600px] max-h-[850px] lg:h-[700px] flex flex-col lg:flex-row rounded-[2rem] lg:rounded-[3rem] bg-zinc-950/40 backdrop-blur-[45px] saturate-[2] border border-white/[0.1] ring-1 ring-white/[0.05] shadow-[0_32px_128px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Left Side: Avatar Section (Responsive) */}
        <div className="w-full h-[220px] sm:h-[280px] lg:h-full lg:w-[45%] xl:w-[40%] relative flex flex-col items-center justify-end p-4 lg:p-8 shrink-0 overflow-visible lg:overflow-hidden z-10">
             {/* Decorative Background Blur */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Avatar Image Wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full h-full lg:h-auto max-w-[200px] sm:max-w-[250px] lg:max-w-[500px] lg:aspect-[4/5.5] z-10 lg:-mb-12 pointer-events-none"
            >
              <Image 
                src="/ai-avatar.png" 
                alt="Zenya AI" 
                fill
                className="object-contain object-bottom lg:object-center drop-shadow-[0_0_50px_rgba(16,185,129,0.25)] lg:scale-125 transition-transform duration-700 hover:scale-105 lg:hover:scale-[1.28] pointer-events-auto"
                priority
              />
            </motion.div>

            {/* AI Name Tag */}
            <div className="absolute top-4 left-4 lg:top-10 lg:left-10 flex flex-col z-20">
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary-400 font-bold opacity-60 mb-0 lg:mb-1 drop-shadow-md">Health Expert</span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-widest uppercase drop-shadow-md">Zenya</h3>
            </div>
        </div>



        {/* Right Side: Chat Interface Wrapper */}
        <div className="flex-1 flex flex-col min-h-0 relative z-20 bg-zinc-950/40 lg:bg-transparent rounded-t-[2rem] lg:rounded-none border-t border-white/5 lg:border-none -mt-4 lg:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] lg:shadow-none">

            {/* Messages Stream */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-8 custom-scrollbar space-y-8">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-20 lg:py-0">
                    <div className="space-y-3">
                      <h4 className="text-2xl font-light text-white tracking-tight italic">Namaste, How can I assist you today?</h4>
                      <p className="text-zinc-500 text-sm font-light max-w-sm mx-auto">I am ready to help with your diet, yoga, or any health concerns.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSubmit(suggestion)}
                          className="px-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all text-left group"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-5',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >


                        <div className={cn(
                          "flex flex-col gap-3",
                          message.role === 'user' ? "items-end max-w-[80%]" : "items-start max-w-[85%]"
                        )}>
                          <div
                            className={cn(
                              'px-6 py-5 text-[15px] font-light leading-relaxed rounded-3xl shadow-2xl transition-all duration-300',
                              message.role === 'user'
                                ? 'bg-zinc-100 text-zinc-950 rounded-tr-none font-normal'
                                : 'bg-[#0a0a0b] text-zinc-100 border border-white/5 rounded-tl-none shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
                            )}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>

                          {message.role === 'assistant' && !message.id.startsWith('error') && (
                            <button
                              onClick={() => handleGenerateBlog(message)}
                              disabled={generatingBlogFor === message.id}
                              className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-primary-400 transition-colors font-bold uppercase tracking-[0.15em] ml-1"
                            >
                              {generatingBlogFor === message.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                              {generatingBlogFor === message.id ? 'Processing...' : 'Save as Article'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-5">
                        <div className="bg-[#0a0a0b] border border-white/5 rounded-3xl rounded-tl-none px-8 py-5 flex items-center gap-2.5 shadow-2xl">
                          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-6" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Modern Control Bar */}
            <div className="px-6 py-4 md:px-10 md:py-8">
              <div className="flex items-end gap-3 bg-white/[0.03] rounded-3xl border border-white/10 p-2.5 pr-5 focus-within:bg-white/[0.05] focus-within:border-primary-500/40 transition-all shadow-inner group">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e.target);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Share your health goals or ask a question..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-sm min-h-[50px] max-h-[160px] resize-none text-zinc-100 placeholder:text-zinc-600 font-light flex items-center transition-colors"
                />
                <div className="pb-2">
                  <motion.button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    whileHover={input.trim() && !isLoading ? { scale: 1.05, y: -2 } : {}}
                    whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                    className={cn(
                      'p-4 rounded-2xl transition-all shrink-0 shadow-xl flex items-center justify-center',
                      !input.trim() || isLoading
                        ? 'bg-zinc-800/50 text-zinc-600 grayscale'
                        : 'bg-primary-500 text-zinc-950 hover:bg-primary-400 shadow-primary-500/20'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 fill-current" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
