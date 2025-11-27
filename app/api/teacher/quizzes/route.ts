import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { createQuiz, getTeacherQuizzes, updateQuiz, deleteQuiz } from '@/app/lib/db/quizzes';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, duration, password } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create quiz (standalone, not related to courses)
    const quiz = await createQuiz(
      title,
      user.id,
      description,
      password,
      duration ? parseInt(duration) : undefined
    );

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error('API Error creating quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all quizzes created by the teacher
    const quizzes = await getTeacherQuizzes(user.id);
    return NextResponse.json(quizzes);
  } catch (error: any) {
    console.error('API Error fetching quizzes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quizzes' },
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
    const { quizId, title, description, duration, password } = body;

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Verify user owns the quiz
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('created_by')
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedQuiz = await updateQuiz(quizId, {
      title,
      description,
      duration: duration ? parseInt(duration) : undefined,
      password,
    });

    return NextResponse.json(updatedQuiz);
  } catch (error: any) {
    console.error('API Error updating quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quiz' },
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
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Verify user owns the quiz
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('created_by')
      .eq('id', quizId)
      .single();

    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await deleteQuiz(quizId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}

