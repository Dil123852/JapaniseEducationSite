import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseVideos } from '@/app/lib/db/videos';
import Link from 'next/link';
import VideoListClient from './VideoListClient';

export default async function CourseVideosPage({
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

  const videos = await getCourseVideos(resolvedParams.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${resolvedParams.id}`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to course
          </Link>
          <h1 className="text-xl font-light text-slate-800">Listening Videos</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No videos yet</p>
          </div>
        ) : (
          <VideoListClient videos={videos} courseId={resolvedParams.id} studentId={profile.id} />
        )}
      </main>
    </div>
  );
}

