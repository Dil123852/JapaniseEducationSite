import { createClient } from '../supabase-server';

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'short_answer';

export interface Test {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export async function createTest(
  courseId: string,
  title: string,
  description?: string,
  duration?: number
): Promise<Test> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tests')
    .insert({
      course_id: courseId,
      title,
      description,
      duration,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseTests(courseId: string): Promise<Test[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching course tests:', error);
    return [];
  }
  return data;
}

export async function getTest(testId: string): Promise<Test | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (error) {
    console.error('Error fetching test:', error);
    return null;
  }
  return data;
}

export async function getTestWithQuestions(testId: string): Promise<TestWithQuestions | null> {
  const supabase = await createClient();
  
  const { data: test, error: testError } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (testError || !test) {
    console.error('Error fetching test:', testError);
    return null;
  }

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return { ...test, questions: [] };
  }

  return { ...test, questions: questions || [] };
}

export async function addQuestion(
  testId: string,
  questionText: string,
  questionType: QuestionType,
  correctAnswer: string,
  options?: string[],
  points: number = 1,
  orderIndex: number = 0
): Promise<Question> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .insert({
      test_id: testId,
      question_text: questionText,
      question_type: questionType,
      options: options || null,
      correct_answer: correctAnswer,
      points,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitTest(
  testId: string,
  studentId: string,
  answers: { questionId: string; answer: string }[]
): Promise<{ submissionId: string; score: number; totalPoints: number }> {
  // This function needs to work from client, so we'll use a different approach
  // For now, return a promise that can be called from client
  const supabase = await createClient();
  
  // Get test with questions
  const test = await getTestWithQuestions(testId);
  if (!test) throw new Error('Test not found');

  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  const answerRecords: any[] = [];

  for (const question of test.questions) {
    totalPoints += question.points;
    const studentAnswer = answers.find(a => a.questionId === question.id);
    let isCorrect = false;
    let pointsEarned = 0;

    if (studentAnswer) {
      if (question.question_type === 'multiple_choice' || question.question_type === 'fill_blank') {
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
    .from('test_submissions')
    .insert({
      test_id: testId,
      student_id: studentId,
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
    .from('test_answers')
    .insert(answerInserts);

  if (answersError) throw answersError;

  return {
    submissionId: submission.id,
    score: earnedPoints,
    totalPoints,
  };
}

