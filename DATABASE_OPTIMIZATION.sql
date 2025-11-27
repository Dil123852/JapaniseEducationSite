-- =====================================================
-- Database Optimization & Updates for Teacher Dashboard
-- =====================================================
-- This script optimizes the database for better performance
-- and adds useful indexes for the teacher dashboard queries
-- =====================================================

-- =====================================================
-- 1. ADD PERFORMANCE INDEXES
-- =====================================================

-- Indexes for courses (frequently queried by teacher)
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Indexes for lessons (for dashboard stats)
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(course_id, order_index);

-- Indexes for subtopics (for lesson management)
CREATE INDEX IF NOT EXISTS idx_subtopics_lesson_id ON subtopics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_order_index ON subtopics(lesson_id, order_index);

-- Indexes for enrollments (for student management)
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_id, status);

-- Indexes for videos (for resource management)
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_subtopic_id ON videos(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_videos_order_index ON videos(course_id, order_index);

-- Indexes for PDFs (for resource management)
CREATE INDEX IF NOT EXISTS idx_pdfs_course_id ON pdfs(course_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_subtopic_id ON pdfs(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_order_index ON pdfs(course_id, order_index);

-- Indexes for subtopic_questions (for quiz management)
CREATE INDEX IF NOT EXISTS idx_subtopic_questions_subtopic_id ON subtopic_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_subtopic_questions_order_index ON subtopic_questions(subtopic_id, order_index);

-- Indexes for video_analytics (for student progress)
CREATE INDEX IF NOT EXISTS idx_video_analytics_student_id ON video_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_completed ON video_analytics(student_id, completed);

-- Indexes for test_submissions (for quiz results)
CREATE INDEX IF NOT EXISTS idx_test_submissions_student_id ON test_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_test_submissions_test_id ON test_submissions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_submissions_submitted_at ON test_submissions(submitted_at DESC);

-- Indexes for notifications (for communication)
CREATE INDEX IF NOT EXISTS idx_notifications_course_id ON notifications(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Indexes for groups (for class management)
CREATE INDEX IF NOT EXISTS idx_groups_course_id ON groups(course_id);

-- =====================================================
-- 2. ADD USEFUL COMPUTED COLUMNS / VIEWS (Optional)
-- =====================================================

-- View for course statistics (useful for dashboard)
CREATE OR REPLACE VIEW course_stats AS
SELECT 
  c.id,
  c.title,
  c.created_by,
  COUNT(DISTINCT e.id) as student_count,
  COUNT(DISTINCT g.id) as group_count,
  COUNT(DISTINCT l.id) as lesson_count,
  COUNT(DISTINCT v.id) as video_count,
  COUNT(DISTINCT p.id) as pdf_count,
  COUNT(DISTINCT t.id) as test_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
LEFT JOIN groups g ON g.course_id = c.id
LEFT JOIN lessons l ON l.course_id = c.id
LEFT JOIN videos v ON v.course_id = c.id
LEFT JOIN pdfs p ON p.course_id = c.id
LEFT JOIN tests t ON t.course_id = c.id
GROUP BY c.id, c.title, c.created_by;

-- =====================================================
-- 3. ENSURE ALL NECESSARY FIELDS EXIST
-- =====================================================

-- Verify lessons table has all fields (already added in previous updates)
-- grade, subject, thumbnail_url should already exist

-- =====================================================
-- 4. ADD HELPFUL CONSTRAINTS (if needed)
-- =====================================================

-- Ensure order_index is non-negative
ALTER TABLE lessons 
  ADD CONSTRAINT IF NOT EXISTS lessons_order_index_non_negative 
  CHECK (order_index >= 0);

ALTER TABLE subtopics 
  ADD CONSTRAINT IF NOT EXISTS subtopics_order_index_non_negative 
  CHECK (order_index >= 0);

ALTER TABLE videos 
  ADD CONSTRAINT IF NOT EXISTS videos_order_index_non_negative 
  CHECK (order_index >= 0);

ALTER TABLE pdfs 
  ADD CONSTRAINT IF NOT EXISTS pdfs_order_index_non_negative 
  CHECK (order_index >= 0);

-- =====================================================
-- 5. OPTIMIZE FOR TEACHER DASHBOARD QUERIES
-- =====================================================

-- Composite index for common teacher dashboard query pattern
-- (Get all courses with their stats for a teacher)
CREATE INDEX IF NOT EXISTS idx_courses_teacher_stats 
ON courses(created_by, created_at DESC);

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. All indexes use IF NOT EXISTS to avoid errors if they already exist
-- 2. Indexes are optimized for common query patterns in the teacher dashboard
-- 3. The course_stats view provides a quick way to get aggregated data
-- 4. Constraints ensure data integrity
-- =====================================================

