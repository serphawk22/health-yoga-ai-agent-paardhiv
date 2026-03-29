// Root Layout
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yoga Women - Yoga for everyone',
  description: 'Empowering women through personalized yoga practices, AI-guided routines, and holistic wellness plans tailored for every body.',
  keywords: ['yoga', 'yoga for women', 'wellness', 'female health', 'meditation', 'AI yoga assistant', 'health tracker'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="health-agent-theme">
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
