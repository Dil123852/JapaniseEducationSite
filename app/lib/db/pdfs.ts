import { createClient } from '../supabase-server';

export interface PDF {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_size?: number;
  order_index: number;
  uploaded_at: string;
}

export async function addPDF(
  courseId: string,
  title: string,
  fileUrl: string,
  fileSize?: number,
  orderIndex: number = 0
): Promise<PDF> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pdfs')
    .insert({
      course_id: courseId,
      title,
      file_url: fileUrl,
      file_size: fileSize,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCoursePDFs(courseId: string): Promise<PDF[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching course PDFs:', error);
    return [];
  }
  return data;
}

export async function recordPDFDownload(pdfId: string, studentId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('pdf_downloads')
    .insert({
      pdf_id: pdfId,
      student_id: studentId,
    });

  if (error) throw error;
}

export async function getPDFDownloadStats(pdfId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pdf_downloads')
    .select(`
      *,
      student:profiles!pdf_downloads_student_id_fkey(id, email, full_name)
    `)
    .eq('pdf_id', pdfId);

  if (error) {
    console.error('Error fetching PDF download stats:', error);
    return [];
  }
  return data;
}

