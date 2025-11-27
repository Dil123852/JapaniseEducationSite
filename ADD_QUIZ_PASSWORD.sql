-- Add password field to tests table for quiz access control
ALTER TABLE tests
  ADD COLUMN IF NOT EXISTS password TEXT;

-- Create index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_tests_password ON tests(password) WHERE password IS NOT NULL;

-- Add comment
COMMENT ON COLUMN tests.password IS 'Password required for students to attempt this quiz';

