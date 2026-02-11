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
  CheckCircle
} from 'lucide-react';

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
  const [formData, setFormData] = useState<Record<string, any>>({});

  function updateFormData(data: Record<string, any>) {
    setFormData(prev => ({ ...prev, ...data }));
  }

  async function handleNext() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    <div className="min-h-screen bg-health-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-health-text mb-2">Complete Your Health Profile</h1>
          <p className="text-health-muted">
            Help us personalize your health recommendations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary-500 -z-10 transition-all"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isComplete
                      ? 'bg-primary-500 text-white'
                      : isCurrent
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                >
                  {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-primary-600' : 'text-health-muted'
                  }`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="card">
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
          <div className="flex justify-between mt-8 pt-6 border-t border-health-border">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === 4 ? (
                <>
                  Complete Profile
                  <CheckCircle className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <p className="text-center mt-4 text-sm text-health-muted">
          Want to complete this later?{' '}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary-600 hover:text-primary-700"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}

// Step 1: Basic Info
function BasicInfoStep({
  data,
  onChange
}: {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-health-text mb-1">Basic Information</h2>
        <p className="text-sm text-health-muted">Tell us a bit about yourself</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            min="1"
            max="120"
            value={data.age || ''}
            onChange={(e) => onChange({ age: e.target.value })}
            className="input"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            value={data.gender || ''}
            onChange={(e) => onChange({ gender: e.target.value })}
            className="select"
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Height (cm)</label>
          <input
            type="number"
            min="50"
            max="300"
            value={data.height || ''}
            onChange={(e) => onChange({ height: e.target.value })}
            className="input"
            placeholder="e.g., 170"
          />
        </div>

        <div>
          <label className="label">Weight (kg)</label>
          <input
            type="number"
            min="10"
            max="500"
            value={data.weight || ''}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="input"
            placeholder="e.g., 70"
          />
        </div>
      </div>

      <div>
        <label className="label">Blood Type (Optional)</label>
        <select
          value={data.bloodType || ''}
          onChange={(e) => onChange({ bloodType: e.target.value })}
          className="select"
        >
          <option value="">Select blood type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>
    </div>
  );
}

// Step 2: Health History
function HealthHistoryStep({
  data,
  onChange
}: {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-health-text mb-1">Health History</h2>
        <p className="text-sm text-health-muted">Help us understand your health background</p>
      </div>

      <div>
        <label className="label">Do you have any existing health conditions?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => toggleCondition(condition)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${(data.existingConditions || []).includes(condition)
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-health-border text-health-text hover:bg-gray-50'
                }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Any allergies? (food, medicine, etc.)</label>
        <input
          type="text"
          value={(data.allergies || []).join(', ')}
          onChange={(e) => onChange({
            allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="input"
          placeholder="e.g., Peanuts, Penicillin (comma separated)"
        />
      </div>

      <div>
        <label className="label">Current medications (if any)</label>
        <input
          type="text"
          value={(data.medications || []).join(', ')}
          onChange={(e) => onChange({
            medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="input"
          placeholder="e.g., Metformin, Aspirin (comma separated)"
        />
      </div>

      <div>
        <label className="label">Any injuries or physical limitations?</label>
        <input
          type="text"
          value={(data.injuries || []).join(', ')}
          onChange={(e) => onChange({
            injuries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="input"
          placeholder="e.g., Lower back pain, Knee injury (comma separated)"
        />
      </div>
    </div>
  );
}

// Step 3: Lifestyle
function LifestyleStep({
  data,
  onChange
}: {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-health-text mb-1">Your Lifestyle</h2>
        <p className="text-sm text-health-muted">Tell us about your daily habits</p>
      </div>

      <div>
        <label className="label">Diet Preference</label>
        <select
          value={data.dietPreference || ''}
          onChange={(e) => onChange({ dietPreference: e.target.value })}
          className="select"
        >
          <option value="">Select your diet preference</option>
          <option value="VEGETARIAN">Vegetarian</option>
          <option value="NON_VEGETARIAN">Non-Vegetarian</option>
          <option value="VEGAN">Vegan</option>
          <option value="EGGETARIAN">Eggetarian</option>
          <option value="PESCATARIAN">Pescatarian</option>
          <option value="FLEXITARIAN">Flexitarian</option>
        </select>
      </div>

      <div>
        <label className="label">Activity Level</label>
        <select
          value={data.activityLevel || ''}
          onChange={(e) => onChange({ activityLevel: e.target.value })}
          className="select"
        >
          <option value="">Select your activity level</option>
          <option value="SEDENTARY">Sedentary (little or no exercise)</option>
          <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
          <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
          <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
          <option value="EXTREMELY_ACTIVE">Extremely Active (athlete level)</option>
        </select>
      </div>

      <div>
        <label className="label">Sleep Quality</label>
        <select
          value={data.sleepQuality || ''}
          onChange={(e) => onChange({ sleepQuality: e.target.value })}
          className="select"
        >
          <option value="">How would you rate your sleep?</option>
          <option value="POOR">Poor (less than 5 hours, restless)</option>
          <option value="FAIR">Fair (5-6 hours, occasional issues)</option>
          <option value="GOOD">Good (6-7 hours, mostly restful)</option>
          <option value="EXCELLENT">Excellent (7-9 hours, very restful)</option>
        </select>
      </div>

      <div>
        <label className="label">Stress Level</label>
        <select
          value={data.stressLevel || ''}
          onChange={(e) => onChange({ stressLevel: e.target.value })}
          className="select"
        >
          <option value="">How stressed are you generally?</option>
          <option value="LOW">Low (rarely stressed)</option>
          <option value="MODERATE">Moderate (sometimes stressed)</option>
          <option value="HIGH">High (often stressed)</option>
          <option value="VERY_HIGH">Very High (constantly stressed)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Smoking Status</label>
          <select
            value={data.smokingStatus || ''}
            onChange={(e) => onChange({ smokingStatus: e.target.value })}
            className="select"
          >
            <option value="">Select</option>
            <option value="NEVER">Never smoked</option>
            <option value="FORMER">Former smoker</option>
            <option value="OCCASIONAL">Occasional</option>
            <option value="CURRENT">Current smoker</option>
          </select>
        </div>

        <div>
          <label className="label">Alcohol Consumption</label>
          <select
            value={data.alcoholConsumption || ''}
            onChange={(e) => onChange({ alcoholConsumption: e.target.value })}
            className="select"
          >
            <option value="">Select</option>
            <option value="NONE">None</option>
            <option value="OCCASIONAL">Occasional</option>
            <option value="MODERATE">Moderate</option>
            <option value="HEAVY">Heavy</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Step 4: Goals
function GoalsStep({
  data,
  onChange
}: {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
  const goals = [
    { value: 'WEIGHT_LOSS', label: 'Weight Loss', icon: '🔥' },
    { value: 'WEIGHT_GAIN', label: 'Weight Gain', icon: '💪' },
    { value: 'MUSCLE_BUILDING', label: 'Muscle Building', icon: '🏋️' },
    { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight', icon: '⚖️' },
    { value: 'IMPROVE_FITNESS', label: 'Improve Fitness', icon: '🏃' },
    { value: 'INCREASE_FLEXIBILITY', label: 'Increase Flexibility', icon: '🧘' },
    { value: 'STRESS_REDUCTION', label: 'Stress Reduction', icon: '😌' },
    { value: 'BETTER_SLEEP', label: 'Better Sleep', icon: '😴' },
    { value: 'MANAGE_CONDITION', label: 'Manage Health Condition', icon: '❤️' },
    { value: 'GENERAL_WELLNESS', label: 'General Wellness', icon: '✨' },
    { value: 'INJURY_RECOVERY', label: 'Injury Recovery', icon: '🩹' },
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-health-text mb-1">Your Health Goals</h2>
        <p className="text-sm text-health-muted">What do you want to achieve?</p>
      </div>

      <div>
        <label className="label">Primary Goal</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {goals.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => onChange({ primaryGoal: goal.value })}
              className={`px-3 py-3 rounded-lg text-sm border transition-colors text-left ${data.primaryGoal === goal.value
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-health-border text-health-text hover:bg-gray-50'
                }`}
            >
              <span className="text-lg mr-2">{goal.icon}</span>
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Secondary Goals (Optional)</label>
        <p className="text-xs text-health-muted mb-2">Select any additional goals you&apos;d like to work towards</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {goals.filter(g => g.value !== data.primaryGoal).map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => toggleSecondaryGoal(goal.value)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${(data.secondaryGoals || []).includes(goal.value)
                  ? 'bg-accent-50 border-accent-500 text-accent-700'
                  : 'border-health-border text-health-text hover:bg-gray-50'
                }`}
            >
              <span className="mr-1">{goal.icon}</span>
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      {(data.primaryGoal === 'WEIGHT_LOSS' || data.primaryGoal === 'WEIGHT_GAIN') && (
        <div>
          <label className="label">Target Weight (kg)</label>
          <input
            type="number"
            min="20"
            max="300"
            value={data.targetWeight || ''}
            onChange={(e) => onChange({ targetWeight: e.target.value })}
            className="input"
            placeholder="Enter your target weight"
          />
        </div>
      )}
    </div>
  );
}
