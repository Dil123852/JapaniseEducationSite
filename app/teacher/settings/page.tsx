import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'teacher') {
    redirect('/dashboard');
  }

  return <SettingsClient initialProfile={profile} />;
}

