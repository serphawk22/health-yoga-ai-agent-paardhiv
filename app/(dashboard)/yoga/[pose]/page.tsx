import { getYogaPoseBySlug, allYogaPoses } from '@/lib/data/yoga-asanas';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldAlert, Target, Clock, PlayCircle, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: { pose: string } }) {
  const pose = getYogaPoseBySlug(params.pose);
  if (!pose) return { title: 'Pose Not Found' };
  return {
    title: `${pose.englishName} (${pose.sanskritName}) - Yoga Pose Guide`,
    description: `Learn ${pose.englishName} with step-by-step instructions, benefits, common mistakes to avoid, and safety precautions. Complete yoga pose guide.`,
  };
}

export function generateStaticParams() {
  return allYogaPoses.map((p) => ({ pose: p.slug }));
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-400' },
  Intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  Advanced: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

export default function YogaPosePage({ params }: { params: { pose: string } }) {
  const pose = getYogaPoseBySlug(params.pose);

  if (!pose) {
    notFound();
  }

  const colors = difficultyColors[pose.difficulty] || difficultyColors.Beginner;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-6">
      {/* Back Link */}
      <Link
        href="/yoga/library"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Yoga Library
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
            {pose.difficulty}
          </span>
          <span className="text-xs text-zinc-600">{pose.category}</span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Clock className="w-3.5 h-3.5" />
            {pose.duration}
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-health-text tracking-tight mb-1">
          {pose.englishName}
        </h1>
        <p className="text-lg text-zinc-500 italic">{pose.sanskritName}</p>
      </div>

      {/* Introduction */}
      <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Introduction</h2>
        <p className="text-sm text-zinc-400 font-light leading-relaxed">
          {pose.introduction}
        </p>
      </section>

      {/* Target Areas */}
      <div className="flex flex-wrap gap-2 mb-8">
        {pose.targetAreas.map((area, i) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600/10 border border-primary-500/20 text-primary-400 text-xs font-medium">
            <Target className="w-3 h-3" />
            {area}
          </span>
        ))}
      </div>

      {/* Benefits */}
      <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
        <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Benefits</h2>
        <ul className="space-y-3">
          {pose.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
              <span className="text-sm text-zinc-400 font-light leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Step by Step Instructions */}
      <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
        <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Step-by-Step Instructions</h2>
        <ol className="space-y-4">
          {pose.instructions.map((step, i) => (
            <li key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-800/30">
              <span className="w-8 h-8 rounded-xl bg-primary-600/20 text-primary-400 text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-zinc-300 font-light leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Common Mistakes & Safety - Two Column */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-medium text-health-text tracking-tight">Common Mistakes</h2>
          </div>
          <ul className="space-y-3">
            {pose.commonMistakes.map((mistake, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="text-sm text-zinc-400 font-light leading-relaxed">{mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-lg font-medium text-health-text tracking-tight">Safety Precautions</h2>
          </div>
          <ul className="space-y-3">
            {pose.safetyPrecautions.map((precaution, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <span className="text-sm text-zinc-400 font-light leading-relaxed">{precaution}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Video Tutorial */}
      {pose.videoUrl && (
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Video Tutorial</h2>
          <a
            href={pose.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <PlayCircle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-health-text group-hover:text-primary-400 transition-colors">
                Watch: How to do {pose.englishName}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Follow along with a guided video tutorial</p>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-600 ml-auto" />
          </a>
        </section>
      )}
    </div>
  );
}
