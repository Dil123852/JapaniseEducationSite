import { redirect } from 'next/navigation';
import { getCurrentUserProfile, getCurrentUser } from '@/app/lib/auth-server';
import { getStudentEnrollments } from '@/app/lib/db/enrollments';
import { getCourseLessons } from '@/app/lib/db/lessons';
import { getAllQuizzes, getStudentSubmissions } from '@/app/lib/db/quizzes';
import { createClient } from '@/app/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentMobileMenu from '@/app/components/StudentMobileMenu';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  TrendingUp,
  Play,
  Plus,
  Clock,
  Flame,
  Bell,
  ArrowRight,
  Video,
  FileText,
} from 'lucide-react';

export default async function DashboardPage() {
  // First check if user is authenticated
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // User is authenticated, now get their profile
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/complete-profile');
  }

  // Redirect teachers to teacher dashboard
  if (profile.role === 'teacher') {
    redirect('/teacher');
  }

  const userName = profile.full_name || profile.email?.split('@')[0] || 'User';

  // Fetch student statistics
  let stats = {
    totalLessons: 0,
    completedLessons: 0,
    pendingQuizzes: 0,
    overallProgress: 0,
    enrolledCourses: 0,
  };

  let recentActivity: any[] = [];
  let recommendedLessons: any[] = [];
  let announcements: any[] = [];
  let lastLesson: any = null;
  let studentSubmissions: any[] = [];
  let lastUsedLessons: any[] = [];

  try {
    const supabase = await createClient();
    
    // Get enrolled courses
    const enrollments = await getStudentEnrollments(profile.id);
    stats.enrolledCourses = enrollments.length;

    // Calculate lessons stats
    let totalLessons = 0;
    let completedLessons = 0;
    
    for (const enrollment of enrollments) {
      const enrollmentData = enrollment as any;
      const courseId = enrollmentData.course?.id || enrollmentData.course_id;
      if (courseId) {
        const lessons = await getCourseLessons(courseId);
        totalLessons += lessons.length;

        // Check completed lessons (simplified - you can enhance this with actual progress tracking)
        // For now, we'll use a placeholder
        for (const lesson of lessons) {
          // Check if student has accessed this lesson
          const { data: progress } = await supabase
            .from('subtopics')
            .select('id')
            .eq('lesson_id', lesson.id)
            .limit(1);
          
          // Simplified completion check - you can enhance this
          if (progress && progress.length > 0) {
            completedLessons += 0; // Placeholder - implement actual progress tracking
          }
        }
      }
    }

    stats.totalLessons = totalLessons;
    stats.completedLessons = completedLessons;
    stats.overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Get quizzes
    const allQuizzes = await getAllQuizzes();
    studentSubmissions = await getStudentSubmissions(profile.id);
    const submittedQuizIds = new Set(studentSubmissions.map((s: any) => s.quiz_id));
    stats.pendingQuizzes = allQuizzes.filter((q: any) => !submittedQuizIds.has(q.id)).length;

    // Get last used lessons (from all enrolled courses, get recent lessons)
    if (enrollments.length > 0) {
      for (const enrollment of enrollments) {
        const enrollmentData = enrollment as any;
        const courseId = enrollmentData.course?.id || enrollmentData.course_id;
        if (courseId) {
          const courseLessons = await getCourseLessons(courseId);
          // Add course info to each lesson
          const lessonsWithCourse = courseLessons.map((lesson: any) => ({
            ...lesson,
            course_id: courseId,
            course_title: enrollmentData.course?.title || 'Course',
          }));
          lastUsedLessons.push(...lessonsWithCourse);
        }
      }
      // Sort by created_at or updated_at (most recent first) and take first 4-6
      lastUsedLessons = lastUsedLessons
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
          const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 6);
      
      // Get last lesson for quick action
      if (lastUsedLessons.length > 0) {
        lastLesson = lastUsedLessons[0];
      }
    }

    // Get recent activity (simplified - you can enhance with actual activity tracking)
    const recentSubmissions = studentSubmissions.slice(0, 3);
    for (const submission of recentSubmissions) {
      const quiz = allQuizzes.find((q: any) => q.id === submission.quiz_id);
      if (quiz) {
        recentActivity.push({
          type: 'quiz',
          title: quiz.title,
          score: `${submission.score}/${submission.total_points}`,
          date: new Date(submission.submitted_at).toLocaleDateString(),
        });
      }
    }

    // Get recommended lessons (simplified - you can enhance with ML/recommendation logic)
    if (enrollments.length > 0) {
      for (const enrollment of enrollments.slice(0, 2)) {
        const enrollmentData = enrollment as any;
        const courseId = enrollmentData.course?.id || enrollmentData.course_id;
        if (courseId) {
          const courseLessons = await getCourseLessons(courseId);
          recommendedLessons.push(...courseLessons.slice(0, 2).map((lesson: any) => ({ ...lesson, course_id: courseId })));
        }
      }
    }

    // Get announcements (from notifications)
    const courseIds = enrollments.map((e: any) => e.course?.id || e.course_id).filter(Boolean);
    if (courseIds.length > 0) {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (notifications) {
        announcements = notifications.map((n: any) => ({
          id: n.id,
          title: n.title || 'Announcement',
          message: n.message || '',
          date: new Date(n.created_at).toLocaleDateString(),
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <StudentMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B]">Dashboard</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">
              こんにちは 👋 {userName}!
            </h1>
            <p className="text-sm md:text-base text-[#9CA3AF] mt-1">
              Ready to learn Japanese today?
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] rounded-[10px] border border-[#F7DDE2]">
              <Flame className="w-4 h-4 text-[#EF6161]" />
              <span className="text-sm font-medium text-[#2B2B2B]">7 day streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F9FF] rounded-[10px] border border-[#C2E2F5]">
              <Clock className="w-4 h-4 text-[#C2E2F5]" />
              <span className="text-sm font-medium text-[#2B2B2B]">2h 30m this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Used Lessons */}
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Last Used Lessons</CardTitle>
          <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Continue from where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          {lastUsedLessons.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-[#9CA3AF]">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium mb-2">No lessons yet</p>
              <p className="text-sm md:text-base">Enroll in a course to start learning</p>
            </div>
          ) : (
            <div className="overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 min-w-max md:min-w-0">
                {lastUsedLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${lesson.course_id}/lessons/${lesson.id}`}
                    className="flex-shrink-0 w-64 md:w-auto p-4 border border-[#E5E7EB] rounded-[10px] hover:bg-[#FAFAFA] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                        <span className="text-xs text-[#9CA3AF]">{lesson.course_title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-sm font-medium text-[#2B2B2B] mb-1 line-clamp-2">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1">{lesson.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Quick Actions</CardTitle>
          <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Get started with your learning</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {lastLesson ? (
              <Link href={`/student/courses/${lastLesson.course_id}/lessons/${lastLesson.id}`}>
                <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] rounded-[24px] border border-[#E5E7EB] soft-shadow hover:shadow-md">
                  <Play className="w-6 h-6" />
                  <span className="font-medium">Continue Lesson</span>
                </Button>
              </Link>
            ) : (
              <Link href="/student/courses">
                <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] rounded-[24px] border border-[#E5E7EB] soft-shadow hover:shadow-md">
                  <Play className="w-6 h-6" />
                  <span className="font-medium">Start Learning</span>
                </Button>
              </Link>
            )}
            <Link href="/student/courses">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <Plus className="w-6 h-6" />
                <span className="font-medium">New Lesson</span>
              </Button>
            </Link>
            <Link href="/student/quizzes">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <FileQuestion className="w-6 h-6" />
                <span className="font-medium">Attempt Quiz</span>
              </Button>
            </Link>
            <Link href="/student/resources">
              <Button className="w-full h-auto py-6 flex flex-col gap-2 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] rounded-[24px]">
                <BookOpen className="w-6 h-6" />
                <span className="font-medium">Resources</span>
              </Button>
            </Link>
          </div>
          
          {/* Mobile 2-Row Grid */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            {lastLesson ? (
              <Link href={`/student/courses/${lastLesson.course_id}/lessons/${lastLesson.id}`}>
                <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] px-3 rounded-[10px] border border-[#E5E7EB] soft-shadow">
                  <Play className="w-5 h-5" />
                  <span className="font-medium text-xs">Continue</span>
                </Button>
              </Link>
            ) : (
              <Link href="/student/courses">
                <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] px-3 rounded-[10px] border border-[#E5E7EB] soft-shadow">
                  <Play className="w-5 h-5" />
                  <span className="font-medium text-xs">Start</span>
                </Button>
              </Link>
            )}
            <Link href="/student/courses">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <Plus className="w-5 h-5" />
                <span className="font-medium text-xs">New Lesson</span>
              </Button>
            </Link>
            <Link href="/student/quizzes">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <FileQuestion className="w-5 h-5" />
                <span className="font-medium text-xs">Quiz</span>
              </Button>
            </Link>
            <Link href="/student/resources">
              <Button className="w-full h-auto py-3 flex flex-col gap-1.5 bg-white border-2 border-[#E5E7EB] hover:bg-[#FCE7F3] text-[#2B2B2B] px-3 rounded-[10px]">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-xs">Resources</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Progress Summary */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Progress Summary</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Your learning journey overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                <div>
                  <p className="text-sm font-medium text-[#2B2B2B]">Lessons</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Completed / Total</p>
                </div>
                <Badge className="bg-[#C2E2F5] text-[#2B2B2B] text-sm px-3 py-1">
                  {stats.completedLessons} / {stats.totalLessons}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                <div>
                  <p className="text-sm font-medium text-[#2B2B2B]">Quizzes</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Completed / Pending</p>
                </div>
                <Badge className="bg-[#C2E2F5] text-[#2B2B2B] text-sm px-3 py-1">
                  {studentSubmissions?.length || 0} / {stats.pendingQuizzes}
                </Badge>
              </div>

              <div className="p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#2B2B2B]">Overall Course Progress</p>
                  <span className="text-sm font-bold text-[#2B2B2B]">{stats.overallProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E7EB]">
                  <div 
                    className="h-full rounded-full transition-all bg-[#C2E2F5]"
                    style={{ width: `${stats.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recent Activity</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-[#9CA3AF]">
                <Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base md:text-sm">No recent activity</p>
                <p className="text-sm md:text-xs mt-1">Start learning to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-[10px] hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[#C2E2F5] mt-2"></div>
                    <div className="flex-1">
                      <p className="text-base md:text-sm text-[#2B2B2B]">
                        {activity.type === 'quiz' && '📝'} {activity.title}
                      </p>
                      <p className="text-sm md:text-xs text-[#9CA3AF] mt-1">
                        {activity.type === 'quiz' && `Score: ${activity.score} • `}
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Lessons */}
      {recommendedLessons.length > 0 && (
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recommended for You</CardTitle>
                <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Continue your learning journey</CardDescription>
              </div>
              <Link href="/student/courses" className="hidden md:block">
                <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#C2E2F5] hover:border-[#C2E2F5] rounded-[10px]">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedLessons.slice(0, 3).map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/student/courses/${lesson.course_id}/lessons/${lesson.id}`}
                  className="p-4 border border-[#E5E7EB] rounded-[10px] hover:bg-[#FAFAFA] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium text-[#2B2B2B] mb-1">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-2">{lesson.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Announcements</CardTitle>
                <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Updates from your teachers</CardDescription>
              </div>
              <Link href="/student/notifications" className="hidden md:block">
                <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#C2E2F5] hover:border-[#C2E2F5] rounded-[10px]">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 rounded-[10px] bg-[#F0F9FF] border border-[#C2E2F5]">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[#C2E2F5] mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[#2B2B2B] mb-1">{announcement.title}</h4>
                      <p className="text-xs text-[#9CA3AF]">{announcement.message}</p>
                      <p className="text-xs text-[#9CA3AF] mt-2">{announcement.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

