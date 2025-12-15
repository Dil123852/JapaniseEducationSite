'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { FileText, Eye, Sparkles } from 'lucide-react';
import type { CourseMaterial } from '@/app/lib/db/course-materials';
import MaterialCard from '@/app/components/MaterialCard';

interface MaterialsListProps {
  materials: CourseMaterial[];
  isPreviewMode: boolean;
  onOrderUpdate: (materialId: string, newOrderIndex: number) => void;
  onBatchOrderUpdate?: (orderUpdates: { materialId: string; newOrderIndex: number }[]) => void;
  onMaterialUpdate: (materialId: string, updates: Partial<CourseMaterial>) => void;
  onMaterialDelete: (materialId: string) => void;
  onMaterialEdit?: (material: CourseMaterial) => void;
  courseId: string;
}

export default function MaterialsList({
  materials,
  isPreviewMode,
  onOrderUpdate,
  onBatchOrderUpdate,
  onMaterialUpdate,
  onMaterialDelete,
  onMaterialEdit,
  courseId,
}: MaterialsListProps) {
  const [draggedMaterial, setDraggedMaterial] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sort materials by order_index
  const sortedMaterials = [...materials].sort((a, b) => a.order_index - b.order_index);

  const handleDragStart = useCallback(
    (e: React.DragEvent, materialId: string, currentX: number, currentY: number) => {
      if (isPreviewMode) {
        e.preventDefault();
        return;
      }

      e.stopPropagation();
      setDraggedMaterial(materialId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', materialId);

      const target = e.currentTarget as HTMLElement;
      if (e.dataTransfer.setDragImage && target) {
        try {
          const dragImage = target.cloneNode(true) as HTMLElement;
          dragImage.style.opacity = '0.7';
          dragImage.style.position = 'absolute';
          dragImage.style.top = '-9999px';
          dragImage.style.pointerEvents = 'none';
          document.body.appendChild(dragImage);
          e.dataTransfer.setDragImage(dragImage, 50, 50);
          setTimeout(() => {
            if (document.body.contains(dragImage)) {
              document.body.removeChild(dragImage);
            }
          }, 0);
        } catch (error) {
          console.warn('Could not create drag image:', error);
        }
      }
    },
    [isPreviewMode],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedMaterial(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      if (!draggedMaterial || isPreviewMode) return;

      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    },
    [draggedMaterial, isPreviewMode],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      // Get material ID from state or dataTransfer as fallback
      const materialId = draggedMaterial || e.dataTransfer.getData('text/plain');

      if (!materialId || isPreviewMode) {
        handleDragEnd();
        return;
      }

      const draggedIndex = sortedMaterials.findIndex((m) => m.id === materialId);
      if (draggedIndex === -1) {
        handleDragEnd();
        return;
      }

      // Allow dropping even if it's the same position (might be edge case)
      if (draggedIndex === dropIndex) {
        handleDragEnd();
        return;
      }

      // Reorder items: move dragged item to drop position
      const newMaterials = [...sortedMaterials];
      const [removed] = newMaterials.splice(draggedIndex, 1);
      newMaterials.splice(dropIndex, 0, removed);

      // Prepare batch update with all order_index changes
      const orderUpdates = newMaterials.map((material, index) => ({
        materialId: material.id,
        newOrderIndex: (index + 1) * 10, // Use multiples of 10 for easier reordering later
      }));

      // Use batch update if available, otherwise fall back to individual updates
      if (onBatchOrderUpdate) {
        onBatchOrderUpdate(orderUpdates);
      } else {
        // Fallback to individual updates
        orderUpdates.forEach(({ materialId, newOrderIndex }) => {
          onOrderUpdate(materialId, newOrderIndex);
        });
      }

      handleDragEnd();
    },
    [draggedMaterial, sortedMaterials, isPreviewMode, onOrderUpdate, onBatchOrderUpdate, handleDragEnd],
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto relative">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #C2E2F5 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Materials List */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 space-y-3 md:space-y-4 max-w-5xl mx-auto w-full relative z-10">
        {sortedMaterials.length === 0 ? (
          <div className="text-center py-12 md:py-24 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-[24px] sakura-gradient mb-4 md:mb-6 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
              <FileText className="w-8 h-8 md:w-12 md:h-12 text-[#2B2B2B] relative z-10" />
              <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-[#F7DDE2]/50 rounded-full blur-sm animate-pulse" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-2 md:mb-3">
              No materials yet
            </h3>
            {!isPreviewMode && (
              <p className="text-xs md:text-sm text-[#6B7280] flex items-center justify-center gap-2 px-4">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#C2E2F5] flex-shrink-0" />
                <span className="hidden md:inline">Click the + button below to add your first material</span>
                <span className="md:hidden">Tap the + button to add materials</span>
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Drop zone above first item */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedMaterial && !isPreviewMode) {
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverIndex(0);
                }
              }}
              onDrop={(e) => handleDrop(e, 0)}
              onDragEnter={(e) => {
                e.preventDefault();
                if (draggedMaterial && !isPreviewMode) {
                  setDragOverIndex(0);
                }
              }}
              onDragLeave={() => {
                if (dragOverIndex === 0) {
                  setDragOverIndex(null);
                }
              }}
              className={`
                relative min-h-[40px] md:min-h-[60px] -mb-2 rounded-[16px] md:rounded-[24px] transition-all duration-300
                ${dragOverIndex === 0 && draggedMaterial
                  ? 'bg-gradient-to-r from-[#F7DDE2]/40 via-[#C2E2F5]/40 to-[#F7DDE2]/40 border-2 border-dashed border-[#C2E2F5] shadow-md'
                  : 'bg-transparent'
                }
              `}
            >
              {dragOverIndex === 0 && draggedMaterial && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-[#2B2B2B] font-medium">
                    <div className="w-2 h-2 rounded-full bg-[#C2E2F5] animate-pulse" />
                    <span className="text-sm">Drop here</span>
                    <div className="w-2 h-2 rounded-full bg-[#C2E2F5] animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {sortedMaterials.map((material, index) => {
              const isDragging = draggedMaterial === material.id;
              const isDropTarget = dragOverIndex === index + 1 && draggedMaterial && draggedMaterial !== material.id;

              return (
                <div key={material.id} className="relative">
                  {/* Drop zone above each item */}
                  <div
                    onDragOver={(e) => handleDragOver(e, index + 1)}
                    onDrop={(e) => handleDrop(e, index + 1)}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (draggedMaterial && !isPreviewMode) {
                        setDragOverIndex(index + 1);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverIndex === index + 1) {
                        setDragOverIndex(null);
                      }
                    }}
                    className={`
                      relative min-h-[35px] md:min-h-[50px] -mb-2 rounded-[16px] md:rounded-[24px] transition-all duration-300
                      ${isDropTarget
                        ? 'bg-gradient-to-r from-[#F7DDE2]/40 via-[#C2E2F5]/40 to-[#F7DDE2]/40 border-2 border-dashed border-[#C2E2F5] shadow-md'
                        : 'bg-transparent'
                      }
                    `}
                  >
                    {isDropTarget && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-[#2B2B2B] font-medium">
                          <div className="w-2 h-2 rounded-full bg-[#C2E2F5] animate-pulse" />
                          <span className="text-sm">Drop here</span>
                          <div className="w-2 h-2 rounded-full bg-[#C2E2F5] animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Material Card */}
                  <div className={`
                    transition-all duration-300
                    ${isDragging ? 'opacity-40' : 'opacity-100'}
                    ${isDropTarget ? 'transform translate-y-2' : ''}
                  `}>
                    <MaterialCard
                      material={material}
                      isPreviewMode={isPreviewMode}
                      isDragging={isDragging}
                      isListMode={true}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onUpdate={onMaterialUpdate}
                      onDelete={onMaterialDelete}
                      onEdit={onMaterialEdit}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
