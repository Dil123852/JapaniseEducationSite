import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getQuizWithQuestions } from '@/app/lib/db/quizzes';
import QuizManagementClient from './QuizManagementClient';

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default async function QuizQuestionsPage({ params }: PageProps) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  const { quizId } = await params;
  const quiz = await getQuizWithQuestions(quizId);

  if (!quiz) {
    redirect('/teacher/quizzes');
  }

  // Verify user owns the quiz
  if (quiz.created_by !== profile.id) {
    redirect('/teacher/quizzes');
  }

  return <QuizManagementClient quiz={quiz} />;
}

