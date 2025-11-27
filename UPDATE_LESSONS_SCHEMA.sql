-- Add new fields to lessons table for improved lesson management
ALTER TABLE lessons 
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade);
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject);

