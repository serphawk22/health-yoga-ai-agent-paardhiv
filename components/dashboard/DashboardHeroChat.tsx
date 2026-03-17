'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '@/lib/actions/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, HeartPulse, FileText, MessageCircle, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[90] w-14 h-14 bg-primary-600 hover:bg-primary-500 rounded-full shadow-2xl shadow-primary-500/30 flex items-center justify-center transition-transform hover:scale-105"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-zinc-950" />
        ) : (
          <MessageCircle className="w-6 h-6 text-zinc-950" />
        )}
      </button>

      {/* Floating Chat Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-[90] w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col rounded-[2rem] bg-zinc-950/95 backdrop-blur-xl border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-500/20 shrink-0">
                    <Image 
                        src="/ai-avatar.png" 
                        alt="Zenya AI" 
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Zenya</h3>
                    <p className="text-[10px] text-primary-400 capitalize tracking-wider">Health Expert</p>
                </div>
            </div>

            {/* Messages Stream */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-6">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                    <div className="space-y-2">
                      <h4 className="text-xl font-light text-white tracking-tight italic">Namaste, How can I assist you today?</h4>
                      <p className="text-zinc-500 text-xs font-light max-w-[250px] mx-auto">I am ready to help with your diet, yoga, or any health concerns.</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSubmit(suggestion)}
                          className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-3',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={cn(
                          "flex flex-col gap-2",
                          message.role === 'user' ? "items-end max-w-[85%]" : "items-start max-w-[90%]"
                        )}>
                          <div
                            className={cn(
                              'px-4 py-3 text-[14px] font-light leading-relaxed rounded-2xl transition-all duration-300',
                              message.role === 'user'
                                ? 'bg-zinc-100 text-zinc-950 rounded-tr-none font-normal'
                                : 'bg-[#0a0a0b] text-zinc-100 border border-white/5 rounded-tl-none shadow-md'
                            )}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>

                          {message.role === 'assistant' && !message.id.startsWith('error') && (
                            <button
                              onClick={() => handleGenerateBlog(message)}
                              disabled={generatingBlogFor === message.id}
                              className="flex items-center gap-1.5 text-[9px] text-zinc-600 hover:text-primary-400 transition-colors font-bold uppercase tracking-[0.1em] ml-1"
                            >
                              {generatingBlogFor === message.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              {generatingBlogFor === message.id ? 'Processing...' : 'Save as article'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="bg-[#0a0a0b] border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} className="h-2" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-end gap-2 bg-white/[0.03] rounded-2xl border border-white/10 p-2 pr-2 focus-within:bg-white/[0.05] focus-within:border-primary-500/40 transition-all shadow-inner relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e.target);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a health question..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-[13px] min-h-[40px] max-h-[120px] resize-none text-zinc-100 placeholder:text-zinc-600 font-light"
                />
                <div className="pb-1.5 shrink-0">
                  <motion.button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                    className={cn(
                      'p-2.5 rounded-xl transition-all flex items-center justify-center',
                      !input.trim() || isLoading
                        ? 'bg-zinc-800/50 text-zinc-600 grayscale'
                        : 'bg-primary-500 text-zinc-950 hover:bg-primary-400'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 fill-current" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
