import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import {
  addQuizQuestion,
  getQuizQuestions,
  updateQuizQuestion,
  deleteQuizQuestion,
  getQuiz,
} from '@/app/lib/db/quizzes';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { quizId } = await params;

    // Verify user owns the quiz
    const quiz = await getQuiz(quizId);
    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const questions = await getQuizQuestions(quizId);
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('API Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { quizId } = await params;
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { question_text, question_type, correct_answer, options, points, order_index } = body;

    if (!question_text || !question_type || !correct_answer) {
      return NextResponse.json(
        { error: 'Question text, type, and correct answer are required' },
        { status: 400 }
      );
    }

    // Verify user owns the quiz
    const quiz = await getQuiz(quizId);
    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const question = await addQuizQuestion(
      quizId,
      question_text,
      question_type,
      correct_answer,
      options && Array.isArray(options) && options.length > 0 ? options : undefined,
      points || 1,
      order_index || 0
    );

    return NextResponse.json(question);
  } catch (error: any) {
    console.error('API Error creating question:', error);
    const errorMessage = error?.message || error?.toString() || 'Failed to create question';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { questionId, question_text, question_type, correct_answer, options, points, order_index } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Verify user owns the quiz
    const quiz = await getQuiz(quizId);
    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedQuestion = await updateQuizQuestion(questionId, {
      question_text,
      question_type,
      correct_answer,
      options: options && Array.isArray(options) && options.length > 0 ? options : undefined,
      points,
      order_index,
    });

    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    console.error('API Error updating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { quizId } = await params;
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Verify user owns the quiz
    const quiz = await getQuiz(quizId);
    if (!quiz || quiz.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await deleteQuizQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}

