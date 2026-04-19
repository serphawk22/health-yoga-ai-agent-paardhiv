import { nutritionists } from '@/lib/data/nutritionists';
import Link from 'next/link';
import { Award, ArrowRight, Clock } from 'lucide-react';

export const metadata = {
  title: 'Expert Nutritionists - Health Agent',
  description: 'Connect with certified nutritionists and health experts for personalized dietary guidance and wellness plans.',
};

export default function NutritionistsPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 pt-2 md:pt-6">
      <div className="mb-6 md:mb-10 px-1 md:px-0">
        <p className="text-zinc-500 font-medium text-[10px] md:text-sm uppercase tracking-wider mb-1">Expert Panel</p>
        <h1 className="text-2xl md:text-3xl font-light text-health-text tracking-tight">
          Our Nutritionists
        </h1>
        <p className="text-zinc-500 mt-2 text-xs md:text-sm max-w-xl">
          Meet our team of certified nutritionists who bring years of expertise in therapeutic nutrition, sports nutrition, Ayurvedic wisdom, and family health.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {nutritionists.map((nutritionist) => (
          <Link
            key={nutritionist.id}
            href={`/nutritionists/${nutritionist.slug}`}
            className="group rounded-3xl bg-zinc-900 border border-zinc-800 p-5 md:p-8 hover:border-zinc-700 transition-all hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-light text-primary-400">
                  {nutritionist.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-medium text-health-text group-hover:text-primary-400 transition-colors tracking-tight mb-1">
                  {nutritionist.name}
                </h2>
                <p className="text-sm text-primary-400/80 font-medium mb-3">{nutritionist.title}</p>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                  {nutritionist.bio.substring(0, 200)}...
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {nutritionist.experience} years experience
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Award className="w-3.5 h-3.5" />
                    {nutritionist.certifications.length} certifications
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {nutritionist.specializations.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                      {spec}
                    </span>
                  ))}
                  {nutritionist.specializations.length > 3 && (
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                      +{nutritionist.specializations.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="self-center shrink-0">
                <div className="p-3 bg-zinc-800 rounded-2xl group-hover:bg-primary-600/20 transition-colors">
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
