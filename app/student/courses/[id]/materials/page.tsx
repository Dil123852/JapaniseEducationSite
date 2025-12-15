import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseMaterials } from '@/app/lib/db/course-materials';
import StudentMaterialsViewClient from './StudentMaterialsViewClient';

export default async function StudentMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
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

  // Verify student is enrolled
  const { createClient } = await import('@/app/lib/supabase-server');
  const supabase = await createClient();
  
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', resolvedParams.id)
    .eq('student_id', profile.id)
    .eq('status', 'active')
    .single();

  if (!enrollment) {
    redirect('/student/courses');
  }

  // Load materials
  const materials = await getCourseMaterials(resolvedParams.id);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <StudentMaterialsViewClient
        courseId={resolvedParams.id}
        courseTitle={course.title}
        initialMaterials={materials}
      />
    </div>
  );
}

