import { allYogaPoses, topTenPoses } from '@/lib/data/yoga-asanas';
import Link from 'next/link';
import { ArrowRight, Star, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Yoga Asana Library - Complete Pose Guide',
  description: 'Explore our comprehensive yoga pose library with detailed instructions, benefits, safety precautions, and video tutorials for each asana.',
};

const difficultyColors: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-400' },
  Intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  Advanced: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

export default function YogaLibraryPage() {
  const remainingPoses = allYogaPoses.filter(p => !topTenPoses.find(t => t.id === p.id));

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6">
      <div className="mb-10">
        <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Yoga Knowledge</p>
        <h1 className="text-3xl font-light text-health-text tracking-tight">
          Yoga Asana Library
        </h1>
        <p className="text-zinc-500 mt-2 text-sm max-w-xl">
          Explore yoga poses with detailed instructions, benefits, common mistakes, and safety precautions. Each pose page includes step-by-step guidance and video tutorials.
        </p>
      </div>

      {/* Top 10 Poses Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-medium text-health-text tracking-tight">Top 10 Essential Poses</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {topTenPoses.map((pose, index) => {
            const colors = difficultyColors[pose.difficulty] || difficultyColors.Beginner;
            return (
              <Link
                key={pose.id}
                href={`/yoga/${pose.slug}`}
                className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-zinc-700 transition-all hover:shadow-lg flex items-start gap-4"
              >
                <span className="w-8 h-8 rounded-xl bg-primary-600/20 text-primary-400 text-sm font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-health-text group-hover:text-primary-400 transition-colors mb-1 truncate">
                    {pose.englishName}
                  </h3>
                  <p className="text-xs text-zinc-600 italic mb-2">{pose.sanskritName}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                      {pose.difficulty}
                    </span>
                    <span className="text-[10px] text-zinc-600">{pose.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary-400 transition-colors shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Poses Section */}
      {remainingPoses.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-600/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-medium text-health-text tracking-tight">More Poses</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {remainingPoses.map((pose) => {
              const colors = difficultyColors[pose.difficulty] || difficultyColors.Beginner;
              return (
                <Link
                  key={pose.id}
                  href={`/yoga/${pose.slug}`}
                  className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-700 transition-all hover:shadow-lg"
                >
                  <h3 className="text-sm font-medium text-health-text group-hover:text-primary-400 transition-colors mb-1 truncate">
                    {pose.englishName}
                  </h3>
                  <p className="text-xs text-zinc-600 italic mb-3">{pose.sanskritName}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                      {pose.difficulty}
                    </span>
                    <span className="text-[10px] text-zinc-600">{pose.category}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
