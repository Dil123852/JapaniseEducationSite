'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video } from '@/app/lib/db/videos';

interface Props {
  videos: Video[];
  courseId: string;
  studentId: string;
}

export default function VideoListClient({ videos, courseId, studentId }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/student/courses/${courseId}/videos/${video.id}`}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-slate-800 mb-2 line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {video.description}
            </p>
          )}
          <div className="text-xs text-slate-400">
            Video ID: {video.video_id}
          </div>
        </Link>
      ))}
    </div>
  );
}

