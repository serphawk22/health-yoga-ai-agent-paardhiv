'use client';

// Health Metrics Page

import { useState, useEffect, useCallback } from 'react';
import { getHealthMetrics, logHealthMetric } from '@/lib/actions/metrics';
import {
  Loader2,
  AlertCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Heart,
  Scale,
  Moon,
  Droplets,
  Footprints,
  Flame,
  X,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Info,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const METRIC_TYPES = [
  { id: 'WEIGHT', label: 'Weight', unit: 'kg', icon: Scale, color: 'blue' },
  { id: 'BLOOD_PRESSURE_SYS', label: 'Blood Pressure (Sys)', unit: 'mmHg', icon: Heart, color: 'red' },
  { id: 'BLOOD_PRESSURE_DIA', label: 'Blood Pressure (Dia)', unit: 'mmHg', icon: Heart, color: 'red' },
  { id: 'HEART_RATE', label: 'Heart Rate', unit: 'bpm', icon: Activity, color: 'pink' },
  { id: 'BLOOD_SUGAR', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplets, color: 'purple' },
  { id: 'SLEEP_HOURS', label: 'Sleep', unit: 'hours', icon: Moon, color: 'indigo' },
  { id: 'STEPS', label: 'Steps', unit: 'steps', icon: Footprints, color: 'green' },
  { id: 'CALORIES_BURNED', label: 'Calories Burned', unit: 'kcal', icon: Flame, color: 'orange' },
  { id: 'WATER_INTAKE', label: 'Water Intake', unit: 'glasses', icon: Droplets, color: 'cyan' },
];

const METRIC_RANGES: Record<string, { min: number, max: number, step?: number }> = {
  WEIGHT: { min: 30, max: 200, step: 0.1 },
  BLOOD_PRESSURE_SYS: { min: 60, max: 220, step: 1 },
  BLOOD_PRESSURE_DIA: { min: 40, max: 140, step: 1 },
  HEART_RATE: { min: 30, max: 220, step: 1 },
  BLOOD_SUGAR: { min: 40, max: 500, step: 1 },
  SLEEP_HOURS: { min: 0, max: 24, step: 0.5 },
  STEPS: { min: 0, max: 50000, step: 100 },
  CALORIES_BURNED: { min: 0, max: 5000, step: 50 },
  WATER_INTAKE: { min: 0, max: 20, step: 1 },
};

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
      {label && <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-left flex items-center justify-between transition-all duration-300",
          isOpen ? "border-primary-500 ring-2 ring-primary-500/20" : "hover:border-zinc-700 hover:bg-zinc-900/50"
        )}
      >
        <span className={cn("font-semibold", selectedOption ? "text-white" : "text-zinc-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="relative z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 right-0 mt-3 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50 backdrop-blur-3xl"
            >
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar py-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-5 py-3.5 text-left transition-colors flex items-center justify-between border-b border-white/5 last:border-0",
                      value === opt.value ? "bg-primary-500/10 text-primary-400 font-bold" : "text-zinc-400 hover:bg-zinc-900"
                    )}
                  >
                    <span>{opt.label}</span>
                    {value === opt.value && <CheckCircle className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
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
  step,
  unit,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-primary-500/50 group">
      <div className="flex justify-between items-center mb-6">
        <label className="text-xs font-bold text-zinc-500 group-hover:text-primary-400 transition-colors uppercase tracking-[0.2em]">{label}</label>
        <div className="flex items-baseline gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          <span className="text-2xl font-black text-white">{value}</span>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step || 1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400 transition-all"
        />
      </div>
      <div className="flex justify-between mt-3 px-1">
        <span className="text-[10px] font-bold text-zinc-600">{min}</span>
        <span className="text-[10px] font-bold text-zinc-600">{max}</span>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState(METRIC_TYPES[0].id);
  const [metricValue, setMetricValue] = useState('');
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    const result = await getHealthMetrics(dateRange);

    if (result.success) {
      setMetrics(result.data || []);
    }

    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    loadMetrics();
  }, [dateRange, loadMetrics]);

  async function handleAddMetric() {
    if (!metricValue) return;

    setIsSaving(true);
    setError(null);

    const result = await logHealthMetric(
      selectedMetricType,
      parseFloat(metricValue),
      new Date(metricDate)
    );

    if (result.success) {
      setShowAddModal(false);
      setMetricValue('');
      loadMetrics();
    } else {
      setError(result.error || 'Failed to save metric');
    }

    setIsSaving(false);
  }

  const groupedMetrics = METRIC_TYPES.reduce((acc, type) => {
    acc[type.id] = metrics.filter((m: any) => m.type === type.id);
    return acc;
  }, {} as Record<string, any[]>);

  const getLatestValue = (type: string) => {
    const typeMetrics = groupedMetrics[type];
    if (!typeMetrics || typeMetrics.length === 0) return null;
    return typeMetrics[0];
  };

  const getTrend = (type: string) => {
    const typeMetrics = groupedMetrics[type];
    if (!typeMetrics || typeMetrics.length < 2) return 'stable';
    const latest = typeMetrics[0].value;
    const previous = typeMetrics[1].value;
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const selectedMetric = METRIC_TYPES.find(m => m.id === selectedMetricType);

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-text">Health Metrics</h1>
          <p className="text-health-muted">Track and monitor your health data over time</p>
        </div>
        <GradientButton
          onClick={() => setShowAddModal(true)}
          className="h-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Metric
        </GradientButton>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-health-muted" />
          <span className="text-sm text-health-muted">Show data from:</span>
          <div className="flex gap-2 ml-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                  dateRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/5 text-health-text hover:bg-white/10'
                )}
              >
                {range === 'week' ? 'Last 7 days' : range === 'month' ? 'Last 30 days' : 'All time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {METRIC_TYPES.map((type) => {
            const Icon = type.icon;
            const latest = getLatestValue(type.id);
            const trend = getTrend(type.id);
            const colorMap: Record<string, { bg: string; text: string }> = {
              blue: { bg: 'bg-blue-500/20', text: 'text-blue-500' },
              red: { bg: 'bg-red-500/20', text: 'text-red-500' },
              pink: { bg: 'bg-pink-500/20', text: 'text-pink-500' },
              purple: { bg: 'bg-purple-500/20', text: 'text-purple-500' },
              indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500' },
              green: { bg: 'bg-green-500/20', text: 'text-green-500' },
              orange: { bg: 'bg-orange-500/20', text: 'text-orange-500' },
              cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500' },
            };
            const colors = colorMap[type.color] || colorMap.blue;

            return (
              <div key={type.id} className="card p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-health-text">{type.label}</p>
                      <p className="text-xs text-health-muted">{type.unit}</p>
                    </div>
                  </div>
                  {latest && (
                    <div className="text-right">
                      {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600 ml-auto" />}
                      {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600 ml-auto" />}
                      {trend === 'stable' && <Minus className="w-5 h-5 text-gray-400 ml-auto" />}
                    </div>
                  )}
                </div>

                {latest ? (
                  <div>
                    <p className="text-2xl font-bold text-health-text">
                      {latest.value} <span className="text-sm font-normal text-health-muted">{type.unit}</span>
                    </p>
                    <p className="text-xs text-health-muted mt-1">
                      Last logged: {new Date(latest.recordedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-health-muted mb-2">No data yet</p>
                    <button
                      onClick={() => {
                        setSelectedMetricType(type.id);
                        setShowAddModal(true);
                      }}
                      className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                    >
                      + Add first reading
                    </button>
                  </div>
                )}

                {/* Mini history */}
                {groupedMetrics[type.id] && groupedMetrics[type.id].length > 1 && (
                  <div className="mt-3 pt-3 border-t border-health-border">
                    <p className="text-xs text-health-muted mb-2">Recent readings:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {groupedMetrics[type.id].slice(0, 5).map((m: any, i: number) => (
                        <div key={i} className="text-center shrink-0">
                          <p className="text-xs font-medium text-health-text">{m.value}</p>
                          <p className="text-xs text-health-muted">
                            {new Date(m.recordedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Metric Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full z-10 overflow-hidden relative"
            >
              <div className="flex items-center justify-between p-8 border-b border-health-border/50">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Log Health Reading</h3>
                  <p className="text-sm text-zinc-500 mt-1">Updates your health profile instantly</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 group"
                >
                  <X className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Metric Type Selection */}
                <PremiumDropdown
                  label="What reading are you logging?"
                  value={selectedMetricType}
                  options={METRIC_TYPES.map(t => ({ value: t.id, label: `${t.label} (${t.unit})` }))}
                  onChange={setSelectedMetricType}
                />

                {/* Value Input with Slider */}
                {selectedMetric && (
                  <StyledSlider
                    label={`Adjust ${selectedMetric.label}`}
                    value={parseFloat(metricValue) || METRIC_RANGES[selectedMetricType]?.min || 0}
                    min={METRIC_RANGES[selectedMetricType]?.min || 0}
                    max={METRIC_RANGES[selectedMetricType]?.max || 100}
                    step={METRIC_RANGES[selectedMetricType]?.step}
                    unit={selectedMetric.unit}
                    onChange={setMetricValue}
                  />
                )}

                {/* Date Input */}
                <div className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recorded Date</label>
                  </div>
                  <input
                    type="date"
                    value={metricDate}
                    onChange={(e) => setMetricDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 p-8 pt-0">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-4 rounded-2xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-white/5 flex-1"
                >
                  Cancel
                </button>
                <GradientButton
                  onClick={handleAddMetric}
                  disabled={!metricValue || isSaving}
                  className="flex-1 py-4 h-auto text-sm"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Check className="w-5 h-5 mr-2" />
                      Save Metric
                    </span>
                  )}
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="card mt-6 bg-blue-500/10 border-blue-500/20">
        <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2"><Info className="w-5 h-5" /> Tips for Tracking</h3>
        <ul className="space-y-1 text-sm text-blue-300">
          <li>• Log your metrics at the same time each day for consistency</li>
          <li>• Track weight first thing in the morning for accurate readings</li>
          <li>• Record blood pressure after 5 minutes of rest</li>
          <li>• Regular tracking helps identify patterns and trends</li>
        </ul>
      </div>
    </div>
  );
}
