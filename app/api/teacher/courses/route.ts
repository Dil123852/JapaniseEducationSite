import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { createCourse, updateCourse, deleteCourse } from '@/app/lib/db/courses';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, enrollmentKey } = body;

    if (!title || !enrollmentKey) {
      return NextResponse.json(
        { error: 'Title and enrollment key are required' },
        { status: 400 }
      );
    }

    // Check if enrollment key already exists
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('enrollment_key', enrollmentKey)
      .maybeSingle();

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Enrollment key already exists. Please choose a different one.' },
        { status: 400 }
      );
    }

    const course = await createCourse(title, description || '', enrollmentKey, user.id);
    return NextResponse.json(course);
  } catch (error: any) {
    console.error('API Error creating course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create course' },
      { status: 500 }
    );
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
    const { courseId, title, description, enrollmentKey } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify user owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('created_by')
      .eq('id', courseId)
      .single();

    if (!course || course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If enrollment key is being updated, check if it's unique
    if (enrollmentKey) {
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('enrollment_key', enrollmentKey)
        .neq('id', courseId)
        .maybeSingle();

      if (existingCourse) {
        return NextResponse.json(
          { error: 'Enrollment key already exists. Please choose a different one.' },
          { status: 400 }
        );
      }
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (enrollmentKey !== undefined) updates.enrollment_key = enrollmentKey;

    const updatedCourse = await updateCourse(courseId, updates);
    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    console.error('API Error updating course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update course' },
      { status: 500 }
    );
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
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify user owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('created_by')
      .eq('id', courseId)
      .single();

    if (!course || course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await deleteCourse(courseId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete course' },
      { status: 500 }
    );
  }
}

