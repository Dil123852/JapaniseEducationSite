import { createClient } from '../supabase-server';

export interface Group {
  id: string;
  course_id: string;
  name: string;
  created_at: string;
}

export interface GroupWithStudentCount extends Group {
  student_count: number;
}

export async function createGroup(
  courseId: string,
  name: string
): Promise<Group> {
  const supabase = await createClient();
  
  // Check if group name already exists for this course
  const { data: existing } = await supabase
    .from('groups')
    .select('id')
    .eq('course_id', courseId)
    .eq('name', name)
    .single();

  if (existing) {
    throw new Error('Group name already exists for this course');
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      course_id: courseId,
      name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseGroups(courseId: string): Promise<GroupWithStudentCount[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      enrollments(count)
    `)
    .eq('course_id', courseId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching course groups:', error);
    return [];
  }

  return data.map((group: any) => ({
    ...group,
    student_count: group.enrollments?.[0]?.count || 0,
  }));
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    console.error('Error fetching group:', error);
    return null;
  }
  return data;
}

export async function updateGroup(
  groupId: string,
  name: string
): Promise<Group> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('groups')
    .update({ name })
    .eq('id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) throw error;
}

export async function getGroupStudents(groupId: string, courseId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      student:profiles!enrollments_student_id_fkey(id, email, full_name)
    `)
    .eq('group_id', groupId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: true });

  if (error) {
    console.error('Error fetching group students:', error);
    return [];
  }
  return data;
}

