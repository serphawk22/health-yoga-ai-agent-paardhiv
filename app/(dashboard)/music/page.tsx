import { Metadata } from 'next';
import { getSpotifyToken } from '@/lib/spotify';
import { Headphones, Wind, Activity } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yoga & Focus Music | Health Agent',
  description: 'Personalized calm and light music for your yoga and concentration sessions.',
};

export default async function MusicPage() {
  const accessToken = await getSpotifyToken();
  const isConnected = !!accessToken;

  const curatedPlaylists = [
    {
      id: '4Qxy1JjPBbohRQIlMj6xBA',
      name: 'Calm & Focused',
      description: 'Soft piano and quiet instrumentals for deep focus.',
    },
    {
      id: '37i9dQZF1DX9uKNf5jGX6m',
      name: 'Yoga & Meditation',
      description: 'Find your center with soft ambient sounds.',
    },
    {
      id: '37i9dQZF1DWZeKCadgRdKQ',
      name: 'Deep Focus',
      description: 'Keep your mind sharp and steady with immersive soundscapes.',
    },
    {
      id: '37i9dQZF1DX3Ogo9pFvBkY',
      name: 'Ambient Relaxation',
      description: 'Pure tranquility for your yoga and mindfulness practice.',
    }
  ];

  return (
    <div className="max-w-3xl mx-auto pb-32 pt-2 md:pt-6 animate-fadeIn p-4 md:p-0">
      {/* Header matching YogaHeader styling */}
      <div className="space-y-6 mb-8 md:mb-12 flex flex-col md:flex-row md:items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-health-text">
            Focus & Calm Music
          </h1>
          <p className="text-zinc-500 mt-1 max-w-sm">
            Curated soundscapes to enhance your concentration and yoga flow.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
          {!isConnected ? (
              <Link
                href="/api/auth/spotify"
                className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 text-sm font-medium shadow-sm"
              >
                Connect Spotify
              </Link>
          ) : (
            <div className="px-5 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Linked</span>
            </div>
          )}
        </div>
      </div>

      {/* Playlists in a single, spacious column */}
      <div className="space-y-12">
        {curatedPlaylists.map((playlist) => (
          <div key={playlist.id} className="group">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-health-text">{playlist.name}</h2>
              <p className="text-sm text-zinc-500">{playlist.description}</p>
            </div>
            
            <div className="w-full h-20 bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800/80 shadow-sm transition-all hover:border-zinc-200 dark:hover:border-zinc-700">
              <iframe
                src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Simple Footer Note */}
      <div className="mt-20 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-xs text-zinc-400">
          Powered by Spotify Web Playback. Ensure your Spotify account is active.
        </p>
      </div>
    </div>
  );
}
