import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { getTeacherCourses } from '@/app/lib/db/courses';
import { getCourseLessons } from '@/app/lib/db/lessons';

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

    // Calculate total students across all courses
    let totalStudents = 0;
    for (const course of teacherCourses) {
      totalStudents += course.student_count || 0;
    }

    // Calculate total lessons across all courses
    let totalLessons = 0;
    let totalSubtopics = 0;
    let totalVideos = 0;
    let totalPDFs = 0;
    let totalQuizzes = 0;

    for (const course of teacherCourses) {
      try {
        const lessons = await getCourseLessons(course.id);
        totalLessons += lessons.length;

        // Count subtopics, videos, PDFs, and quizzes for each lesson
        for (const lesson of lessons) {
          const { data: subtopics } = await supabase
            .from('subtopics')
            .select('id')
            .eq('lesson_id', lesson.id);

          if (subtopics) {
            totalSubtopics += subtopics.length;

            // Count videos and PDFs for each subtopic
            for (const subtopic of subtopics) {
              const [videosResult, pdfsResult, questionsResult] = await Promise.all([
                supabase.from('videos').select('id').eq('subtopic_id', subtopic.id),
                supabase.from('pdfs').select('id').eq('subtopic_id', subtopic.id),
                supabase.from('subtopic_questions').select('id').eq('subtopic_id', subtopic.id),
              ]);

              if (videosResult.data) totalVideos += videosResult.data.length;
              if (pdfsResult.data) totalPDFs += pdfsResult.data.length;
              if (questionsResult.data) totalQuizzes += questionsResult.data.length;
            }
          }

          // Also count videos and PDFs directly linked to course (legacy)
          const [courseVideos, coursePDFs] = await Promise.all([
            supabase.from('videos').select('id').eq('course_id', course.id).is('subtopic_id', null),
            supabase.from('pdfs').select('id').eq('course_id', course.id).is('subtopic_id', null),
          ]);

          if (courseVideos.data) totalVideos += courseVideos.data.length;
          if (coursePDFs.data) totalPDFs += coursePDFs.data.length;
        }
      } catch (error) {
        console.error(`Error fetching lessons for course ${course.id}:`, error);
        // Continue with other courses
      }
    }

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
      totalSubtopics,
      totalVideos,
      totalPDFs,
      totalQuizzes,
      recentCourses,
    });
  } catch (error: any) {
    console.error('API Error fetching teacher dashboard data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

