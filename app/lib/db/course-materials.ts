import { createClient } from '../supabase-server';

export type MaterialType = 'video' | 'mcq_test' | 'listening_test' | 'pdf' | 'notice' | 'text';

export interface CourseMaterial {
  id: string;
  course_id: string;
  material_type: MaterialType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  title: string;
  description?: string;
  order_index: number;
  video_id?: string;
  video_url?: string;
  quiz_id?: string;
  listening_video_id?: string;
  listening_video_url?: string;
  file_url?: string;
  file_size?: number;
  notice_content?: string;
  text_content?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseMaterialParams {
  courseId: string;
  materialType: MaterialType;
  title: string;
  description?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  orderIndex?: number;
  // Video fields
  videoId?: string;
  videoUrl?: string;
  // MCQ Test fields
  quizId?: string;
  // Listening Test fields
  listeningVideoId?: string;
  listeningVideoUrl?: string;
  // PDF fields
  fileUrl?: string;
  fileSize?: number;
  // Notice fields
  noticeContent?: string;
  // Text fields
  textContent?: string;
  createdBy: string;
}

export async function createCourseMaterial(
  params: CreateCourseMaterialParams
): Promise<CourseMaterial> {
  const supabase = await createClient();

  const insertData: any = {
    course_id: params.courseId,
    material_type: params.materialType,
    title: params.title,
    description: params.description || null,
    position_x: params.positionX ?? 0,
    position_y: params.positionY ?? 0,
    width: params.width ?? 400,
    height: params.height ?? 300,
    z_index: params.zIndex ?? 0,
    order_index: params.orderIndex ?? 0,
    created_by: params.createdBy,
  };

  // Add type-specific fields
  if (params.materialType === 'video') {
    insertData.video_id = params.videoId || null;
    insertData.video_url = params.videoUrl || null;
  } else if (params.materialType === 'mcq_test') {
    insertData.quiz_id = params.quizId || null;
  } else if (params.materialType === 'listening_test') {
    insertData.listening_video_id = params.listeningVideoId || null;
    insertData.listening_video_url = params.listeningVideoUrl || null;
  } else if (params.materialType === 'pdf') {
    insertData.file_url = params.fileUrl || null;
    insertData.file_size = params.fileSize || null;
  } else if (params.materialType === 'notice') {
    insertData.notice_content = params.noticeContent || null;
  } else if (params.materialType === 'text') {
    insertData.text_content = params.textContent || null;
  }

  const { data, error } = await supabase
    .from('course_materials')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('course_materials')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching course materials:', error);
    return [];
  }

  return data || [];
}

export async function getCourseMaterial(materialId: string): Promise<CourseMaterial | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('course_materials')
    .select('*')
    .eq('id', materialId)
    .single();

  if (error) {
    console.error('Error fetching course material:', error);
    return null;
  }

  return data;
}

export async function updateCourseMaterial(
  materialId: string,
  updates: Partial<CreateCourseMaterialParams>
): Promise<CourseMaterial> {
  const supabase = await createClient();

  const updateData: any = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.positionX !== undefined) updateData.position_x = updates.positionX;
  if (updates.positionY !== undefined) updateData.position_y = updates.positionY;
  if (updates.width !== undefined) updateData.width = updates.width;
  if (updates.height !== undefined) updateData.height = updates.height;
  if (updates.zIndex !== undefined) updateData.z_index = updates.zIndex;
  if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;

  // Type-specific fields
  if (updates.videoId !== undefined) updateData.video_id = updates.videoId;
  if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
  if (updates.quizId !== undefined) updateData.quiz_id = updates.quizId;
  if (updates.listeningVideoId !== undefined) updateData.listening_video_id = updates.listeningVideoId;
  if (updates.listeningVideoUrl !== undefined) updateData.listening_video_url = updates.listeningVideoUrl;
  if (updates.fileUrl !== undefined) updateData.file_url = updates.fileUrl;
  if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
  if (updates.noticeContent !== undefined) updateData.notice_content = updates.noticeContent;
  if (updates.textContent !== undefined) updateData.text_content = updates.textContent;

  const { data, error } = await supabase
    .from('course_materials')
    .update(updateData)
    .eq('id', materialId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMaterialPosition(
  materialId: string,
  positionX: number,
  positionY: number
): Promise<CourseMaterial> {
  return updateCourseMaterial(materialId, {
    positionX,
    positionY,
  });
}

export async function updateMaterialSize(
  materialId: string,
  width: number,
  height: number
): Promise<CourseMaterial> {
  return updateCourseMaterial(materialId, {
    width,
    height,
  });
}

export async function deleteCourseMaterial(materialId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('course_materials')
    .delete()
    .eq('id', materialId);

  if (error) throw error;
}

export async function batchUpdateMaterialPositions(
  updates: Array<{ id: string; positionX: number; positionY: number }>
): Promise<void> {
  const supabase = await createClient();

  // Update each material position
  const promises = updates.map(({ id, positionX, positionY }) =>
    updateMaterialPosition(id, positionX, positionY)
  );

  await Promise.all(promises);
}

