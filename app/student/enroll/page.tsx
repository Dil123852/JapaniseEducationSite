'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, CheckCircle2, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0 safe-area-bottom">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2B2B] mb-2">
            Enroll in Course
          </h1>
          <p className="text-sm sm:text-base text-[#9CA3AF]">
            Enter your enrollment key to join a course
          </p>
        </div>

        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-[#2B2B2B]" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#2B2B2B]">Enrollment</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-[#9CA3AF]">
                  Get your enrollment key from your teacher
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#F0FDF4] border border-[#CFE3C1] text-[#166534] rounded-[10px] text-sm sm:text-base flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Enrollment completed successfully!</p>
                  <p className="text-xs sm:text-sm mt-1">Redirecting to courses...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#FEF2F2] border border-[#F7DDE2] text-[#991B1B] rounded-[10px] text-sm sm:text-base flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Enrollment failed</p>
                  <p className="text-xs sm:text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label htmlFor="enrollment_key" className="block text-sm font-medium text-[#2B2B2B] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#C2E2F5]" />
                  Enrollment Key <span className="text-[#EF6161]">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('enrollment_key')}
                    type="text"
                    id="enrollment_key"
                    className="w-full px-4 py-3 pl-12 border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#C2E2F5]/20 focus:border-[#C2E2F5] text-base uppercase font-mono bg-white text-[#2B2B2B] transition-all"
                    placeholder="e.g., ABC123"
                    autoComplete="off"
                    disabled={isLoading || success}
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Enter the enrollment key provided by your teacher
                </p>
                {errors.enrollment_key && (
                  <p className="mt-1 text-sm text-[#EF6161] flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.enrollment_key.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium py-3 rounded-[24px] text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-target touch-feedback flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#2B2B2B] border-t-transparent rounded-full animate-spin"></div>
                    Enrolling...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Enrolled Successfully
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Enroll in Course
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Help Section */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#E5E7EB]">
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#F9FAFB] rounded-[10px]">
                <BookOpen className="w-5 h-5 text-[#C2E2F5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#2B2B2B] mb-1">Need help?</p>
                  <p className="text-xs sm:text-sm text-[#9CA3AF]">
                    Contact your teacher to get your enrollment key. The key is usually a combination of letters and numbers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

