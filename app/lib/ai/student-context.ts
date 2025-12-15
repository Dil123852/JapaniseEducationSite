import { createClient } from '../supabase-server';
import { getStudentEnrollments } from '../db/enrollments';
import { getStudentSubmissions } from '../db/quizzes';
import { getStudentLearningTime, calculateStudentStatus } from '../db/student-stats';
import { getCourseLessons } from '../db/lessons';

export interface StudentContext {
  studentId: string;
  studentName: string;
  enrollments: Array<{
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
  }>;
  learningTime: {
    hours: number;
    minutes: number;
    formatted: string;
  };
  studentStatus: {
    level: string;
    score: number;
    description: string;
    improvements: string[];
  };
  quizPerformance: {
    totalQuizzes: number;
    averageScore: number;
    recentScores: number[];
  };
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    score?: string;
  }>;
  weakAreas: string[];
  strengths: string[];
  nextSteps: string[];
}

/**
 * Gather comprehensive student context for AI recommendations
 */
export async function gatherStudentContext(studentId: string): Promise<StudentContext> {
  const supabase = await createClient();
  
  // Get student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', studentId)
    .single();
  
  const studentName = profile?.full_name || profile?.email?.split('@')[0] || 'Student';
  
  // Get enrollments
  const enrollmentsData = await getStudentEnrollments(studentId);
  const enrollments = enrollmentsData.map((e: any) => ({
    courseId: e.course?.id || e.course_id,
    courseTitle: e.course?.title || 'Course',
    enrolledAt: e.enrolled_at || e.created_at,
  }));
  
  // Get learning time
  const learningTime = await getStudentLearningTime(studentId);
  
  // Get student status
  const studentStatus = await calculateStudentStatus(studentId);
  
  // Get quiz performance
  const submissions = await getStudentSubmissions(studentId);
  
  let averageScore = 0;
  const recentScores: number[] = [];
  
  if (submissions.length > 0) {
    const scores = submissions.map(s => {
      const percentage = s.total_points > 0 ? (s.score / s.total_points) * 100 : 0;
      return percentage;
    });
    averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    recentScores.push(...scores.slice(0, 5));
  }
  
  // Get recent activity
  const recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    score?: string;
  }> = [];
  
  const recentSubmissions = submissions.slice(0, 5);
  for (const submission of recentSubmissions) {
    try {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', submission.quiz_id)
        .single();
      
      if (quiz) {
        recentActivity.push({
          type: 'quiz',
          title: quiz.title || 'Quiz',
          date: new Date(submission.submitted_at).toLocaleDateString(),
          score: `${submission.score}/${submission.total_points}`,
        });
      }
    } catch (error) {
      // Skip if quiz not found
      console.error('Error fetching quiz:', error);
    }
  }
  
  // Analyze weak areas and strengths
  const weakAreas: string[] = [];
  const strengths: string[] = [];
  
  if (averageScore < 60 && submissions.length > 0) {
    weakAreas.push('Quiz performance needs improvement');
  }
  if (learningTime.hours < 2) {
    weakAreas.push('Low study time - consider increasing learning hours');
  }
  if (enrollments.length === 0) {
    weakAreas.push('No enrolled courses - start by enrolling in a course');
  }
  
  if (averageScore >= 80 && submissions.length > 0) {
    strengths.push('Excellent quiz performance');
  }
  if (learningTime.hours >= 10) {
    strengths.push('High engagement with learning materials');
  }
  if (enrollments.length >= 3) {
    strengths.push('Active participation in multiple courses');
  }
  
  // Generate next steps
  const nextSteps: string[] = [];
  
  if (enrollments.length === 0) {
    nextSteps.push('Enroll in your first course to begin learning');
  } else {
    // Get lessons from enrolled courses
    for (const enrollment of enrollments.slice(0, 3)) {
      try {
        const lessons = await getCourseLessons(enrollment.courseId);
        if (lessons.length > 0) {
          const { data: completions } = await supabase
            .from('lesson_completions')
            .select('lesson_id')
            .eq('student_id', studentId)
            .in('lesson_id', lessons.map(l => l.id));
          
          const completedIds = new Set(completions?.map(c => c.lesson_id) || []);
          const incompleteLessons = lessons.filter(l => !completedIds.has(l.id));
          
          if (incompleteLessons.length > 0) {
            nextSteps.push(`Continue with "${incompleteLessons[0].title}" in ${enrollment.courseTitle}`);
          }
        }
      } catch (error) {
        // Skip if error getting lessons
        console.error('Error fetching lessons:', error);
      }
    }
  }
  
  if (submissions.length === 0) {
    nextSteps.push('Take a quiz to test your knowledge');
  }
  
  if (learningTime.hours < 5) {
    nextSteps.push('Watch more course videos to increase learning time');
  }
  
  return {
    studentId,
    studentName,
    enrollments,
    learningTime,
    studentStatus,
    quizPerformance: {
      totalQuizzes: submissions.length,
      averageScore: Math.round(averageScore),
      recentScores,
    },
    recentActivity,
    weakAreas,
    strengths,
    nextSteps,
  };
}
