-- =====================================================
-- Standalone Quiz System (Independent from Courses/Lessons)
-- =====================================================

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  password text,
  duration integer, -- in minutes
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id)
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'short_answer'::text])),
  options jsonb, -- For multiple choice options
  correct_answer text NOT NULL,
  points integer DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id)
);

-- Create quiz_submissions table
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  password_used text, -- Store the password used to access
  score numeric DEFAULT 0,
  total_points numeric DEFAULT 0,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_submissions_pkey PRIMARY KEY (id)
);

-- Create quiz_answers table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  submission_id uuid NOT NULL REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id),
  answer text,
  is_correct boolean,
  points_earned numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_answers_pkey PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_password ON public.quizzes(password) WHERE password IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_student_id ON public.quiz_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_submission_id ON public.quiz_answers(submission_id);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quizzes
-- Teachers can view and manage their own quizzes
CREATE POLICY "Teachers can view their own quizzes" ON public.quizzes
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Teachers can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teachers can update their own quizzes" ON public.quizzes
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their own quizzes" ON public.quizzes
  FOR DELETE USING (created_by = auth.uid());

-- Students can view quizzes (but need password to attempt)
CREATE POLICY "Students can view quizzes" ON public.quizzes
  FOR SELECT USING (true);

-- RLS Policies for quiz_questions
-- Teachers can manage questions for their quizzes
CREATE POLICY "Teachers can manage questions for their quizzes" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- Students can view questions (when attempting quiz)
CREATE POLICY "Students can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

-- RLS Policies for quiz_submissions
-- Students can create their own submissions
CREATE POLICY "Students can create their own submissions" ON public.quiz_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Students can view their own submissions
CREATE POLICY "Students can view their own submissions" ON public.quiz_submissions
  FOR SELECT USING (student_id = auth.uid());

-- Teachers can view all submissions for their quizzes
CREATE POLICY "Teachers can view submissions for their quizzes" ON public.quiz_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_submissions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- RLS Policies for quiz_answers
-- Students can create answers for their submissions
CREATE POLICY "Students can create answers for their submissions" ON public.quiz_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      WHERE quiz_submissions.id = quiz_answers.submission_id
      AND quiz_submissions.student_id = auth.uid()
    )
  );

-- Students can view answers for their submissions
CREATE POLICY "Students can view answers for their submissions" ON public.quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      WHERE quiz_submissions.id = quiz_answers.submission_id
      AND quiz_submissions.student_id = auth.uid()
    )
  );

-- Teachers can view all answers for their quizzes
CREATE POLICY "Teachers can view answers for their quizzes" ON public.quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      JOIN public.quizzes ON quizzes.id = quiz_submissions.quiz_id
      WHERE quiz_submissions.id = quiz_answers.submission_id
      AND quizzes.created_by = auth.uid()
    )
  );

