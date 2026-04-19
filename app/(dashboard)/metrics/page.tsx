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
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const METRIC_TYPES = [
  { id: 'WEIGHT', label: 'Body Weight', unit: 'kg', icon: Scale, color: 'blue' },
  { id: 'BLOOD_PRESSURE_SYS', label: 'Blood Pressure (Top Number)', unit: 'mmHg', icon: Heart, color: 'red' },
  { id: 'BLOOD_PRESSURE_DIA', label: 'Blood Pressure (Bottom Number)', unit: 'mmHg', icon: Heart, color: 'red' },
  { id: 'HEART_RATE', label: 'Heart Beat', unit: 'bpm', icon: Activity, color: 'pink' },
  { id: 'BLOOD_SUGAR', label: 'Sugar Level', unit: 'mg/dL', icon: Droplets, color: 'purple' },
  { id: 'SLEEP_HOURS', label: 'Sleep', unit: 'hours', icon: Moon, color: 'indigo' },
  { id: 'STEPS', label: 'Steps', unit: 'steps', icon: Footprints, color: 'green' },
  { id: 'CALORIES_BURNED', label: 'Calories Burned', unit: 'kcal', icon: Flame, color: 'orange' },
  { id: 'WATER_INTAKE', label: 'Water Intake', unit: 'L', icon: Droplets, color: 'cyan' },
];

const METRIC_GROUPS = [
  {
    title: 'Daily Activity',
    metrics: ['STEPS', 'CALORIES_BURNED', 'WATER_INTAKE', 'SLEEP_HOURS'],
  },
  {
    title: 'Body',
    metrics: ['WEIGHT', 'BLOOD_SUGAR'],
  },
  {
    title: 'Heart & Blood',
    metrics: ['BLOOD_PRESSURE_SYS', 'BLOOD_PRESSURE_DIA', 'HEART_RATE'],
  }
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
  WATER_INTAKE: { min: 0, max: 10, step: 0.1 },
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



export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState(METRIC_TYPES[0].id);
  const [metricValue, setMetricValue] = useState('');
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    const fetchRange = dateRange === 'today' ? 'week' : dateRange;
    const result = await getHealthMetrics(fetchRange);

    if (result.success) {
      let data = result.data || [];
      if (dateRange === 'today') {
        const today = new Date();
        const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        data = data.filter((m: any) => {
          if (!m.recordedAt) return false;
          const d = new Date(m.recordedAt);
          const mStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          return mStr === todayStr;
        });
      }
      setMetrics(data);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-health-text">Health Metrics</h1>
          <p className="text-xs md:text-sm text-health-muted">Track and monitor your health data over time</p>
        </div>
        <GradientButton
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto py-3 md:py-4 h-auto text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Metric
        </GradientButton>
      </div>

      {/* Knowledge Guide Banner */}
      <Link href="/metrics/knowledge">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group rounded-[24px] p-6 mb-8 bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-blue-500/20 ring-1 ring-blue-500/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-blue-500/40 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6"
        >
          <div className="p-4 bg-blue-500/10 rounded-[1.5rem] w-fit shrink-0">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Health Metrics Guide</h3>
            <p className="text-sm text-zinc-400 font-light">Learn all about what these numbers mean: blood pressure, blood sugar, BMI, and more.</p>
          </div>
        </motion.div>
      </Link>

      {/* Date Range Filter */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-[24px] mb-8 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
            <span className="text-base md:text-lg font-medium text-zinc-400">Show analytics for:</span>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {(['today', 'week', 'month', 'all'] as const).map((range) => {
              const labels: Record<string, string> = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                all: 'All Time'
              };
              return (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={cn(
                    "px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-base font-bold transition-colors min-h-[40px] md:min-h-[48px]",
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  )}
                >
                  {labels[range]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div>
          {METRIC_GROUPS.map((group) => (
            <div key={group.title} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">{group.title}</h2>
                <div className="h-px flex-1 bg-zinc-800 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.metrics.map(metricId => {
                  const type = METRIC_TYPES.find(t => t.id === metricId);
                  if (!type) return null;
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
                    <div key={type.id} className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 md:p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[18px] md:rounded-[20px] ${colors.bg} flex items-center justify-center mb-4 md:mb-5`}>
                          <Icon className={`w-8 h-8 md:w-10 md:h-10 ${colors.text}`} />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{type.label}</h3>

                        {latest ? (
                          <div className="my-4 md:my-5 w-full">
                            <p className="text-3xl md:text-[2.5rem] font-black text-white leading-none">
                              {latest.value} <span className="text-lg font-normal text-zinc-400">{type.unit}</span>
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <p className="text-base text-zinc-400 font-medium">
                                Last: {new Date(latest.recordedAt).toLocaleDateString()}
                              </p>
                              {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                              {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                              {trend === 'stable' && <Minus className="w-5 h-5 text-gray-500" />}
                            </div>
                          </div>
                        ) : (
                          <div className="my-5 py-4">
                            <p className="text-[1.1rem] text-zinc-400 font-medium px-2 leading-relaxed">
                              No readings yet.<br />
                              Tap the button below to add your first one.
                            </p>
                          </div>
                        )}

                        <GradientButton
                          onClick={() => {
                            setSelectedMetricType(type.id);
                            setShowAddModal(true);
                          }}
                          className="w-full min-h-[48px] md:min-h-[56px] mt-4 rounded-[14px] md:rounded-[16px] font-bold text-base md:text-xl"
                        >
                          <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2 group-hover:scale-110 transition-transform" />
                          Add Reading
                        </GradientButton>
                      </div>

                      {/* Mini history */}
                      {groupedMetrics[type.id] && groupedMetrics[type.id].length > 1 && (
                        <div className="mt-8 pt-5 border-t border-zinc-800">
                          <p className="text-sm font-medium text-zinc-500 mb-4 text-center">Recent history</p>
                          <div className="flex gap-3 overflow-x-auto no-scrollbar justify-center pb-2">
                            {groupedMetrics[type.id].slice(0, 5).map((m: any, i: number) => (
                              <div key={i} className="text-center shrink-0 bg-white/5 rounded-[12px] px-3 py-2 border border-white/5">
                                <p className="text-sm font-bold text-white mb-1">{m.value}</p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{new Date(m.recordedAt || m.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-primary-500/50 group">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-zinc-500 group-hover:text-primary-400 transition-colors uppercase tracking-[0.2em]">
                        Enter {selectedMetric.label}
                      </label>
                      <div className="flex items-center gap-1.5 bg-black/40 px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                        <input
                          type="number"
                          value={metricValue}
                          onChange={(e) => setMetricValue(e.target.value)}
                          placeholder="0"
                          className="bg-transparent text-2xl font-black text-white w-24 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{selectedMetric.unit}</span>
                      </div>
                    </div>
                  </div>
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
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-[24px] mt-8 p-8">
        <h3 className="text-xl font-bold text-blue-400 mb-5 flex items-center gap-3">
          <Info className="w-6 h-6" /> Helpful Tips
        </h3>
        <ul className="space-y-4 text-base text-blue-300 font-medium">
          <li className="flex gap-3 items-start"><span className="text-blue-400 mt-0.5">•</span> Try to record your health numbers at the same time each day</li>
          <li className="flex gap-3 items-start"><span className="text-blue-400 mt-0.5">•</span> Measure weight in the morning before eating</li>
          <li className="flex gap-3 items-start"><span className="text-blue-400 mt-0.5">•</span> Sit and relax for 5 minutes before checking blood pressure</li>
        </ul>
      </div>
    </div>
  );
}
