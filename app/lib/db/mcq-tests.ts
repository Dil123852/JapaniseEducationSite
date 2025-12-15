import { createClient } from '../supabase-server';

export interface MCQTestQuestion {
  id: string;
  course_material_id: string;
  question_text: string;
  options: string[]; // Array of answer options
  correct_answer: string; // Must match one of the options
  points: number;
  order_index: number;
  created_at: string;
}

export interface MCQTestSubmission {
  id: string;
  course_material_id: string;
  student_id: string;
  score: number;
  total_points: number;
  submitted_at: string;
}

export interface MCQTestAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
}

export interface CreateMCQQuestionParams {
  courseMaterialId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points?: number;
  orderIndex?: number;
}

export async function createMCQQuestion(
  params: CreateMCQQuestionParams
): Promise<MCQTestQuestion> {
  const supabase = await createClient();

  // Validate that correct_answer is one of the options
  if (!params.options.includes(params.correctAnswer)) {
    throw new Error('Correct answer must be one of the provided options');
  }

  const { data, error } = await supabase
    .from('mcq_test_questions')
    .insert({
      course_material_id: params.courseMaterialId,
      question_text: params.questionText,
      options: params.options,
      correct_answer: params.correctAnswer,
      points: params.points ?? 1,
      order_index: params.orderIndex ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMCQQuestions(courseMaterialId: string): Promise<MCQTestQuestion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mcq_test_questions')
    .select('*')
    .eq('course_material_id', courseMaterialId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching MCQ questions:', error);
    return [];
  }

  return data || [];
}

export async function getMCQQuestion(questionId: string): Promise<MCQTestQuestion | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mcq_test_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error) {
    console.error('Error fetching MCQ question:', error);
    return null;
  }

  return data;
}

export async function updateMCQQuestion(
  questionId: string,
  updates: {
    questionText?: string;
    options?: string[];
    correctAnswer?: string;
    points?: number;
    orderIndex?: number;
  }
): Promise<MCQTestQuestion> {
  const supabase = await createClient();

  const updateData: any = {};

  if (updates.questionText !== undefined) updateData.question_text = updates.questionText;
  if (updates.options !== undefined) {
    updateData.options = updates.options;
    // Validate correct answer if both are updated
    if (updates.correctAnswer && !updates.options.includes(updates.correctAnswer)) {
      throw new Error('Correct answer must be one of the provided options');
    }
  }
  if (updates.correctAnswer !== undefined) {
    // Get existing options to validate
    const existingQuestion = await getMCQQuestion(questionId);
    if (existingQuestion) {
      const optionsToCheck = updates.options || existingQuestion.options;
      if (!optionsToCheck.includes(updates.correctAnswer)) {
        throw new Error('Correct answer must be one of the provided options');
      }
    }
    updateData.correct_answer = updates.correctAnswer;
  }
  if (updates.points !== undefined) updateData.points = updates.points;
  if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;

  const { data, error } = await supabase
    .from('mcq_test_questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMCQQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('mcq_test_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

export interface SubmitMCQTestParams {
  courseMaterialId: string;
  studentId: string;
  answers: Array<{ questionId: string; answer: string }>;
}

export async function submitMCQTest(
  params: SubmitMCQTestParams
): Promise<{ submissionId: string; score: number; totalPoints: number }> {
  const supabase = await createClient();

  // Get all questions for this test
  const questions = await getMCQQuestions(params.courseMaterialId);
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
      // Case-insensitive comparison
      isCorrect = studentAnswer.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
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
    .from('mcq_test_submissions')
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
    .from('mcq_test_answers')
    .insert(answerInserts);

  if (answersError) throw answersError;

  return {
    submissionId: submission.id,
    score: earnedPoints,
    totalPoints,
  };
}

export async function getMCQTestSubmission(
  courseMaterialId: string,
  studentId: string
): Promise<MCQTestSubmission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mcq_test_submissions')
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
    console.error('Error fetching MCQ submission:', error);
    return null;
  }

  return data;
}

export async function getMCQTestAnswers(submissionId: string): Promise<MCQTestAnswer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mcq_test_answers')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching MCQ answers:', error);
    return [];
  }

  return data || [];
}

