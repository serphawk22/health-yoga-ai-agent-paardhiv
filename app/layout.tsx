// Root Layout
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health Agent - Your Personal AI Health Assistant',
  description: 'Personalized health recommendations powered by AI. Get diet plans, exercise routines, yoga recommendations, and book doctor appointments.',
  keywords: ['health', 'wellness', 'AI', 'diet', 'exercise', 'yoga', 'doctor appointments'],
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
