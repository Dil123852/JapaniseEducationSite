-- =====================================================
-- Migration: Replace 'heading' with 'text' material type
-- =====================================================
-- This script updates the course_materials table to replace
-- heading material type with text material type

-- Step 1: Add the new text_content column
ALTER TABLE public.course_materials 
ADD COLUMN IF NOT EXISTS text_content TEXT;

-- Step 2: Migrate existing heading_text data to text_content
-- (if you have any existing heading materials you want to keep)
UPDATE public.course_materials 
SET text_content = heading_text 
WHERE material_type = 'heading' AND heading_text IS NOT NULL;

-- Step 3: Update the CHECK constraint to allow 'text' instead of 'heading'
ALTER TABLE public.course_materials 
DROP CONSTRAINT IF EXISTS course_materials_material_type_check;

ALTER TABLE public.course_materials 
ADD CONSTRAINT course_materials_material_type_check 
CHECK (material_type = ANY (ARRAY['video'::text, 'mcq_test'::text, 'listening_test'::text, 'pdf'::text, 'notice'::text, 'text'::text]));

-- Step 4: Update existing 'heading' material_type to 'text'
UPDATE public.course_materials 
SET material_type = 'text' 
WHERE material_type = 'heading';

-- Step 5: (Optional) Remove the old heading columns if you no longer need them
-- Uncomment these lines if you want to remove the old columns:
-- ALTER TABLE public.course_materials 
-- DROP COLUMN IF EXISTS heading_text;

-- ALTER TABLE public.course_materials 
-- DROP COLUMN IF EXISTS heading_level;

