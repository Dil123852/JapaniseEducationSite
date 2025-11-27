import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseLessons } from '@/app/lib/db/lessons';
import Link from 'next/link';

export default async function StudentCourseLessonsPage({
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

  const lessons = await getCourseLessons(resolvedParams.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${resolvedParams.id}`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to course
          </Link>
          <h1 className="text-xl font-light text-slate-800">Lessons</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No lessons available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/student/courses/${resolvedParams.id}/lessons/${lesson.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-slate-800 mb-2">{lesson.title}</h2>
                    {lesson.description && (
                      <p className="text-sm text-slate-600 mb-3">{lesson.description}</p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

