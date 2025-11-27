import { createClient } from '../supabase-server';

export interface Notification {
  id: string;
  course_id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
}

export async function createNotification(
  courseId: string,
  title: string,
  message: string,
  teacherId: string
): Promise<Notification> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      course_id: courseId,
      title,
      message,
      created_by: teacherId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseNotifications(courseId: string): Promise<Notification[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching course notifications:', error);
    return [];
  }
  return data;
}

