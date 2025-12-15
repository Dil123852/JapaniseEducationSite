-- =====================================================
-- Whiteboard Course Materials System - Database Migration
-- =====================================================
-- This script adds new tables for the drag-and-drop whiteboard system
-- while maintaining compatibility with existing tables

-- =====================================================
-- 1. Create course_materials table (main whiteboard items)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type = ANY (ARRAY['video'::text, 'mcq_test'::text, 'listening_test'::text, 'pdf'::text, 'notice'::text, 'text'::text])),
  
  -- Positioning (for drag-and-drop)
  position_x INTEGER NOT NULL DEFAULT 0,  -- X coordinate on whiteboard
  position_y INTEGER NOT NULL DEFAULT 0,  -- Y coordinate on whiteboard
  width INTEGER DEFAULT 400,              -- Width in pixels
  height INTEGER DEFAULT 300,             -- Height in pixels
  z_index INTEGER DEFAULT 0,              -- Layer ordering
  
  -- Common fields
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,          -- Fallback ordering
  
  -- Video-specific fields
  video_id TEXT,                          -- YouTube video ID or uploaded video URL
  video_url TEXT,
  
  -- MCQ Test fields (optional link to existing quiz)
  quiz_id UUID,                           -- Optional: Link to existing quiz
  
  -- Listening Test fields
  listening_video_id TEXT,                -- Video for listening test
  listening_video_url TEXT,
  
  -- PDF fields
  file_url TEXT,
  file_size INTEGER,
  
  -- Notice fields
  notice_content TEXT,                    -- Rich text content
  
  -- Text fields
  text_content TEXT,                      -- Plain text content (rendered like text on paper)
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT course_materials_pkey PRIMARY KEY (id),
  CONSTRAINT course_materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT course_materials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT course_materials_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE SET NULL
);

-- Indexes for course_materials
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_material_type ON public.course_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_course_materials_position ON public.course_materials(position_x, position_y);

-- =====================================================
-- 2. Create mcq_test_questions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mcq_test_questions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,                 -- Array of answer options: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT NOT NULL,           -- The correct answer text (must match one of the options)
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT mcq_test_questions_pkey PRIMARY KEY (id),
  CONSTRAINT mcq_test_questions_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE
);

-- Indexes for mcq_test_questions
CREATE INDEX IF NOT EXISTS idx_mcq_test_questions_material_id ON public.mcq_test_questions(course_material_id);
CREATE INDEX IF NOT EXISTS idx_mcq_test_questions_order ON public.mcq_test_questions(course_material_id, order_index);

-- =====================================================
-- 3. Create listening_test_questions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.listening_test_questions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'short_answer'::text])),
  options JSONB,                          -- For multiple choice: array of options
  correct_answer TEXT NOT NULL,           -- The correct answer
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  timestamp_seconds INTEGER,              -- When question appears during video (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT listening_test_questions_pkey PRIMARY KEY (id),
  CONSTRAINT listening_test_questions_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE
);

-- Indexes for listening_test_questions
CREATE INDEX IF NOT EXISTS idx_listening_test_questions_material_id ON public.listening_test_questions(course_material_id);
CREATE INDEX IF NOT EXISTS idx_listening_test_questions_order ON public.listening_test_questions(course_material_id, order_index);

-- =====================================================
-- 4. Create mcq_test_submissions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mcq_test_submissions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  student_id UUID NOT NULL,
  score NUMERIC DEFAULT 0,
  total_points NUMERIC DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT mcq_test_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT mcq_test_submissions_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE,
  CONSTRAINT mcq_test_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Indexes for mcq_test_submissions
CREATE INDEX IF NOT EXISTS idx_mcq_test_submissions_material_id ON public.mcq_test_submissions(course_material_id);
CREATE INDEX IF NOT EXISTS idx_mcq_test_submissions_student_id ON public.mcq_test_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_mcq_test_submissions_student_material ON public.mcq_test_submissions(student_id, course_material_id);

-- =====================================================
-- 5. Create mcq_test_answers table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mcq_test_answers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer TEXT,                            -- Student's selected answer
  is_correct BOOLEAN,                     -- Whether the answer is correct
  points_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT mcq_test_answers_pkey PRIMARY KEY (id),
  CONSTRAINT mcq_test_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.mcq_test_submissions(id) ON DELETE CASCADE,
  CONSTRAINT mcq_test_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.mcq_test_questions(id) ON DELETE CASCADE
);

