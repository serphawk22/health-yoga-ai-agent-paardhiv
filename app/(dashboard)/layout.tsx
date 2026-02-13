// Dashboard Layout with Sidebar
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProfileAlert } from '@/components/dashboard/ProfileAlert';
import { CartProvider } from '@/components/providers/CartProvider';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?source=layout');
  }

  return (
    <div className="min-h-screen bg-health-bg">
      <CartProvider>
        <Sidebar user={user as any} />
        <div className="lg:pl-64">
          <Header user={user} />
          <ProfileAlert
            isComplete={!!user.healthProfile?.isComplete}
            completionStep={user.healthProfile?.completionStep || 0}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </CartProvider>
    </div>
  );
}
