'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Trash2, X, RefreshCw, Check, CheckCheck } from 'lucide-react';
import { sendDoctorPatientMessage, getDoctorPatientMessages, unsendDoctorPatientMessage, markMessagesAsRead } from '@/lib/actions/chat-p2d';

interface ChatInterfaceProps {
    recipientId: string;
    recipientName: string;
    recipientRole: 'doctor' | 'patient';
    currentUserId: string;
    onClose: () => void;
}

export function DoctorPatientChat({ recipientId, recipientName, recipientRole, currentUserId, onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isDoctorViewer = recipientRole === 'patient'; // If viewing a patient, I am a doctor

    const loadMessages = useCallback(async () => {
        const result = await getDoctorPatientMessages(recipientId, isDoctorViewer);
        if (result.success && result.data) {
            setMessages(result.data);
            setIsLoading(false);
        }
    }, [recipientId, isDoctorViewer]);

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Poll every 5s for new messages
        return () => clearInterval(interval);
    }, [recipientId, loadMessages]);

    // Mark messages as read when they are loaded and I am the recipient
    useEffect(() => {
        if (messages.length > 0) {
            // Check if there are any unread messages from the other party
            const hasUnread = messages.some(m => m.senderId !== currentUserId && !m.isRead);
            if (hasUnread) {
                markMessagesAsRead(recipientId, isDoctorViewer)
                    .then(() => {
                        // Optional: Refresh to show updated state (though local state might not need "isRead" on incoming)
                        // But we might want to trigger a global notification update? 
                        // The server action revalidates paths, but client state here needs manual refresh or wait for poll.
                    });
            }
        }
    }, [messages, recipientId, currentUserId, isDoctorViewer]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);



    async function handleSend() {
        if (!newMessage.trim()) return;
        setIsSending(true);

        const result = await sendDoctorPatientMessage(recipientId, newMessage, isDoctorViewer);
        if (result.success) {
            setNewMessage('');
            loadMessages();
        }
        setIsSending(false);
    }

    async function handleUnsend(messageId: string) {
        if (confirm('Unsend this message?')) {
            await unsendDoctorPatientMessage(messageId);
            loadMessages();
        }
    }

    function scrollToBottom() {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-health-card border border-health-border rounded-xl shadow-2xl overflow-hidden fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            {/* ... (Header remains same) */}
            <div className="flex items-center justify-between p-4 bg-primary-600 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {recipientName[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{recipientName}</h3>
                        <p className="text-xs opacity-80">{recipientRole === 'doctor' ? 'Doctor' : 'Patient'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadMessages} className="p-1 hover:bg-white/10 rounded">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-health-card" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner text-primary-500"></span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-health-muted py-8 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 relative group ${isMe
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-health-muted/10 text-health-text rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-primary-100' : 'text-health-muted'
                                        }`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <>
                                                <span className="ml-1">
                                                    {msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                </span>
                                                <button
                                                    onClick={() => handleUnsend(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                                    title="Unsend"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-health-border bg-health-card">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-health-muted/5 border border-health-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
