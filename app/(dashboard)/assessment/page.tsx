// Health Assessment Page
'use client';

import { useState, useEffect } from 'react';
import { calculateHealthAssessment } from '@/lib/actions/metrics';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Activity,
  Heart,
  Brain,
  Moon,
  Utensils,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Target,
  Gauge,
} from 'lucide-react';

export default function AssessmentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setIsLoading(true);
    setError(null);

    const result = await calculateHealthAssessment();

    if (result.success) {
      setAssessment(result.data);
    } else {
      setError(result.error || 'Failed to calculate health assessment');
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-health-muted">Calculating your health assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="card text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-health-text mb-2">Assessment Not Available</h2>
          <p className="text-health-muted mb-4">{error}</p>
          <button onClick={loadAssessment} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-health-text">Health Assessment</h1>
          <p className="text-health-muted">Your comprehensive health score analysis</p>
        </div>
        <button onClick={loadAssessment} className="btn-secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {assessment && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overall Score */}
          <div className="card">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(assessment.overall.score / 100) * 440} 440`}
                    strokeLinecap="round"
                    className={getScoreColor(assessment.overall.score)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getTextColor(assessment.overall.score)}`}>
                    {assessment.overall.score}
                  </span>
                  <span className="text-sm text-health-muted">out of 100</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-health-text mb-2">
                  {getScoreLabel(assessment.overall.score)}
                </h2>
                <p className="text-health-muted mb-4">{assessment.overall.summary}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {assessment.overall.score >= 80 && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                      ⭐ Excellent Health
                    </span>
                  )}
                  {assessment.overall.score >= 60 && assessment.overall.score < 80 && (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                      💪 Good Progress
                    </span>
                  )}
                  {assessment.overall.score < 60 && (
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                      🎯 Room to Improve
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoreCard
              icon={Activity}
              label="BMI Score"
              score={assessment.bmi.score}
              details={assessment.bmi.recommendation}
              color="blue"
            />
            <ScoreCard
              icon={Dumbbell}
              label="Activity Level"
              score={assessment.activity.score}
              details={assessment.activity.recommendation}
              color="green"
            />
            <ScoreCard
              icon={Moon}
              label="Sleep Quality"
              score={assessment.sleep.score}
              details={assessment.sleep.recommendation}
              color="purple"
            />
            <ScoreCard
              icon={Brain}
              label="Stress Level"
              score={assessment.stress.score}
              details={assessment.stress.recommendation}
              color="orange"
            />
            <ScoreCard
              icon={Utensils}
              label="Nutrition"
              score={assessment.nutrition?.score || 50}
              details={assessment.nutrition?.recommendation || "Maintain a balanced diet."}
              color="yellow"
            />
            <ScoreCard
              icon={Heart}
              label="Overall Wellness"
              score={assessment.overall.score}
              details={assessment.overall.summary}
              color="red"
            />
          </div>

          {/* Recommendations */}
          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-health-text">Personalized Recommendations</h3>
              </div>
              <div className="space-y-3">
                {assessment.recommendations.map((rec: any, i: number) => (
                  <RecommendationCard key={i} recommendation={rec} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {assessment.riskFactors && assessment.riskFactors.length > 0 && (
            <div className="card bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Areas to Watch</h3>
              </div>
              <ul className="space-y-2">
                {assessment.riskFactors.map((risk: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200/80">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {assessment.strengths && assessment.strengths.length > 0 && (
            <div className="card bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Your Strengths</h3>
              </div>
              <ul className="space-y-2">
                {assessment.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200/80">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goal Suggestions */}
          {assessment.goalSuggestions && assessment.goalSuggestions.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-health-text">Suggested Goals</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {assessment.goalSuggestions.map((goal: string, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-health-border hover:border-primary-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-health-text">{goal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-gray-100 text-sm text-health-muted flex items-start gap-2">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Note:</strong> This health assessment is based on the information in your profile
              and is for informational purposes only. It is not a medical diagnosis. For accurate health
              evaluations, please consult with healthcare professionals.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  label,
  score,
  details,
  color
}: {
  icon: any;
  label: string;
  score: number;
  details?: string;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
    green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-500' },
    red: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-health-muted">{label}</p>
          <p className="text-xl font-bold text-health-text">{score}/100</p>
        </div>
        {score >= 70 ? (
          <TrendingUp className="w-5 h-5 text-green-600" />
        ) : score >= 50 ? (
          <Minus className="w-5 h-5 text-yellow-600" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-600" />
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      {details && (
        <p className="text-xs text-health-muted mt-2">{details}</p>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation, index }: { recommendation: any; index: number }) {
  const priorityColors: Record<string, string> = {
    high: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
    medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
  };

  const priority = recommendation.priority || 'medium';
  const colorClass = priorityColors[priority] || priorityColors.medium;

  return (
    <div className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-health-text">{recommendation.title}</h4>
          <p className="text-sm text-health-muted mt-1">{recommendation.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded capitalize ${priority === 'high' ? 'bg-red-100 text-red-700' :
          priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
          {priority}
        </span>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getTextColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Health';
  if (score >= 80) return 'Very Good Health';
  if (score >= 70) return 'Good Health';
  if (score >= 60) return 'Fair Health';
  if (score >= 50) return 'Needs Improvement';
  return 'Requires Attention';
}
