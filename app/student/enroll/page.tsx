'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';

const enrollSchema = z.object({
  enrollment_key: z.string().min(1, 'Please enter enrollment key'),
});

type EnrollForm = z.infer<typeof enrollSchema>;

export default function EnrollPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollForm>({
    resolver: zodResolver(enrollSchema),
  });

  const onSubmit = async (data: EnrollForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Login required');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'student') {
        throw new Error('Student account required');
      }

      // Find course by enrollment key
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, enrollment_key')
        .eq('enrollment_key', data.enrollment_key.toUpperCase())
        .single();

      if (courseError || !course) {
        throw new Error('Invalid enrollment key');
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .single();

      if (existing) {
        throw new Error('Already enrolled in this course');
      }

      // Enroll student
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: course.id,
          enrollment_key_used: data.enrollment_key.toUpperCase(),
          status: 'active',
        });

      if (enrollError) throw enrollError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/student/courses');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to dashboard
          </Link>
          <h1 className="text-xl font-light text-slate-800">Enroll in Course</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
              Enrollment completed. Redirecting to courses...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="enrollment_key" className="block text-sm font-medium text-slate-700 mb-2">
                Enrollment Key <span className="text-red-500">*</span>
              </label>
              <input
                {...register('enrollment_key')}
                type="text"
                id="enrollment_key"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-base uppercase"
                placeholder="e.g., ABC123"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter the enrollment key provided by your teacher
              </p>
              {errors.enrollment_key && (
                <p className="mt-1 text-sm text-red-600">{errors.enrollment_key.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium text-base hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isLoading ? 'Enrolling...' : success ? 'Enrolled' : 'Enroll in Course'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

