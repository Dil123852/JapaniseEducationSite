import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getLessonWithSubtopics } from '@/app/lib/db/lessons';
import LessonEditorClient from './LessonEditorClient';

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonEditorPage({ params }: PageProps) {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  const { lessonId } = await params;
  const lesson = await getLessonWithSubtopics(lessonId);

  if (!lesson) {
    redirect('/teacher/lessons');
  }

  return <LessonEditorClient lesson={lesson} />;
}

