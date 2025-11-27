import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import Link from 'next/link';

export default async function StudentCourseDetailPage({
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

  // TODO: Check if student is enrolled and active

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/student/courses" className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to courses
          </Link>
          <h1 className="text-xl font-light text-slate-800">{course.title}</h1>
          {course.description && (
            <p className="text-sm text-slate-600 mt-1">{course.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Lessons</h2>
            <p className="text-sm text-slate-600 mb-4">View course lessons and subtopics</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/lessons`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Lessons
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Tests</h2>
            <p className="text-sm text-slate-600 mb-4">Take course tests</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/tests`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Tests
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Videos</h2>
            <p className="text-sm text-slate-600 mb-4">Watch listening videos</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/videos`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Videos
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Materials</h2>
            <p className="text-sm text-slate-600 mb-4">Download PDF materials</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/pdfs`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Materials
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Notifications</h2>
            <p className="text-sm text-slate-600 mb-4">View course notifications</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/notifications`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Notifications
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Work Plan</h2>
            <p className="text-sm text-slate-600 mb-4">View course work plan</p>
            <Link
              href={`/student/courses/${resolvedParams.id}/work-plan`}
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px]"
            >
              View Work Plan
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

