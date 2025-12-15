import { createClient } from '../supabase-server';
import { getStudentSubmissions } from './quizzes';

export interface LearningTimeStats {
  totalSeconds: number;
  hours: number;
  minutes: number;
  formatted: string;
}

export interface StudentStatusResult {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  score: number; // 0-100
  description: string;
  improvements: string[];
}

/**
 * Calculate total learning time for a student from video analytics
 */
export async function getStudentLearningTime(studentId: string): Promise<LearningTimeStats> {
  const supabase = await createClient();
  
  const { data: analytics, error } = await supabase
    .from('video_analytics')
    .select('watch_time')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching learning time:', error);
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      formatted: '0h 0m',
    };
  }

  const totalSeconds = analytics?.reduce((sum, a) => sum + (a.watch_time || 0), 0) || 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    totalSeconds,
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`,
  };
}

/**
 * Calculate student status based on quiz performance and watch time
 */
export async function calculateStudentStatus(studentId: string): Promise<StudentStatusResult> {
  const supabase = await createClient();
  
  // Get quiz submissions
  const submissions = await getStudentSubmissions(studentId);
  
  // Calculate average quiz score
  let averageScore = 0;
  if (submissions.length > 0) {
    const totalScore = submissions.reduce((sum, s) => {
      const percentage = s.total_points > 0 ? (s.score / s.total_points) * 100 : 0;
      return sum + percentage;
    }, 0);
    averageScore = totalScore / submissions.length;
  }

  // Get learning time
  const learningTime = await getStudentLearningTime(studentId);
  const totalHours = learningTime.hours + learningTime.minutes / 60;

  // Get enrolled courses count
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('status', 'active');

  const enrolledCourses = enrollments?.length || 0;

  // Calculate overall score (0-100)
  // Factors: Quiz performance (50%), Learning time (30%), Course engagement (20%)
  let overallScore = 0;
  let level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  let description = '';
  const improvements: string[] = [];

  // Quiz performance (0-50 points)
  const quizScore = (averageScore / 100) * 50;
  
  // Learning time score (0-30 points)
  // 10+ hours = 30 points, 5-10 hours = 20 points, 1-5 hours = 10 points, <1 hour = 5 points
  let timeScore = 0;
  if (totalHours >= 10) {
    timeScore = 30;
  } else if (totalHours >= 5) {
    timeScore = 20;
  } else if (totalHours >= 1) {
    timeScore = 10;
  } else {
    timeScore = 5;
  }

  // Course engagement (0-20 points)
  // 5+ courses = 20 points, 3-4 courses = 15 points, 1-2 courses = 10 points, 0 courses = 0 points
  let engagementScore = 0;
  if (enrolledCourses >= 5) {
    engagementScore = 20;
  } else if (enrolledCourses >= 3) {
    engagementScore = 15;
  } else if (enrolledCourses >= 1) {
    engagementScore = 10;
  }

  overallScore = quizScore + timeScore + engagementScore;

  // Determine level based on overall score
  if (overallScore >= 75) {
    level = 'Expert';
    description = 'Outstanding performance! You have demonstrated excellent understanding and consistent engagement.';
  } else if (overallScore >= 55) {
    level = 'Advanced';
    description = 'Great work! You are making excellent progress and showing strong mastery of the material.';
  } else if (overallScore >= 35) {
    level = 'Intermediate';
    description = 'Good progress! Keep practicing and engaging with the material to advance further.';
  } else {
    level = 'Beginner';
    description = 'You\'re just getting started! Keep learning and practicing to improve your skills.';
  }

  // Generate improvement suggestions
  if (averageScore < 70 && submissions.length > 0) {
    improvements.push('Focus on reviewing quiz mistakes to improve your understanding');
  }
  if (totalHours < 5) {
    improvements.push('Increase your learning time by watching more course videos');
  }
  if (enrolledCourses < 2) {
    improvements.push('Enroll in more courses to broaden your knowledge');
  }
  if (submissions.length === 0) {
    improvements.push('Complete quizzes to track your progress');
  }

  return {
    level,
    score: Math.round(overallScore),
    description,
    improvements: improvements.length > 0 ? improvements : ['Keep up the great work!'],
  };
}
