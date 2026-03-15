import { getNutritionistBySlug, nutritionists } from '@/lib/data/nutritionists';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, Clock, BookOpen, PlayCircle, Lightbulb, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const nutritionist = getNutritionistBySlug(params.slug);
  if (!nutritionist) return { title: 'Nutritionist Not Found' };
  return {
    title: `${nutritionist.name} - ${nutritionist.title}`,
    description: `${nutritionist.name} is a ${nutritionist.title} with ${nutritionist.experience} years of experience specializing in ${nutritionist.specializations.slice(0, 3).join(', ')}.`,
  };
}

export function generateStaticParams() {
  return nutritionists.map((n) => ({ slug: n.slug }));
}

export default function NutritionistPage({ params }: { params: { slug: string } }) {
  const nutritionist = getNutritionistBySlug(params.slug);

  if (!nutritionist) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-6">
      {/* Back Link */}
      <Link
        href="/nutritionists"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Nutritionists
      </Link>

      {/* Profile Header */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center shrink-0">
            <span className="text-3xl font-light text-primary-400">
              {nutritionist.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-light text-health-text tracking-tight mb-1">
              {nutritionist.name}
            </h1>
            <p className="text-sm text-primary-400 font-medium mb-4">{nutritionist.title}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {nutritionist.experience} years experience
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {nutritionist.certifications.length} certifications
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">About</h2>
        <p className="text-sm text-zinc-400 font-light leading-relaxed">{nutritionist.bio}</p>
      </section>

      {/* Certifications & Specializations */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Certifications</h2>
          <ul className="space-y-3">
            {nutritionist.certifications.map((cert, i) => (
              <li key={i} className="flex items-start gap-3">
                <Award className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-300 font-light">{cert}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {nutritionist.specializations.map((spec, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-primary-600/10 border border-primary-500/20 text-primary-400 text-xs font-medium">
                {spec}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Blogs */}
      {nutritionist.blogs.length > 0 && (
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Articles by {nutritionist.name.split(' ')[0]}</h2>
          </div>
          <div className="space-y-4">
            {nutritionist.blogs.map((blog, i) => (
              <div key={i} className="p-5 rounded-2xl bg-zinc-800/50 border border-zinc-800">
                <h3 className="text-sm font-medium text-health-text mb-2">{blog.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{blog.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {nutritionist.videos.length > 0 && (
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <PlayCircle className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Video Content</h2>
          </div>
          <div className="space-y-4">
            {nutritionist.videos.map((video, i) => (
              <a
                key={i}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-health-text group-hover:text-primary-400 transition-colors">{video.title}</h3>
                  <p className="text-xs text-zinc-500">{video.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-600" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Health Tips */}
      {nutritionist.tips.length > 0 && (
        <section className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Expert Health Tips</h2>
          </div>
          <ul className="space-y-3">
            {nutritionist.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-800/30">
                <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
