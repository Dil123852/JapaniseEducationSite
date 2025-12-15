import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface TextRendererProps {
  material: CourseMaterial;
}

export default function TextRenderer({ material }: TextRendererProps) {
  return (
    <div className="bg-white border-l-4 border-l-[#C2E2F5] pl-6 pr-4 py-5 rounded-r-lg">
      <div 
        className="prose prose-sm max-w-none text-[#2B2B2B] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: material.text_content || '' }}
      />
    </div>
  );
}

