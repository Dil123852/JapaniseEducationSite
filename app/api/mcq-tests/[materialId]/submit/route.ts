import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { submitMCQTest } from '@/app/lib/db/mcq-tests';

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

    // Verify user is a student
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can submit tests' }, { status: 403 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    // Verify student is enrolled in the course
    const { data: material } = await supabase
      .from('course_materials')
      .select(`
        id,
        course_id,
        enrollments!enrollments_course_id_fkey (student_id, status)
      `)
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const enrollments = material.enrollments as any[];
    const isEnrolled = enrollments?.some(
      (e: any) => e.student_id === user.id && e.status === 'active'
    );

    if (!isEnrolled) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    const result = await submitMCQTest({
      courseMaterialId: materialId,
      studentId: user.id,
      answers,
    });

    // Get question results
    const { data: questionAnswers } = await supabase
      .from('mcq_test_answers')
      .select('question_id, is_correct')
      .eq('submission_id', result.submissionId);

    const results: Record<string, boolean> = {};
    questionAnswers?.forEach((qa) => {
      results[qa.question_id] = qa.is_correct;
    });

    return NextResponse.json({
      submissionId: result.submissionId,
      score: result.score,
      totalPoints: result.totalPoints,
      results,
    });
  } catch (error: any) {
    console.error('API Error submitting MCQ test:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit MCQ test' },
      { status: 500 }
    );
  }
}

