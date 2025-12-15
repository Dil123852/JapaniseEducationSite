import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getStudentEnrollments } from '@/app/lib/db/enrollments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, ArrowRight, Users, Calendar } from 'lucide-react';

export default async function StudentCoursesPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'student') {
    redirect('/dashboard');
  }

  const enrollments = await getStudentEnrollments(profile.id);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0 safe-area-bottom">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2B2B] mb-2">
            My Courses
          </h1>
          <p className="text-sm sm:text-base text-[#9CA3AF]">
            All your enrolled courses
          </p>
        </div>

        {enrollments.length === 0 ? (
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardContent className="py-12 sm:py-16 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#C2E2F5] opacity-50" />
              <h3 className="text-lg sm:text-xl font-medium text-[#2B2B2B] mb-2">
                No courses enrolled
              </h3>
              <p className="text-sm sm:text-base text-[#9CA3AF] mb-6">
                Enroll in a course to start learning
              </p>
              <Link
                href="/student/enroll"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium rounded-lg shadow-sm hover:shadow-md transition-all touch-target touch-feedback"
              >
                Enroll in Course
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/student/courses/${enrollment.course_id}`}
                className="group"
              >
                <Card className="bg-white border-[#E5E7EB] rounded-[18px] sm:rounded-[24px] soft-shadow hover:shadow-md active:shadow-sm transition-all h-full touch-feedback">
                  <CardHeader className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-[#2B2B2B]" />
                        </div>
                        <CardTitle className="text-base sm:text-lg font-medium text-[#2B2B2B] line-clamp-2 group-hover:text-[#C2E2F5] transition-colors">
                          {enrollment.course.title}
                        </CardTitle>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    {enrollment.course.description && (
                      <CardDescription className="text-sm text-[#9CA3AF] line-clamp-2">
                        {enrollment.course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 md:p-6 pt-0 space-y-3">
                    {enrollment.group && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Users className="w-4 h-4 text-[#C2E2F5]" />
                        <span className="text-[#9CA3AF]">Group: </span>
                        <span className="text-[#2B2B2B] font-medium">{enrollment.group.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#9CA3AF]">
                      <Calendar className="w-4 h-4" />
                      <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E5E7EB]">
                      <span className="text-xs sm:text-sm text-[#C2E2F5] font-medium group-hover:text-[#B0D9F0] transition-colors">
                        View Course →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

