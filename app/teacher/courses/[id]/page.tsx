import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getCourse } from '@/app/lib/db/courses';
import { getCourseMaterials } from '@/app/lib/db/course-materials';
import CourseMaterialsClient from './CourseMaterialsClient';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  const resolvedParams = params instanceof Promise ? await params : params;
  const course = await getCourse(resolvedParams.id);

  if (!course) {
    redirect('/teacher/courses');
  }

  // Verify teacher owns the course
  if (course.created_by !== profile.id) {
    redirect('/teacher/courses');
  }

  // Load materials
  const materials = await getCourseMaterials(resolvedParams.id);

  return (
    <CourseMaterialsClient
      courseId={resolvedParams.id}
      courseTitle={course.title}
      initialMaterials={materials}
    />
  );
}

