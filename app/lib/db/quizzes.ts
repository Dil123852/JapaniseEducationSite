import { createClient } from '../supabase-server';

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  password?: string;
  duration?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuizQuestionType;
  options?: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  created_at: string;
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  password_used?: string;
  score: number;
  total_points: number;
  submitted_at: string;
}

// Quiz functions
export async function createQuiz(
  title: string,
  description?: string,
  password?: string,
  duration?: number,
  teacherId: string
): Promise<Quiz> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      title,
      description: description || null,
      password: password || null,
      duration: duration ? parseInt(duration.toString()) : null,
      created_by: teacherId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher quizzes:', error);
    return [];
  }
  return data || [];
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all quizzes:', error);
    return [];
  }
  return data || [];
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
  return data;
}

export async function getQuizWithQuestions(quizId: string): Promise<QuizWithQuestions | null> {
  const supabase = await createClient();
  
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    console.error('Error fetching quiz:', quizError);
    return null;
  }

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error('Error fetching quiz questions:', questionsError);
    return { ...quiz, questions: [] };
  }

  return { ...quiz, questions: questions || [] };
}

export async function updateQuiz(
  quizId: string,
  updates: {
    title?: string;
    description?: string;
    password?: string;
    duration?: number;
  }
): Promise<Quiz> {
  const supabase = await createClient();
  
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.password !== undefined) updateData.password = updates.password || null;
  if (updates.duration !== undefined) updateData.duration = updates.duration ? parseInt(updates.duration.toString()) : null;

  const { data, error } = await supabase
    .from('quizzes')
    .update(updateData)
    .eq('id', quizId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId);

  if (error) throw error;
}

// Quiz Question functions
export async function addQuizQuestion(
  quizId: string,
  questionText: string,
  questionType: QuizQuestionType,
  correctAnswer: string,
  options?: string[],
  points: number = 1,
  orderIndex: number = 0
): Promise<QuizQuestion> {
  const supabase = await createClient();
  
  // Prepare options - only include if it's multiple_choice and options are provided
  let optionsValue: string[] | null = null;
  if (questionType === 'multiple_choice' && options && Array.isArray(options) && options.length > 0) {
    optionsValue = options.filter(opt => opt && opt.trim().length > 0);
    if (optionsValue.length === 0) {
      optionsValue = null;
    }
  }
  
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      question_type: questionType,
      options: optionsValue,
      correct_answer: correctAnswer,
      points,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding quiz question:', error);
    throw new Error(error.message || 'Failed to add question to database');
  }
  
  if (!data) {
    throw new Error('No data returned from database');
  }
  
  return data;
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }
  return data || [];
}

export async function updateQuizQuestion(
  questionId: string,
  updates: {
    question_text?: string;
    question_type?: QuizQuestionType;
    options?: string[];
    correct_answer?: string;
    points?: number;
    order_index?: number;
  }
): Promise<QuizQuestion> {
  const supabase = await createClient();
  
  const updateData: any = { ...updates };
  if (updates.options !== undefined) {
    updateData.options = updates.options.length > 0 ? updates.options : null;
  }
  
  const { data, error } = await supabase
    .from('quiz_questions')
    .update(updateData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

// Quiz Submission functions
export async function submitQuiz(
  quizId: string,
  studentId: string,
  password: string,
  answers: { questionId: string; answer: string }[]
): Promise<{ submissionId: string; score: number; totalPoints: number }> {
  const supabase = await createClient();
  
  // Verify password
  const quiz = await getQuiz(quizId);
  if (!quiz) throw new Error('Quiz not found');
  
  if (quiz.password && quiz.password !== password) {
    throw new Error('Incorrect password');
  }

  // Get quiz with questions
  const quizWithQuestions = await getQuizWithQuestions(quizId);
  if (!quizWithQuestions) throw new Error('Quiz not found');

  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  const answerRecords: any[] = [];

  for (const question of quizWithQuestions.questions) {
    totalPoints += question.points;
    const studentAnswer = answers.find(a => a.questionId === question.id);
    let isCorrect = false;
    let pointsEarned = 0;

    if (studentAnswer) {
      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        isCorrect = studentAnswer.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += question.points;
        }
      } else {
        // Short answer - needs manual grading, set points to 0 for now
        pointsEarned = 0;
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
    .from('quiz_submissions')
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      password_used: quiz.password ? password : null,
      score: earnedPoints,
      total_points: totalPoints,
    })
    .select()
    .single();

  if (submissionError) throw submissionError;

  // Create answers
  const answerInserts = answerRecords.map(record => ({
    submission_id: submission.id,
    ...record,
  }));

  const { error: answersError } = await supabase
    .from('quiz_answers')
    .insert(answerInserts);

  if (answersError) throw answersError;

  return {
    submissionId: submission.id,
    score: earnedPoints,
    totalPoints,
  };
}

export async function getStudentSubmissions(studentId: string): Promise<QuizSubmission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching student submissions:', error);
    return [];
  }
  return data || [];
}

export async function getQuizSubmissions(quizId: string): Promise<QuizSubmission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching quiz submissions:', error);
    return [];
  }
  return data || [];
}

