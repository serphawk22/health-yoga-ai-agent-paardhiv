// Profile Setup Page - Multi-step health profile creation
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateHealthProfile } from '@/lib/actions/profile';
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  User,
  Heart,
  Utensils,
  Target,
  CheckCircle,
  Activity,
  Moon,
  Zap,
  Flame // Using lucide icons for goals/lifestyle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';

const STEPS = [
  { id: 1, name: 'Basic Info', icon: User },
  { id: 2, name: 'Health History', icon: Heart },
  { id: 3, name: 'Lifestyle', icon: Utensils },
  { id: 4, name: 'Goals', icon: Target },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize array fields as empty strings for smooth typing
  const [formData, setFormData] = useState<Record<string, any>>({
    allergies: '',
    medications: '',
    injuries: '',
    existingConditions: [], // Keep as array for selection buttons
    secondaryGoals: [] // Keep as array for selection buttons
  });

  function updateFormData(data: Record<string, any>) {
    setFormData(prev => ({ ...prev, ...data }));
  }

  async function handleNext() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          form.append(key, value.join(','));
        } else if (value !== undefined && value !== null && value !== '') {
          form.append(key, String(value));
        }
      });
      form.append('completionStep', '4');

      const result = await updateHealthProfile(form);

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary-900/30 selection:text-primary-200">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Setup Your Profile
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto text-lg">
            Let&apos;s personalize your health journey. This helps our AI tailor recommendations just for you.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -z-10 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          <div className="flex justify-between relative px-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isComplete = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center group">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4",
                      isComplete
                        ? 'bg-primary-600 border-black text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                        : isCurrent
                          ? 'bg-black border-primary-500 text-primary-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-110'
                          : 'bg-zinc-900 border-black text-zinc-600'
                    )}
                  >
                    {isComplete ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "mt-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                    isCurrent ? 'text-primary-400' : isComplete ? 'text-zinc-300' : 'text-zinc-600'
                  )}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-slideUp">
          {currentStep === 1 && (
            <BasicInfoStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 2 && (
            <HealthHistoryStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 3 && (
            <LifestyleStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 4 && (
            <GoalsStep data={formData} onChange={updateFormData} />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-8 border-t border-zinc-800/50">
            <div className="flex-1"> {/* Spacer for alignment or back button */}
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  "flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-colors",
                  currentStep === 1
                    ? 'invisible'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>

            <GradientButton
              variant="variant"
              onClick={handleNext}
              disabled={isLoading}
              className="h-auto py-3 px-8 text-sm shadow-none hover:shadow-none min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === 4 ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </GradientButton>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Components

function SectionHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-zinc-300 mb-2">{children}</label>;
}

function StyledInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600 transition-all",
        props.className
      )}
    />
  );
}

function PremiumDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option"
}: {
  label?: string;
  value: string;
  options: { value: string, label: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full">
      {label && <InputLabel>{label}</InputLabel>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary-600/50",
          isOpen && "border-primary-600/50 ring-2 ring-primary-600/20"
        )}
      >
        <span className={cn("truncate font-medium", !selectedOption ? "text-zinc-600" : "text-zinc-100")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronRight className={cn("w-4 h-4 text-zinc-500 transition-transform duration-300", isOpen && "rotate-90")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-[70] w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1.5 backdrop-blur-3xl"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between group",
                      value === opt.value
                        ? "bg-primary-600/20 text-primary-400 font-bold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    )}
                  >
                    <span>{opt.label}</span>
                    {value === opt.value && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function StyledSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (val: number) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 transition-colors hover:border-primary-500/50 group"
    >
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-wider">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white leading-none">{value || min}</span>
          <span className="text-xs font-medium text-zinc-500">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 focus:outline-none"
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{min} {unit}</span>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{max} {unit}</span>
      </div>
    </motion.div>
  );
}

function BasicInfoStep({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void; }) {
  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
  ];

  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  return (
    <div className="animate-fadeIn">
      <SectionHeader title="Basic Information" description="Tell us a bit about yourself to get started." />
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StyledSlider
            label="Age"
            value={parseInt(data.age)}
            min={1}
            max={120}
            unit="Years"
            onChange={(val) => onChange({ age: val })}
          />
          <PremiumDropdown
            label="Gender"
            value={data.gender || ''}
            options={genderOptions}
            onChange={(val) => onChange({ gender: val })}
            placeholder="Select gender"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StyledSlider
            label="Height"
            value={parseInt(data.height)}
            min={50}
            max={250}
            unit="cm"
            onChange={(val) => onChange({ height: val })}
          />
          <StyledSlider
            label="Weight"
            value={parseInt(data.weight)}
            min={10}
            max={250}
            unit="kg"
            onChange={(val) => onChange({ weight: val })}
          />
        </div>

        <PremiumDropdown
          label="Blood Type (Optional)"
          value={data.bloodType || ''}
          options={bloodTypeOptions}
          onChange={(val) => onChange({ bloodType: val })}
          placeholder="Select blood type"
        />
      </div>
    </div>
  );
}

// Step 2: Health History
function HealthHistoryStep({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void; }) {
  const conditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid Disorder',
    'Asthma', 'Arthritis', 'Back Pain', 'Obesity', 'High Cholesterol',
    'PCOS', 'Anxiety', 'Depression', 'Migraine', 'Insomnia'
  ];

  const toggleCondition = (condition: string) => {
    const current = data.existingConditions || [];
    const updated = current.includes(condition)
      ? current.filter((c: string) => c !== condition)
      : [...current, condition];
    onChange({ existingConditions: updated });
  };

  return (
    <div className="animate-fadeIn">
      <SectionHeader title="Health History" description="Help us understand your background for better safety." />
      <div className="space-y-8">
        <div>
          <InputLabel>Existing Health Conditions</InputLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {conditions.map((condition) => {
              const check = (data.existingConditions || []).includes(condition);
              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200",
                    check
                      ? 'bg-primary-600 border-primary-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  )}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <InputLabel>Allergies</InputLabel>
          <StyledInput
            type="text"
            value={data.allergies || ''}
            onChange={(e) => onChange({ allergies: e.target.value })}
            placeholder="e.g., Peanuts, Penicillin (comma separated)"
            className="mt-1"
          />
        </div>

        <div>
          <InputLabel>Current medications</InputLabel>
          <StyledInput
            type="text"
            value={data.medications || ''}
            onChange={(e) => onChange({ medications: e.target.value })}
            placeholder="e.g., Metformin, Aspirin (comma separated)"
            className="mt-1"
          />
        </div>

        <div>
          <InputLabel>Injuries or limitations</InputLabel>
          <StyledInput
            type="text"
            value={data.injuries || ''}
            onChange={(e) => onChange({ injuries: e.target.value })}
            placeholder="e.g., Lower back pain, Knee injury"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Lifestyle
function LifestyleStep({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void; }) {
  const dietOptions = [
    { value: "VEGETARIAN", label: "Vegetarian" },
    { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
    { value: "VEGAN", label: "Vegan" },
    { value: "EGGETARIAN", label: "Eggetarian" },
    { value: "PESCATARIAN", label: "Pescatarian" },
    { value: "FLEXITARIAN", label: "Flexitarian" },
  ];

  const activityOptions = [
    { value: "SEDENTARY", label: "Sedentary (little or no exercise)" },
    { value: "LIGHTLY_ACTIVE", label: "Lightly Active (1-3 days/week)" },
    { value: "MODERATELY_ACTIVE", label: "Moderately Active (3-5 days/week)" },
    { value: "VERY_ACTIVE", label: "Very Active (6-7 days/week)" },
    { value: "EXTREMELY_ACTIVE", label: "Extremely Active (athlete level)" },
  ];

  const sleepOptions = [
    { value: "POOR", label: "Poor (less than 5 hours)" },
    { value: "FAIR", label: "Fair (5-6 hours)" },
    { value: "GOOD", label: "Good (6-7 hours)" },
    { value: "EXCELLENT", label: "Excellent (7-9 hours)" },
  ];

  const stressOptions = [
    { value: "LOW", label: "Low" },
    { value: "MODERATE", label: "Moderate" },
    { value: "HIGH", label: "High" },
    { value: "VERY_HIGH", label: "Very High" },
  ];

  const smokingOptions = [
    { value: "NEVER", label: "Never" },
    { value: "FORMER", label: "Former" },
    { value: "OCCASIONAL", label: "Occasional" },
    { value: "CURRENT", label: "Current" },
  ];

  const alcoholOptions = [
    { value: "NONE", label: "None" },
    { value: "OCCASIONAL", label: "Occasional" },
    { value: "MODERATE", label: "Moderate" },
    { value: "HEAVY", label: "Heavy" },
  ];

  return (
    <div className="animate-fadeIn">
      <SectionHeader title="Lifestyle" description="Tell us about your daily habits and routine." />
      <div className="space-y-6">
        <PremiumDropdown
          label="Diet Preference"
          value={data.dietPreference || ''}
          options={dietOptions}
          onChange={(val) => onChange({ dietPreference: val })}
          placeholder="Select your diet preference"
        />

        <PremiumDropdown
          label="Activity Level"
          value={data.activityLevel || ''}
          options={activityOptions}
          onChange={(val) => onChange({ activityLevel: val })}
          placeholder="Select your activity level"
        />

        <PremiumDropdown
          label="Sleep Quality"
          value={data.sleepQuality || ''}
          options={sleepOptions}
          onChange={(val) => onChange({ sleepQuality: val })}
          placeholder="How would you rate your sleep?"
        />

        <PremiumDropdown
          label="Stress Level"
          value={data.stressLevel || ''}
          options={stressOptions}
          onChange={(val) => onChange({ stressLevel: val })}
          placeholder="General stress level"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumDropdown
            label="Smoking"
            value={data.smokingStatus || ''}
            options={smokingOptions}
            onChange={(val) => onChange({ smokingStatus: val })}
            placeholder="Select Status"
          />
          <PremiumDropdown
            label="Alcohol"
            value={data.alcoholConsumption || ''}
            options={alcoholOptions}
            onChange={(val) => onChange({ alcoholConsumption: val })}
            placeholder="Select Status"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Goals
function GoalsStep({ data, onChange }: { data: Record<string, any>; onChange: (data: Record<string, any>) => void; }) {
  const goals = [
    { value: 'WEIGHT_LOSS', label: 'Weight Loss', icon: Flame },
    { value: 'WEIGHT_GAIN', label: 'Weight Gain', icon: Activity },
    { value: 'MUSCLE_BUILDING', label: 'Muscle Building', icon: Zap },
    { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight', icon: Target },
    { value: 'IMPROVE_FITNESS', label: 'Improve Fitness', icon: Heart },
    { value: 'BETTER_SLEEP', label: 'Better Sleep', icon: Moon },
    { value: 'STRESS_REDUCTION', label: 'Reduce Stress', icon: Utensils },
  ];

  const toggleSecondaryGoal = (goal: string) => {
    if (goal === data.primaryGoal) return;
    const current = data.secondaryGoals || [];
    const updated = current.includes(goal)
      ? current.filter((g: string) => g !== goal)
      : [...current, goal];
    onChange({ secondaryGoals: updated });
  };

  return (
    <div className="animate-fadeIn">
      <SectionHeader title="Your Goals" description="What do you want to achieve with Health Agent?" />
      <div className="space-y-8">
        <div>
          <InputLabel>Primary Goal</InputLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = data.primaryGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => onChange({ primaryGoal: goal.value })}
                  className={cn(
                    "flex items-center px-4 py-4 rounded-xl text-left border transition-all duration-200 group",
                    isSelected
                      ? 'bg-primary-600 border-primary-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-primary-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg mr-4 transition-colors",
                    isSelected ? 'bg-white/20 text-white' : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{goal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <InputLabel>Secondary Goals (Optional)</InputLabel>
          <p className="text-sm text-zinc-500 mb-3">Select any additional areas you&apos;d like to improve.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {goals.filter(g => g.value !== data.primaryGoal).map((goal) => {
              const check = (data.secondaryGoals || []).includes(goal.value);
              return (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => toggleSecondaryGoal(goal.value)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200",
                    check
                      ? 'bg-primary-900/50 border-primary-500 text-primary-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  )}
                >
                  {goal.label}
                </button>
              );
            })}
          </div>
        </div>

        {(data.primaryGoal === 'WEIGHT_LOSS' || data.primaryGoal === 'WEIGHT_GAIN') && (
          <div className="pt-6 border-t border-zinc-800/50">
            <StyledSlider
              label="Target Weight"
              value={parseInt(data.targetWeight)}
              min={20}
              max={250}
              unit="kg"
              onChange={(val) => onChange({ targetWeight: val })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

