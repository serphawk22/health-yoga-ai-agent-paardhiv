// Dashboard Layout with Sidebar
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

import { UserCapsule } from '@/components/layout/UserCapsule';
import { ProfileAlert } from '@/components/dashboard/ProfileAlert';
import { CartProvider } from '@/components/providers/CartProvider';
import { Dock } from '@/components/ui/dock';
import { DashboardHeroChat } from '@/components/dashboard/DashboardHeroChat';

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
    <div className="min-h-screen">
      <CartProvider>
        <div className="min-h-screen relative z-10">
          <UserCapsule user={user} />
          <ProfileAlert
            isComplete={!!user.healthProfile?.isComplete}
            completionStep={user.healthProfile?.completionStep || 0}
          />
          <main className="p-6 max-w-7xl mx-auto pb-24">
            {children}
          </main>
          <Dock userRole={user.role} />
          <DashboardHeroChat />
        </div>
      </CartProvider>
    </div>
  );
}
