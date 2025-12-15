import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { submitListeningTest } from '@/app/lib/db/listening-tests';

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

    // Get user profile to get student ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify material exists and student is enrolled
    const { data: material } = await supabase
      .from('course_materials')
      .select('course_id')
      .eq('id', materialId)
      .single();

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', material.course_id)
      .eq('student_id', profile.id)
      .eq('status', 'active')
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // Convert answers format
    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer: answer as string,
    }));

    const result = await submitListeningTest({
      courseMaterialId: materialId,
      studentId: profile.id,
      answers: answerArray,
    });

    // Get question results
    const { data: questionAnswers } = await supabase
      .from('listening_test_answers')
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
    console.error('API Error submitting listening test:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit test' },
      { status: 500 }
    );
  }
}

