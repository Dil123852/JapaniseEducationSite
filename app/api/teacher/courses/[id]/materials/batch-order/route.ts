import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { updateCourseMaterial } from '@/app/lib/db/course-materials';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const courseId = resolvedParams.id;

    // Verify user owns the course
    const { data: course } = await supabase
      .from('courses')
      .select('created_by')
      .eq('id', courseId)
      .single();

    if (!course || course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { orderUpdates } = body;

    if (!orderUpdates || !Array.isArray(orderUpdates)) {
      return NextResponse.json({ error: 'orderUpdates array is required' }, { status: 400 });
    }

    // Update each material's order_index
    const updatePromises = orderUpdates.map(({ materialId, newOrderIndex }: { materialId: string; newOrderIndex: number }) =>
      updateCourseMaterial(materialId, { orderIndex: newOrderIndex })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error updating batch order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update batch order' },
      { status: 500 }
    );
  }
}

