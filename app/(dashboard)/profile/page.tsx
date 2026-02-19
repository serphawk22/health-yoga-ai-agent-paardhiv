'use client';

// Profile View/Edit Page

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getHealthProfile, updateProfile } from '@/lib/actions/profile';
import {
  Loader2,
  AlertCircle,
  User,
  Heart,
  Activity,
  Apple,
  Calendar,
  Scale,
  Ruler,
  Edit2,
  Save,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState<any>({});

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const result = await getHealthProfile();

    if (result.success && result.data) {
      // Map schema fields to UI fields
      const mappedProfile = {
        ...result.data,
        heightCm: result.data.height,
        weightKg: result.data.weight,
        dietType: result.data.dietPreference,
        healthConditions: result.data.existingConditions || [],
        fitnessGoals: result.data.secondaryGoals || [],
      };
      setProfile(mappedProfile);
      setFormData(mappedProfile);
    } else if (result.success && !result.data) {
      router.push('/profile/setup');
    } else {
      setError(result.error || 'Failed to load profile');
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const result = await updateProfile(formData);

    if (result.success) {
      const mappedProfile = {
        ...result.data,
        heightCm: result.data.height,
        weightKg: result.data.weight,
        dietType: result.data.dietPreference,
        healthConditions: result.data.existingConditions || [],
        fitnessGoals: result.data.secondaryGoals || [],
      };
      setProfile(mappedProfile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      toast.success('Profile updated');
    } else {
      setError(result.error || 'Failed to update profile');
      toast.error('Failed to update profile');
    }

    setIsSaving(false);
  }

  function handleCancel() {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-semibold text-health-text mb-2 tracking-tight">Profile Not Set Up</h2>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Please complete your health profile to get personalized AI recommendations and tailored health plans.</p>
          <GradientButton
            onClick={() => router.push('/profile/setup')}
            className="px-8 shadow-xl shadow-primary-500/20"
          >
            Set Up Your Profile
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      <div className="max-w-3xl mx-auto pt-4 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between"
        >
          <div>
            <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Health Hub</p>
            <h1 className="text-3xl font-light text-health-text tracking-tight">
              My Profile
            </h1>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {(successMessage || error) && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              {successMessage && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8 mt-6">
          {/* Basic Information Section */}
          <Section layoutId="basic" title="Basic Information">
            {isEditing ? (
              <div className="grid sm:grid-cols-2 gap-8 p-2">
                <Field label="Age">
                  <Slider
                    value={formData.age || 18}
                    min={0}
                    max={100}
                    onChange={(val) => setFormData({ ...formData, age: val })}
                    unit="yr"
                  />
                </Field>
                <Field label="Gender">
                  <CustomSelect
                    value={formData.gender}
                    options={[
                      { label: 'Male', value: 'MALE' },
                      { label: 'Female', value: 'FEMALE' },
                      { label: 'Other', value: 'OTHER' },
                    ]}
                    onChange={(val) => setFormData({ ...formData, gender: val })}
                  />
                </Field>
                <Field label="Height">
                  <Slider
                    value={formData.heightCm || 160}
                    min={100}
                    max={250}
                    onChange={(val) => setFormData({ ...formData, heightCm: val })}
                    unit="cm"
                  />
                </Field>
                <Field label="Weight">
                  <Slider
                    value={formData.weightKg || 60}
                    min={30}
                    max={200}
                    onChange={(val) => setFormData({ ...formData, weightKg: val })}
                    unit="kg"
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
                <MetricCard icon={Calendar} label="Age" value={profile.age} unit="yr" />
                <MetricCard icon={User} label="Gender" value={profile.gender} />
                <MetricCard icon={Ruler} label="Height" value={profile.heightCm} unit="cm" />
                <MetricCard icon={Scale} label="Weight" value={profile.weightKg} unit="kg" />
              </div>
            )}
          </Section>

          {/* Health Metrics Section */}
          <Section layoutId="metrics" title="Daily Vitals">
            {isEditing ? (
              <div className="grid sm:grid-cols-2 gap-8 p-2">
                <Field label="Activity Level">
                  <CustomSelect
                    value={formData.activityLevel}
                    options={[
                      { label: 'Sedentary', value: 'SEDENTARY' },
                      { label: 'Lightly Active', value: 'LIGHTLY_ACTIVE' },
                      { label: 'Moderately Active', value: 'MODERATELY_ACTIVE' },
                      { label: 'Very Active', value: 'VERY_ACTIVE' },
                      { label: 'Extremely Active', value: 'EXTREMELY_ACTIVE' },
                    ]}
                    onChange={(val) => setFormData({ ...formData, activityLevel: val })}
                  />
                </Field>
                <Field label="Sleep">
                  <Slider
                    value={formData.sleepHours || 8}
                    min={0}
                    max={15}
                    step={0.5}
                    onChange={(val) => setFormData({ ...formData, sleepHours: val })}
                    unit="hr"
                  />
                </Field>
                <Field label="Stress Level">
                  <CustomSelect
                    value={formData.stressLevel}
                    options={[
                      { label: 'Low', value: 'LOW' },
                      { label: 'Moderate', value: 'MODERATE' },
                      { label: 'High', value: 'HIGH' },
                      { label: 'Very High', value: 'VERY_HIGH' },
                    ]}
                    onChange={(val) => setFormData({ ...formData, stressLevel: val })}
                  />
                </Field>
                <Field label="Water">
                  <Slider
                    value={formData.waterIntake || 8}
                    min={0}
                    max={20}
                    onChange={(val) => setFormData({ ...formData, waterIntake: val })}
                    unit="gls"
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
                <MetricCard icon={Activity} label="Activity" value={formatEnumValue(profile.activityLevel)} />
                <MetricCard icon={Heart} label="Sleep" value={profile.sleepHours || '-'} unit="hr" />
                <MetricCard icon={Activity} label="Stress" value={formatEnumValue(profile.stressLevel)} />
                <MetricCard icon={Activity} label="Water" value={profile.waterIntake || '-'} unit="gls" />
              </div>
            )}
          </Section>

          {/* BMI Card */}
          {profile.heightCm && profile.weightKg && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden"
            >
              {/* Subtle top accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

              <div className="text-center md:text-left mb-6 md:mb-0">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Body Mass Index</p>
                <div className="flex items-baseline justify-center md:justify-start gap-3">
                  <h3 className="text-6xl font-light text-health-text tracking-tighter leading-none">
                    {(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)}
                  </h3>
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm tracking-widest uppercase">BMI</span>
                </div>
              </div>

              <div className="md:text-right flex flex-col items-center md:items-end">
                <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 mb-3">
                  <span className="text-health-text text-sm font-bold tracking-tight">
                    {getBmiCategory(profile.weightKg / Math.pow(profile.heightCm / 100, 2))}
                  </span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px]">
                  Analyzed based on your personal height and weight metrics.
                </p>
              </div>
            </motion.div>
          )}

          {/* Lifestyle & Conditions */}
          <div className="grid md:grid-cols-2 gap-8">
            <Section title="Diet & Preferences" layoutId="diet">
              {isEditing ? (
                <div className="space-y-6 p-2">
                  <Field label="Diet Type">
                    <CustomSelect
                      value={formData.dietType}
                      options={[
                        { label: 'Vegetarian', value: 'VEGETARIAN' },
                        { label: 'Non-Vegetarian', value: 'NON_VEGETARIAN' },
                        { label: 'Vegan', value: 'VEGAN' },
                        { label: 'Eggetarian', value: 'EGGETARIAN' },
                        { label: 'Pescatarian', value: 'PESCATARIAN' },
                      ]}
                      onChange={(val) => setFormData({ ...formData, dietType: val })}
                    />
                  </Field>
                  <Field label="Allergies">
                    <input
                      type="text"
                      value={formData.allergies?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(',').map((s: any) => s.trim()).filter(Boolean) })}
                      placeholder="Peanuts, Dairy..."
                      className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-zinc-500 text-sm font-medium">Type</span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                      {profile.dietType ? formatEnumValue(profile.dietType) : 'Not set'}
                    </span>
                  </div>
                  <div className="px-2">
                    <p className="text-zinc-500 text-sm font-medium mb-3">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies && profile.allergies.length > 0 ? (
                        profile.allergies.map((a: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500 text-[11px] font-bold">
                            {a}
                          </span>
                        ))
                      ) : (
                        <p className="text-zinc-600 text-[11px] italic">No allergies reported</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section title="Health Conditions" layoutId="health">
              {isEditing ? (
                <div className="space-y-4 p-2">
                  <Field label="Conditions">
                    <textarea
                      value={formData.healthConditions?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value.split(',').map((s: any) => s.trim()).filter(Boolean) })}
                      className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none rounded-xl px-4 py-3 text-sm min-h-[100px] transition-all resize-none"
                      placeholder="Diabetes, Hypertension..."
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-2 p-2 min-h-[120px]">
                  {profile.healthConditions && profile.healthConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.healthConditions.map((c: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 w-full group hover:border-zinc-700 transition-all">
                          <span className="text-sm font-medium text-health-text">{c}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center opacity-40">
                      <p className="text-xs text-zinc-500 font-medium italic">All clear! No conditions reported.</p>
                    </div>
                  )}
                </div>
              )}
            </Section>
          </div>

          <Section title="Primary Health Goals" layoutId="goals">
            {isEditing ? (
              <div className="p-2">
                <textarea
                  value={formData.fitnessGoals?.join(', ') || ''}
                  onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value.split(',').map((s: any) => s.trim()).filter(Boolean) })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 focus:border-primary-500/50 outline-none rounded-xl px-4 py-3 text-sm min-h-[120px] transition-all resize-none"
                  placeholder="Build muscle, lose fat, improve endurance..."
                />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 p-1">
                {profile.fitnessGoals && profile.fitnessGoals.length > 0 ? (
                  profile.fitnessGoals.map((g: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[13px] font-bold text-health-text">{g}</span>
                      <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm font-medium italic p-4 text-center col-span-2">No active goals yet. Add them to start tracking!</p>
                )}
              </div>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}

/* ──── Sub-components ──── */

function Section({ title, children, layoutId }: { title: string; children: React.ReactNode; layoutId?: string }) {
  return (
    <motion.div
      layoutId={layoutId}
      className="space-y-4"
    >
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">{title}</h2>
      <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
        {children}
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, unit }: { icon: any; label: string; value: any; unit?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-700/50">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-health-text">{value || '-'}</span>
        {unit && <span className="text-[10px] font-bold text-zinc-500 lowercase">{unit}</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{label}</label>
      {children}
    </div>
  );
}

/* ──── Slider Component ──── */

function Slider({ value, min, max, step = 1, onChange, unit }: { value: number; min: number; max: number; step?: number; onChange: (val: number) => void; unit: string }) {
  return (
    <div className="space-y-4 px-1">
      <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/60 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-800">
        <span className="text-2xl font-light text-health-text tracking-tight">{value}</span>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{unit}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
        />
      </div>
      <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

/* ──── Custom Select Component ──── */

function CustomSelect({ value, options, onChange }: { value: string; options: { label: string; value: string }[]; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/50 rounded-xl px-4 py-3.5 text-sm font-medium text-health-text transition-all text-left"
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute z-[60] w-full mt-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 text-sm font-medium transition-colors",
                  value === opt.value
                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatEnumValue(value: string | undefined): string {
  if (!value) return '-';
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese range';
}
