import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseMaterial } from '@/app/lib/db/course-materials';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import VideoRenderer from '@/app/components/MaterialRenderers/VideoRenderer';

export default async function ViewMaterialPage({
  params,
}: {
  params: Promise<{ id: string; materialId: string }> | { id: string; materialId: string };
}) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'student') {
    redirect('/dashboard');
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  const course = await getCourse(resolvedParams.id);
  
  if (!course) {
    redirect('/student/courses');
  }

  const material = await getCourseMaterial(resolvedParams.materialId);
  
  if (!material || material.course_id !== resolvedParams.id) {
    redirect(`/student/courses/${resolvedParams.id}`);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Back Button */}
        <Link 
          href={`/student/courses/${resolvedParams.id}`}
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#2B2B2B] mb-6 transition-colors"
        >
          ← Back to course
        </Link>

        {/* Material Content */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardContent className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-4">
              {material.title}
            </h1>
            
            {material.description && (
              <p className="text-base text-[#6B7280] mb-6">
                {material.description}
              </p>
            )}

            {/* Video Content */}
            {(material.material_type === 'video' || material.material_type === 'listening_test') && (
              <div className="mt-6">
                <VideoRenderer material={material} />
              </div>
            )}

            {/* Listening Test - Show video and questions will be handled separately */}
            {material.material_type === 'listening_test' && (
              <div className="mt-8">
                <p className="text-sm text-[#9CA3AF] mb-4">
                  Questions for this listening test will appear below the video.
                </p>
              </div>
            )}

            {/* Notice/Text Content */}
            {material.material_type === 'notice' && material.notice_content && (
              <div 
                className="mt-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: material.notice_content }}
              />
            )}

            {material.material_type === 'text' && material.text_content && (
              <div 
                className="mt-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: material.text_content }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

