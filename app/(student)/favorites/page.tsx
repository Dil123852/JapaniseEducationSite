import { redirect } from 'next/navigation';
import { getCurrentUserProfile, getCurrentUser } from '@/app/lib/auth-server';
import { getFavoriteLessons } from '@/app/lib/db/favorites';
import { createClient } from '@/app/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Heart, ArrowRight } from 'lucide-react';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/complete-profile');
  }

  if (profile.role === 'teacher') {
    redirect('/teacher');
  }

  // Get favorite lessons
  let favoriteLessons: any[] = [];
  const supabase = await createClient();

  try {
    const favorites = await getFavoriteLessons(profile.id);
    
    // Get course information for each lesson
    for (const favorite of favorites) {
      const lesson = favorite.lesson;
      if (lesson) {
        // Get course info
        const { data: course } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', lesson.course_id)
          .single();

        favoriteLessons.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          course_id: lesson.course_id,
          course_title: course?.title || 'Course',
          favorited_at: favorite.created_at,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 pb-20 md:pb-8 safe-area-bottom">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">
          Favourit Lessons
        </h1>
        <p className="text-sm md:text-base text-[#9CA3AF]">
          Your favorite lessons saved for quick access
        </p>
      </div>

      {/* Favorites List */}
      {favoriteLessons.length === 0 ? (
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardContent className="py-12 md:py-16">
            <div className="text-center">
              <Heart className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-[#C2E2F5] opacity-50" />
              <h3 className="text-lg md:text-xl font-medium text-[#2B2B2B] mb-2">
                No favorites yet
              </h3>
              <p className="text-sm md:text-base text-[#9CA3AF] mb-6">
                Start exploring lessons and add them to your favorites for easy access
              </p>
              <Link href="/student/courses">
                <button className="px-6 py-3 bg-[#C2E2F5] hover:bg-[#B0D9F0] active:bg-[#9DD0EB] text-[#2B2B2B] rounded-lg font-medium transition-colors touch-target touch-feedback">
                  Browse Lessons
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {favoriteLessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/student/courses/${lesson.course_id}/lessons/${lesson.id}`}
              className="group"
            >
              <Card className="bg-white border-[#E5E7EB] rounded-[18px] soft-shadow hover:shadow-md active:shadow-sm transition-all h-full touch-feedback">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#C2E2F5] group-hover:text-[#B0D9F0]" />
                      <span className="text-xs text-[#9CA3AF]">{lesson.course_title}</span>
                    </div>
                    <Heart className="w-5 h-5 text-[#EF6161] fill-[#EF6161]" />
                  </div>
                  <h3 className="text-base font-medium text-[#2B2B2B] mb-2 line-clamp-2 group-hover:text-[#C2E2F5] transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-4">
                      {lesson.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E7EB]">
                    <span className="text-xs text-[#9CA3AF]">
                      Added {new Date(lesson.favorited_at).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
