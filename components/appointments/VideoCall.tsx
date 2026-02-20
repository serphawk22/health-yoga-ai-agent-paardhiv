'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Users, Shield, Signal,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { completeAppointment } from '@/lib/actions/appointments';
import type Peer from 'peerjs';

interface VideoCallProps {
    appointmentId: string;
    meetingId: string;
    userName: string;
    otherName: string;
    role: 'doctor' | 'patient';
}

export function VideoCall({ appointmentId, meetingId, userName, otherName, role }: VideoCallProps) {
    const router = useRouter();

    // Media States
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Connection States
    const [peer, setPeer] = useState<Peer | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [connectionStrength, setConnectionStrength] = useState(3);
    const [status, setStatus] = useState('Initializing secure connection...');

    // Refs for video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const connectionInterval = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef(false);

    // Determines Peer IDs
    const myPeerId = `${meetingId}-${role}`;
    const targetPeerId = `${meetingId}-${role === 'doctor' ? 'patient' : 'doctor'}`;

    useEffect(() => {
        let mounted = true;
        let peerInstance: Peer | null = null;

        const init = async () => {
            try {
                // 1. Get Local Stream
                setStatus('Accessing camera and microphone...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                if (!mounted) return;

                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Fetch TURN credentials
                setStatus('Fetching relay server credentials...');
                let iceServers: RTCIceServer[] = [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' },
                ];

                try {
                    const res = await fetch('/api/turn-credentials');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.iceServers && data.iceServers.length > 0) {
                            iceServers = data.iceServers;
                            console.log('Got TURN credentials:', iceServers.length, 'servers');
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch TURN credentials, using STUN only:', e);
                }

                // 3. Import PeerJS & Initialize
                setStatus('Connecting to secure signaling server...');
                const { default: Peer } = await import('peerjs');

                peerInstance = new Peer(myPeerId, {
                    debug: 2,
                    config: { iceServers }
                });

                peerInstance.on('open', (id) => {
                    console.log('My Peer ID:', id);
                    setStatus('Waiting for peer connection...');
                    setPeer(peerInstance);

                    // Attempt to connect periodically
                    if (peerInstance) {
                        startConnectionAttempts(peerInstance, stream);
                    }
                });

                peerInstance.on('call', (call) => {
                    console.log('Incoming call from:', call.peer);
                    setStatus('Connecting...');
                    call.answer(stream); // Answer immediately

                    call.on('stream', (incomingStream) => {
                        console.log('Received remote stream via answer, tracks:', incomingStream.getTracks().length);
                        setRemoteStream(incomingStream);
                        setIsConnected(true);
                        isConnectedRef.current = true;
                        setStatus('Connected');
                        // Directly set srcObject
                        setTimeout(() => {
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = incomingStream;
                                remoteVideoRef.current.play().catch(e => console.log('Auto-play blocked:', e));
                            }
                        }, 100);
                    });

                    call.on('close', () => {
                        console.log('Call closed by remote peer');
                        setIsConnected(false);
                        isConnectedRef.current = false;
                        setRemoteStream(null);
                        setStatus('Call ended by other party');
                    });
                });

                peerInstance.on('error', (err) => {
                    console.warn('Peer error:', err);
                    if (err.type === 'peer-unavailable') {
                        setStatus('Waiting for other party to join...');
                    } else if (err.type === 'unavailable-id') {
                        // ID taken? Maybe refresh or just proceed if we are re-initializing
                        console.log('ID taken, we might already be connected or zombie session');
                    }
                });

            } catch (err) {
                console.error('Initialization error:', err);
                setStatus('Error accessing devices or connecting. Please check permissions.');
            }
        };

        init();

        // Duration timer — use ref to avoid stale closure
        const timer = setInterval(() => {
            if (isConnectedRef.current) setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            mounted = false;
            clearInterval(timer);
            if (connectionInterval.current) clearInterval(connectionInterval.current);

            // Cleanup media tracks
            localStream?.getTracks().forEach(track => track.stop());

            // Destroy peer
            if (peerInstance) peerInstance.destroy();
        };
    }, [meetingId, role, myPeerId]); // Re-run if ID changes (shouldn't happen often)

    // Re-attach remote stream whenever remoteStream state changes
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.log('Auto-play blocked:', e));
        }
    }, [remoteStream]);

    function startConnectionAttempts(currentPeer: Peer, stream: MediaStream) {
        if (connectionInterval.current) clearInterval(connectionInterval.current);

        connectionInterval.current = setInterval(() => {
            if (!currentPeer || currentPeer.destroyed) return;

            // Only try calling if we're not already connected
            if (isConnectedRef.current) {
                if (connectionInterval.current) clearInterval(connectionInterval.current);
                return;
            }

            console.log(`Attempting to call ${targetPeerId}...`);
            const call = currentPeer.call(targetPeerId, stream);

            if (call) {
                call.on('stream', (incomingStream) => {
                    console.log('Call accepted, receiving stream, tracks:', incomingStream.getTracks().length);
                    setRemoteStream(incomingStream);
                    setIsConnected(true);
                    isConnectedRef.current = true;
                    setStatus('Connected');
                    if (connectionInterval.current) clearInterval(connectionInterval.current);
                    // Directly set srcObject
                    setTimeout(() => {
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = incomingStream;
                            remoteVideoRef.current.play().catch(e => console.log('Auto-play blocked:', e));
                        }
                    }, 100);
                });

                call.on('error', (err) => {
                    console.log('Call error (likely peer not ready):', err);
                });

                call.on('close', () => {
                    console.log('Outgoing call closed');
                });
            }
        }, 3000); // Retry every 3s
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = async () => {
        setIsEnding(true);
        // Mark appointment as completed
        await completeAppointment(appointmentId);

        // Cleanup and redirect
        localStream?.getTracks().forEach(track => track.stop());
        peer?.destroy();
        router.push(role === 'doctor' ? '/doctor' : '/dashboard');
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const toggleControls = () => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => setShowControls(false), 5000);
    };

    return (
        <div
            className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-[100] font-sans"
            onMouseMove={toggleControls}
            onClick={toggleControls}
        >
            {/* Background Stream (Remote) */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
                            <div className="absolute inset-0 opacity-20 blur-3xl bg-gradient-to-tr from-primary-900/30 via-zinc-900 to-indigo-900/30 animate-pulse" />

                            <div className="relative z-10 w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center animate-spin-slow">
                                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                            </div>

                            <div className="space-y-2 text-center z-10">
                                <h3 className="text-xl font-bold text-white tracking-widest uppercase">{status}</h3>
                                <p className="text-zinc-500 text-sm">Secure handshake in progress...</p>
                            </div>
                        </div>
                    )}

                    {/* Remote Name Label */}
                    {isConnected && (
                        <div className="absolute bottom-10 left-10 z-20">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/10">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-black text-white tracking-widest uppercase">{otherName}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Self View (Local) */}
            <motion.div
                drag
                dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
                className="absolute top-10 right-10 w-48 sm:w-64 aspect-video rounded-3xl overflow-hidden bg-zinc-800 border-2 border-white/10 shadow-2xl z-30 group cursor-move active:scale-95 transition-transform"
            >
                <div className="w-full h-full relative bg-zinc-950">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn("w-full h-full object-cover mirror-mode", isVideoOff && "hidden")}
                    />

                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-white/20">
                                <VideoOff className="w-6 h-6" />
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                            You
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Top HUD */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-10 flex items-center justify-between pointer-events-none"
                    >
                        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-[2rem] border border-white/10 pointer-events-auto">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Encrypted Session</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="text-sm font-black text-white tabular-nums tracking-widest">
                                {formatDuration(callDuration)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl px-4 py-3 rounded-2xl border border-white/10 pointer-events-auto">
                            <Signal className={cn("w-4 h-4",
                                connectionStrength === 3 ? "text-green-500" :
                                    connectionStrength === 2 ? "text-yellow-500" : "text-red-500"
                            )} />
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">HD Stable</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-10 z-40 w-full flex items-center justify-center pointer-events-none"
                    >
                        <div className="flex items-center gap-6 p-4 bg-black/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 pointer-events-auto shadow-2xl">
                            <ControlBtn
                                active={!isMuted}
                                icon={isMuted ? MicOff : Mic}
                                onClick={toggleAudio}
                                color={isMuted ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-white border-white/10"}
                            />
                            <ControlBtn
                                active={!isVideoOff}
                                icon={isVideoOff ? VideoOff : Video}
                                onClick={toggleVideo}
                                color={isVideoOff ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-white border-white/10"}
                            />
                            <button className="w-14 h-14 rounded-2xl bg-white/5 text-white border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
                                <Users className="w-6 h-6" />
                            </button>

                            <div className="w-px h-10 bg-white/5 mx-2" />

                            <button
                                onClick={handleEndCall}
                                disabled={isEnding}
                                className="h-14 px-8 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center gap-3 transition-all active:scale-95 shadow-[0_8px_32px_rgba(239,68,68,0.4)]"
                            >
                                {isEnding ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneOff className="w-5 h-5" />}
                                <span className="font-black uppercase tracking-widest text-sm">End Call</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .mirror-mode {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}

function ControlBtn({ active, icon: Icon, onClick, color }: { active: boolean, icon: any, onClick: () => void, color: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                color
            )}
        >
            <Icon className="w-6 h-6" />
        </button>
    );
}

