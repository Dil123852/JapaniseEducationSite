// Client-side test functions
import { supabase } from '../supabaseClient';
import { Question } from './tests';

export async function getTestWithQuestionsClient(testId: string) {
  const { data: test, error: testError } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (testError || !test) {
    throw new Error('Test not found');
  }

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    throw questionsError;
  }

  return { ...test, questions: questions || [] };
}

export async function submitTestClient(
  testId: string,
  studentId: string,
  answers: { questionId: string; answer: string }[]
) {
  // Get test with questions
  const test = await getTestWithQuestionsClient(testId);

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
        // Short answer - needs manual grading
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

