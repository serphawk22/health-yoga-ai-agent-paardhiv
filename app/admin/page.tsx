'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getAllUsers, 
    verifyAdminPassword, 
    updateUser, 
    deleteUser, 
    changeUserPassword, 
    getSystemMetrics,
    getTokenConsumptionBreakdown
} from '@/lib/actions/admin';
import { 
    Users, 
    Database, 
    Activity, 
    ShieldAlert, 
    Lock, 
    Trash2, 
    Edit, 
    Key, 
    Search, 
    RefreshCw, 
    X,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    
    // Dashboard Data
    const [users, setUsers] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals
    const [editingUser, setEditingUser] = useState<any>(null);
    const [passwordResetUser, setPasswordResetUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [tokenBreakdown, setTokenBreakdown] = useState<any>(null);

    const METRIC_DETAILS: Record<string, string> = {
        "Total Users": "A complete count of all registered doctors, yoga instructors, and patients currently active on the platform.",
        "Total Activities": "Aggregated count of all workout sessions, yoga plans generated, and medical appointments scheduled across the system.",
        "OpenAI Tokens (Est.)": "Estimated consumption of OpenAI API tokens for Zenya AI chat interactions. This figure is calculated based on session logs and chat history volume to monitor API costs.",
        "Database Storage": "The amount of space currently consumed by your database. This includes user profiles, health data, and all platform records. The limit represents your total allocated storage on Neon."
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [usersRes, metricsRes] = await Promise.all([
                getAllUsers(),
                getSystemMetrics()
            ]);
            
            if (usersRes.success) setUsers(usersRes.data || []);
            if (metricsRes.success) {
                setMetrics(metricsRes.data || null);
                // Fetch token breakdown if not already fetched
                const breakRes = await getTokenConsumptionBreakdown();
                if (breakRes.success) setTokenBreakdown(breakRes);
            }
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsAuthenticating(true);
        const res = await verifyAdminPassword(passwordInput);
        if (res.success) {
            setIsAuthenticated(true);
            toast.success('Admin access granted');
        } else {
            toast.error('Invalid admin password');
        }
        setIsAuthenticating(false);
    }

    async function handleUpdateUser(e: React.FormEvent) {
        e.preventDefault();
        if (!editingUser) return;
        
        try {
            const res = await updateUser(editingUser.id, editingUser);
            if (res.success) {
                toast.success('User updated successfully');
                setEditingUser(null);
                fetchData();
            } else {
                toast.error(res.error || 'Failed to update user');
            }
        } catch (e) {
            toast.error('Failed to update user');
        }
    }

    async function handleDeleteUser(id: string) {
        if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        
        try {
            const res = await deleteUser(id);
            if (res.success) {
                toast.success('User deleted');
                fetchData();
            } else {
                toast.error('Failed to delete user');
            }
        } catch (e) {
            toast.error('Failed to delete user');
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!passwordResetUser || !newPassword) return;
        
        try {
            const res = await changeUserPassword(passwordResetUser.id, newPassword);
            if (res.success) {
                toast.success('Password updated successfully');
                setPasswordResetUser(null);
                setNewPassword('');
            } else {
                toast.error(res.error || 'Failed to update password');
            }
        } catch (e) {
            toast.error('Failed to update password');
        }
    }

    const filteredUsers = users.filter((u: any) => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-zinc-950 border border-primary-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden"
                >

                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-primary-500" />
                        </div>
                        <h1 className="text-2xl font-light text-white mb-2">Restricted Access</h1>
                        <p className="text-sm text-zinc-500">Please enter the master password to access the Admin Control Panel.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Admin Password"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isAuthenticating || !passwordInput}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isAuthenticating ? 'Authenticating...' : 'Enter Control Panel'}
                        </button>
                    </form>
                    
                    <button 
                        onClick={() => router.back()}
                        className="w-full mt-4 text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Config */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-primary-500 mb-1">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-sm font-bold tracking-widest uppercase">Admin Terminal</span>
                        </div>
                        <h1 className="text-3xl font-light">System Control Panel</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData}
                            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Exit Admin
                        </button>
                    </div>
                </div>

                {/* System Metrics */}
                {metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard 
                            icon={<Users className="w-5 h-5" />} 
                            title="Total Users" 
                            value={metrics.totalUsers} 
                            sub={"+ Active"}
                            onClick={() => setSelectedMetric("Total Users")}
                        />
                        <MetricCard 
                            icon={<Activity className="w-5 h-5" />} 
                            title="Total Activities" 
                            value={metrics.totalSessions} 
                            sub={"Plans & Appts"}
                            onClick={() => setSelectedMetric("Total Activities")}
                        />
                        <MetricCard 
                            icon={<Search className="w-5 h-5" />} 
                            title="OpenAI Tokens (Est.)" 
                            value={metrics.tokenUsage} 
                            sub={`Cost: $${metrics.tokenCost} USD`}
                            trend="up"
                            onClick={() => setSelectedMetric("OpenAI Tokens (Est.)")}
                        />
                        <MetricCard 
                            icon={<Database className="w-5 h-5" />} 
                            title="Database Storage" 
                            value={`${metrics.databaseSize} Used`} 
                            sub={`${((parseFloat(metrics.databaseSize) / parseFloat(metrics.databaseLimit)) * 100).toFixed(1)}% of ${metrics.databaseLimit} total`}
                            onClick={() => setSelectedMetric("Database Storage")}
                        />
                    </div>
                )}

                {/* User Management */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-medium">User Management</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input 
                                type="text"
                                placeholder="Search users by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-80 bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-xs">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Loading system records...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No users found.</td></tr>
                                ) : (
                                    filteredUsers.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{user.name}</div>
                                                <div className="text-zinc-500 text-xs">{user.email}</div>
                                                <div className="text-zinc-600 text-[10px] font-mono mt-1">{user.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${
                                                    user.role === 'DOCTOR' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    user.role === 'YOGA_INSTRUCTOR' ? 'bg-primary-500/10 border-primary-500/20 text-primary-400' :
                                                    user.role === 'ADMIN' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                    'bg-zinc-800 border-zinc-700 text-zinc-300'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.healthProfile?.isComplete ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-primary-500"><Check className="w-3 h-3"/> Profile OK</span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">Incomplete</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button 
                                                    onClick={() => setPasswordResetUser(user)}
                                                    className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500/70 hover:text-red-500 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit User Modal */}
                <AnimatePresence>
                    {editingUser && (
                        <Modal title="Edit User Profile" onClose={() => setEditingUser(null)}>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Account Role</label>
                                    <select 
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="PATIENT">PATIENT</option>
                                        <option value="DOCTOR">DOCTOR</option>
                                        <option value="YOGA_INSTRUCTOR">YOGA INSTRUCTOR</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium"
                                    >Cancel</button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-2.5 bg-primary-600 text-black rounded-xl hover:bg-primary-500 transition-colors text-sm font-semibold"
                                    >Save Changes</button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>

                {/* Password Reset Modal */}
                <AnimatePresence>
                    {passwordResetUser && (
                        <Modal title="Overwrite Password" onClose={() => setPasswordResetUser(null)}>
                            <p className="text-sm text-zinc-400 mb-6">You are resetting the password for <strong className="text-white">{passwordResetUser.email}</strong></p>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new 8+ character password"
                                        minLength={8}
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setPasswordResetUser(null)}
                                        className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium"
                                    >Cancel</button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-2.5 bg-[#e05e5e] text-white rounded-xl hover:bg-[#ff6b6b] transition-colors text-sm font-semibold"
                                    >Force Reset</button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>
                {/* Metric Detail Modal */}
                <AnimatePresence>
                    {selectedMetric && (
                        <Modal title={selectedMetric} onClose={() => setSelectedMetric(null)}>
                            <div className="space-y-4">
                                <p className="text-zinc-400 leading-relaxed">
                                    {METRIC_DETAILS[selectedMetric]}
                                </p>

                                {selectedMetric === "OpenAI Tokens (Est.)" && tokenBreakdown && (
                                    <div className="space-y-6 mt-4">
                                        {/* Service Breakdown */}
                                        <div>
                                            <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Service Breakdown</h4>
                                            <div className="space-y-2">
                                                {tokenBreakdown.serviceBreakdown.map((s: any) => (
                                                    <div key={s.name} className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
                                                        <span className="text-xs text-zinc-300">{s.name}</span>
                                                        <div className="text-right">
                                                            <div className="text-xs font-medium text-white">{s.tokens.toLocaleString()}</div>
                                                            <div className="text-[10px] text-zinc-500">${s.cost}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Top Users */}
                                        <div>
                                            <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Top Users by Consumption</h4>
                                            <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {tokenBreakdown.userBreakdown.slice(0, 5).map((u: any) => (
                                                    <div key={u.email} className="flex items-center justify-between p-2.5 hover:bg-zinc-900/30 rounded-lg transition-colors border border-transparent hover:border-zinc-800">
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-medium text-zinc-200 truncate">{u.name}</div>
                                                            <div className="text-[10px] text-zinc-600 truncate">{u.email}</div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-xs font-mono text-primary-500/80">{u.tokens.toLocaleString()}</div>
                                                            <div className="text-[10px] text-zinc-500">${u.cost}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                                            <div className="text-xs text-zinc-400">Total Estimated Cost</div>
                                            <div className="text-lg font-light text-primary-500">${tokenBreakdown.totalCost}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedMetric !== "OpenAI Tokens (Est.)" && (
                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Status</div>
                                        <div className="text-sm font-medium text-primary-500 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                            Operational & Tracking
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setSelectedMetric(null)}
                                    className="w-full py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors text-sm font-semibold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function MetricCard({ icon, title, value, sub, trend, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group text-left hover:border-primary-500/30 transition-all active:scale-[0.98]"
        >
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                {icon}
            </div>
            <div className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2 relative z-10">{title}</div>
            <div className="text-3xl font-light text-white mb-1 relative z-10">{value}</div>
            <div className={`text-xs font-semibold relative z-10 ${trend === 'up' ? 'text-primary-500' : 'text-zinc-600'}`}>
                {sub}
            </div>
        </button>
    );
}

function Modal({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-white">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-900 text-zinc-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}
