-- Create favorites table for student lesson favorites
-- This allows students to save their favorite lessons for quick access

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_unique_student_lesson UNIQUE (student_id, lesson_id)
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_student_id ON public.favorites(student_id);
CREATE INDEX IF NOT EXISTS idx_favorites_lesson_id ON public.favorites(lesson_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at DESC);

-- Add RLS (Row Level Security) policies if needed
-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own favorites
CREATE POLICY "Students can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = student_id);

-- Policy: Students can add their own favorites
CREATE POLICY "Students can add their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own favorites
CREATE POLICY "Students can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = student_id);

