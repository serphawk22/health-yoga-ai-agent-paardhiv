'use client';

import { useState } from 'react';
import { completeOnboardingStep } from '@/lib/actions/onboarding';
import { X, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COMMON_ALLERGIES = ['Peanuts', 'Dairy', 'Gluten', 'Seafood', 'Eggs', 'Soy', 'Tree Nuts', 'Wheat', 'Shellfish'];

interface AllergyCheckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (allergies: string[]) => void;
}

export function AllergyCheckDialog({ isOpen, onClose, onComplete }: AllergyCheckDialogProps) {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleNoAllergies = () => {
    setShowConfirmation(true);
  };

  const handleConfirmNoAllergies = async () => {
    setIsSaving(true);
    const result = await completeOnboardingStep('allergies', ['None']);
    if (result.success) {
      toast.success('Allergy information saved');
      onComplete([]);
      onClose();
    }
    setIsSaving(false);
  };

  const handleSaveAllergies = async () => {
    if (selectedAllergies.length === 0) {
      handleNoAllergies();
      return;
    }
    setIsSaving(true);
    const result = await completeOnboardingStep('allergies', selectedAllergies);
    if (result.success) {
      toast.success('Allergy information saved');
      onComplete(selectedAllergies);
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full z-10 overflow-hidden"
          >
            {showConfirmation ? (
              /* Confirmation Step */
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-medium text-health-text">Are you sure?</h3>
                </div>

                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 mb-6">
                  <p className="text-sm text-amber-300/90 font-light leading-relaxed">
                    Some allergies include reactions to foods like peanuts, milk, wheat, or shellfish.
                    Are you sure you do not have any food allergies?
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-zinc-800"
                  >
                    Let me check again
                  </button>
                  <button
                    onClick={handleConfirmNoAllergies}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-500 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Confirm: No Allergies'}
                  </button>
                </div>
              </div>
            ) : (
              /* Main Step */
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-600/10 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-health-text">Allergy Information</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Required before generating diet plans</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-600 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-zinc-400 font-light mb-6">
                  Do you have any food allergies? Select all that apply or add your own.
                </p>

                {/* Allergy Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => handleToggle(allergy)}
                      className={cn(
                        'px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-center',
                        selectedAllergies.includes(allergy)
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      )}
                    >
                      {selectedAllergies.includes(allergy) && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      {allergy}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleNoAllergies}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-zinc-800"
                  >
                    No Allergies
                  </button>
                  <button
                    onClick={handleSaveAllergies}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-500 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Allergies'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
