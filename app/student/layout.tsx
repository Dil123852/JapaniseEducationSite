import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import StudentSidebar from '@/app/components/StudentSidebar';
import StudentMobileNav from '@/app/components/StudentMobileNav';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.role !== 'student') {
    if (profile.role === 'teacher') {
      redirect('/teacher');
    } else {
      redirect('/auth/login');
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <StudentMobileNav />
    </div>
  );
}

