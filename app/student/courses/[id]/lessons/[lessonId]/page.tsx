import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getLessonWithSubtopics } from '@/app/lib/db/lessons';
import Link from 'next/link';

export default async function StudentLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }> | { id: string; lessonId: string };
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

  const lesson = await getLessonWithSubtopics(resolvedParams.lessonId);
  if (!lesson) {
    redirect(`/student/courses/${resolvedParams.id}/lessons`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${resolvedParams.id}/lessons`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to lessons
          </Link>
          <div>
            <h1 className="text-xl font-light text-slate-800">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-sm text-slate-600 mt-1">{lesson.description}</p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {lesson.subtopics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No subtopics available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lesson.subtopics.map((subtopic) => (
              <Link
                key={subtopic.id}
                href={`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/subtopics/${subtopic.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-slate-800 mb-2">{subtopic.title}</h2>
                    {subtopic.description && (
                      <p className="text-sm text-slate-600 mb-3">{subtopic.description}</p>
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

