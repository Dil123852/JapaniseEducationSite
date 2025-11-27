import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { createSubtopic, updateSubtopic, deleteSubtopic } from '@/app/lib/db/lessons';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, title, description, orderIndex } = body;

    if (!lessonId || !title) {
      return NextResponse.json({ error: 'Lesson ID and title are required' }, { status: 400 });
    }

    // Verify user owns the lesson's course
    const { data: lesson } = await supabase
      .from('lessons')
      .select(`
        *,
        course:courses!lessons_course_id_fkey(created_by)
      `)
      .eq('id', lessonId)
      .single();

    if (!lesson || (lesson.course as any).created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const subtopic = await createSubtopic(lessonId, title, description, orderIndex || 0);
    return NextResponse.json(subtopic);
  } catch (error: any) {
    console.error('API Error creating subtopic:', error);
    return NextResponse.json({ error: error.message || 'Failed to create subtopic' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { subtopicId, title, description, orderIndex } = body;

    if (!subtopicId) {
      return NextResponse.json({ error: 'Subtopic ID is required' }, { status: 400 });
    }

    // Verify user owns the subtopic's lesson's course
    const { data: subtopic } = await supabase
      .from('subtopics')
      .select(`
        *,
        lesson:lessons!subtopics_lesson_id_fkey(
          course:courses!lessons_course_id_fkey(created_by)
        )
      `)
      .eq('id', subtopicId)
      .single();

    if (!subtopic || (subtopic.lesson as any).course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedSubtopic = await updateSubtopic(subtopicId, title, description, orderIndex);
    return NextResponse.json(updatedSubtopic);
  } catch (error: any) {
    console.error('API Error updating subtopic:', error);
    return NextResponse.json({ error: error.message || 'Failed to update subtopic' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get('subtopicId');

    if (!subtopicId) {
      return NextResponse.json({ error: 'Subtopic ID is required' }, { status: 400 });
    }

    // Verify user owns the subtopic's lesson's course
    const { data: subtopic } = await supabase
      .from('subtopics')
      .select(`
        *,
        lesson:lessons!subtopics_lesson_id_fkey(
          course:courses!lessons_course_id_fkey(created_by)
        )
      `)
      .eq('id', subtopicId)
      .single();

    if (!subtopic || (subtopic.lesson as any).course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await deleteSubtopic(subtopicId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting subtopic:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete subtopic' }, { status: 500 });
  }
}

