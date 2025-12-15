import { redirect } from 'next/navigation';
import { getCurrentUserProfile, getCurrentUser } from '@/app/lib/auth-server';
import { getStudentEnrollments } from '@/app/lib/db/enrollments';
import { getAllQuizzes, getStudentSubmissions } from '@/app/lib/db/quizzes';
import { getStudentLearningTime, calculateStudentStatus } from '@/app/lib/db/student-stats';
import { createClient } from '@/app/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import AIRecommendations from '@/app/components/AIRecommendations';

export default async function NextStepPage() {
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

  // Fetch data for AI analysis
  let enrollments: any[] = [];
  let studentSubmissions: any[] = [];
  let learningTime = { formatted: '0h 0m', hours: 0, minutes: 0, totalSeconds: 0 };
  let studentStatus = {
    level: 'Beginner' as const,
    score: 0,
    description: '',
    improvements: [] as string[],
  };
  let allQuizzes: any[] = [];
  let recentActivity: any[] = [];
  let weakAreas: string[] = [];
  let strengths: string[] = [];

  try {
    const supabase = await createClient();
    
    // Get enrolled courses
    enrollments = await getStudentEnrollments(profile.id);

    // Get all quizzes and submissions
    allQuizzes = await getAllQuizzes();
    studentSubmissions = await getStudentSubmissions(profile.id);

    // Get learning time
    learningTime = await getStudentLearningTime(profile.id);

    // Get student status (with AI calculations)
    studentStatus = await calculateStudentStatus(profile.id);

    // Analyze quiz performance for AI insights
    if (studentSubmissions.length > 0) {
      const averageScore = studentSubmissions.reduce((sum, s) => {
        const percentage = s.total_points > 0 ? (s.score / s.total_points) * 100 : 0;
        return sum + percentage;
      }, 0) / studentSubmissions.length;

      if (averageScore >= 80) {
        strengths.push('Excellent quiz performance');
      } else if (averageScore >= 60) {
        strengths.push('Good understanding of quiz material');
      } else {
        weakAreas.push('Need to improve quiz scores');
      }

      // Recent performance trend
      const recentSubmissions = studentSubmissions.slice(0, 3);
      const recentScores = recentSubmissions.map(s => 
        s.total_points > 0 ? (s.score / s.total_points) * 100 : 0
      );
      const recentAverage = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      
      if (recentAverage > averageScore + 5) {
        strengths.push('Performance is improving');
      } else if (recentAverage < averageScore - 5) {
        weakAreas.push('Recent performance needs attention');
      }
    }

    // Learning time analysis
    if (learningTime.hours >= 10) {
      strengths.push('High engagement with learning materials');
    } else if (learningTime.hours < 2) {
      weakAreas.push('Increase study time for better results');
    }

    // Course engagement
    if (enrollments.length >= 3) {
      strengths.push('Active participation in multiple courses');
    } else if (enrollments.length === 0) {
      weakAreas.push('Enroll in courses to start learning');
    }

    // Get recent activity
    const recentSubmissions = studentSubmissions.slice(0, 5);
    for (const submission of recentSubmissions) {
      const quiz = allQuizzes.find((q: any) => q.id === submission.quiz_id);
      if (quiz) {
        recentActivity.push({
          type: 'quiz',
          title: quiz.title,
          score: `${submission.score}/${submission.total_points}`,
          percentage: submission.total_points > 0 ? Math.round((submission.score / submission.total_points) * 100) : 0,
          date: new Date(submission.submitted_at).toLocaleDateString(),
        });
      }
    }

  } catch (error) {
    console.error('Error fetching next step data:', error);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 pb-20 md:pb-8 safe-area-bottom">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2B2B2B]">
          Next Step
        </h1>
        <p className="text-sm sm:text-base text-[#9CA3AF]">
          AI-powered insights to guide your learning journey
        </p>
      </div>

      {/* Current Status Overview */}
      <Card className="bg-gradient-to-br from-[#C2E2F5] to-[#F7DDE2] border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Your Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 sm:p-5 bg-white/50 rounded-lg touch-target">
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-[#2B2B2B] mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">{studentStatus.level}</div>
              <p className="text-xs text-[#9CA3AF] mt-1">Learning Level</p>
            </div>
            <div className="text-center p-4 sm:p-5 bg-white/50 rounded-lg touch-target">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-[#2B2B2B] mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">{learningTime.formatted}</div>
              <p className="text-xs text-[#9CA3AF] mt-1">Learning Time</p>
            </div>
            <div className="text-center p-4 sm:p-5 bg-white/50 rounded-lg touch-target">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-[#2B2B2B] mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">{studentStatus.score}%</div>
              <p className="text-xs text-[#9CA3AF] mt-1">Overall Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* What to Improve */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#EF6161]" />
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">What to Improve</CardTitle>
            </div>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF]">
              Areas that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weakAreas.length === 0 && studentStatus.improvements.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Great job! Keep up the excellent work.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-[#FEF2F2] border border-[#F7DDE2] touch-feedback">
                    <AlertCircle className="w-5 h-5 text-[#EF6161] mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-[#2B2B2B] leading-relaxed">{area}</p>
                  </div>
                ))}
                {studentStatus.improvements.map((improvement, idx) => (
                  <div key={`imp-${idx}`} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-[#FEF2F2] border border-[#F7DDE2] touch-feedback">
                    <Lightbulb className="w-5 h-5 text-[#EF6161] mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-[#2B2B2B] leading-relaxed">{improvement}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* What Has Improved */}
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">What Has Improved</CardTitle>
            </div>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF]">
              Your recent achievements and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {strengths.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start learning to see your improvements here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-[#F0FDF4] border border-[#CFE3C1] touch-feedback">
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-[#2B2B2B] leading-relaxed">{strength}</p>
                  </div>
                ))}
                {studentStatus.description && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F0FDF4] border border-[#CFE3C1]">
                    <Sparkles className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#2B2B2B]">{studentStatus.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      {recentActivity.length > 0 && (
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recent Performance</CardTitle>
            <CardDescription className="text-sm md:text-base text-[#9CA3AF]">
              Your latest quiz results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 sm:p-5 rounded-lg border border-[#E5E7EB] hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-colors touch-feedback">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#C2E2F5]" />
                    <div>
                      <p className="text-sm font-medium text-[#2B2B2B]">{activity.title}</p>
                      <p className="text-xs text-[#9CA3AF]">{activity.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${
                      activity.percentage >= 80 ? 'bg-[#22C55E]' :
                      activity.percentage >= 60 ? 'bg-[#C2E2F5]' :
                      'bg-[#EF6161]'
                    } text-white`}>
                      {activity.percentage}%
                    </Badge>
                    <span className="text-sm text-[#9CA3AF]">{activity.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Recommendations */}
      <AIRecommendations />

      {/* Recommended Next Actions */}
      <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C2E2F5]" />
            <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">Recommended Next Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {enrollments.length === 0 && (
              <Link href="/student/enroll" className="p-4 sm:p-5 border-2 border-[#C2E2F5] rounded-lg hover:bg-[#F0F9FF] active:bg-[#E0F2FE] transition-colors group touch-feedback min-h-[120px] sm:min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-6 h-6 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                  <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-medium text-[#2B2B2B] mb-1">Enroll in Your First Course</h3>
                <p className="text-sm text-[#9CA3AF]">Start your learning journey today</p>
              </Link>
            )}
            {learningTime.hours < 5 && (
              <Link href="/student/courses" className="p-4 border-2 border-[#C2E2F5] rounded-lg hover:bg-[#F0F9FF] transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                  <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-medium text-[#2B2B2B] mb-1">Watch More Videos</h3>
                <p className="text-sm text-[#9CA3AF]">Increase your learning time</p>
              </Link>
            )}
            <Link href="/student/quizzes" className="p-4 border-2 border-[#C2E2F5] rounded-lg hover:bg-[#F0F9FF] transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-medium text-[#2B2B2B] mb-1">Take a Quiz</h3>
              <p className="text-sm text-[#9CA3AF]">Test your knowledge and track progress</p>
            </Link>
            <Link href="/dashboard" className="p-4 border-2 border-[#C2E2F5] rounded-lg hover:bg-[#F0F9FF] transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-medium text-[#2B2B2B] mb-1">View Dashboard</h3>
              <p className="text-sm text-[#9CA3AF]">See your overall progress</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
