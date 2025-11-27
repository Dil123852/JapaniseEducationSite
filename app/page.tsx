import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth-server';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
