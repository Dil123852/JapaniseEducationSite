import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import {
  createMCQQuestion,
  getMCQQuestions,
  updateMCQQuestion,
  deleteMCQQuestion,
} from '@/app/lib/db/mcq-tests';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> | { materialId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    // Verify user has access to this material (teacher or enrolled student)
    const { data: material } = await supabase
      .from('course_materials')
      .select(`
        id,
        course_id,
        courses!course_materials_course_id_fkey (
          created_by,
          enrollments!enrollments_course_id_fkey (student_id)
        )
      `)
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const course = material.courses as any;
    const isTeacher = course?.created_by === user.id;
    const isEnrolled = course?.enrollments?.some((e: any) => e.student_id === user.id);

    if (!isTeacher && !isEnrolled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const questions = await getMCQQuestions(materialId);
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('API Error fetching MCQ questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch MCQ questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> | { materialId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    // Verify user owns the course
    const { data: material } = await supabase
      .from('course_materials')
      .select(`
        id,
        course_id,
        courses!course_materials_course_id_fkey (created_by)
      `)
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const course = material.courses as any;
    if (course?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { questionText, options, correctAnswer, points, orderIndex } = body;

    if (!questionText || !options || !correctAnswer) {
      return NextResponse.json(
        { error: 'Question text, options, and correct answer are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      );
    }

    const question = await createMCQQuestion({
      courseMaterialId: materialId,
      questionText,
      options,
      correctAnswer,
      points,
      orderIndex,
    });

    return NextResponse.json(question);
  } catch (error: any) {
    console.error('API Error creating MCQ question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create MCQ question' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> | { materialId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    // Verify user owns the course
    const { data: material } = await supabase
      .from('course_materials')
      .select(`
        id,
        course_id,
        courses!course_materials_course_id_fkey (created_by)
      `)
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const course = material.courses as any;
    if (course?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { questionId, updates } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Verify question belongs to this material
    const { data: question } = await supabase
      .from('mcq_test_questions')
      .select('course_material_id')
      .eq('id', questionId)
      .single();

    if (!question || question.course_material_id !== materialId) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updatedQuestion = await updateMCQQuestion(questionId, updates);
    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    console.error('API Error updating MCQ question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update MCQ question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> | { materialId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    // Verify user owns the course
    const { data: material } = await supabase
      .from('course_materials')
      .select(`
        id,
        course_id,
        courses!course_materials_course_id_fkey (created_by)
      `)
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const course = material.courses as any;
    if (course?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Verify question belongs to this material
    const { data: question } = await supabase
      .from('mcq_test_questions')
      .select('course_material_id')
      .eq('id', questionId)
      .single();

    if (!question || question.course_material_id !== materialId) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    await deleteMCQQuestion(questionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting MCQ question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete MCQ question' },
      { status: 500 }
    );
  }
}

