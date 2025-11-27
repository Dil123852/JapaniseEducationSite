import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import QuizzesListClient from './QuizzesListClient';

export default async function QuizzesPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  return <QuizzesListClient />;
}

