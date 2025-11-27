# Lessons and Subtopics Setup Guide

## Error: Internal Server Error on Lessons Page

If you're seeing an "Internal Server Error" when accessing the lessons page, it's likely because the database tables haven't been created yet.

## Solution

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Schema SQL**
   - Open the file `LESSONS_SUBTOPICS_SCHEMA.sql`
   - Copy the entire contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute

3. **Verify Tables Were Created**
   - Go to the Table Editor in Supabase
   - You should see these new tables:
     - `lessons`
     - `subtopics`
     - `subtopic_questions`
   - The `videos` and `pdfs` tables should also have a new `subtopic_id` column

4. **Check RLS Policies**
   - The SQL script also creates Row Level Security (RLS) policies
   - These ensure only authorized users can access lessons and subtopics

## After Running the SQL

Once the tables are created, refresh the lessons page and you should see:
- The page loads successfully
- You can create new lessons
- You can add subtopics to lessons
- You can add videos, PDFs, and questions to subtopics

## Troubleshooting

If you still see errors after running the SQL:

1. **Check the browser console** for specific error messages
2. **Check the server logs** in your terminal where `npm run dev` is running
3. **Verify the tables exist** in Supabase Table Editor
4. **Check RLS policies** are enabled on the new tables

## Need Help?

If the error persists, check:
- The exact error message in the browser console
- The server terminal output
- That all SQL statements executed successfully

