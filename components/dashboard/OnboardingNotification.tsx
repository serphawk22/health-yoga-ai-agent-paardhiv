'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNextOnboardingStep, completeOnboardingStep } from '@/lib/actions/onboarding';
import { X, ArrowRight, AlertCircle, Heart, Pill, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const stepConfig: Record<string, {
  title: string;
  description: string;
  icon: any;
  placeholder: string;
  examples: string[];
}> = {
  allergies: {
    title: 'Do you have any allergies?',
    description: 'Knowing your allergies helps us generate safe diet plans and recommendations.',
    icon: AlertCircle,
    placeholder: 'e.g., Peanuts, Dairy, Gluten',
    examples: ['Peanuts', 'Dairy', 'Gluten', 'Seafood', 'Eggs', 'Soy', 'Tree Nuts'],
  },
  conditions: {
    title: 'Any existing health conditions?',
    description: 'This helps us tailor recommendations to your specific health needs.',
    icon: Heart,
    placeholder: 'e.g., Diabetes, Hypertension',
    examples: ['Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Heart Disease', 'Arthritis'],
  },
  medications: {
    title: 'Are you taking any medications?',
    description: 'Knowing your medications helps us avoid dietary conflicts.',
    icon: Pill,
    placeholder: 'e.g., Metformin, Aspirin',
    examples: ['Metformin', 'Aspirin', 'Lisinopril', 'Atorvastatin', 'Vitamins'],
  },
  goals: {
    title: 'What are your health goals?',
    description: 'We will create personalized plans aligned with your objectives.',
    icon: Target,
    placeholder: 'e.g., Weight Loss, Better Sleep',
    examples: ['Weight Loss', 'Muscle Building', 'Better Sleep', 'Stress Reduction', 'General Wellness', 'Flexibility'],
  },
};

export function OnboardingNotification() {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadStep = useCallback(async () => {
    const result = await getNextOnboardingStep();
    if (result.success && result.data) {
      setCurrentStep(result.data);
      setTimeout(() => setIsVisible(true), 2000);
    } else {
      setCurrentStep(null);
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    loadStep();
  }, [loadStep]);

  const handleToggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !selectedItems.includes(customInput.trim())) {
      setSelectedItems(prev => [...prev, customInput.trim()]);
      setCustomInput('');
    }
  };

  const handleComplete = async () => {
    if (!currentStep) return;
    setIsSaving(true);

    const items = selectedItems.length > 0 ? selectedItems : ['None'];
    const result = await completeOnboardingStep(
      currentStep as any,
      items
    );

    if (result.success) {
      toast.success('Information saved');
      setIsVisible(false);
      setSelectedItems([]);
      setCustomInput('');
      setTimeout(() => loadStep(), 500);
    } else {
      toast.error('Failed to save');
    }
    setIsSaving(false);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setSelectedItems([]);
  };

  if (!currentStep || !isVisible) return null;

  const config = stepConfig[currentStep];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 right-6 z-[80] w-[380px] max-w-[calc(100vw-3rem)]"
      >
        <div className="bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 rounded-3xl p-6 shadow-2xl shadow-black/50">
          {/* Close */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary-600/10 rounded-xl">
              <Icon className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-health-text">{config.title}</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">{config.description}</p>
            </div>
          </div>

          {/* Quick Select */}
          <div className="flex flex-wrap gap-2 mb-4">
            {config.examples.map((item) => (
              <button
                key={item}
                onClick={() => handleToggleItem(item)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                  selectedItems.includes(item)
                    ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder={config.placeholder}
              className="flex-1 bg-zinc-800/60 border border-zinc-800 focus:border-primary-500/50 outline-none rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-600"
            />
            <button
              onClick={handleAddCustom}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-400 hover:bg-zinc-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex-1"
            >
              Later
            </button>
            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-500 transition-all flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
