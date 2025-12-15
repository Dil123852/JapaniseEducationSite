import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';
import { getCurrentUser } from '@/app/lib/auth-server';
import { getTeacherCourses } from '@/app/lib/db/courses';
import { getTeacherQuizzes } from '@/app/lib/db/quizzes';
import { redirect } from 'next/navigation';
import {
  Video,
  FileText,
  Users,
  FileQuestion,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default async function TeacherDashboard() {
  // Get authenticated user
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch real-time data directly from database
  let stats = {
    totalStudents: 0,
    totalQuizzes: 0,
  };

  let recentActivity: any[] = [];

  try {
    // Fetch all courses created by the teacher
    const teacherCourses = await getTeacherCourses(user.id);

    // Calculate total students across all courses (real-time count)
    let totalStudents = 0;
    for (const course of teacherCourses) {
      totalStudents += course.student_count || 0;
    }

    // Get total quizzes from standalone quizzes table (real-time count)
    const teacherQuizzes = await getTeacherQuizzes(user.id);
    const totalQuizzes = teacherQuizzes.length;

    stats = {
      totalStudents,
      totalQuizzes,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Use default values if fetch fails
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <TeacherMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B]">Dashboard</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">Dashboard</h1>
        <p className="text-[#9CA3AF]">Welcome back! Here's what's happening with your classes.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-6">
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-0 px-2.5 md:px-6 pt-1.5 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium text-[#9CA3AF]">Quizzes</CardTitle>
            <FileQuestion className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C2E2F5]" />
          </CardHeader>
          <CardContent className="px-2.5 md:px-6 pb-1.5 md:pb-3 pt-0">
            <div className="text-lg md:text-3xl font-bold text-[#2B2B2B]">{stats.totalQuizzes}</div>
            <p className="text-[10px] md:text-xs text-[#9CA3AF] mt-0">Created quizzes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-0 px-2.5 md:px-6 pt-1.5 md:pt-3">
            <CardTitle className="text-xs md:text-sm font-medium text-[#9CA3AF]">Total Students</CardTitle>
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C2E2F5]" />
          </CardHeader>
          <CardContent className="px-2.5 md:px-6 pb-1.5 md:pb-3 pt-0">
            <div className="text-lg md:text-3xl font-bold text-[#2B2B2B]">{stats.totalStudents}</div>
            <p className="text-[10px] md:text-xs text-[#9CA3AF] mt-0">Enrolled students</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Quick Actions</CardTitle>
          <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            <Link href="/teacher/resources/videos">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <Video className="w-6 h-6" />
                <span className="font-medium">Upload Video</span>
              </Button>
            </Link>
            <Link href="/teacher/resources/pdfs">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <FileText className="w-6 h-6" />
                <span className="font-medium">Upload PDF</span>
              </Button>
            </Link>
            <Link href="/teacher/quizzes/create">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <FileQuestion className="w-6 h-6" />
                <span className="font-medium">Create Quiz</span>
              </Button>
            </Link>
          </div>
          
          {/* Mobile 2-Row Grid */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            <Link href="/teacher/resources/videos">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <Video className="w-5 h-5" />
                <span className="font-medium text-xs">Upload Video</span>
              </Button>
            </Link>
            <Link href="/teacher/resources/pdfs">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <FileText className="w-5 h-5" />
                <span className="font-medium text-xs">Upload PDF</span>
              </Button>
            </Link>
            <Link href="/teacher/quizzes/create">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <FileQuestion className="w-5 h-5" />
                <span className="font-medium text-xs">Create Quiz</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recent Activity</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Latest updates from your classes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-[#9CA3AF]">
                <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base md:text-sm">No recent activity</p>
                <p className="text-sm md:text-xs mt-1">Activity will appear here as students interact</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 md:p-3 rounded-[10px] hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#C2E2F5] mt-2"></div>
                    <div className="flex-1">
                      <p className="text-base md:text-sm text-[#2B2B2B]">{activity.message}</p>
                      <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Progress Snapshot */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Student Progress</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Quick overview of student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-4 md:p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 md:w-5 md:h-5 text-[#C2E2F5]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Completed Quizzes</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Students who finished recent quizzes</p>
                  </div>
                </div>
                <Badge className="bg-[#C2E2F5] text-[#2B2B2B] text-sm md:text-xs px-3 py-1">0</Badge>
              </div>

              <div className="flex items-center justify-between p-4 md:p-4 rounded-[10px] bg-[#FEF2F2] border border-[#F7DDE2]">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 md:w-5 md:h-5 text-[#EF6161]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Behind Schedule</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Students who need attention</p>
                  </div>
                </div>
                <Badge className="bg-[#EF6161] text-white text-sm md:text-xs px-3 py-1">0</Badge>
              </div>

              <div className="flex items-center justify-between p-4 md:p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 md:w-5 md:h-5 text-[#C2E2F5]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Average Score</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Recent quiz performance</p>
                  </div>
                </div>
                <Badge className="bg-[#C2E2F5] text-[#2B2B2B] text-sm md:text-xs px-3 py-1">N/A</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

