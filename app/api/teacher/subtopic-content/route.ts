import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';
import { addVideoToSubtopic, addPDFToSubtopic, addQuestionToSubtopic } from '@/app/lib/db/subtopic-content';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { subtopicId, type, ...contentData } = body;

    if (!subtopicId || !type) {
      return NextResponse.json({ error: 'Subtopic ID and type are required' }, { status: 400 });
    }

    // Verify user owns the subtopic's lesson's course
    const { data: subtopic } = await supabase
      .from('subtopics')
      .select(`
        *,
        lesson:lessons!subtopics_lesson_id_fkey(
          course:courses!lessons_course_id_fkey(created_by)
        )
      `)
      .eq('id', subtopicId)
      .single();

    if (!subtopic || (subtopic.lesson as any).course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let result;
    switch (type) {
      case 'video':
        if (!contentData.title || !contentData.videoId) {
          return NextResponse.json({ error: 'Title and video ID are required for videos' }, { status: 400 });
        }
        result = await addVideoToSubtopic(
          subtopicId,
          contentData.title,
          contentData.videoId,
          contentData.description,
          contentData.orderIndex || 0
        );
        break;

      case 'pdf':
        if (!contentData.title || !contentData.fileUrl) {
          return NextResponse.json({ error: 'Title and file URL are required for PDFs' }, { status: 400 });
        }
        result = await addPDFToSubtopic(
          subtopicId,
          contentData.title,
          contentData.fileUrl,
          contentData.fileSize,
          contentData.orderIndex || 0
        );
        break;

      case 'question':
        if (!contentData.questionText) {
          return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
        }
        result = await addQuestionToSubtopic(
          subtopicId,
          contentData.questionText,
          contentData.questionType || 'multiple_choice',
          contentData.options,
          contentData.correctAnswer,
          contentData.points || 1,
          contentData.orderIndex || 0
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error adding content to subtopic:', error);
    return NextResponse.json({ error: error.message || 'Failed to add content' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get('subtopicId');
    const type = searchParams.get('type');

    if (!subtopicId) {
      return NextResponse.json({ error: 'Subtopic ID is required' }, { status: 400 });
    }

    // Verify user owns the subtopic's lesson's course
    const { data: subtopic } = await supabase
      .from('subtopics')
      .select(`
        *,
        lesson:lessons!subtopics_lesson_id_fkey(
          course:courses!lessons_course_id_fkey(created_by)
        )
      `)
      .eq('id', subtopicId)
      .single();

    if (!subtopic || (subtopic.lesson as any).course.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let data;
    if (type === 'video') {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('subtopic_id', subtopicId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      data = videos;
    } else if (type === 'pdf') {
      const { data: pdfs, error } = await supabase
        .from('pdfs')
        .select('*')
        .eq('subtopic_id', subtopicId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      data = pdfs;
    } else if (type === 'question') {
      const { data: questions, error } = await supabase
        .from('subtopic_questions')
        .select('*')
        .eq('subtopic_id', subtopicId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      data = questions;
    } else {
      // Return all content types
      const [videosRes, pdfsRes, questionsRes] = await Promise.all([
        supabase.from('videos').select('*').eq('subtopic_id', subtopicId).order('order_index', { ascending: true }),
        supabase.from('pdfs').select('*').eq('subtopic_id', subtopicId).order('order_index', { ascending: true }),
        supabase.from('subtopic_questions').select('*').eq('subtopic_id', subtopicId).order('order_index', { ascending: true }),
      ]);

      if (videosRes.error) throw videosRes.error;
      if (pdfsRes.error) throw pdfsRes.error;
      if (questionsRes.error) throw questionsRes.error;

      data = {
        videos: videosRes.data || [],
        pdfs: pdfsRes.data || [],
        questions: questionsRes.data || [],
      };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error fetching subtopic content:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch content' }, { status: 500 });
  }
}
