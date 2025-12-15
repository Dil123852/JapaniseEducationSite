'use client';

import type React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, FileText, Video, FileQuestion, Eye, Type, Play, GripVertical, Pencil } from 'lucide-react';
import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface MaterialCardProps {
  material: CourseMaterial;
  isPreviewMode: boolean;
  isDragging: boolean;
  isListMode: boolean;
  onDragStart: (e: React.DragEvent, materialId: string, x: number, y: number) => void;
  onDragEnd: () => void;
  onUpdate: (materialId: string, updates: Partial<CourseMaterial>) => void;
  onDelete: (materialId: string) => void;
  onEdit?: (material: CourseMaterial) => void;
  courseId: string;
}

const getIcon = (materialType: string) => {
  switch (materialType) {
    case 'video':
      return <Play className="w-5 h-5" />;
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    case 'mcq_test':
      return <FileQuestion className="w-5 h-5" />;
    case 'listening_test':
      return <Video className="w-5 h-5" />;
    case 'notice':
      return <Eye className="w-5 h-5" />;
    case 'text':
      return <Type className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

const getMaterialTypeLabel = (materialType: string) => {
  switch (materialType) {
    case 'video':
      return 'Video';
    case 'pdf':
      return 'PDF';
    case 'mcq_test':
      return 'MCQ Test';
    case 'listening_test':
      return 'Listening Test';
    case 'notice':
      return 'Notice';
    case 'text':
      return 'Text';
    default:
      return materialType;
  }
};

const getMaterialTypeColor = (materialType: string) => {
  switch (materialType) {
    case 'video':
      return {
        bg: 'bg-gradient-to-br from-[#C2E2F5] to-[#B0D9F0]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#F0F9FF] text-[#2B2B2B] border-[#C2E2F5]',
      };
    case 'pdf':
      return {
        bg: 'bg-gradient-to-br from-[#F7DDE2] to-[#F0D1D8]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#FEF2F2] text-[#2B2B2B] border-[#F7DDE2]',
      };
    case 'mcq_test':
      return {
        bg: 'bg-gradient-to-br from-[#CFE3C1] to-[#C5DDB5]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#F0FDF4] text-[#2B2B2B] border-[#CFE3C1]',
      };
    case 'listening_test':
      return {
        bg: 'bg-gradient-to-br from-[#C2E2F5] to-[#E0F2FE]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#F0F9FF] text-[#2B2B2B] border-[#C2E2F5]',
      };
    case 'notice':
      return {
        bg: 'bg-gradient-to-br from-[#EF6161] to-[#EF4444]',
        icon: 'text-white',
        badge: 'bg-[#FEF2F2] text-[#EF6161] border-[#EF6161]',
      };
    case 'text':
      return {
        bg: 'bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-[#C2E2F5] to-[#F7DDE2]',
        icon: 'text-[#2B2B2B]',
        badge: 'bg-[#F0F9FF] text-[#2B2B2B] border-[#C2E2F5]',
      };
  }
};

export default function MaterialCard({
  material,
  isPreviewMode,
  isDragging,
  isListMode,
  onDragStart,
  onDragEnd,
  onUpdate,
  onDelete,
  onEdit,
  courseId,
}: MaterialCardProps) {
  const router = useRouter();

  const handleMaterialClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) return; // Only handle clicks in preview/student mode
    
    // Prevent navigation if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Navigate to appropriate material view page based on type
    switch (material.material_type) {
      case 'video':
        router.push(`/student/courses/${courseId}/materials/${material.id}/view`);
        break;
      case 'listening_test':
        router.push(`/student/courses/${courseId}/materials/${material.id}/listening`);
        break;
      case 'mcq_test':
        router.push(`/student/courses/${courseId}/materials/${material.id}/test`);
        break;
      case 'pdf':
        if (material.file_url) {
          window.open(material.file_url, '_blank');
        }
        break;
      default:
        // For notices and text, just open in a view page
        router.push(`/student/courses/${courseId}/materials/${material.id}/view`);
        break;
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/materials?materialId=${material.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      onDelete(material.id);
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material');
    }
  };

  // For text materials in preview mode, show only plain text without any styling
  if (material.material_type === 'text' && isPreviewMode) {
    return (
      <div 
        className="prose prose-sm max-w-none text-[#2B2B2B] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: material.text_content || '' }}
      />
    );
  }

  const typeColors = getMaterialTypeColor(material.material_type);
  
  // Get border color based on material type
  const getBorderColor = () => {
    if (material.material_type === 'notice') {
      return 'border-[#EF4444] border-2'; // Red border for notices
    }
    return 'border-[#E5E7EB]';
  };

  return (
    <div
      draggable={!isPreviewMode}
      onDragStart={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onDragStart(e, material.id, rect.left, rect.top);
      }}
      onDragEnd={onDragEnd}
      className={`
        group relative flex items-center gap-2 md:gap-4 p-3 md:p-5 bg-white rounded-[16px] md:rounded-[24px] ${getBorderColor()}
        transition-all duration-300 ease-out soft-shadow
        ${isDragging 
          ? 'opacity-60 scale-95 shadow-lg rotate-1' 
          : 'opacity-100 scale-100 hover:shadow-md hover:scale-[1.01]'
        }
        ${material.material_type === 'notice' 
          ? 'hover:border-[#EF4444] hover:shadow-[#EF4444]/10' 
          : 'hover:border-[#C2E2F5] hover:bg-[#FCE7F3]/30'
        }
        ${!isPreviewMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
      `}
      onClick={handleMaterialClick}
      style={isPreviewMode ? { pointerEvents: 'auto' } : undefined}
    >
      {/* Drag Handle */}
      {!isPreviewMode && (
        <div className="flex-shrink-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 text-[#9CA3AF] hover:text-[#C2E2F5]">
          <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      )}

      {/* Icon Container with Gradient Background */}
      <div className={`
        flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-[12px] ${typeColors.bg} 
        flex items-center justify-center shadow-sm
        transition-all duration-300 md:group-hover:scale-105
        ${isDragging ? 'scale-90' : ''}
      `}>
        <div className={typeColors.icon}>
          {getIcon(material.material_type)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* For text materials, show the formatted content */}
            {material.material_type === 'text' ? (
              <div 
                className="prose prose-sm max-w-none text-[#2B2B2B] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: material.text_content || '' }}
              />
            ) : (
              <>
                <h3 className="font-semibold text-[#2B2B2B] text-base md:text-lg mb-1 md:mb-1.5 truncate md:group-hover:text-[#C2E2F5] transition-colors">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="text-xs md:text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
                    {material.description}
                  </p>
                )}
                <div className={`
                  inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-[8px] md:rounded-[10px] text-[10px] md:text-xs font-medium mt-2 md:mt-3
                  border ${typeColors.badge}
                  transition-all duration-200
                `}>
                  {getMaterialTypeLabel(material.material_type)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isPreviewMode && (
        <div className="flex items-center gap-1 md:gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(material);
              }}
              className="
                flex-shrink-0 p-2 md:p-2.5 text-[#6B7280] 
                hover:text-[#C2E2F5] hover:bg-[#F0F9FF]
                rounded-[8px] md:rounded-[10px] transition-all duration-200 
                hover:scale-105
                active:scale-95
              "
              title="Edit material"
            >
              <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="
              flex-shrink-0 p-2 md:p-2.5 text-[#6B7280] 
              hover:text-[#EF6161] hover:bg-[#FEF2F2]
              rounded-[8px] md:rounded-[10px] transition-all duration-200 
              hover:scale-105
              active:scale-95
            "
            title="Delete material"
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
