"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Pill,
    Clock,
    Calendar,
    ShoppingCart,
    Loader2,
    User,
    Activity
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { analyzePrescription } from '@/app/actions/analyze-prescription';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export default function PrescriptionPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await analyzePrescription(formData);

            if (response.success) {
                setResult(response.data);
            } else {
                console.error("Analysis failed:", response.error);
                setError(response.error || "Failed to analyze prescription");
            }
        } catch (error) {
            console.error("Error analyzing prescription:", error);
            setError("An unexpected error occurred");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setIsAnalyzing(false);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 lg:pb-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-health-text mb-2">Prescription Management</h1>
                <p className="text-health-muted">Upload your prescription to digitize and manage your medications.</p>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card min-h-[400px] flex flex-col items-center justify-center p-8 border-dashed border-2 border-health-border hover:border-primary-500/50 transition-colors bg-white/5"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isAnalyzing ? (
                            <div className="text-center space-y-6">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-pulse"></div>
                                    <div className="absolute inset-0 rounded-full border-t-4 border-primary-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-primary-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-health-text">Analyzing Prescription...</h3>
                                    <div className="text-primary-400 min-h-[24px]">
                                        <Typewriter
                                            text={[
                                                "Scanning document structure...",
                                                "Identifying medications...",
                                                "Extracting dosage instructions...",
                                                "Checking drug interactions...",
                                                "Finalizing report..."
                                            ]}
                                            speed={50}
                                            waitTime={100}
                                            loop={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !file ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-10 h-10 text-primary-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-health-text mb-2">
                                            {isDragging ? "Drop your file here" : "Upload Prescription"}
                                        </h3>
                                        <p className="text-health-muted max-w-sm mx-auto">
                                            Drag and drop your prescription image or PDF here, or click to browse files.
                                        </p>
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg max-w-sm mx-auto text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileSelect}
                                    />
                                    <GradientButton onClick={() => fileInputRef.current?.click()}>
                                        Select File
                                    </GradientButton>
                                </div>
                            ) : (
                                <div className="text-center space-y-6">
                                    <div className="w-16 h-16 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto border border-primary-500/20">
                                        <FileText className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-health-text">{file.name}</h3>
                                        <p className="text-sm text-health-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setFile(null)}
                                            className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                        <GradientButton onClick={handleAnalyze}>
                                            Analyze Prescription
                                        </GradientButton>
                                    </div>
                                </div>
                            )
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Analysis Summary */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="card bg-primary-500/10 border-primary-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-primary-500" />
                                    <span className="text-sm text-primary-400">Doctor</span>
                                </div>
                                <p className="font-semibold text-health-text">{result.doctor}</p>
                            </div>
                            <div className="card bg-primary-500/10 border-primary-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    <span className="text-sm text-primary-400">Date</span>
                                </div>
                                <p className="font-semibold text-health-text">{result.date}</p>
                            </div>
                            <div className="card bg-primary-500/10 border-primary-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-5 h-5 text-primary-500" />
                                    <span className="text-sm text-primary-400">Diagnosis</span>
                                </div>
                                <p className="font-semibold text-health-text">{result.diagnosis}</p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Medicines List */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-lg font-semibold text-health-text flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-primary-500" />
                                    Prescribed Medicines
                                </h3>
                                <div className="space-y-3">
                                    {result.medicines.map((med: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="card relative overflow-hidden group border-health-border/50"
                                        >
                                            <GlowingEffect
                                                spread={40}
                                                glow={true}
                                                disabled={false}
                                                proximity={64}
                                                inactiveZone={0.01}
                                                borderWidth={3}
                                            />
                                            <div className="relative z-10 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-health-text text-lg">{med.name}</h4>
                                                        <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs border border-primary-500/20">
                                                            {med.type}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-health-muted mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <Pill className="w-4 h-4 text-primary-500/70" />
                                                            {med.dosage}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-primary-500/70" />
                                                            {med.frequency}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-primary-500/70" />
                                                            {med.duration}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3">
                                                    <span className="text-lg font-bold text-health-text">{med.price}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>


                            {/* Instructions & Actions */}
                            <div className="space-y-6">
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-health-text mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary-500" />
                                        Instructions
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.instructions.map((inst: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-health-muted">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                <span className="text-sm">{inst}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="card border-primary-500/20 bg-primary-500/5">
                                    <h3 className="text-lg font-semibold text-health-text mb-2">Summary</h3>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-health-muted">Total Cost</span>
                                        <span className="text-2xl font-bold text-health-text">
                                            {/* Simple heuristic to sum prices if they are in expected format, else show 'Calculated at Pharmacy' */}
                                            {result.medicines.reduce((acc: number, curr: any) => {
                                                const price = parseFloat(curr.price?.replace(/[^0-9.]/g, '') || '0');
                                                return acc + price;
                                            }, 0) > 0 ? `₹${result.medicines.reduce((acc: number, curr: any) => {
                                                const price = parseFloat(curr.price?.replace(/[^0-9.]/g, '') || '0');
                                                return acc + price;
                                            }, 0).toFixed(2)}` : 'N/A'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="w-full mt-3 py-2 text-sm text-health-muted hover:text-health-text transition-colors"
                                    >
                                        Upload Another Prescription
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
