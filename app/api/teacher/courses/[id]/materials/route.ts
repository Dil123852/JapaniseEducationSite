import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import {
  createCourseMaterial,
  getCourseMaterials,
  updateCourseMaterial,
  deleteCourseMaterial,
  batchUpdateMaterialPositions,
} from '@/app/lib/db/course-materials';

export async function GET(
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

    const materials = await getCourseMaterials(courseId);
    return NextResponse.json(materials);
  } catch (error: any) {
    console.error('API Error fetching course materials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch course materials' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const {
      materialType,
      title,
      description,
      positionX,
      positionY,
      width,
      height,
      zIndex,
      orderIndex,
      videoId,
      videoUrl,
      quizId,
      listeningVideoId,
      listeningVideoUrl,
      fileUrl,
      fileSize,
      noticeContent,
      textContent,
    } = body;

    // Text materials don't need title
    if (!materialType) {
      return NextResponse.json(
        { error: 'Material type is required' },
        { status: 400 }
      );
    }
    
    if (materialType !== 'text' && !title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (materialType === 'text' && !textContent?.trim()) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    const material = await createCourseMaterial({
      courseId,
      materialType,
      title,
      description,
      positionX,
      positionY,
      width,
      height,
      zIndex,
      orderIndex,
      videoId,
      videoUrl,
      quizId,
      listeningVideoId,
      listeningVideoUrl,
      fileUrl,
      fileSize,
      noticeContent,
      textContent,
      createdBy: user.id,
    });

    return NextResponse.json(material);
  } catch (error: any) {
    console.error('API Error creating course material:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create course material' },
      { status: 500 }
    );
  }
}

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
    const { materialId, positionUpdates, ...updates } = body;
    
    // Handle orderIndex updates
    if (updates.orderIndex !== undefined) {
      updates.orderIndex = updates.orderIndex;
    }

    // Handle batch position updates
    if (positionUpdates && Array.isArray(positionUpdates)) {
      await batchUpdateMaterialPositions(positionUpdates);
      return NextResponse.json({ success: true });
    }

    // Handle single material update
    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    // Verify material belongs to this course
    const { data: material } = await supabase
      .from('course_materials')
      .select('course_id, created_by')
      .eq('id', materialId)
      .single();

    if (!material || material.course_id !== courseId) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const updatedMaterial = await updateCourseMaterial(materialId, updates);
    return NextResponse.json(updatedMaterial);
  } catch (error: any) {
    console.error('API Error updating course material:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update course material' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    // Verify material belongs to this course
    const { data: material } = await supabase
      .from('course_materials')
      .select('course_id')
      .eq('id', materialId)
      .single();

    if (!material || material.course_id !== courseId) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    await deleteCourseMaterial(materialId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting course material:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete course material' },
      { status: 500 }
    );
  }
}

