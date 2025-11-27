import { createClient } from '../supabase-server';

export interface WorkPlan {
  id: string;
  course_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function createWorkPlan(
  courseId: string,
  title: string,
  content: string,
  teacherId: string
): Promise<WorkPlan> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('work_plans')
    .insert({
      course_id: courseId,
      title,
      content,
      created_by: teacherId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseWorkPlan(courseId: string): Promise<WorkPlan | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('work_plans')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching work plan:', error);
    return null;
  }
  return data;
}

export async function updateWorkPlan(
  workPlanId: string,
  title: string,
  content: string
): Promise<WorkPlan> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('work_plans')
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workPlanId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

