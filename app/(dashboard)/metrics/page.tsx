// Health Metrics Page
'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  async function loadMetrics() {
    setIsLoading(true);
    const result = await getHealthMetrics(dateRange);

    if (result.success) {
      setMetrics(result.data || []);
    }

    setIsLoading(false);
  }

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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-health-card border border-health-border rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-health-border">
              <h3 className="font-semibold text-health-text">Log Health Metric</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-health-muted" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Metric Type Selection */}
              <div>
                <label className="block text-sm font-medium text-health-text mb-2">
                  Metric Type
                </label>
                <select
                  value={selectedMetricType}
                  onChange={(e) => setSelectedMetricType(e.target.value)}
                  className="input"
                >
                  {METRIC_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label} ({type.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-sm font-medium text-health-text mb-2">
                  Value ({selectedMetric?.unit})
                </label>
                <input
                  type="number"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder={`Enter ${selectedMetric?.label.toLowerCase()}`}
                  className="input"
                  step="0.1"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-health-text mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={metricDate}
                  onChange={(e) => setMetricDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t border-health-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1 border border-health-border hover:bg-white/5"
              >
                Cancel
              </button>
              <GradientButton
                onClick={handleAddMetric}
                disabled={!metricValue || isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Metric
                  </>
                )}
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card mt-6 bg-blue-500/10 border-blue-500/20">
        <h3 className="font-semibold text-blue-400 mb-2">💡 Tips for Tracking</h3>
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
