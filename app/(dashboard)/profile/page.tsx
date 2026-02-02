// Profile View/Edit Page
'use client';

import { useState, useEffect } from 'react';
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
  AlertTriangle,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'motion/react';

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

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
    } else if (!result.data) {
      router.push('/profile/setup');
    } else {
      setError(result.error || 'Failed to load profile');
    }

    setIsLoading(false);
  }

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
    } else {
      setError(result.error || 'Failed to update profile');
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
        <div className="card text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-health-text mb-2">Profile Not Set Up</h2>
          <p className="text-health-muted mb-4">Please complete your health profile to get started.</p>
          <GradientButton
            onClick={() => router.push('/profile/setup')}
            className="mt-4"
          >
            Set Up Profile
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto pb-20 lg:pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-text">Health Profile</h1>
          <p className="text-health-muted">Your personal health information</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-secondary border-health-border hover:bg-white/5">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-secondary border-health-border hover:bg-white/5">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <GradientButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </GradientButton>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-health-text">Basic Information</h2>
          </div>

          {isEditing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm || ''}
                  onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg || ''}
                  onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={Calendar} label="Age" value={`${profile.age} years`} />
              <InfoCard icon={User} label="Gender" value={profile.gender} />
              <InfoCard icon={Ruler} label="Height" value={`${profile.heightCm} cm`} />
              <InfoCard icon={Scale} label="Weight" value={`${profile.weightKg} kg`} />
            </div>
          )}
        </div>

        {/* Health Metrics */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-health-text">Health Metrics</h2>
          </div>

          {isEditing ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Activity Level</label>
                <select
                  value={formData.activityLevel || ''}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="input"
                >
                  <option value="SEDENTARY">Sedentary</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active</option>
                  <option value="VERY_ACTIVE">Very Active</option>
                  <option value="EXTREMELY_ACTIVE">Extremely Active</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Sleep Hours</label>
                <input
                  type="number"
                  value={formData.sleepHours || ''}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                  className="input"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Stress Level</label>
                <select
                  value={formData.stressLevel || ''}
                  onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                  <option value="VERY_HIGH">Very High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Water Intake (glasses/day)</label>
                <input
                  type="number"
                  value={formData.waterIntake || ''}
                  onChange={(e) => setFormData({ ...formData, waterIntake: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard
                icon={Activity}
                label="Activity"
                value={formatEnumValue(profile.activityLevel)}
              />
              <InfoCard icon={Activity} label="Sleep" value={`${profile.sleepHours || '-'} hours`} />
              <InfoCard
                icon={Activity}
                label="Stress"
                value={formatEnumValue(profile.stressLevel)}
              />
              <InfoCard icon={Activity} label="Water" value={`${profile.waterIntake || '-'} glasses`} />
            </div>
          )}
        </div>

        {/* Diet Preferences */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Apple className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-health-text">Diet & Preferences</h2>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">Diet Type</label>
                <select
                  value={formData.dietType || ''}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  className="input"
                >
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="PESCATARIAN">Pescatarian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.allergies?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    allergies: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Peanuts, Dairy, Gluten"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">
                  Food Preferences (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.foodPreferences?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    foodPreferences: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., South Indian, Low spice"
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-health-text">Diet Type:</span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm border border-green-500/20">
                  {formatEnumValue(profile.dietType)}
                </span>
              </div>
              {profile.allergies && profile.allergies.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-health-text">Allergies:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.allergies.map((allergy: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm border border-red-500/20">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.foodPreferences && profile.foodPreferences.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-health-text">Preferences:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.foodPreferences.map((pref: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-sm border border-blue-500/20">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Health Conditions */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-health-text">Health Conditions</h2>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">
                  Health Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.healthConditions?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthConditions: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Diabetes, Hypertension"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-health-text mb-1">
                  Current Medications (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.medications?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    medications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Metformin, Aspirin"
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.healthConditions && profile.healthConditions.length > 0 ? (
                <div>
                  <span className="text-sm font-medium text-health-text">Conditions:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.healthConditions.map((condition: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-sm border border-amber-500/20">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-health-muted">No health conditions reported</p>
              )}
              {profile.medications && profile.medications.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-health-text">Medications:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.medications.map((med: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm border border-purple-500/20">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Health Goals */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-health-text">Health Goals</h2>
          </div>

          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-health-text mb-1">
                Your Health Goals (comma separated)
              </label>
              <textarea
                value={formData.fitnessGoals?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  fitnessGoals: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., Lose weight, Build muscle, Improve sleep"
                className="textarea"
                rows={3}
              />
            </div>
          ) : (
            <div>
              {profile.fitnessGoals && profile.fitnessGoals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.fitnessGoals.map((goal: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-500 text-sm border border-primary-500/20">
                      🎯 {goal}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-health-muted">No goals set yet</p>
              )}
            </div>
          )}
        </div>

        {/* Calculated BMI */}
        {profile.heightCm && profile.weightKg && (
          <div className="card bg-gradient-to-r from-primary-500/10 to-blue-500/10 border-primary-500/20">
            <h3 className="font-semibold text-primary-400 mb-3">Your BMI</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary-500">
                {(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)}
              </div>
              <div>
                <p className="text-sm text-primary-300">
                  {getBmiCategory(profile.weightKg / Math.pow(profile.heightCm / 100, 2))}
                </p>
                <p className="text-xs text-primary-400/70">Based on your height and weight</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-health-muted" />
        <span className="text-xs text-health-muted">{label}</span>
      </div>
      <p className="font-medium text-health-text">{value || '-'}</p>
    </div>
  );
}

function formatEnumValue(value: string | undefined): string {
  if (!value) return '-';
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
