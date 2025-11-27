import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseNotifications } from '@/app/lib/db/notifications';
import Link from 'next/link';
import NotificationCard from '@/app/components/NotificationCard';

export default async function CourseNotificationsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'student') {
    redirect('/dashboard');
  }

  // Handle params as Promise (Next.js 15) or object (Next.js 14)
  const resolvedParams = params instanceof Promise ? await params : params;
  const course = await getCourse(resolvedParams.id);
  if (!course) {
    redirect('/student/courses');
  }

  const notifications = await getCourseNotifications(resolvedParams.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${resolvedParams.id}`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to course
          </Link>
          <h1 className="text-xl font-light text-slate-800">Notifications</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

