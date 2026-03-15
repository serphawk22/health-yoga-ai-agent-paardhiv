import { metricsKnowledge } from '@/lib/data/metrics-knowledge';
import Link from 'next/link';
import { Heart, Droplets, Scale, Activity, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Health Metrics Guide - Understanding Your Health Numbers',
  description: 'Simple, easy-to-understand guides about important health metrics like blood pressure, blood sugar, weight, and heart rate.',
};

const iconMap: Record<string, any> = {
  Heart, Droplets, Scale, Activity,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
};

export default function MetricsKnowledgePage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6">
      <div className="mb-10">
        <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Health Education</p>
        <h1 className="text-3xl font-light text-health-text tracking-tight">
          Understanding Your Health Numbers
        </h1>
        <p className="text-zinc-500 mt-2 text-sm max-w-xl">
          Simple explanations of important health metrics. Learn what they mean, why they matter, and how to measure them at home.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {metricsKnowledge.map((metric) => {
          const Icon = iconMap[metric.icon] || Heart;
          const colors = colorMap[metric.color] || colorMap.blue;

          return (
            <Link
              key={metric.slug}
              href={`/metrics/${metric.slug}`}
              className="group rounded-3xl bg-zinc-900 border border-zinc-800 p-8 hover:border-zinc-700 transition-all hover:shadow-xl"
            >
              <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                <Icon className={`w-7 h-7 ${colors.text}`} />
              </div>
              <h2 className="text-xl font-medium text-health-text group-hover:text-primary-400 transition-colors tracking-tight mb-3">
                {metric.name}
              </h2>
              <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed mb-6">
                {metric.whatItMeans.substring(0, 150)}...
              </p>
              <div className="flex items-center gap-2 text-sm text-primary-400 font-medium">
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
