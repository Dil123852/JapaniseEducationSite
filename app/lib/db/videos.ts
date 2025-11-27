import { createClient } from '../supabase-server';

export interface Video {
  id: string;
  course_id: string;
  video_id: string; // YouTube video ID
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface VideoAnalytics {
  id: string;
  video_id: string;
  student_id: string;
  watch_time: number; // in seconds
  completed: boolean;
  last_watched_at: string;
}

export async function addVideo(
  courseId: string,
  videoId: string,
  title: string,
  description?: string,
  orderIndex: number = 0
): Promise<Video> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('videos')
    .insert({
      course_id: courseId,
      video_id: videoId,
      title,
      description,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseVideos(courseId: string): Promise<Video[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching course videos:', error);
    return [];
  }
  return data;
}

export async function updateVideoWatchTime(
  videoId: string,
  studentId: string,
  watchTime: number,
  completed: boolean = false
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('video_analytics')
    .upsert({
      video_id: videoId,
      student_id: studentId,
      watch_time: watchTime,
      completed,
      last_watched_at: new Date().toISOString(),
    }, {
      onConflict: 'video_id,student_id',
    });

  if (error) throw error;
}

export async function getVideoAnalytics(videoId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('video_analytics')
    .select(`
      *,
      student:profiles!video_analytics_student_id_fkey(id, email, full_name)
    `)
    .eq('video_id', videoId);

  if (error) {
    console.error('Error fetching video analytics:', error);
    return [];
  }
  return data;
}

