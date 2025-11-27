'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer';
import { getCourseVideos } from '@/app/lib/db/videos';
import { supabase } from '@/app/lib/supabaseClient';

export default function WatchVideoPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const videoId = params.videoId as string;
  
  const [video, setVideo] = useState<any>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      const videos = await getCourseVideos(courseId);
      const foundVideo = videos.find(v => v.id === videoId);
      if (foundVideo) {
        setVideo(foundVideo);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = async (currentTime: number, duration: number) => {
    setWatchTime(currentTime);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('video_analytics')
        .upsert({
          video_id: videoId,
          student_id: user.id,
          watch_time: Math.floor(currentTime),
          completed: currentTime >= duration * 0.9,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'video_id,student_id',
        });
    } catch (err) {
      // Silent fail for analytics
    }
  };

  const handleComplete = () => {
    // Video completed
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Video not found</p>
          <Link href={`/student/courses/${courseId}/videos`} className="text-slate-800 underline">
            Back to videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={`/student/courses/${courseId}/videos`} className="text-sm text-slate-500 hover:text-slate-700 mb-2 block">
            ← Back to videos
          </Link>
          <h1 className="text-xl font-light text-slate-800">{video.title}</h1>
          {video.description && (
            <p className="text-sm text-slate-600 mt-1">{video.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <VideoPlayer
            videoId={video.video_id}
            onTimeUpdate={handleTimeUpdate}
            onComplete={handleComplete}
          />
        </div>
      </main>
    </div>
  );
}

