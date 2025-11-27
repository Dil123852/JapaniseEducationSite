import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getSubtopicWithContent } from '@/app/lib/db/lessons';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer';

export default async function StudentSubtopicDetailPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string; subtopicId: string }> | { id: string; lessonId: string; subtopicId: string };
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

  const subtopic = await getSubtopicWithContent(resolvedParams.subtopicId);
  if (!subtopic) {
    redirect(`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to lesson
          </Link>
          <div>
            <h1 className="text-xl font-light text-slate-800">{subtopic.title}</h1>
            {subtopic.description && (
              <p className="text-sm text-slate-600 mt-1">{subtopic.description}</p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Videos Section */}
        {subtopic.videos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Videos</h2>
            <div className="space-y-6">
              {subtopic.videos.map((video: any) => (
                <div key={video.id} className="border-b border-slate-200 last:border-0 pb-6 last:pb-0">
                  <h3 className="font-medium text-slate-800 mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-slate-600 mb-4">{video.description}</p>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <VideoPlayer
                      videoId={video.video_id}
                      onTimeUpdate={async (currentTime: number, duration: number) => {
                        // Track video analytics
                        try {
                          await fetch('/api/video-analytics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              videoId: video.id,
                              watchTime: Math.floor(currentTime),
                              completed: currentTime >= duration * 0.9,
                            }),
                          });
                        } catch (err) {
                          // Silent fail for analytics
                        }
                      }}
                      onComplete={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDFs Section */}
        {subtopic.pdfs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">PDF Materials</h2>
            <div className="space-y-3">
              {subtopic.pdfs.map((pdf: any) => (
                <a
                  key={pdf.id}
                  href={pdf.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    // Track PDF download
                    try {
                      await fetch('/api/pdf-downloads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pdfId: pdf.id }),
                      });
                    } catch (err) {
                      // Silent fail for analytics
                    }
                  }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-slate-800">{pdf.title}</h3>
                    {pdf.file_size && (
                      <p className="text-sm text-slate-600 mt-1">
                        Size: {(pdf.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Questions Section */}
        {subtopic.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Practice Questions</h2>
            <div className="space-y-4">
              {subtopic.questions.map((question: any, index: number) => (
                <div key={question.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Question {index + 1}</span>
                    <span className="text-xs text-slate-500">
                      {question.question_type.replace('_', ' ')} • {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-slate-800 mb-3">{question.question_text}</p>
                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center p-2 bg-white rounded border border-slate-200">
                          <span className="text-sm font-medium text-slate-600 mr-3">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="text-sm text-slate-800">{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.correct_answer && (
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <span className="text-sm text-slate-600">Correct Answer: </span>
                      <span className="font-medium text-green-700">{question.correct_answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {subtopic.videos.length === 0 && subtopic.pdfs.length === 0 && subtopic.questions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No content available for this subtopic yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

