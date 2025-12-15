import { createClient } from '../supabase-server';

export type ListeningQuestionType = 'multiple_choice' | 'short_answer';

export interface ListeningTestQuestion {
  id: string;
  course_material_id: string;
  question_text: string;
  question_type: ListeningQuestionType;
  options?: string[]; // For multiple choice questions
  correct_answer: string;
  points: number;
  order_index: number;
  timestamp_seconds?: number; // When question appears during video (optional)
  created_at: string;
}

export interface ListeningTestSubmission {
  id: string;
  course_material_id: string;
  student_id: string;
  score: number;
  total_points: number;
  submitted_at: string;
}

export interface ListeningTestAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
}

export interface CreateListeningQuestionParams {
  courseMaterialId: string;
  questionText: string;
  questionType: ListeningQuestionType;
  options?: string[]; // Required for multiple_choice
  correctAnswer: string;
  points?: number;
  orderIndex?: number;
  timestampSeconds?: number;
}

export async function createListeningQuestion(
  params: CreateListeningQuestionParams
): Promise<ListeningTestQuestion> {
  const supabase = await createClient();

  // Validate that for multiple_choice, options are provided and correct_answer is in options
  if (params.questionType === 'multiple_choice') {
    if (!params.options || params.options.length === 0) {
      throw new Error('Multiple choice questions must have options');
    }
    if (!params.options.includes(params.correctAnswer)) {
      throw new Error('Correct answer must be one of the provided options');
    }
  }

  const { data, error } = await supabase
    .from('listening_test_questions')
    .insert({
      course_material_id: params.courseMaterialId,
      question_text: params.questionText,
      question_type: params.questionType,
      options: params.options || null,
      correct_answer: params.correctAnswer,
      points: params.points ?? 1,
      order_index: params.orderIndex ?? 0,
      timestamp_seconds: params.timestampSeconds || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getListeningQuestions(courseMaterialId: string): Promise<ListeningTestQuestion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listening_test_questions')
    .select('*')
    .eq('course_material_id', courseMaterialId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching listening test questions:', error);
    return [];
  }

  return data || [];
}

export async function getListeningQuestion(questionId: string): Promise<ListeningTestQuestion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listening_test_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error) {
    console.error('Error fetching listening question:', error);
    return null;
  }

  return data;
}

export async function updateListeningQuestion(
  questionId: string,
  updates: {
    questionText?: string;
    questionType?: ListeningQuestionType;
    options?: string[];
    correctAnswer?: string;
    points?: number;
    orderIndex?: number;
    timestampSeconds?: number;
  }
): Promise<ListeningTestQuestion> {
  const supabase = await createClient();

  const updateData: any = {};

  if (updates.questionText !== undefined) updateData.question_text = updates.questionText;
  if (updates.questionType !== undefined) updateData.question_type = updates.questionType;
  if (updates.options !== undefined) {
    updateData.options = updates.options;
    // Validate correct answer if both are updated
    if (updates.correctAnswer && updates.questionType === 'multiple_choice') {
      if (!updates.options.includes(updates.correctAnswer)) {
        throw new Error('Correct answer must be one of the provided options');
      }
    }
  }
  if (updates.correctAnswer !== undefined) {
    // Validate correct answer
    const existingQuestion = await getListeningQuestion(questionId);
    if (existingQuestion) {
      const questionType = updates.questionType || existingQuestion.question_type;
      if (questionType === 'multiple_choice') {
        const optionsToCheck = updates.options || existingQuestion.options || [];
        if (!optionsToCheck.includes(updates.correctAnswer)) {
          throw new Error('Correct answer must be one of the provided options');
        }
      }
    }
    updateData.correct_answer = updates.correctAnswer;
  }
  if (updates.points !== undefined) updateData.points = updates.points;
  if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
  if (updates.timestampSeconds !== undefined) updateData.timestamp_seconds = updates.timestampSeconds;

  const { data, error } = await supabase
    .from('listening_test_questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteListeningQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('listening_test_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

export interface SubmitListeningTestParams {
  courseMaterialId: string;
  studentId: string;
  answers: Array<{ questionId: string; answer: string }>;
}

export async function submitListeningTest(
  params: SubmitListeningTestParams
): Promise<{ submissionId: string; score: number; totalPoints: number }> {
  const supabase = await createClient();

  // Get all questions for this test
  const questions = await getListeningQuestions(params.courseMaterialId);
  if (questions.length === 0) {
    throw new Error('No questions found for this test');
  }

  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  const answerRecords: any[] = [];

  for (const question of questions) {
    totalPoints += question.points;
    const studentAnswer = params.answers.find(a => a.questionId === question.id);
    let isCorrect = false;
    let pointsEarned = 0;

    if (studentAnswer) {
      if (question.question_type === 'multiple_choice') {
        // Case-insensitive comparison for multiple choice
        isCorrect = studentAnswer.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
      } else {
        // Short answer - case-insensitive comparison
        isCorrect = studentAnswer.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
      }
      
      if (isCorrect) {
        pointsEarned = question.points;
        earnedPoints += question.points;
      }
    }

    answerRecords.push({
      question_id: question.id,
      answer: studentAnswer?.answer || '',
      is_correct: isCorrect,
      points_earned: pointsEarned,
    });
  }

  // Create submission
  const { data: submission, error: submissionError } = await supabase
    .from('listening_test_submissions')
    .insert({
      course_material_id: params.courseMaterialId,
      student_id: params.studentId,
      score: earnedPoints,
      total_points: totalPoints,
    })
    .select()
    .single();

  if (submissionError) throw submissionError;

  // Create answer records
  const answerInserts = answerRecords.map(record => ({
    submission_id: submission.id,
    ...record,
  }));

  const { error: answersError } = await supabase
    .from('listening_test_answers')
    .insert(answerInserts);

  if (answersError) throw answersError;

  return {
    submissionId: submission.id,
    score: earnedPoints,
    totalPoints,
  };
}

export async function getListeningTestSubmission(
  courseMaterialId: string,
  studentId: string
): Promise<ListeningTestSubmission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listening_test_submissions')
    .select('*')
    .eq('course_material_id', courseMaterialId)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching listening test submission:', error);
    return null;
  }

  return data;
}

export async function getListeningTestAnswers(submissionId: string): Promise<ListeningTestAnswer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('listening_test_answers')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching listening test answers:', error);
    return [];
  }

  return data || [];
}

