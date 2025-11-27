import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getTeacherCourses } from '@/app/lib/db/courses';
import CoursesListClient from './CoursesListClient';

export default async function CoursesPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  const courses = await getTeacherCourses(profile.id);

  return <CoursesListClient courses={courses} />;
}

