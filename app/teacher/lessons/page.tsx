import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getTeacherCourses, type CourseWithStats } from '@/app/lib/db/courses';
import { getCourseLessons } from '@/app/lib/db/lessons';
import LessonsListClient from './LessonsListClient';

export default async function LessonsPage() {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile || profile.role !== 'teacher') {
      redirect('/dashboard');
    }

    // Fetch all courses for the teacher
    let courses: CourseWithStats[];
    try {
      courses = await getTeacherCourses(profile.id);
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      courses = [];
    }

    if (!courses || courses.length === 0) {
      return <LessonsListClient courses={[]} />;
    }

    // Fetch lessons for all courses and serialize properly
    // Use Promise.allSettled to handle individual course failures gracefully
    const coursesWithLessonsResults = await Promise.allSettled(
      courses.map(async (course) => {
        try {
          // Ensure we only use serializable properties
          const courseId = String(course.id);
          const courseTitle = String(course.title || 'Untitled Course');
          const courseDescription = course.description ? String(course.description) : undefined;

          const lessons = await getCourseLessons(courseId);
          
          return {
            id: courseId,
            title: courseTitle,
            description: courseDescription,
            lessons: (lessons || []).map((lesson) => ({
              id: String(lesson.id),
              title: String(lesson.title || 'Untitled Lesson'),
              description: lesson.description ? String(lesson.description) : undefined,
              grade: lesson.grade ? String(lesson.grade) : undefined,
              subject: lesson.subject ? String(lesson.subject) : undefined,
              thumbnail_url: lesson.thumbnail_url ? String(lesson.thumbnail_url) : undefined,
              order_index: Number(lesson.order_index) || 0,
              created_at: String(lesson.created_at || new Date().toISOString()),
            })),
          };
        } catch (error) {
          console.error(`Error fetching lessons for course ${course.id}:`, error);
          // Return course with empty lessons array if there's an error
          return {
            id: String(course.id || ''),
            title: String(course.title || 'Unknown Course'),
            description: course.description ? String(course.description) : undefined,
            lessons: [],
          };
        }
      })
    );

    // Extract successful results and handle failures
    const coursesWithLessons = coursesWithLessonsResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error('Error processing course:', result.reason);
        // Return a fallback course structure
        const courseIndex = coursesWithLessonsResults.indexOf(result);
        const course = courses[courseIndex];
        return {
          id: course?.id || '',
          title: course?.title || 'Unknown Course',
          description: course?.description || undefined,
          lessons: [],
        };
      }
    });

    return <LessonsListClient courses={coursesWithLessons} />;
  } catch (error) {
    console.error('Error in LessonsPage:', error);
    // Return empty state on error
    return <LessonsListClient courses={[]} />;
  }
}

