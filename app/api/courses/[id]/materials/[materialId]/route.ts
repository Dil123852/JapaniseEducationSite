import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { getCourseMaterial } from '@/app/lib/db/course-materials';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> | { id: string; materialId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const materialId = resolvedParams.materialId;

    const material = await getCourseMaterial(materialId);

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // For students, check enrollment
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'student') {
      // Verify student is enrolled
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', material.course_id)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .single();

      if (!enrollment) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json(material);
  } catch (error: any) {
    console.error('API Error fetching material:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

