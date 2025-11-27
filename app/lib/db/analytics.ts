import { createClient } from '../supabase-server';

export interface CourseAnalytics {
  totalStudents: number;
  activeStudents: number;
  blockedStudents: number;
  restrictedStudents: number;
  totalTests: number;
  totalVideos: number;
  totalPDFs: number;
  totalNotifications: number;
  averageTestScore?: number;
  videoWatchStats: {
    totalWatchTime: number;
    completedVideos: number;
    totalVideos: number;
  };
  pdfDownloadStats: {
    totalDownloads: number;
    uniqueDownloaders: number;
  };
}

export async function getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
  const supabase = await createClient();
  
  // Get enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('status')
    .eq('course_id', courseId);

  const totalStudents = enrollments?.length || 0;
  const activeStudents = enrollments?.filter(e => e.status === 'active').length || 0;
  const blockedStudents = enrollments?.filter(e => e.status === 'blocked').length || 0;
  const restrictedStudents = enrollments?.filter(e => e.status === 'restricted').length || 0;

  // Get tests
  const { data: tests } = await supabase
    .from('tests')
    .select('id')
    .eq('course_id', courseId);

  const totalTests = tests?.length || 0;

  // Get average test score
  const { data: submissions } = await supabase
    .from('test_submissions')
    .select('score, total_points')
    .in('test_id', tests?.map(t => t.id) || []);

  const averageTestScore = submissions && submissions.length > 0
    ? submissions.reduce((sum, s) => sum + (s.score / s.total_points * 100), 0) / submissions.length
    : undefined;

  // Get videos
  const { data: videos } = await supabase
    .from('videos')
    .select('id')
    .eq('course_id', courseId);

  const totalVideos = videos?.length || 0;

  // Get video watch stats
  const { data: videoAnalytics } = await supabase
    .from('video_analytics')
    .select('watch_time, completed')
    .in('video_id', videos?.map(v => v.id) || []);

  const totalWatchTime = videoAnalytics?.reduce((sum, a) => sum + (a.watch_time || 0), 0) || 0;
  const completedVideos = videoAnalytics?.filter(a => a.completed).length || 0;

  // Get PDFs
  const { data: pdfs } = await supabase
    .from('pdfs')
    .select('id')
    .eq('course_id', courseId);

  const totalPDFs = pdfs?.length || 0;

  // Get PDF download stats
  const { data: downloads } = await supabase
    .from('pdf_downloads')
    .select('student_id')
    .in('pdf_id', pdfs?.map(p => p.id) || []);

  const totalDownloads = downloads?.length || 0;
  const uniqueDownloaders = new Set(downloads?.map(d => d.student_id) || []).size;

  // Get notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('course_id', courseId);

  const totalNotifications = notifications?.length || 0;

  return {
    totalStudents,
    activeStudents,
    blockedStudents,
    restrictedStudents,
    totalTests,
    totalVideos,
    totalPDFs,
    totalNotifications,
    averageTestScore,
    videoWatchStats: {
      totalWatchTime,
      completedVideos,
      totalVideos,
    },
    pdfDownloadStats: {
      totalDownloads,
      uniqueDownloaders,
    },
  };
}

export async function getGroupAnalytics(courseId: string, groupId: string) {
  const supabase = await createClient();
  
  // Get group students
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student_id')
    .eq('course_id', courseId)
    .eq('group_id', groupId)
    .eq('status', 'active');

  const studentIds = enrollments?.map(e => e.student_id) || [];

  // Get test scores for group
  const { data: tests } = await supabase
    .from('tests')
    .select('id')
    .eq('course_id', courseId);

  const { data: submissions } = await supabase
    .from('test_submissions')
    .select('student_id, score, total_points')
    .in('test_id', tests?.map(t => t.id) || [])
    .in('student_id', studentIds);

  // Calculate rankings
  const studentScores: { [key: string]: { total: number; count: number } } = {};
  
  submissions?.forEach(s => {
    if (!studentScores[s.student_id]) {
      studentScores[s.student_id] = { total: 0, count: 0 };
    }
    studentScores[s.student_id].total += (s.score / s.total_points) * 100;
    studentScores[s.student_id].count += 1;
  });

  const rankings = Object.entries(studentScores)
    .map(([studentId, stats]) => ({
      student_id: studentId,
      averageScore: stats.count > 0 ? stats.total / stats.count : 0,
      testCount: stats.count,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((rank, index) => ({
      ...rank,
      rank: index + 1,
    }));

  return {
    studentCount: studentIds.length,
    rankings,
  };
}

