import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { getStudentEnrollments } from '@/app/lib/db/enrollments';
import Link from 'next/link';

export default async function StudentCoursesPage() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.role !== 'student') {
    redirect('/dashboard');
  }

  const enrollments = await getStudentEnrollments(profile.id);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-4">Not enrolled in any courses yet</p>
            <Link
              href="/student/enroll"
              className="inline-block px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 min-h-[48px]"
            >
              Enroll in Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/student/courses/${enrollment.course_id}`}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow min-h-[160px] flex flex-col"
              >
                <h2 className="text-lg font-medium text-slate-800 mb-2 line-clamp-2">
                  {enrollment.course.title}
                </h2>
                {enrollment.course.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
                    {enrollment.course.description}
                  </p>
                )}
                {enrollment.group && (
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Group: {enrollment.group.name}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-400">
                  Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString('en-US')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

