'use client';

import { useState } from 'react';
import type { CourseMaterial } from '@/app/lib/db/course-materials';
import WhiteboardCanvas from '@/app/components/WhiteboardCanvas';

interface StudentMaterialsViewClientProps {
  courseId: string;
  courseTitle: string;
  initialMaterials: CourseMaterial[];
}

export default function StudentMaterialsViewClient({
  courseId,
  courseTitle,
  initialMaterials,
}: StudentMaterialsViewClientProps) {
  const [materials] = useState<CourseMaterial[]>(initialMaterials);

  // Student view - no updates/deletes allowed
  const handlePositionUpdate = () => {
    // Not allowed in student view
  };

  const handleMaterialUpdate = () => {
    // Not allowed in student view
  };

  const handleMaterialDelete = () => {
    // Not allowed in student view
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 md:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#2B2B2B]">{courseTitle}</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Course Materials</p>
      </div>

      {/* Whiteboard Canvas - Read-only */}
      <div className="flex-1 overflow-hidden">
        <WhiteboardCanvas
          materials={materials}
          isPreviewMode={true}
          onPositionUpdate={handlePositionUpdate}
          onMaterialUpdate={handleMaterialUpdate}
          onMaterialDelete={handleMaterialDelete}
          courseId={courseId}
        />
      </div>
    </div>
  );
}

