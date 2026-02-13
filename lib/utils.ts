// Utility Functions
import { type ClassValue, clsx } from 'clsx';

// Class name merger utility (like cn from shadcn)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Calculate BMI
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Get health score color
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

// Get health score background
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// Format health goal for display
export function formatGoal(goal: string): string {
  return goal
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Body parts list for exercises
export const BODY_PARTS = [
  'Full Body',
  'Back',
  'Chest',
  'Shoulders',
  'Arms',
  'Core',
  'Legs',
  'Glutes',
  'Knees',
  'Neck',
  'Hips',
];

// Health conditions list
export const HEALTH_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Thyroid Disorder',
  'Asthma',
  'Arthritis',
  'Back Pain',
  'Obesity',
  'High Cholesterol',
  'PCOS',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Migraine',
];

// Goal options
export const GOAL_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain' },
  { value: 'MUSCLE_BUILDING', label: 'Muscle Building' },
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
  { value: 'IMPROVE_FITNESS', label: 'Improve Fitness' },
  { value: 'INCREASE_FLEXIBILITY', label: 'Increase Flexibility' },
  { value: 'STRESS_REDUCTION', label: 'Stress Reduction' },
  { value: 'BETTER_SLEEP', label: 'Better Sleep' },
  { value: 'MANAGE_CONDITION', label: 'Manage Health Condition' },
  { value: 'GENERAL_WELLNESS', label: 'General Wellness' },
  { value: 'INJURY_RECOVERY', label: 'Injury Recovery' },
];
