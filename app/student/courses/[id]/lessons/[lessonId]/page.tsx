import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getLessonWithSubtopics, getSubtopicWithContent } from '@/app/lib/db/lessons';
import { createClient } from '@/app/lib/supabase-server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, FileText, FileQuestion, Download, ExternalLink } from 'lucide-react';

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
    redirect(`/student/courses/${resolvedParams.id}`);
  }

  const supabase = await createClient();

  // Fetch all materials from all subtopics
  const subtopicsWithContent = await Promise.all(
    lesson.subtopics.map(async (subtopic) => {
      return await getSubtopicWithContent(subtopic.id);
    })
  );

  // Get all videos, PDFs, and questions from all subtopics
  const allVideos: any[] = [];
  const allPDFs: any[] = [];
  const allQuestions: any[] = [];

  subtopicsWithContent.forEach((subtopic) => {
    if (subtopic) {
      subtopic.videos.forEach(video => {
        allVideos.push({ ...video, subtopicTitle: subtopic.title, subtopicId: subtopic.id });
      });
      subtopic.pdfs.forEach(pdf => {
        allPDFs.push({ ...pdf, subtopicTitle: subtopic.title, subtopicId: subtopic.id });
      });
      subtopic.questions.forEach(question => {
        allQuestions.push({ ...question, subtopicTitle: subtopic.title, subtopicId: subtopic.id });
      });
    }
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Link 
            href={`/student/courses/${resolvedParams.id}`} 
            className="text-sm text-[#9CA3AF] hover:text-[#2B2B2B] mb-3 inline-block transition-colors"
          >
            ← Back to course
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-2">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-sm md:text-base text-[#9CA3AF]">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Videos Section */}
        {allVideos.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-[#C2E2F5]" />
              Videos ({allVideos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allVideos.map((video) => (
                <Card 
                  key={video.id}
                  className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-[#2B2B2B] mb-1 line-clamp-2">
                          {video.title}
                        </CardTitle>
                        <p className="text-xs text-[#9CA3AF] mb-2">{video.subtopicTitle}</p>
                        {video.description && (
                          <p className="text-xs text-[#9CA3AF] line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/subtopics/${video.subtopicId}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#C2E2F5] hover:text-[#B0D9F0] transition-colors"
                    >
                      Watch Video
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PDFs Section */}
        {allPDFs.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C2E2F5]" />
              Materials ({allPDFs.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPDFs.map((pdf) => (
                <Card 
                  key={pdf.id}
                  className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-[#2B2B2B] mb-1 line-clamp-2">
                          {pdf.title}
                        </CardTitle>
                        <p className="text-xs text-[#9CA3AF] mb-2">{pdf.subtopicTitle}</p>
                        {pdf.description && (
                          <p className="text-xs text-[#9CA3AF] line-clamp-2">
                            {pdf.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pdf.file_url && (
                      <a
                        href={pdf.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#C2E2F5] hover:text-[#B0D9F0] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Questions/Tests Section */}
        {allQuestions.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B] mb-4 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-[#C2E2F5]" />
              Tests ({allQuestions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allQuestions.map((question) => (
                <Card 
                  key={question.id}
                  className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base text-[#2B2B2B] mb-1 line-clamp-2">
                          {question.question_text || 'Question'}
                        </CardTitle>
                        <p className="text-xs text-[#9CA3AF] mb-2">{question.subtopicTitle}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          Type: {question.question_type || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/student/courses/${resolvedParams.id}/lessons/${resolvedParams.lessonId}/subtopics/${question.subtopicId}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#C2E2F5] hover:text-[#B0D9F0] transition-colors"
                    >
                      View Question
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allVideos.length === 0 && allPDFs.length === 0 && allQuestions.length === 0 && (
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardContent className="py-12 text-center">
              <p className="text-[#9CA3AF]">No materials available in this lesson yet</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
