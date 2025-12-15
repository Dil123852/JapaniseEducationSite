'use client';

import { useState, useCallback, useRef } from 'react';
import type { CourseMaterial } from '@/app/lib/db/course-materials';
import MaterialCard from '@/app/components/MaterialCard';

interface WhiteboardCanvasProps {
  materials: CourseMaterial[];
  isPreviewMode: boolean;
  onPositionUpdate: (materialId: string, x: number, y: number) => void;
  onMaterialUpdate: (materialId: string, updates: Partial<CourseMaterial>) => void;
  onMaterialDelete: (materialId: string) => void;
  courseId: string;
}

export default function WhiteboardCanvas({
  materials,
  isPreviewMode,
  onPositionUpdate,
  onMaterialUpdate,
  onMaterialDelete,
  courseId,
}: WhiteboardCanvasProps) {
  const [draggedMaterial, setDraggedMaterial] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localPositions, setLocalPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, materialId: string, currentX: number, currentY: number) => {
    if (isPreviewMode) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // DON'T preventDefault here - it will stop the drag!
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    // Calculate offset from mouse to top-left of card BEFORE setting state
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedMaterial(materialId);
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('text/plain', materialId); // Store material ID
    
    // Create a custom drag image for better visual feedback
    if (e.dataTransfer.setDragImage && target) {
      try {
        // Clone the card for drag preview
        const dragImage = target.cloneNode(true) as HTMLElement;
        dragImage.style.opacity = '0.8';
        dragImage.style.transform = 'rotate(2deg) scale(1.05)';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.left = '-9999px';
        dragImage.style.pointerEvents = 'none';
        dragImage.style.width = `${rect.width}px`;
        dragImage.style.height = `${rect.height}px`;
        document.body.appendChild(dragImage);
        
        // Use calculated offset
        e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
        
        // Clean up after a short delay
        setTimeout(() => {
          if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
          }
        }, 0);
      } catch (error) {
        console.warn('Could not create drag image:', error);
        // Continue without custom drag image
      }
    }
    
    return false;
  }, [isPreviewMode]);

  const handleDragEnd = useCallback(() => {
    setDraggedMaterial(null);
    setDragOffset({ x: 0, y: 0 });
    setLocalPositions(new Map());
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    
    if (!draggedMaterial || isPreviewMode) {
      handleDragEnd();
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) {
      handleDragEnd();
      return;
    }

    const scrollLeft = canvasRef.current?.scrollLeft || 0;
    const scrollTop = canvasRef.current?.scrollTop || 0;
    
    // Calculate new position accounting for scroll
    const newX = e.clientX - canvasRect.left + scrollLeft - dragOffset.x;
    const newY = e.clientY - canvasRect.top + scrollTop - dragOffset.y;

    // Ensure position is within bounds
    const clampedX = Math.max(0, Math.round(newX));
    const clampedY = Math.max(0, Math.round(newY));

    // Update position
    onPositionUpdate(draggedMaterial, clampedX, clampedY);
    handleDragEnd();
    
    return false;
  }, [draggedMaterial, dragOffset, isPreviewMode, onPositionUpdate, handleDragEnd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    
    if (draggedMaterial && !isPreviewMode) {
      e.dataTransfer.dropEffect = 'move';
      
      // Update local position for visual feedback
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const scrollLeft = canvasRef.current?.scrollLeft || 0;
        const scrollTop = canvasRef.current?.scrollTop || 0;
        const newX = e.clientX - canvasRect.left + scrollLeft - dragOffset.x;
        const newY = e.clientY - canvasRect.top + scrollTop - dragOffset.y;
        
        setLocalPositions(prev => {
          const newMap = new Map(prev);
          newMap.set(draggedMaterial, {
            x: Math.max(0, Math.round(newX)),
            y: Math.max(0, Math.round(newY)),
          });
          return newMap;
        });
      }
    }
    
    return false;
  }, [draggedMaterial, dragOffset, isPreviewMode]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-white overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        if (draggedMaterial && !isPreviewMode) {
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDragLeave={(e) => {
        // Only prevent default if we're actually leaving the canvas
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX;
          const y = e.clientY;
          if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            // Actually leaving the canvas
          }
        }
      }}
      style={{
        backgroundImage: isPreviewMode
          ? 'none'
          : `linear-gradient(to right, #E5E7EB 1px, transparent 1px),
             linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#C2E2F5] text-[#2B2B2B] px-4 py-2 rounded-lg shadow-md">
          Preview Mode - This is how students will see the whiteboard
        </div>
      )}

      {/* Materials */}
      {materials.map((material) => {
        const localPos = localPositions.get(material.id);
        const displayX = localPos ? localPos.x : material.position_x;
        const displayY = localPos ? localPos.y : material.position_y;
        
        return (
          <MaterialCard
            key={material.id}
            material={{
              ...material,
              position_x: displayX,
              position_y: displayY,
            }}
            isPreviewMode={isPreviewMode}
            isDragging={draggedMaterial === material.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onUpdate={onMaterialUpdate}
            onDelete={onMaterialDelete}
            courseId={courseId}
          />
        );
      })}

      {/* Empty State */}
      {materials.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-[#9CA3AF] mb-2">No materials yet</p>
            {!isPreviewMode && (
              <p className="text-sm text-[#9CA3AF]">Click "Add Material" to get started</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

