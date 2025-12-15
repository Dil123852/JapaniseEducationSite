'use client';

import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface VideoRendererProps {
  material: CourseMaterial;
}

export default function VideoRenderer({ material }: VideoRendererProps) {
  // Extract YouTube video ID if video_id or video_url is provided
  const getYouTubeId = () => {
    if (material.video_id) {
      return material.video_id;
    }
    if (material.video_url) {
      const match = material.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const videoId = getYouTubeId();

  if (!videoId) {
    return (
      <div className="p-4 bg-[#FEF2F2] border border-[#EF6161] rounded-lg">
        <p className="text-sm text-[#EF6161]">Video URL or ID is required</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={material.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </div>
      {material.description && (
        <p className="mt-2 text-sm text-[#9CA3AF]">{material.description}</p>
      )}
    </div>
  );
}

