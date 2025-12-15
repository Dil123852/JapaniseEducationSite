'use client';

import { useState, useEffect } from 'react';
import { Video, FileText, FileQuestion, Eye, Type, Headphones, X, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RichTextEditor from '@/app/components/RichTextEditor';
import type { MaterialType } from '@/app/lib/db/course-materials';

import type { CourseMaterial } from '@/app/lib/db/course-materials';

interface AddMaterialDialogProps {
  courseId: string;
  open: boolean;
  onClose: () => void;
  onMaterialAdded: () => void;
  currentMaterialCount?: number;
  editingMaterial?: CourseMaterial | null;
}

const materialTypes: Array<{ value: MaterialType; label: string; icon: any }> = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'mcq_test', label: 'MCQ Test', icon: FileQuestion },
  { value: 'listening_test', label: 'Listening Test', icon: Headphones },
  { value: 'notice', label: 'Notice', icon: Eye },
  { value: 'text', label: 'Text', icon: Type },
];

export default function AddMaterialDialog({
  courseId,
  open,
  onClose,
  onMaterialAdded,
  currentMaterialCount = 0,
  editingMaterial = null,
}: AddMaterialDialogProps) {
  const isEditMode = !!editingMaterial;
  
  const [materialType, setMaterialType] = useState<MaterialType | ''>(editingMaterial?.material_type || '');
  const [title, setTitle] = useState(editingMaterial?.title || '');
  const [description, setDescription] = useState(editingMaterial?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Video fields
  const [videoId, setVideoId] = useState(editingMaterial?.video_id || '');
  const [videoUrl, setVideoUrl] = useState(editingMaterial?.video_url || '');

  // PDF fields
  const [fileUrl, setFileUrl] = useState(editingMaterial?.file_url || '');
  const [fileSize, setFileSize] = useState(editingMaterial?.file_size?.toString() || '');

  // Notice fields
  const [noticeContent, setNoticeContent] = useState(editingMaterial?.notice_content || '');

  // Text fields
  const [textContent, setTextContent] = useState(editingMaterial?.text_content || '');

  // Listening Test fields
  const [listeningVideoId, setListeningVideoId] = useState(editingMaterial?.listening_video_id || '');
  const [listeningVideoUrl, setListeningVideoUrl] = useState(editingMaterial?.listening_video_url || '');

  // MCQ Questions
  interface MCQQuestion {
    id?: string; // For editing existing questions
    questionText: string;
    options: string[]; // Up to 4 options
    correctAnswer: string;
    points: number;
  }
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);

  // Listening Test Questions
  interface ListeningQuestion {
    id?: string; // For editing existing questions
    questionText: string;
    questionType: 'multiple_choice' | 'short_answer';
    options: string[]; // For multiple choice questions
    correctAnswer: string;
    points: number;
  }
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Text materials don't need title, only text content
    if (!materialType) {
      alert('Material type is required');
      return;
    }

    if (materialType !== 'text' && !title) {
      alert('Title is required');
      return;
    }

    if (materialType === 'text' && !textContent.trim()) {
      alert('Text content is required');
      return;
    }

    if (materialType === 'mcq_test' && mcqQuestions.length === 0) {
      alert('At least one question is required for MCQ test');
      return;
    }

    // Validate MCQ questions
    if (materialType === 'mcq_test') {
      for (let i = 0; i < mcqQuestions.length; i++) {
        const q = mcqQuestions[i];
        if (!q.questionText.trim()) {
          alert(`Question ${i + 1}: Question text is required`);
          return;
        }
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          alert(`Question ${i + 1}: At least 2 options are required`);
          return;
        }
        if (!q.correctAnswer || !validOptions.includes(q.correctAnswer)) {
          alert(`Question ${i + 1}: Please select a valid correct answer`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const body: any = {
        materialType,
        title: materialType === 'text' ? 'Text Material' : title, // Dummy title for text, not shown
        description: materialType === 'text' ? undefined : (description || undefined),
      };

      // Add type-specific fields
      if (materialType === 'video') {
        body.videoId = videoId || undefined;
        body.videoUrl = videoUrl || undefined;
      } else if (materialType === 'listening_test') {
        body.listeningVideoId = listeningVideoId || undefined;
        body.listeningVideoUrl = listeningVideoUrl || undefined;
      } else if (materialType === 'pdf') {
        body.fileUrl = fileUrl || undefined;
        body.fileSize = fileSize ? parseInt(fileSize) : undefined;
      } else if (materialType === 'notice') {
        body.noticeContent = noticeContent || undefined;
      } else if (materialType === 'text') {
        body.textContent = textContent || undefined;
      }

      let response;
      if (isEditMode && editingMaterial) {
        // Edit mode - PATCH request
        body.materialId = editingMaterial.id;
        response = await fetch(`/api/teacher/courses/${courseId}/materials`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Add mode - POST request
        const newOrderIndex = (currentMaterialCount + 1) * 10;
        body.positionX = 0;
        body.positionY = 0;
        body.width = 400;
        body.height = 300;
        body.orderIndex = newOrderIndex;
        
        response = await fetch(`/api/teacher/courses/${courseId}/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} material`);
      }

      const result = await response.json();
      const materialId = result.id;

      // If Listening test, create/update questions
      if (materialType === 'listening_test' && materialId) {
        // For edit mode, we need to handle updating/deleting existing questions
        if (isEditMode && editingMaterial) {
          // Fetch existing questions
          const existingQuestionsResponse = await fetch(`/api/listening-tests/${editingMaterial.id}/questions`, {
            credentials: 'include',
          });
          if (existingQuestionsResponse.ok) {
            const existingQuestions = await existingQuestionsResponse.json();
            
            // Delete questions that are no longer in the list
            const questionIdsToKeep = listeningQuestions.filter(q => q.id).map(q => q.id);
            for (const existingQ of existingQuestions) {
              if (!questionIdsToKeep.includes(existingQ.id)) {
                const deleteResponse = await fetch(`/api/listening-tests/${editingMaterial.id}/questions?questionId=${existingQ.id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                });
                if (!deleteResponse.ok) {
                  const error = await deleteResponse.json();
                  console.error('Error deleting question:', error);
                }
              }
            }
          }

          // Update or create questions
          for (let i = 0; i < listeningQuestions.length; i++) {
            const question = listeningQuestions[i];
            const validOptions = question.questionType === 'multiple_choice' 
              ? question.options.filter((opt: string) => opt && opt.trim())
              : undefined;
            
            if (question.id) {
              // Update existing question
              const updateResponse = await fetch(`/api/listening-tests/${editingMaterial.id}/questions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  questionId: question.id,
                  updates: {
                    questionText: question.questionText,
                    questionType: question.questionType,
                    options: validOptions,
                    correctAnswer: question.correctAnswer,
                    points: question.points,
                    orderIndex: i,
                  },
                }),
              });
              if (!updateResponse.ok) {
                const error = await updateResponse.json();
                throw new Error(error.error || `Failed to update question ${i + 1}`);
              }
            } else {
              // Create new question
              const createResponse = await fetch(`/api/listening-tests/${editingMaterial.id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                  body: JSON.stringify({
                    questionText: question.questionText,
                    questionType: question.questionType,
                    options: validOptions,
                    correctAnswer: question.correctAnswer,
                    points: question.points,
                    orderIndex: i,
                  }),
              });
              if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || `Failed to create question ${i + 1}`);
              }
            }
          }
        } else {
          // Create mode - create all questions in batch
          const questionsToCreate = listeningQuestions.map((q, i) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.questionType === 'multiple_choice' ? q.options.filter(opt => opt.trim()) : undefined,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
          }));

          // Create questions one by one (no batch endpoint for listening tests yet)
          for (let i = 0; i < questionsToCreate.length; i++) {
            const q = questionsToCreate[i];
            const createResponse = await fetch(`/api/listening-tests/${materialId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(q),
            });
            if (!createResponse.ok) {
              const error = await createResponse.json();
              throw new Error(error.error || `Failed to create question ${i + 1}`);
            }
          }
        }
      }

      // If MCQ test, create/update questions
      if (materialType === 'mcq_test' && materialId) {
        // For edit mode, we need to handle updating/deleting existing questions
        if (isEditMode && editingMaterial) {
          // Fetch existing questions
          const existingQuestionsResponse = await fetch(`/api/mcq-tests/${editingMaterial.id}/questions`, {
            credentials: 'include',
          });
          if (existingQuestionsResponse.ok) {
            const existingQuestions = await existingQuestionsResponse.json();
            
            // Delete questions that are no longer in the list
            const questionIdsToKeep = mcqQuestions.filter(q => q.id).map(q => q.id);
            for (const existingQ of existingQuestions) {
              if (!questionIdsToKeep.includes(existingQ.id)) {
                const deleteResponse = await fetch(`/api/mcq-tests/${editingMaterial.id}/questions?questionId=${existingQ.id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                });
                if (!deleteResponse.ok) {
                  const error = await deleteResponse.json();
                  console.error('Error deleting question:', error);
                }
              }
            }
          }

          // Update or create questions
          for (let i = 0; i < mcqQuestions.length; i++) {
            const question = mcqQuestions[i];
            const validOptions = question.options.filter(opt => opt.trim());
            
            if (question.id) {
              // Update existing question
              const updateResponse = await fetch(`/api/mcq-tests/${editingMaterial.id}/questions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  questionId: question.id,
                  updates: {
                    questionText: question.questionText,
                    options: validOptions,
                    correctAnswer: question.correctAnswer,
                    points: question.points,
                    orderIndex: i,
                  },
                }),
              });
              if (!updateResponse.ok) {
                const error = await updateResponse.json();
                throw new Error(error.error || `Failed to update question ${i + 1}`);
              }
            } else {
              // Create new question
              const createResponse = await fetch(`/api/mcq-tests/${editingMaterial.id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  questionText: question.questionText,
                  options: validOptions,
                  correctAnswer: question.correctAnswer,
                  points: question.points,
                  orderIndex: i,
                }),
              });
              if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || `Failed to create question ${i + 1}`);
              }
            }
          }
        } else {
          // Create mode - create all questions in batch
          const questionsToCreate = mcqQuestions.map((q, i) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
          }));

          const batchResponse = await fetch(`/api/mcq-tests/${materialId}/questions/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ questions: questionsToCreate }),
          });

          if (!batchResponse.ok) {
            const error = await batchResponse.json();
            throw new Error(error.error || `Failed to create questions: ${error.message || 'Not authenticated'}`);
          }
        }
      }

      // Reset form
      if (!isEditMode) {
        setMaterialType('');
        setTitle('');
        setDescription('');
        setVideoId('');
        setVideoUrl('');
        setListeningVideoId('');
        setListeningVideoUrl('');
        setFileUrl('');
        setFileSize('');
        setNoticeContent('');
        setTextContent('');
        setMcqQuestions([]);
        setListeningQuestions([]);
      }

      onMaterialAdded();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} material:`, error);
      alert(error.message || `Failed to ${isEditMode ? 'update' : 'create'} material`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      if (!isSubmitting) {
        if (!isEditMode) {
          setMaterialType('');
          setTitle('');
          setDescription('');
          setVideoId('');
          setVideoUrl('');
          setListeningVideoId('');
          setListeningVideoUrl('');
          setFileUrl('');
          setFileSize('');
          setNoticeContent('');
          setTextContent('');
          setMcqQuestions([]);
          setListeningQuestions([]);
        }
        onClose();
      }
  };

  // MCQ Question Management Functions
  const addMCQQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ]);
  };

  const removeMCQQuestion = (index: number) => {
    setMcqQuestions(mcqQuestions.filter((_, i) => i !== index));
  };

  const updateMCQQuestion = (index: number, updates: Partial<MCQQuestion>) => {
    const updated = [...mcqQuestions];
    updated[index] = { ...updated[index], ...updates };
    setMcqQuestions(updated);
  };

  const updateMCQOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...mcqQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setMcqQuestions(updated);
  };

  // Listening Test Question Management Functions
  const addListeningQuestion = () => {
    setListeningQuestions([
      ...listeningQuestions,
      {
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ]);
  };

  const removeListeningQuestion = (index: number) => {
    setListeningQuestions(listeningQuestions.filter((_, i) => i !== index));
  };

  const updateListeningQuestion = (index: number, updates: Partial<ListeningQuestion>) => {
    const updated = [...listeningQuestions];
    updated[index] = { ...updated[index], ...updates };
    setListeningQuestions(updated);
  };

  const updateListeningOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...listeningQuestions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = ['', '', '', ''];
    }
    updated[questionIndex].options[optionIndex] = value;
    setListeningQuestions(updated);
  };

  // Load questions when editing MCQ material
  useEffect(() => {
    const loadMCQQuestions = async () => {
      if (editingMaterial && editingMaterial.material_type === 'mcq_test' && open) {
        try {
          const response = await fetch(`/api/mcq-tests/${editingMaterial.id}/questions`, {
            credentials: 'include',
          });
          if (response.ok) {
            const questions = await response.json();
            setMcqQuestions(questions.map((q: any) => ({
              id: q.id,
              questionText: q.question_text,
              options: q.options || [],
              correctAnswer: q.correct_answer,
              points: q.points || 1,
            })));
          }
        } catch (error) {
          console.error('Error loading MCQ questions:', error);
        }
      }
    };

    loadMCQQuestions();
  }, [editingMaterial, open]);

  // Load questions when editing Listening test material
  useEffect(() => {
    const loadListeningQuestions = async () => {
      if (editingMaterial && editingMaterial.material_type === 'listening_test' && open) {
        try {
          const response = await fetch(`/api/listening-tests/${editingMaterial.id}/questions`, {
            credentials: 'include',
          });
          if (response.ok) {
            const questions = await response.json();
            setListeningQuestions(questions.map((q: any) => ({
              id: q.id,
              questionText: q.question_text,
              questionType: q.question_type,
              options: q.options || ['', '', '', ''],
              correctAnswer: q.correct_answer,
              points: q.points || 1,
            })));
          }
        } catch (error) {
          console.error('Error loading Listening test questions:', error);
        }
      }
    };

    loadListeningQuestions();
  }, [editingMaterial, open]);

  // Update form when editingMaterial changes
  useEffect(() => {
    if (editingMaterial && open) {
      setMaterialType(editingMaterial.material_type);
      setTitle(editingMaterial.title || '');
      setDescription(editingMaterial.description || '');
      setVideoId(editingMaterial.video_id || '');
      setVideoUrl(editingMaterial.video_url || '');
      setListeningVideoId(editingMaterial.listening_video_id || '');
      setListeningVideoUrl(editingMaterial.listening_video_url || '');
      setFileUrl(editingMaterial.file_url || '');
      setFileSize(editingMaterial.file_size?.toString() || '');
      setNoticeContent(editingMaterial.notice_content || '');
      setTextContent(editingMaterial.text_content || '');
      if (editingMaterial.material_type !== 'mcq_test') {
        setMcqQuestions([]);
      }
      if (editingMaterial.material_type !== 'listening_test') {
        setListeningQuestions([]);
      }
    } else if (!open && !editingMaterial) {
      // Reset form when dialog closes and we're not editing
      setMaterialType('');
      setTitle('');
      setDescription('');
      setVideoId('');
      setVideoUrl('');
      setFileUrl('');
      setFileSize('');
      setNoticeContent('');
      setTextContent('');
      setListeningVideoId('');
      setListeningVideoUrl('');
      setMcqQuestions([]);
      setListeningQuestions([]);
    }
  }, [editingMaterial, open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2B2B2B]">
            {isEditMode ? 'Edit Material' : 'Add New Material'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Material Type - Disabled in edit mode */}
          <div>
            <Label className="text-[#2B2B2B]">Material Type *</Label>
            <Select 
              value={materialType} 
              onValueChange={(value) => setMaterialType(value as MaterialType)}
              disabled={isEditMode}
            >
              <SelectTrigger className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#4c8bf5]" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {isEditMode && (
              <p className="text-xs text-[#9CA3AF] mt-1">Material type cannot be changed when editing</p>
            )}
          </div>

          {/* Title - not needed for text */}
          {materialType !== 'text' && (
            <>
              <div>
                <Label htmlFor="title" className="text-[#2B2B2B]">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-[#2B2B2B]">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Video-specific fields */}
          {materialType === 'video' && (
            <>
              <div>
                <Label htmlFor="videoId" className="text-[#2B2B2B]">Video ID (YouTube)</Label>
                <Input
                  id="videoId"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  placeholder="dQw4w9WgXcQ"
                />
              </div>
              <div>
                <Label htmlFor="videoUrl" className="text-[#2B2B2B]">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          {/* PDF-specific fields */}
          {materialType === 'pdf' && (
            <>
              <div>
                <Label htmlFor="fileUrl" className="text-[#2B2B2B]">PDF URL *</Label>
                <Input
                  id="fileUrl"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="fileSize" className="text-[#2B2B2B]">File Size (bytes)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                  placeholder="1024000"
                />
              </div>
            </>
          )}

          {/* Notice-specific fields */}
          {materialType === 'notice' && (
            <div>
              <Label htmlFor="noticeContent" className="text-[#2B2B2B]">Notice Content</Label>
              <Textarea
                id="noticeContent"
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                rows={5}
                placeholder="Enter notice content..."
              />
            </div>
          )}

          {/* Text-specific fields */}
          {materialType === 'text' && (
            <div>
              <Label htmlFor="textContent" className="text-[#2B2B2B]">Text Content *</Label>
              <div className="mt-2">
                <RichTextEditor
                  value={textContent}
                  onChange={setTextContent}
                  placeholder="Enter your text content here... Use the toolbar to format text (bold, italic, colors)"
                  rows={10}
                />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">Use the formatting toolbar to make text bold, italic, or change colors</p>
            </div>
          )}

          {/* Listening Test-specific fields */}
          {materialType === 'listening_test' && (
            <div className="space-y-4 md:space-y-6">
              {/* Group 1: Listening Test Details */}
              <div className="border border-[#E5E7EB] rounded-lg p-3 md:p-4 bg-[#FAFAFA]">
                <h3 className="text-base md:text-lg font-semibold text-[#2B2B2B] mb-3 md:mb-4 flex items-center gap-2">
                  <Headphones className="w-4 h-4 md:w-5 md:h-5 text-[#4C8BF5]" />
                  Listening Test Details
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <p className="text-xs md:text-sm text-[#6B7280]">
                    Provide basic information about your listening test. The title and description help students understand what they'll be listening to.
                  </p>
                  {/* Title and Description are already shown above for non-text materials */}
                </div>
              </div>

              {/* Group 2: Listening Test Video Link */}
              <div className="border border-[#E5E7EB] rounded-lg p-3 md:p-4 bg-[#FAFAFA]">
                <h3 className="text-base md:text-lg font-semibold text-[#2B2B2B] mb-3 md:mb-4 flex items-center gap-2">
                  <Video className="w-4 h-4 md:w-5 md:h-5 text-[#4C8BF5]" />
                  Listening Test Video Link
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="listeningVideoId" className="text-[#2B2B2B]">Video ID (YouTube) *</Label>
                    <Input
                      id="listeningVideoId"
                      value={listeningVideoId}
                      onChange={(e) => setListeningVideoId(e.target.value)}
                      className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                      placeholder="dQw4w9WgXcQ"
                      required
                    />
                    <p className="text-xs text-[#9CA3AF] mt-1">Enter the YouTube video ID for the listening test</p>
                  </div>
                  <div>
                    <Label htmlFor="listeningVideoUrl" className="text-[#2B2B2B]">Video URL *</Label>
                    <Input
                      id="listeningVideoUrl"
                      value={listeningVideoUrl}
                      onChange={(e) => setListeningVideoUrl(e.target.value)}
                      className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                    <p className="text-xs text-[#9CA3AF] mt-1">Enter the full YouTube URL for the listening test</p>
                  </div>
                </div>
              </div>

              {/* Group 3: Questions */}
              <div className="border border-[#E5E7EB] rounded-lg p-3 md:p-4 bg-[#FAFAFA]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-[#2B2B2B] flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 md:w-5 md:h-5 text-[#4C8BF5]" />
                    Questions *
                  </h3>
                  <Button
                    type="button"
                    onClick={addListeningQuestion}
                    className="bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] text-xs md:text-sm px-3 py-1.5 h-auto w-full sm:w-auto"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                    Add Question
                  </Button>
                </div>
                {listeningQuestions.length === 0 && (
                  <p className="text-xs md:text-sm text-[#9CA3AF] text-center py-3 md:py-4">
                    No questions yet. Click "Add Question" to get started.
                  </p>
                )}
                {listeningQuestions.map((question, qIndex) => (
                  <div key={question.id || `new-lq-${qIndex}`} className="mb-3 md:mb-4 p-3 md:p-4 border border-[#E5E7EB] rounded-lg bg-white space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#2B2B2B]">Question {qIndex + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeListeningQuestion(qIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-[#EF6161] hover:text-[#EF6161] hover:bg-[#FEF2F2] h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label className="text-[#2B2B2B]">Question Text *</Label>
                      <Textarea
                        value={question.questionText}
                        onChange={(e) => updateListeningQuestion(qIndex, { questionText: e.target.value })}
                        className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                        rows={2}
                        placeholder="Enter the question..."
                      />
                    </div>

                    <div>
                      <Label className="text-[#2B2B2B]">Question Type *</Label>
                      <Select
                        value={question.questionType}
                        onValueChange={(value: 'multiple_choice' | 'short_answer') => {
                          updateListeningQuestion(qIndex, { 
                            questionType: value,
                            options: value === 'multiple_choice' ? ['', '', '', ''] : [],
                            correctAnswer: '',
                          });
                        }}
                      >
                        <SelectTrigger className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {question.questionType === 'multiple_choice' && (
                      <>
                        <div>
                          <Label className="text-[#2B2B2B]">Options (up to 4) *</Label>
                          <div className="mt-2 space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateListeningOption(qIndex, optIndex, e.target.value)}
                                  className="border-[#E5E7EB] focus:border-[#4c8bf5]"
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#9CA3AF] mt-1">Leave empty options to remove them</p>
                        </div>

                        <div>
                          <Label className="text-[#2B2B2B]">Correct Answer *</Label>
                          <Select
                            value={(() => {
                              if (!question.correctAnswer) return '';
                              const matchingIndex = question.options.findIndex(opt => opt.trim() === question.correctAnswer);
                              return matchingIndex >= 0 ? `${question.correctAnswer}__idx__${matchingIndex}` : question.correctAnswer;
                            })()}
                            onValueChange={(value) => {
                              const optionText = value.includes('__idx__') ? value.split('__idx__')[0] : value;
                              updateListeningQuestion(qIndex, { correctAnswer: optionText });
                            }}
                          >
                            <SelectTrigger className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]">
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options
                                .map((option, optIndex) => ({ 
                                  option: option.trim(), 
                                  originalIndex: optIndex
                                }))
                                .filter(({ option }) => option)
                                .map(({ option, originalIndex }) => {
                                  const uniqueKey = `lq${qIndex}-opt${originalIndex}`;
                                  const uniqueValue = `${option}__idx__${originalIndex}`;
                                  return (
                                    <SelectItem key={uniqueKey} value={uniqueValue}>
                                      {option}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {question.questionType === 'short_answer' && (
                      <div>
                        <Label className="text-[#2B2B2B]">Correct Answer *</Label>
                        <Input
                          value={question.correctAnswer}
                          onChange={(e) => updateListeningQuestion(qIndex, { correctAnswer: e.target.value })}
                          className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                          placeholder="Enter the correct answer..."
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-[#2B2B2B]">Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateListeningQuestion(qIndex, { points: parseInt(e.target.value) || 1 })}
                        className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MCQ-specific fields */}
          {materialType === 'mcq_test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[#2B2B2B]">Questions *</Label>
                <Button
                  type="button"
                  onClick={addMCQQuestion}
                  className="bg-[#C2E2F5] hover:bg-[#B0D9F0] text-[#2B2B2B] text-sm px-3 py-1.5 h-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>
              {mcqQuestions.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-4">
                  No questions yet. Click "Add Question" to get started.
                </p>
              )}
              {mcqQuestions.map((question, qIndex) => (
                <div key={question.id || `new-q-${qIndex}`} className="p-3 md:p-4 border border-[#E5E7EB] rounded-lg bg-[#FAFAFA] space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[#2B2B2B] text-sm md:text-base">Question {qIndex + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeMCQQuestion(qIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-[#EF6161] hover:text-[#EF6161] hover:bg-[#FEF2F2] h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <Label className="text-[#2B2B2B]">Question Text *</Label>
                    <Textarea
                      value={question.questionText}
                      onChange={(e) => updateMCQQuestion(qIndex, { questionText: e.target.value })}
                      className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                      rows={2}
                      placeholder="Enter the question..."
                    />
                  </div>

                  <div>
                    <Label className="text-[#2B2B2B]">Options (up to 4) *</Label>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateMCQOption(qIndex, optIndex, e.target.value)}
                            className="border-[#E5E7EB] focus:border-[#4c8bf5]"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1">Leave empty options to remove them</p>
                  </div>

                  <div>
                    <Label className="text-[#2B2B2B]">Correct Answer *</Label>
                    <Select
                      value={(() => {
                        // Convert stored answer to the format used in SelectItem values
                        if (!question.correctAnswer) return '';
                        const matchingIndex = question.options.findIndex(opt => opt.trim() === question.correctAnswer);
                        return matchingIndex >= 0 ? `${question.correctAnswer}__idx__${matchingIndex}` : question.correctAnswer;
                      })()}
                      onValueChange={(value) => {
                        // Extract just the option text (before __idx__) for storage
                        const optionText = value.includes('__idx__') ? value.split('__idx__')[0] : value;
                        updateMCQQuestion(qIndex, { correctAnswer: optionText });
                      }}
                    >
                      <SelectTrigger className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options
                          .map((option, optIndex) => ({ 
                            option: option.trim(), 
                            originalIndex: optIndex
                          }))
                          .filter(({ option }) => option)
                          .map(({ option, originalIndex }) => {
                            // Create a truly unique key combining question index and original index
                            const uniqueKey = `q${qIndex}-opt${originalIndex}`;
                            // Create unique value by appending index to prevent duplicate values
                            const uniqueValue = `${option}__idx__${originalIndex}`;
                            return (
                              <SelectItem key={uniqueKey} value={uniqueValue}>
                                {option}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#2B2B2B]">Points</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateMCQQuestion(qIndex, { points: parseInt(e.target.value) || 1 })}
                      className="mt-2 border-[#E5E7EB] focus:border-[#4c8bf5]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FAFAFA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
            >
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Material' : 'Create Material')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

