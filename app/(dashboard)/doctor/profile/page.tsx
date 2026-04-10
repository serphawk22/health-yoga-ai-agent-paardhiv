'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/lib/actions/auth';
import { updateUserIdentity } from '@/lib/actions/doctor';
import { Loader2, User, Settings, Mail, Briefcase, ChevronDown, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DoctorProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: ''
    });

    const getRoleLabel = (role?: string) => {
        if (role === 'DOCTOR') return 'Medical Practitioner';
        if (role === 'YOGA_INSTRUCTOR') return 'Yoga Instructor';
        return 'Patient';
    };

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const userData = await getUser();
            setUser(userData);
            if (userData) {
                setFormData({
                    name: userData.name || '',
                    role: userData.role || '',
                    email: userData.email || ''
                });
            }
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Call Server Action
        const result = await updateUserIdentity(formData);
        
        if (result.success) {
            toast.success('Profile updated successfully.');
            // Update local user state
            setUser({ ...user, ...formData });
            setIsEditMode(false);
        } else {
            toast.error(result.error || 'Failed to update profile.');
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Loading Profile...</p>
            </div>
        );
    }

    const labelClasses = "text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 block ml-1";
    const infoBoxClasses = "bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all";

    return (
        <div className="max-w-6xl mx-auto pb-20 lg:pb-6 space-y-12 animate-fadeIn relative">
            
            {/* Aurora Background Effects */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            
            {/* HUD Header */}
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <div className="w-full h-full rounded-[2.3rem] bg-zinc-950 flex items-center justify-center text-5xl font-light text-emerald-400">
                                {user?.name?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-4">
                            Verified Professional
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light text-white leading-tight">
                            {user?.name}
                        </h1>
                        <p className="text-gray-400 mt-2 text-xl font-medium tracking-wide">
                            {getRoleLabel(user?.role)}
                        </p>
                    </div>

                    <div className="flex-1" />

                    {!isEditMode ? (
                        <button 
                            onClick={() => setIsEditMode(true)}
                            className="h-14 px-8 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/30 transition-all flex items-center gap-2 text-white font-medium"
                        >
                            <Settings className="w-4 h-4" />
                            Edit Public Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-14 px-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 font-medium disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Contact & Details */}
                <div className="space-y-12">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                        <h3 className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 uppercase tracking-widest flex items-center gap-3 mb-10">
                            <User className="w-4 h-4 text-emerald-400" /> Identity Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>Full Name</label>
                                {isEditMode ? (
                                    <input 
                                        type="text" 
                                        className="w-full text-sm font-medium text-white px-5 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                ) : (
                                    <div className="text-lg font-medium text-white px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl capitalize shadow-sm">
                                        {user?.name}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className={labelClasses}>Professional Role</label>
                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditMode(true)}
                                            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
                                        >
                                            Change Role
                                        </button>
                                    )}
                                </div>
                                {isEditMode ? (
                                    <div className="relative">
                                        <select
                                            className="w-full text-sm font-medium text-white px-5 py-3 pr-12 bg-black/20 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all appearance-none"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="DOCTOR" className="bg-zinc-900">Medical Practitioner</option>
                                            <option value="YOGA_INSTRUCTOR" className="bg-zinc-900">Yoga Instructor</option>
                                            <option value="PATIENT" className="bg-zinc-900">Patient</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            Select the role you want to use for this account.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-lg font-medium text-white px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
                                        {getRoleLabel(user?.role)}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className={labelClasses}>Primary Contact</label>
                                {isEditMode ? (
                                    <input 
                                        type="email" 
                                        className="w-full text-sm font-medium text-white px-5 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all" 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-lg font-medium text-white px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl shadow-sm">
                                        <Mail className="w-4 h-4 text-gray-500 border-none" />
                                        {user?.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                            <p className="text-sm font-medium leading-relaxed tracking-wide">
                                <strong>Professional Note:</strong> Your profile is currently visible to assigned patients and the marketplace administration. Public directory listing is pending license re-verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
