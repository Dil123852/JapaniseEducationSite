import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { getTeacherCourses } from '@/app/lib/db/courses';
import { getCourseLessons } from '@/app/lib/db/lessons';
import { getTeacherQuizzes } from '@/app/lib/db/quizzes';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch all courses created by the teacher
    const teacherCourses = await getTeacherCourses(user.id);
    const totalCourses = teacherCourses.length;

    // Calculate total students across all courses (real-time count)
    let totalStudents = 0;
    for (const course of teacherCourses) {
      totalStudents += course.student_count || 0;
    }

    // Calculate total lessons across all courses (real-time count)
    let totalLessons = 0;
    for (const course of teacherCourses) {
      try {
        const lessons = await getCourseLessons(course.id);
        totalLessons += lessons.length;
      } catch (error) {
        console.error(`Error fetching lessons for course ${course.id}:`, error);
        // Continue with other courses
      }
    }

    // Get total quizzes from standalone quizzes table (real-time count)
    const teacherQuizzes = await getTeacherQuizzes(user.id);
    const totalQuizzes = teacherQuizzes.length;

    // Get recent courses (last 5)
    const recentCourses = teacherCourses.slice(0, 5).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      student_count: course.student_count || 0,
      group_count: course.group_count || 0,
    }));

    return NextResponse.json({
      totalCourses,
      totalStudents,
      totalLessons,
      totalQuizzes,
      recentCourses,
    });
  } catch (error: any) {
    console.error('API Error fetching teacher dashboard data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

