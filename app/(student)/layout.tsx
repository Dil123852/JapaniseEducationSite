import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import StudentSidebar from '@/app/components/StudentSidebar';
import StudentMobileNav from '@/app/components/StudentMobileNav';
import StudentHeader from '@/app/components/StudentHeader';
import StudentMobileTopNav from '@/app/components/StudentMobileTopNav';
import AIAssistant from '@/app/components/AIAssistant';
import { AIAssistantProvider } from '@/app/components/AIAssistantContext';

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
    <AIAssistantProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        <StudentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-[60px]">
          <StudentHeader />
          <StudentMobileTopNav />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#FAFAFA]">
          {children}
        </main>
        </div>
        <StudentMobileNav />
        <AIAssistant />
      </div>
    </AIAssistantProvider>
  );
}

