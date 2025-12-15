import { redirect } from 'next/navigation';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default function TeacherLessonsPage() {
  // Redirect to courses page since lessons system has been replaced with whiteboard
  redirect('/teacher/courses');
}

