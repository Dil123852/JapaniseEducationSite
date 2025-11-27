import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';
import {
  BookOpen,
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
  // Fetch dashboard data from API
  let stats = {
    totalLessons: 0,
    totalSubtopics: 0,
    totalStudents: 0,
    totalVideos: 0,
    totalPDFs: 0,
    totalQuizzes: 0,
  };

  let recentActivity: any[] = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/teacher/dashboard`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      const data = await response.json();
      stats = {
        totalLessons: data.totalLessons || 0,
        totalSubtopics: data.totalSubtopics || 0,
        totalStudents: data.totalStudents || 0,
        totalVideos: data.totalVideos || 0,
        totalPDFs: data.totalPDFs || 0,
        totalQuizzes: data.totalQuizzes || 0,
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Use default values if fetch fails
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">Total Lessons</CardTitle>
            <BookOpen className="w-5 h-5 md:w-4 md:h-4 text-[#4c8bf5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalLessons}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Active lessons</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">Subtopics</CardTitle>
            <FileText className="w-5 h-5 md:w-4 md:h-4 text-[#6d5dfc]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalSubtopics}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Learning modules</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">Total Students</CardTitle>
            <Users className="w-5 h-5 md:w-4 md:h-4 text-[#7fd1a1]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalStudents}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">Videos</CardTitle>
            <Video className="w-5 h-5 md:w-4 md:h-4 text-[#EF6161]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalVideos}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Uploaded videos</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">PDFs</CardTitle>
            <FileText className="w-5 h-5 md:w-4 md:h-4 text-[#4c8bf5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalPDFs}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Document files</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E5E7EB] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">Quizzes</CardTitle>
            <FileQuestion className="w-5 h-5 md:w-4 md:h-4 text-[#6d5dfc]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{stats.totalQuizzes}</div>
            <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">Created quizzes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border-[#E5E7EB]">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Quick Actions</CardTitle>
          <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            <Link href="/teacher/lessons/create">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white">
                <Plus className="w-6 h-6" />
                <span className="font-medium">Create Lesson</span>
              </Button>
            </Link>
            <Link href="/teacher/resources/videos">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B]">
                <Video className="w-6 h-6" />
                <span className="font-medium">Upload Video</span>
              </Button>
            </Link>
            <Link href="/teacher/resources/pdfs">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B]">
                <FileText className="w-6 h-6" />
                <span className="font-medium">Upload PDF</span>
              </Button>
            </Link>
            <Link href="/teacher/quizzes/create">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B]">
                <FileQuestion className="w-6 h-6" />
                <span className="font-medium">Create Quiz</span>
              </Button>
            </Link>
          </div>
          
          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-3 min-w-max">
              <Link href="/teacher/lessons/create" className="flex-shrink-0">
                <Button className="h-auto min-h-[120px] w-[140px] flex flex-col gap-2 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white px-4 py-4 rounded-xl">
                  <Plus className="w-7 h-7" />
                  <span className="font-medium text-base">Create Lesson</span>
                </Button>
              </Link>
              <Link href="/teacher/resources/videos" className="flex-shrink-0">
                <Button className="h-auto min-h-[120px] w-[140px] flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-4 py-4 rounded-xl">
                  <Video className="w-7 h-7" />
                  <span className="font-medium text-base">Upload Video</span>
                </Button>
              </Link>
              <Link href="/teacher/resources/pdfs" className="flex-shrink-0">
                <Button className="h-auto min-h-[120px] w-[140px] flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-4 py-4 rounded-xl">
                  <FileText className="w-7 h-7" />
                  <span className="font-medium text-base">Upload PDF</span>
                </Button>
              </Link>
              <Link href="/teacher/quizzes/create" className="flex-shrink-0">
                <Button className="h-auto min-h-[120px] w-[140px] flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-4 py-4 rounded-xl">
                  <FileQuestion className="w-7 h-7" />
                  <span className="font-medium text-base">Create Quiz</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card className="bg-white border-[#E5E7EB]">
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
                  <div key={index} className="flex items-start gap-3 p-3 md:p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#4c8bf5] mt-2"></div>
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
        <Card className="bg-white border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Student Progress</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Quick overview of student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-4 md:p-4 rounded-lg bg-[#F0F9FF] border border-[#C2E2F5]">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 md:w-5 md:h-5 text-[#7fd1a1]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Completed Quizzes</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Students who finished recent quizzes</p>
                  </div>
                </div>
                <Badge className="bg-[#7fd1a1] text-white text-sm md:text-xs px-3 py-1">0</Badge>
              </div>

              <div className="flex items-center justify-between p-4 md:p-4 rounded-lg bg-[#FEF2F2] border border-[#F7DDE2]">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 md:w-5 md:h-5 text-[#EF6161]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Behind Schedule</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Students who need attention</p>
                  </div>
                </div>
                <Badge className="bg-[#EF6161] text-white text-sm md:text-xs px-3 py-1">0</Badge>
              </div>

              <div className="flex items-center justify-between p-4 md:p-4 rounded-lg bg-[#F0F9FF] border border-[#C2E2F5]">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 md:w-5 md:h-5 text-[#4c8bf5]" />
                  <div>
                    <p className="text-base md:text-sm font-medium text-[#2B2B2B]">Average Score</p>
                    <p className="text-sm md:text-xs text-[#9CA3AF]">Recent quiz performance</p>
                  </div>
                </div>
                <Badge className="bg-[#4c8bf5] text-white text-sm md:text-xs px-3 py-1">N/A</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Overview */}
      <Card className="bg-white border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Lesson Overview</CardTitle>
              <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">All your lessons at a glance</CardDescription>
            </div>
            <Link href="/teacher/lessons" className="hidden md:block">
              <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3]">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#9CA3AF]">Lesson</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#9CA3AF]">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#9CA3AF]">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#9CA3AF]">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#9CA3AF]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E7EB]">
                  <td colSpan={5} className="py-8 text-center text-[#9CA3AF]">
                    No lessons yet. <Link href="/teacher/lessons/create" className="text-[#4c8bf5] hover:underline">Create your first lesson</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            <div className="p-4 border border-[#E5E7EB] rounded-lg bg-white shadow-sm">
              <div className="text-center py-6 text-[#9CA3AF]">
                <p className="text-base mb-2">No lessons yet.</p>
                <Link href="/teacher/lessons/create">
                  <Button className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white px-6 py-3 rounded-xl text-base font-medium min-h-[48px]">
                    Create your first lesson
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

