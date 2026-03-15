import { getMetricBySlug, metricsKnowledge } from '@/lib/data/metrics-knowledge';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, PlayCircle, ShoppingCart, CheckCircle } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const metric = getMetricBySlug(params.slug);
  if (!metric) return { title: 'Metric Not Found' };
  return {
    title: `${metric.name} - Understanding Your Health Numbers`,
    description: `Learn what ${metric.name.toLowerCase()} means, why it is important, and how to measure it at home. Simple health education for everyone.`,
  };
}

export function generateStaticParams() {
  return metricsKnowledge.map((m) => ({ slug: m.slug }));
}

export default function MetricKnowledgePage({ params }: { params: { slug: string } }) {
  const metric = getMetricBySlug(params.slug);

  if (!metric) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6">
      {/* Back Link */}
      <Link
        href="/metrics/knowledge"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Health Metrics Guide
      </Link>

      <h1 className="text-3xl md:text-4xl font-light text-health-text tracking-tight mb-2">
        {metric.name}
      </h1>
      <p className="text-zinc-500 text-sm mb-10">
        Normal Range: {metric.normalRange}
      </p>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Explanation */}
        <div className="space-y-8">
          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">What does this number mean?</h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              {metric.whatItMeans}
            </p>
          </section>

          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Why is it important?</h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              {metric.whyImportant}
            </p>
          </section>

          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">What do we learn from tracking it?</h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              {metric.whatWeLean}
            </p>
          </section>
        </div>

        {/* Right Side - Practical Tools & Resources */}
        <div className="space-y-8">
          {/* Device Recommendation */}
          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Recommended Device</h2>
            <div className="bg-zinc-800/50 rounded-2xl p-6 mb-4">
              <h3 className="text-sm font-bold text-health-text mb-2">{metric.deviceName}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                {metric.deviceDescription}
              </p>
              <a
                href={metric.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                View on Amazon
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>

          {/* How to Measure */}
          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">How to Measure at Home</h2>
            <ol className="space-y-3">
              {metric.measurementGuide.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Video Tutorial */}
          <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
            <h2 className="text-lg font-medium text-health-text mb-4 tracking-tight">Video Tutorial</h2>
            <a
              href={metric.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <PlayCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-health-text group-hover:text-primary-400 transition-colors">
                  {metric.videoTitle}
                </h3>
                <p className="text-xs text-zinc-500">Watch on YouTube</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600 ml-auto" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
