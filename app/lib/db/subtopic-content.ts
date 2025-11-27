import { createClient } from '../supabase-server';

export type SubtopicQuestionType = 'multiple_choice' | 'structured' | 'short_answer';

export interface SubtopicQuestion {
  id: string;
  subtopic_id: string;
  question_text: string;
  question_type: SubtopicQuestionType;
  options?: string[];
  correct_answer?: string;
  points: number;
  order_index: number;
  created_at: string;
}

// Video functions for subtopics
export async function addVideoToSubtopic(
  subtopicId: string,
  title: string,
  videoId: string,
  description?: string,
  orderIndex: number = 0
): Promise<any> {
  const supabase = await createClient();
  
  // Get subtopic to find course_id
  const { data: subtopic, error: subtopicError } = await supabase
    .from('subtopics')
    .select(`
      *,
      lesson:lessons!subtopics_lesson_id_fkey(
        course_id
      )
    `)
    .eq('id', subtopicId)
    .single();

  if (subtopicError || !subtopic) {
    throw new Error('Subtopic not found');
  }

  const courseId = (subtopic.lesson as any).course_id;

  const { data, error } = await supabase
    .from('videos')
    .insert({
      subtopic_id: subtopicId,
      course_id: courseId, // Keep course_id for backward compatibility
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

// PDF functions for subtopics
export async function addPDFToSubtopic(
  subtopicId: string,
  title: string,
  fileUrl: string,
  fileSize?: number,
  orderIndex: number = 0
): Promise<any> {
  const supabase = await createClient();
  
  // Get subtopic to find course_id
  const { data: subtopic, error: subtopicError } = await supabase
    .from('subtopics')
    .select(`
      *,
      lesson:lessons!subtopics_lesson_id_fkey(
        course_id
      )
    `)
    .eq('id', subtopicId)
    .single();

  if (subtopicError || !subtopic) {
    throw new Error('Subtopic not found');
  }

  const courseId = (subtopic.lesson as any).course_id;

  const { data, error } = await supabase
    .from('pdfs')
    .insert({
      subtopic_id: subtopicId,
      course_id: courseId, // Keep course_id for backward compatibility
      title,
      file_url: fileUrl,
      file_size: fileSize,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Question functions for subtopics
export async function addQuestionToSubtopic(
  subtopicId: string,
  questionText: string,
  questionType: SubtopicQuestionType,
  options?: string[],
  correctAnswer?: string,
  points: number = 1,
  orderIndex: number = 0
): Promise<SubtopicQuestion> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subtopic_questions')
    .insert({
      subtopic_id: subtopicId,
      question_text: questionText,
      question_type: questionType,
      options: options || null,
      correct_answer: correctAnswer || null,
      points,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubtopicQuestions(subtopicId: string): Promise<SubtopicQuestion[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subtopic_questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching subtopic questions:', error);
    return [];
  }
  return data;
}

export async function updateSubtopicQuestion(
  questionId: string,
  questionText?: string,
  questionType?: SubtopicQuestionType,
  correctAnswer?: string,
  options?: string[],
  points?: number,
  orderIndex?: number
): Promise<SubtopicQuestion> {
  const supabase = await createClient();
  
  const updateData: any = {};
  if (questionText !== undefined) updateData.question_text = questionText;
  if (questionType !== undefined) updateData.question_type = questionType;
  if (correctAnswer !== undefined) updateData.correct_answer = correctAnswer;
  if (options !== undefined) updateData.options = options;
  if (points !== undefined) updateData.points = points;
  if (orderIndex !== undefined) updateData.order_index = orderIndex;

  const { data, error } = await supabase
    .from('subtopic_questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubtopicQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('subtopic_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

