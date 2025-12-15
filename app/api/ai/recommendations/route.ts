import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase-server';
import { getCurrentUserProfile } from '@/app/lib/auth-server';
import { gatherStudentContext } from '@/app/lib/ai/student-context';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await getCurrentUserProfile();
    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Gather student context
    const studentContext = await gatherStudentContext(profile.id);

    // Generate AI-powered recommendations
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_API_KEY) {
      // Return basic recommendations if API key is not set
      return NextResponse.json({
        recommendations: studentContext.nextSteps.map((step, idx) => ({
          id: `rec-${idx}`,
          title: step,
          priority: idx + 1,
          type: 'general',
        })),
      });
    }

    // Create prompt for recommendations
    const prompt = `Based on this student's learning data, provide 3-5 specific, actionable recommendations for their next steps:

Student Level: ${studentContext.studentStatus.level}
Score: ${studentContext.studentStatus.score}%
Learning Time: ${studentContext.learningTime.formatted}
Courses Enrolled: ${studentContext.enrollments.length}
Quiz Average: ${studentContext.quizPerformance.averageScore}%

Strengths: ${studentContext.strengths.join(', ')}
Areas to Improve: ${studentContext.weakAreas.join(', ')}

Provide recommendations in a simple format, one per line, starting with action verbs.`;

    try {
      const model = process.env.HF_TEXT_MODEL || 'gpt2';
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let aiText = '';
        
        if (Array.isArray(data) && data[0]?.generated_text) {
          aiText = data[0].generated_text.trim();
        } else if (data.generated_text) {
          aiText = data.generated_text.trim();
        }

        // Parse recommendations (fallback to context-based if parsing fails)
        const recommendations = studentContext.nextSteps.map((step, idx) => ({
          id: `rec-${idx}`,
          title: step,
          priority: idx + 1,
          type: 'general',
        }));

        return NextResponse.json({ recommendations });
      }
    } catch (error) {
      console.error('AI recommendations error:', error);
    }

    // Fallback to context-based recommendations
    const recommendations = studentContext.nextSteps.map((step, idx) => ({
      id: `rec-${idx}`,
      title: step,
      priority: idx + 1,
      type: 'general',
    }));

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
