import { createClient } from '../supabase-server';
import { UserProfile } from '../auth';

export interface Course {
  id: string;
  title: string;
  description?: string;
  enrollment_key: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CourseWithStats extends Course {
  student_count?: number;
  group_count?: number;
}

export async function createCourse(
  title: string,
  description: string,
  enrollmentKey: string,
  teacherId: string
): Promise<Course> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      enrollment_key: enrollmentKey,
      created_by: teacherId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const supabase = await createClient();
    
    if (!courseId) {
      console.error('getCourse called with empty courseId');
      return null;
    }
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (error) {
      // Log error details - use direct property access for Supabase errors
      const errorMessage = (error as any)?.message || 'Unknown error';
      const errorCode = (error as any)?.code || 'NO_CODE';
      const errorDetails = (error as any)?.details || null;
      const errorHint = (error as any)?.hint || null;
      
      // Log to server console (this will show in terminal, not browser)
      console.error('[Server] Error fetching course:', {
        courseId,
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        hint: errorHint,
        fullError: error,
      });
      
      return null;
    }
    
    if (!data) {
      console.warn('Course not found:', courseId);
      return null;
    }
    
    return data;
  } catch (err: any) {
    // Catch any unexpected errors
    console.error('Unexpected error in getCourse:', {
      courseId,
      error: err?.message || String(err),
      stack: err?.stack,
    });
    return null;
  }
}

export async function getTeacherCourses(teacherId: string): Promise<CourseWithStats[]> {
  try {
    const supabase = await createClient();
    
    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('[getTeacherCourses] Error fetching courses:', coursesError);
      return [];
    }

    if (!courses || courses.length === 0) {
      return [];
    }

    // Get counts for each course - use simpler approach
    const coursesWithStats: CourseWithStats[] = [];
    
    for (const course of courses) {
      try {
        // Get student count by fetching and counting
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', course.id)
          .eq('status', 'active');
        
        const studentCount = enrollments?.length || 0;

        // Get group count by fetching and counting
        const { data: groups } = await supabase
          .from('groups')
          .select('id')
          .eq('course_id', course.id);
        
        const groupCount = groups?.length || 0;

        // Explicitly serialize all fields
        coursesWithStats.push({
          id: String(course.id),
          title: String(course.title || 'Untitled Course'),
          description: course.description ? String(course.description) : undefined,
          enrollment_key: String(course.enrollment_key || ''),
          created_by: String(course.created_by),
          created_at: String(course.created_at || new Date().toISOString()),
          updated_at: String(course.updated_at || new Date().toISOString()),
          student_count: studentCount,
          group_count: groupCount,
        });
      } catch (err: any) {
        console.error(`[getTeacherCourses] Error processing course ${course.id}:`, {
          message: err?.message,
          stack: err?.stack,
        });
        // Return safe fallback
        coursesWithStats.push({
          id: String(course.id || ''),
          title: String(course.title || 'Unknown Course'),
          description: course.description ? String(course.description) : undefined,
          enrollment_key: String(course.enrollment_key || ''),
          created_by: String(course.created_by || ''),
          created_at: String(course.created_at || new Date().toISOString()),
          updated_at: String(course.updated_at || new Date().toISOString()),
          student_count: 0,
          group_count: 0,
        });
      }
    }

    return coursesWithStats;
  } catch (error: any) {
    console.error('[getTeacherCourses] Unexpected error:', {
      message: error?.message,
      stack: error?.stack,
      teacherId: teacherId,
    });
    return [];
  }
}

export async function updateCourse(
  courseId: string,
  updates: { title?: string; description?: string; enrollment_key?: string }
): Promise<Course> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourse(courseId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
}

export async function getCourseByEnrollmentKey(enrollmentKey: string): Promise<Course | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('enrollment_key', enrollmentKey)
    .single();

  if (error) {
    console.error('Error fetching course by enrollment key:', error);
    return null;
  }
  return data;
}

