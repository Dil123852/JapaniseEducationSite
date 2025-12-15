import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { createMCQQuestion } from '@/app/lib/db/mcq-tests';

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
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Questions array is required' },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one question is required' },
        { status: 400 }
      );
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.options || !q.correctAnswer) {
        return NextResponse.json(
          { error: `Question ${i + 1}: Question text, options, and correct answer are required` },
          { status: 400 }
        );
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1}: At least 2 options are required` },
          { status: 400 }
        );
      }
      const validOptions = q.options.filter((opt: string) => opt && opt.trim());
      if (validOptions.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1}: At least 2 valid (non-empty) options are required` },
          { status: 400 }
        );
      }
      if (!validOptions.includes(q.correctAnswer)) {
        return NextResponse.json(
          { error: `Question ${i + 1}: Correct answer must be one of the valid options` },
          { status: 400 }
        );
      }
    }

    // Create all questions
    const createdQuestions = await Promise.all(
      questions.map((q: any, index: number) => {
        const validOptions = q.options.filter((opt: string) => opt && opt.trim());
        return createMCQQuestion({
          courseMaterialId: materialId,
          questionText: q.questionText,
          options: validOptions,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          orderIndex: index,
        });
      })
    );

    return NextResponse.json({ questions: createdQuestions });
  } catch (error: any) {
    console.error('API Error creating MCQ questions batch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create MCQ questions' },
      { status: 500 }
    );
  }
}

