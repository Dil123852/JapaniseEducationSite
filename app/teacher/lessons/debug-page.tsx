// Temporary debug page to isolate the issue
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';

export default async function DebugLessonsPage() {
  try {
    console.log('[DEBUG] Starting LessonsPage');
    
    const profile = await getCurrentUserProfile();
    console.log('[DEBUG] Profile:', profile ? 'Found' : 'Not found');

    if (!profile || profile.role !== 'teacher') {
      console.log('[DEBUG] Redirecting to dashboard');
      redirect('/dashboard');
    }

    console.log('[DEBUG] About to fetch courses');
    // Just return empty for now to test
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Lessons Page</h1>
        <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
        <p>Role: {profile?.role}</p>
        <p>If you see this, the page is loading but courses fetch might be failing.</p>
      </div>
    );
  } catch (error: any) {
    console.error('[DEBUG] Error in LessonsPage:', {
      message: error?.message,
      stack: error?.stack,
    });
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}

