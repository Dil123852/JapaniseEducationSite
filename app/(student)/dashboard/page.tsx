import { redirect } from 'next/navigation';
import { getCurrentUserProfile, getCurrentUser } from '@/app/lib/auth-server';
import { getStudentEnrollments } from '@/app/lib/db/enrollments';
import { getCourseLessons } from '@/app/lib/db/lessons';
import { getAllQuizzes, getStudentSubmissions } from '@/app/lib/db/quizzes';
import { getStudentLearningTime, calculateStudentStatus } from '@/app/lib/db/student-stats';
import { createClient } from '@/app/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FavoriteButton from '@/app/components/FavoriteButton';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  TrendingUp,
  Play,
  Plus,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/complete-profile');
  }

  if (profile.role === 'teacher') {
    redirect('/teacher');
  }

  const userName = profile.full_name || profile.email?.split('@')[0] || 'User';
  const greeting = getGreeting();

  // Fetch all data with proper initialization
  let enrollments: any[] = [];
  let inProgressLessons: any[] = [];
  let recentCourses: any[] = [];
  let recentQuizzes: any[] = [];
  let learningTime = { formatted: '0h 0m', hours: 0, minutes: 0, totalSeconds: 0 };
  let studentStatus = {
    level: 'Beginner' as const,
    score: 0,
    description: '',
    improvements: [] as string[],
  };
  let allQuizzes: any[] = [];
  let studentSubmissions: any[] = [];

  try {
    const supabase = await createClient();
    
    // Get enrolled courses - ensures real data is fetched
    const fetchedEnrollments = await getStudentEnrollments(profile.id);
    enrollments = Array.isArray(fetchedEnrollments) ? fetchedEnrollments : [];

    // Get all quizzes and submissions - ensures real data is fetched
    const fetchedQuizzes = await getAllQuizzes();
    allQuizzes = Array.isArray(fetchedQuizzes) ? fetchedQuizzes : [];
    
    const fetchedSubmissions = await getStudentSubmissions(profile.id);
    studentSubmissions = Array.isArray(fetchedSubmissions) ? fetchedSubmissions : [];

    // Get learning time - ensures real data is fetched
    const fetchedLearningTime = await getStudentLearningTime(profile.id);
    learningTime = fetchedLearningTime || { formatted: '0h 0m', hours: 0, minutes: 0, totalSeconds: 0 };

    // Get student status - ensures real data is fetched
    const fetchedStatus = await calculateStudentStatus(profile.id);
    studentStatus = fetchedStatus || {
      level: 'Beginner',
      score: 0,
      description: 'Start learning to see your status',
      improvements: ['Complete quizzes and watch videos to improve'],
    };

    // Get recent courses (last 6 enrolled)
    recentCourses = enrollments
      .map((e: any) => ({
        id: e.course?.id || e.course_id,
        title: e.course?.title || 'Course',
        description: e.course?.description || '',
        enrolledAt: e.enrolled_at || e.created_at,
      }))
      .sort((a: any, b: any) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 6);

    // Get in-progress learning contents
    for (const enrollment of enrollments.slice(0, 3)) {
      const enrollmentData = enrollment as any;
      const courseId = enrollmentData.course?.id || enrollmentData.course_id;
      if (courseId) {
        const lessons = await getCourseLessons(courseId);
        for (const lesson of lessons.slice(0, 2)) {
          // Check if student has progress on this lesson
          const { data: progress } = await supabase
            .from('video_analytics')
            .select('watch_time, completed')
            .limit(1);
          
          inProgressLessons.push({
            ...lesson,
            course_id: courseId,
            course_title: enrollmentData.course?.title || 'Course',
            progress: 0, // Placeholder - can be enhanced with actual progress tracking
          });
        }
      }
    }

    // Limit in-progress lessons to 6
    inProgressLessons = inProgressLessons.slice(0, 6);

    // Get recent quizzes (available quizzes and recently completed)
    const submittedQuizIds = new Set(studentSubmissions.map((s: any) => s.quiz_id));
    const pendingQuizzes = allQuizzes.filter((q: any) => !submittedQuizIds.has(q.id));
    const completedQuizzes = studentSubmissions
      .map((s: any) => {
        const quiz = allQuizzes.find((q: any) => q.id === s.quiz_id);
        if (!quiz) return null;
        return {
          ...quiz,
          score: s.score,
          total_points: s.total_points,
          submitted_at: s.submitted_at,
          completed: true,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    // Combine pending and completed quizzes, limit to 6
    recentQuizzes = [
      ...completedQuizzes.slice(0, 3),
      ...pendingQuizzes.slice(0, 3),
    ].slice(0, 6);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 pb-20 md:pb-8 safe-area-bottom">
      {/* Greeting Section with Stats Cards and Enrollment Button - Single Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Greeting */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2B2B2B] break-words sm:whitespace-nowrap">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5 break-words sm:whitespace-nowrap">
            Welcome to SAKURA DREAM
          </p>
      </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:justify-end justify-between w-full sm:w-auto">
          {/* Small Stats Cards */}
          <div className="flex items-center gap-2 sm:gap-2 md:gap-3 flex-1 sm:flex-none overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {/* Enrolled Courses */}
            <Card className="bg-white border-[#E5E7EB] rounded-[10px] soft-shadow hover:shadow-md transition-shadow flex-shrink-0 h-auto py-2 sm:py-2 px-3 sm:px-4 min-w-[80px] sm:min-w-0 touch-target">
              <div className="flex flex-col items-center justify-center">
                <CardTitle className="text-[9px] sm:text-[10px] font-medium text-[#9CA3AF] leading-tight whitespace-nowrap mb-0.5">Enrolled</CardTitle>
                <div className="text-base sm:text-lg font-bold text-[#2B2B2B]">{enrollments.length}</div>
              </div>
            </Card>

            {/* Learning Time */}
            <Card className="bg-white border-[#E5E7EB] rounded-[10px] soft-shadow hover:shadow-md transition-shadow flex-shrink-0 h-auto py-2 sm:py-2 px-3 sm:px-4 min-w-[80px] sm:min-w-0 touch-target">
              <div className="flex flex-col items-center justify-center">
                <CardTitle className="text-[9px] sm:text-[10px] font-medium text-[#9CA3AF] leading-tight whitespace-nowrap mb-0.5">Time</CardTitle>
                <div className="text-base sm:text-lg font-bold text-[#2B2B2B] text-xs sm:text-base">{learningTime.formatted}</div>
          </div>
            </Card>

            {/* Completed Quizzes */}
            <Card className="bg-white border-[#E5E7EB] rounded-[10px] soft-shadow hover:shadow-md transition-shadow flex-shrink-0 h-auto py-2 sm:py-2 px-3 sm:px-4 min-w-[80px] sm:min-w-0 touch-target">
              <div className="flex flex-col items-center justify-center">
                <CardTitle className="text-[9px] sm:text-[10px] font-medium text-[#9CA3AF] leading-tight whitespace-nowrap mb-0.5">Quizzes</CardTitle>
                <div className="text-base sm:text-lg font-bold text-[#2B2B2B]">{studentSubmissions.length}</div>
            </div>
            </Card>

            {/* Student Status */}
            <Card className="bg-white border-[#E5E7EB] rounded-[10px] soft-shadow hover:shadow-md transition-shadow flex-shrink-0 h-auto py-2 sm:py-2 px-3 sm:px-4 min-w-[80px] sm:min-w-0 touch-target">
              <div className="flex flex-col items-center justify-center">
                <CardTitle className="text-[9px] sm:text-[10px] font-medium text-[#9CA3AF] leading-tight whitespace-nowrap mb-0.5">Status</CardTitle>
                <div className="text-xs sm:text-base font-bold text-[#2B2B2B] truncate w-full text-center">{studentStatus.level}</div>
            </div>
            </Card>
          </div>

          {/* Enroll Button - Right after stat cards */}
          <Link href="/student/enroll" className="flex-shrink-0 touch-target">
            <Button className="h-auto py-2 sm:py-2 px-3 sm:px-4 bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap touch-feedback min-h-[44px]">
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Enroll in Course</span>
              <span className="sm:hidden">Enroll</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* In Progress Learning Contents */}
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">In Progress Learning Contents</CardTitle>
          <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Continue from where you left off</CardDescription>
            </div>
            <Link href="/student/courses" className="hidden md:block">
              <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#C2E2F5] hover:border-[#C2E2F5] rounded-[10px]">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {inProgressLessons.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-[#9CA3AF]">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium mb-2">No lessons in progress</p>
              <p className="text-sm md:text-base">Start a lesson to see your progress here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {inProgressLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="relative p-4 sm:p-5 border border-[#E5E7EB] rounded-[10px] hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-colors group touch-feedback"
                >
                  <Link
                    href={`/student/courses/${lesson.course_id}/lessons/${lesson.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                        <span className="text-xs text-[#9CA3AF]">{lesson.course_title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-sm font-medium text-[#2B2B2B] mb-2 line-clamp-2">{lesson.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        Continue
                </Button>
                      <span className="text-xs text-[#9CA3AF]">{lesson.progress}%</span>
          </div>
                    <div className="h-1.5 rounded-full bg-[#E5E7EB] mt-2">
                      <div 
                        className="h-full rounded-full bg-[#C2E2F5] transition-all"
                        style={{ width: `${lesson.progress || 0}%` }}
                      />
                </div>
                  </Link>
                  <div className="absolute top-4 right-4">
                    <FavoriteButton lessonId={lesson.id} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Recent Enrolled Courses */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recent Enrolled Courses</CardTitle>
              <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Your recently enrolled courses</CardDescription>
              </div>
              <Link href="/student/courses" className="hidden md:block">
                <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#C2E2F5] hover:border-[#C2E2F5] rounded-[10px]">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
          {recentCourses.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-[#9CA3AF]">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium mb-2">No courses enrolled</p>
              <Link href="/student/enroll">
                <Button className="mt-4 bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B]">
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll in a Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="p-4 border border-[#E5E7EB] rounded-[10px] hover:bg-[#FAFAFA] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium text-[#2B2B2B] mb-1 line-clamp-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1">{course.description}</p>
                  )}
                  <p className="text-xs text-[#9CA3AF] mt-3">
                    Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

      {/* Recent Enrolled Quizzes */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recent Enrolled Quizzes</CardTitle>
              <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Available and completed quizzes</CardDescription>
              </div>
            <Link href="/student/quizzes" className="hidden md:block">
                <Button variant="outline" size="sm" className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#C2E2F5] hover:border-[#C2E2F5] rounded-[10px]">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
          {recentQuizzes.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-[#9CA3AF]">
              <FileQuestion className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg font-medium mb-2">No quizzes available</p>
              <p className="text-sm md:text-base">Quizzes will appear here when available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentQuizzes.map((quiz: any) => (
                <Link
                  key={quiz.id}
                  href={quiz.completed ? `/student/quizzes/${quiz.id}` : `/student/quizzes/${quiz.id}/take`}
                  className="p-4 border border-[#E5E7EB] rounded-[10px] hover:bg-[#FAFAFA] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileQuestion className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                    {quiz.completed ? (
                      <Badge className="bg-[#C2E2F5] text-[#2B2B2B] text-xs">Completed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-[#2B2B2B] mb-1 line-clamp-2">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1">{quiz.description}</p>
                  )}
                  {quiz.completed && (
                    <p className="text-xs text-[#9CA3AF] mt-3">
                      Score: {quiz.score}/{quiz.total_points}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Time & Student Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Learning Time */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Learning Time</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Total time spent learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="w-16 h-16 text-[#C2E2F5] mx-auto mb-4" />
                <div className="text-4xl font-bold text-[#2B2B2B] mb-2">{learningTime.formatted}</div>
                <p className="text-sm text-[#9CA3AF]">Total learning time</p>
                    </div>
                  </div>
          </CardContent>
        </Card>

        {/* Student Status */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Student Status</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF] hidden md:block">Your current learning level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Award className={`w-16 h-16 mx-auto mb-4 ${
                  studentStatus.level === 'Expert' ? 'text-yellow-500' :
                  studentStatus.level === 'Advanced' ? 'text-blue-500' :
                  studentStatus.level === 'Intermediate' ? 'text-green-500' :
                  'text-[#C2E2F5]'
                }`} />
                <div className="text-3xl font-bold text-[#2B2B2B] mb-2">{studentStatus.level}</div>
                <Badge className="bg-[#C2E2F5] text-[#2B2B2B]">{studentStatus.score}%</Badge>
                </div>
              <p className="text-sm text-[#9CA3AF] text-center">{studentStatus.description}</p>
              {studentStatus.improvements.length > 0 && (
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <p className="text-xs font-medium text-[#2B2B2B] mb-2">Suggestions to improve:</p>
                  <ul className="space-y-1">
                    {studentStatus.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-xs text-[#9CA3AF] flex items-start gap-2">
                        <Sparkles className="w-3 h-3 mt-0.5 text-[#C2E2F5] flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
