import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseMaterials } from '@/app/lib/db/course-materials';
import { Card, CardContent } from '@/components/ui/card';
import ExpandableDescription from '@/app/components/ExpandableDescription';
import StudentMaterialsList from './StudentMaterialsList';

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

  // Fetch course materials
  const courseMaterials = await getCourseMaterials(resolvedParams.id);
  
  // Calculate progress based on materials
  const totalMaterials = courseMaterials.length;
  const progressPercentage = totalMaterials > 0 ? 0 : 0; // Can be enhanced later with completion tracking

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Progress Container with Course Info */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Course Name and Description */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-3">
                  {course.title}
                </h1>
                {course.description && (
                  <ExpandableDescription text={course.description} />
                )}
              </div>

              {/* Materials Count */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 pt-4 border-t border-[#E5E7EB]">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#9CA3AF]">Course Materials</span>
                    <span className="text-sm font-medium text-[#2B2B2B]">{totalMaterials} material{totalMaterials !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Materials List */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#2B2B2B] mb-4">
            Course Materials
          </h2>
          
          {courseMaterials.length === 0 ? (
            <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
              <CardContent className="py-12 text-center">
                <p className="text-[#9CA3AF]">No course materials available yet</p>
              </CardContent>
            </Card>
          ) : (
            <StudentMaterialsList
              materials={courseMaterials}
              courseId={resolvedParams.id}
            />
          )}
        </div>
      </main>
    </div>
  );
}
