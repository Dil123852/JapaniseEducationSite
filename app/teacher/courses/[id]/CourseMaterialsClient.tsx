'use client';

import { useState, useCallback } from 'react';
import { Eye, Plus } from 'lucide-react';
import MaterialsList from '@/app/components/MaterialsList';
import AddMaterialDialog from './AddMaterialDialog';
import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface CourseMaterialsClientProps {
  courseId: string;
  courseTitle: string;
  initialMaterials: CourseMaterial[];
}

export default function CourseMaterialsClient({
  courseId,
  courseTitle,
  initialMaterials,
}: CourseMaterialsClientProps) {
  const [materials, setMaterials] = useState<CourseMaterial[]>(initialMaterials);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);

  const handleOrderUpdate = useCallback(async (materialId: string, newOrderIndex: number) => {
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/materials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          orderIndex: newOrderIndex,
        }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, order_index: newOrderIndex } : m))
      );
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }, [courseId]);

  const handleBatchOrderUpdate = useCallback(
    async (orderUpdates: { materialId: string; newOrderIndex: number }[]) => {
      try {
        const response = await fetch(`/api/teacher/courses/${courseId}/materials/batch-order`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderUpdates }),
        });

        if (!response.ok) throw new Error('Failed to update order');

        // Optimistic update
        setMaterials((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          orderUpdates.forEach(({ materialId, newOrderIndex }) => {
            const material = map.get(materialId);
            if (material) {
              map.set(materialId, { ...material, order_index: newOrderIndex });
            }
          });
          return Array.from(map.values()).sort((a, b) => a.order_index - b.order_index);
        });
      } catch (error) {
        console.error('Error updating batch order:', error);
      }
    },
    [courseId]
  );

  const handleMaterialUpdate = useCallback(
    (materialId: string, updates: Partial<CourseMaterial>) => {
      setMaterials((prev) => prev.map((m) => (m.id === materialId ? { ...m, ...updates } : m)));
    },
    []
  );

  const handleMaterialDelete = useCallback((materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  }, []);

  const handleMaterialAdded = useCallback(async () => {
    // Refresh materials list
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/materials`);
      if (response.ok) {
        const updatedMaterials = await response.json();
        setMaterials(updatedMaterials);
      }
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error refreshing materials:', error);
    }
  }, [courseId]);

  const handleMaterialEdit = useCallback((material: CourseMaterial) => {
    setEditingMaterial(material);
    setIsAddDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingMaterial(null);
  }, []);

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F7DDE2]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C2E2F5]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2B2B2B] mb-1 md:mb-2 truncate">
                {courseTitle}
              </h1>
              <p className="text-xs md:text-sm text-[#6B7280] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2E2F5] animate-pulse flex-shrink-0" />
                <span className="hidden md:inline">Organize and manage your course materials with smooth drag-and-drop</span>
                <span className="md:hidden">Manage course materials</span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`
                  px-3 md:px-5 py-2 md:py-2.5 rounded-[10px] font-medium transition-all duration-300
                  flex items-center gap-1.5 md:gap-2 shadow-sm text-sm md:text-base
                  ${isPreviewMode
                    ? 'bg-[#C2E2F5] text-[#2B2B2B] hover:bg-[#B0D9F0] hover:shadow-md'
                    : 'bg-white border-2 border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] hover:border-[#C2E2F5] hover:shadow-md'
                  }
                  active:scale-95
                `}
                title={isPreviewMode ? 'Exit Preview Mode' : 'Preview as Student'}
              >
                <Eye className={`w-4 h-4 transition-transform duration-300 ${isPreviewMode ? 'scale-110' : ''}`} />
                <span className="hidden md:inline">{isPreviewMode ? 'Exit Preview' : 'Preview Mode'}</span>
                <span className="md:hidden">{isPreviewMode ? 'Exit' : 'Preview'}</span>
              </button>
              {!isPreviewMode && (
                <button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="
                    px-3 md:px-5 py-2 md:py-2.5 rounded-[10px] font-medium transition-all duration-300
                    sakura-gradient text-[#2B2B2B] shadow-sm
                    hover:shadow-md active:scale-95
                    flex items-center gap-1.5 md:gap-2
                    border border-[#E5E7EB] text-sm md:text-base
                  "
                  title="Add Material"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Add Material</span>
                  <span className="md:hidden">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] relative z-10">
        <MaterialsList
          materials={materials}
          isPreviewMode={isPreviewMode}
          onOrderUpdate={handleOrderUpdate}
          onBatchOrderUpdate={handleBatchOrderUpdate}
          onMaterialUpdate={handleMaterialUpdate}
          onMaterialDelete={handleMaterialDelete}
          onMaterialEdit={handleMaterialEdit}
          courseId={courseId}
        />
      </div>


      {/* Add/Edit Material Dialog */}
      <AddMaterialDialog
        courseId={courseId}
        open={isAddDialogOpen}
        onClose={handleDialogClose}
        onMaterialAdded={handleMaterialAdded}
        currentMaterialCount={materials.length}
        editingMaterial={editingMaterial}
      />
    </main>
  );
}