-- Indexes for mcq_test_answers
CREATE INDEX IF NOT EXISTS idx_mcq_test_answers_submission_id ON public.mcq_test_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_mcq_test_answers_question_id ON public.mcq_test_answers(question_id);

-- =====================================================
-- 6. Create listening_test_submissions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.listening_test_submissions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  student_id UUID NOT NULL,
  score NUMERIC DEFAULT 0,
  total_points NUMERIC DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT listening_test_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT listening_test_submissions_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE,
  CONSTRAINT listening_test_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Indexes for listening_test_submissions
CREATE INDEX IF NOT EXISTS idx_listening_test_submissions_material_id ON public.listening_test_submissions(course_material_id);
CREATE INDEX IF NOT EXISTS idx_listening_test_submissions_student_id ON public.listening_test_submissions(student_id);

-- =====================================================
-- 7. Create listening_test_answers table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.listening_test_answers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL,
  question_id UUID NOT NULL,
  answer TEXT,                            -- Student's answer
  is_correct BOOLEAN,                     -- Whether the answer is correct
  points_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT listening_test_answers_pkey PRIMARY KEY (id),
  CONSTRAINT listening_test_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.listening_test_submissions(id) ON DELETE CASCADE,
  CONSTRAINT listening_test_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.listening_test_questions(id) ON DELETE CASCADE
);

-- Indexes for listening_test_answers
CREATE INDEX IF NOT EXISTS idx_listening_test_answers_submission_id ON public.listening_test_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_listening_test_answers_question_id ON public.listening_test_answers(question_id);

-- =====================================================
-- 8. Update favorites table to support course materials
-- =====================================================

-- Add new column for course material favorites
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS course_material_id UUID REFERENCES public.course_materials(id) ON DELETE CASCADE;

-- Drop existing constraint if it exists
ALTER TABLE public.favorites
DROP CONSTRAINT IF EXISTS favorites_material_check;

-- Add new constraint to ensure either lesson_id or course_material_id is set (but not both)
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_material_check CHECK (
  (lesson_id IS NOT NULL AND course_material_id IS NULL) OR
  (lesson_id IS NULL AND course_material_id IS NOT NULL)
);

-- Create index for course_material_id
CREATE INDEX IF NOT EXISTS idx_favorites_course_material_id ON public.favorites(course_material_id);

-- =====================================================
-- 9. Add material completion tracking (optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.material_completions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  student_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT material_completions_pkey PRIMARY KEY (id),
  CONSTRAINT material_completions_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE,
  CONSTRAINT material_completions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT material_completions_unique UNIQUE (course_material_id, student_id)
);

-- Indexes for material_completions
CREATE INDEX IF NOT EXISTS idx_material_completions_material_id ON public.material_completions(course_material_id);
CREATE INDEX IF NOT EXISTS idx_material_completions_student_id ON public.material_completions(student_id);

-- =====================================================
-- 10. Add PDF downloads tracking for course materials (optional enhancement)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_material_pdf_downloads (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_material_id UUID NOT NULL,
  student_id UUID NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT course_material_pdf_downloads_pkey PRIMARY KEY (id),
  CONSTRAINT course_material_pdf_downloads_course_material_id_fkey FOREIGN KEY (course_material_id) REFERENCES public.course_materials(id) ON DELETE CASCADE,
  CONSTRAINT course_material_pdf_downloads_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Indexes for course_material_pdf_downloads
CREATE INDEX IF NOT EXISTS idx_course_material_pdf_downloads_material_id ON public.course_material_pdf_downloads(course_material_id);
CREATE INDEX IF NOT EXISTS idx_course_material_pdf_downloads_student_id ON public.course_material_pdf_downloads(student_id);

-- =====================================================
-- 11. Add function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_course_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course_materials updated_at
DROP TRIGGER IF EXISTS trigger_update_course_materials_updated_at ON public.course_materials;
CREATE TRIGGER trigger_update_course_materials_updated_at
  BEFORE UPDATE ON public.course_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_course_materials_updated_at();

-- =====================================================
-- Migration Complete
-- =====================================================
