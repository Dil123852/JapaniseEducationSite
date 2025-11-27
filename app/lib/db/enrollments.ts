import { createClient } from '../supabase-server';
import { UserProfile } from '../auth';
export type {
  EnrollmentStatus,
  Enrollment,
  EnrollmentWithStudent,
  EnrollmentWithCourse,
} from './enrollments-types';

export async function enrollStudent(
  studentId: string,
  courseId: string,
  enrollmentKey: string
): Promise<Enrollment> {
  const supabase = await createClient();
  
  // Verify enrollment key
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, enrollment_key')
    .eq('id', courseId)
    .single();

  if (courseError || !course || course.enrollment_key !== enrollmentKey) {
    throw new Error('Invalid enrollment key');
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    throw new Error('Already enrolled in this course');
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: studentId,
      course_id: courseId,
      enrollment_key_used: enrollmentKey,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudentEnrollments(studentId: string): Promise<EnrollmentWithCourse[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*),
      group:groups(id, name)
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('Error fetching student enrollments:', error);
    return [];
  }
  return data;
}

export async function getCourseEnrollments(courseId: string): Promise<EnrollmentWithStudent[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      student:profiles!enrollments_student_id_fkey(id, email, full_name)
    `)
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('Error fetching course enrollments:', error);
    return [];
  }
  return data;
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus,
  teacherId: string
): Promise<Enrollment> {
  const supabase = await createClient();
  
  const updateData: any = {
    status,
    blocked_by: teacherId,
  };

  if (status === 'blocked' || status === 'restricted') {
    updateData.blocked_at = new Date().toISOString();
    updateData.reactivated_at = null;
  } else if (status === 'active') {
    updateData.reactivated_at = new Date().toISOString();
    updateData.blocked_at = null;
  }

  const { data, error } = await supabase
    .from('enrollments')
    .update(updateData)
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeEnrollment(enrollmentId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (error) throw error;
}

export async function assignStudentToGroup(
  enrollmentId: string,
  groupId: string
): Promise<Enrollment> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .update({ group_id: groupId })
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

