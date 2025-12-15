import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import TeacherSidebar from '@/app/components/TeacherSidebar';
import TeacherMobileNav from '@/app/components/TeacherMobileNav';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-[60px]">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#FAFAFA]">
          {children}
        </main>
      </div>
      <TeacherMobileNav />
    </div>
  );
}

