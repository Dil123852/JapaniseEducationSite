import { createClient } from '../supabase-server';

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  grade?: string;
  subject?: string;
  thumbnail_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Subtopic {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface LessonWithSubtopics extends Lesson {
  subtopics: Subtopic[];
}

export interface SubtopicWithContent extends Subtopic {
  videos: any[];
  pdfs: any[];
  questions: any[];
}

// Lesson functions
export async function createLesson(
  courseId: string,
  title: string,
  description?: string,
  grade?: string,
  subject?: string,
  thumbnailUrl?: string,
  orderIndex: number = 0
): Promise<Lesson> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      title,
      description,
      grade,
      subject,
      thumbnail_url: thumbnailUrl,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('[Server] Error fetching course lessons:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        courseId: courseId
      });
      // If table doesn't exist, return empty array
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Server] Lessons table does not exist. Please run LESSONS_SUBTOPICS_SCHEMA.sql');
        return [];
      }
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.error('[Server] Unexpected error in getCourseLessons:', {
      message: err.message,
      stack: err.stack,
      courseId: courseId
    });
    return [];
  }
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
  return data;
}

export async function getLessonWithSubtopics(lessonId: string): Promise<LessonWithSubtopics | null> {
  const supabase = await createClient();
  
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    console.error('Error fetching lesson:', lessonError);
    return null;
  }

  const { data: subtopics, error: subtopicsError } = await supabase
    .from('subtopics')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (subtopicsError) {
    console.error('Error fetching subtopics:', subtopicsError);
    return { ...lesson, subtopics: [] };
  }

  return { ...lesson, subtopics: subtopics || [] };
}

export async function updateLesson(
  lessonId: string,
  title?: string,
  description?: string,
  grade?: string,
  subject?: string,
  thumbnailUrl?: string,
  orderIndex?: number
): Promise<Lesson> {
  const supabase = await createClient();
  
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (grade !== undefined) updateData.grade = grade;
  if (subject !== undefined) updateData.subject = subject;
  if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
  if (orderIndex !== undefined) updateData.order_index = orderIndex;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
}

// Subtopic functions
export async function createSubtopic(
  lessonId: string,
  title: string,
  description?: string,
  orderIndex: number = 0
): Promise<Subtopic> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subtopics')
    .insert({
      lesson_id: lessonId,
      title,
      description,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLessonSubtopics(lessonId: string): Promise<Subtopic[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subtopics')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching lesson subtopics:', error);
    return [];
  }
  return data;
}

export async function getSubtopic(subtopicId: string): Promise<Subtopic | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subtopics')
    .select('*')
    .eq('id', subtopicId)
    .single();

  if (error) {
    console.error('Error fetching subtopic:', error);
    return null;
  }
  return data;
}

export async function getSubtopicWithContent(subtopicId: string): Promise<SubtopicWithContent | null> {
  const supabase = await createClient();
  
  const { data: subtopic, error: subtopicError } = await supabase
    .from('subtopics')
    .select('*')
    .eq('id', subtopicId)
    .single();

  if (subtopicError || !subtopic) {
    console.error('Error fetching subtopic:', subtopicError);
    return null;
  }

  // Fetch videos
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .order('order_index', { ascending: true });

  // Fetch PDFs
  const { data: pdfs, error: pdfsError } = await supabase
    .from('pdfs')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .order('order_index', { ascending: true });

  // Fetch questions
  const { data: questions, error: questionsError } = await supabase
    .from('subtopic_questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .order('order_index', { ascending: true });

  return {
    ...subtopic,
    videos: videos || [],
    pdfs: pdfs || [],
    questions: questions || [],
  };
}

export async function updateSubtopic(
  subtopicId: string,
  title?: string,
  description?: string,
  orderIndex?: number
): Promise<Subtopic> {
  const supabase = await createClient();
  
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (orderIndex !== undefined) updateData.order_index = orderIndex;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('subtopics')
    .update(updateData)
    .eq('id', subtopicId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubtopic(subtopicId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('subtopics')
    .delete()
    .eq('id', subtopicId);

  if (error) throw error;
}

