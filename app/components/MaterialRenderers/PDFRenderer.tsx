'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface PDFRendererProps {
  material: CourseMaterial;
}

export default function PDFRenderer({ material }: PDFRendererProps) {
  const handleDownload = () => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    }
  };

  if (!material.file_url) {
    return (
      <div className="p-4 bg-[#FEF2F2] border border-[#EF6161] rounded-lg">
        <p className="text-sm text-[#EF6161]">PDF URL is required</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#2B2B2B]">{material.title}</h3>
          {material.file_size && (
            <p className="text-sm text-[#9CA3AF]">
              {(material.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
      {material.description && (
        <p className="text-sm text-[#9CA3AF]">{material.description}</p>
      )}
      <iframe
        src={material.file_url}
        className="w-full h-96 border border-[#E5E7EB] rounded-lg"
        title={material.title}
      />
    </div>
  );
}

