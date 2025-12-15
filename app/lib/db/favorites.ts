import { createClient } from '../supabase-server';

export interface Favorite {
  id: string;
  student_id: string;
  lesson_id: string;
  created_at: string;
}

/**
 * Add a lesson to student's favorites
 */
export async function addFavorite(studentId: string, lessonId: string): Promise<Favorite> {
  const supabase = await createClient();
  
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .single();

  if (existing) {
    throw new Error('Lesson already in favorites');
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      student_id: studentId,
      lesson_id: lessonId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a lesson from student's favorites
 */
export async function removeFavorite(studentId: string, lessonId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId);

  if (error) throw error;
}

/**
 * Check if a lesson is favorited by a student
 */
export async function isFavorite(studentId: string, lessonId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error, which is fine
    console.error('Error checking favorite:', error);
    return false;
  }

  return !!data;
}

/**
 * Get all favorites for a student
 */
export async function getStudentFavorites(studentId: string): Promise<Favorite[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data || [];
}

/**
 * Get favorite lessons with lesson details
 */
export async function getFavoriteLessons(studentId: string): Promise<any[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      lesson:lessons(*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite lessons:', error);
    return [];
  }

  return data || [];
}

