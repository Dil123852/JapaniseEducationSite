import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { createLesson, updateLesson, deleteLesson } from '@/app/lib/db/lessons';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, description, grade, subject, thumbnailUrl, orderIndex } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Course ID and title are required' }, { status: 400 });
    }

    // Verify user is teacher and owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('created_by')
      .eq('id', courseId)
      .single();

    if (!course || course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const lesson = await createLesson(
      courseId,
      title,
      description,
      grade,
      subject,
      thumbnailUrl,
      orderIndex || 0
    );

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error('API Error creating lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to create lesson' }, { status: 500 });
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
    const { lessonId, title, description, grade, subject, thumbnailUrl, orderIndex } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
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

    const updatedLesson = await updateLesson(
      lessonId,
      title,
      description,
      grade,
      subject,
      thumbnailUrl,
      orderIndex
    );

    return NextResponse.json(updatedLesson);
  } catch (error: any) {
    console.error('API Error updating lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lesson' }, { status: 500 });
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
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
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

    await deleteLesson(lessonId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting lesson:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete lesson' }, { status: 500 });
  }
}

