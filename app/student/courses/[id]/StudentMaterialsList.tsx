'use client';

import MaterialsList from '@/app/components/MaterialsList';
import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface StudentMaterialsListProps {
  materials: CourseMaterial[];
  courseId: string;
}

export default function StudentMaterialsList({
  materials,
  courseId,
}: StudentMaterialsListProps) {
  return (
    <MaterialsList
      materials={materials}
      isPreviewMode={true}
      onOrderUpdate={() => {
        // Not allowed in student view
      }}
      onMaterialUpdate={() => {
        // Not allowed in student view
      }}
      onMaterialDelete={() => {
        // Not allowed in student view
      }}
      courseId={courseId}
    />
  );
}

