'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Video,
  FileText,
  FileQuestion,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { LessonWithSubtopics, Subtopic } from '@/app/lib/db/lessons';
import { VideoManager, PDFManager, QuizManager } from './ContentManager';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';
import Link from 'next/link';

interface Props {
  lesson: LessonWithSubtopics;
}

export default function LessonEditorClient({ lesson: initialLesson }: Props) {
  const router = useRouter();
  const [lesson, setLesson] = useState(initialLesson);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(
    initialLesson.subtopics[0]?.id || null
  );
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(
    new Set(initialLesson.subtopics.map((s) => s.id))
  );
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    grade: lesson.grade || '',
    subject: lesson.subject || '',
    thumbnailUrl: lesson.thumbnail_url || '',
  });

  // Subtopic form state
  const [subtopicForm, setSubtopicForm] = useState({
    title: '',
    description: '',
  });

  const toggleSubtopic = (subtopicId: string) => {
    const newExpanded = new Set(expandedSubtopics);
    if (newExpanded.has(subtopicId)) {
      newExpanded.delete(subtopicId);
    } else {
      newExpanded.add(subtopicId);
    }
    setExpandedSubtopics(newExpanded);
  };

  const handleUpdateLesson = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/lessons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          ...lessonForm,
          thumbnailUrl: lessonForm.thumbnailUrl || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lesson');
      }

      const updated = await response.json();
      setLesson({ ...lesson, ...updated });
      setIsEditingLesson(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to update lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtopicForm.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          title: subtopicForm.title,
          description: subtopicForm.description || undefined,
          orderIndex: lesson.subtopics.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subtopic');
      }

      const newSubtopic = await response.json();
      setLesson({
        ...lesson,
        subtopics: [...lesson.subtopics, newSubtopic],
      });
      setSelectedSubtopic(newSubtopic.id);
      setExpandedSubtopics(new Set([...expandedSubtopics, newSubtopic.id]));
      setIsCreatingSubtopic(false);
      setSubtopicForm({ title: '', description: '' });
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to create subtopic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubtopic = async (subtopicId: string) => {
    if (!confirm('Are you sure you want to delete this subtopic? All content will be lost.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/subtopics?subtopicId=${subtopicId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subtopic');
      }

      setLesson({
        ...lesson,
        subtopics: lesson.subtopics.filter((s) => s.id !== subtopicId),
      });

      if (selectedSubtopic === subtopicId) {
        setSelectedSubtopic(lesson.subtopics[0]?.id || null);
      }
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete subtopic');
    }
  };

  const currentSubtopic = lesson.subtopics.find((s) => s.id === selectedSubtopic);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-[#FAFAFA] pb-20 md:pb-0">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden p-4 bg-white border-b border-[#E5E7EB]">
        <TeacherMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B] line-clamp-1 flex-1 text-center px-2">{lesson.title}</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Left Sidebar - Lesson Outline */}
      <div className="w-full md:w-80 border-r border-[#E5E7EB] bg-white flex flex-col">
        {/* Lesson Header */}
        <div className="p-4 border-b border-[#E5E7EB]">
          {/* Mobile Back Button */}
          <div className="md:hidden mb-3">
            <Link
              href="/teacher/lessons"
              className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-[#2B2B2B] transition-colors text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Lessons
            </Link>
          </div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-lg md:text-lg font-semibold text-[#2B2B2B] line-clamp-2">
                {lesson.title}
              </h2>
              {lesson.grade && (
                <Badge variant="outline" className="mt-2 text-xs border-[#E5E7EB] text-[#9CA3AF]">
                  {lesson.grade}
                </Badge>
              )}
            </div>
            <Dialog open={isEditingLesson} onOpenChange={setIsEditingLesson}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Lesson</DialogTitle>
                  <DialogDescription>Update lesson details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={lessonForm.title}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, title: e.target.value })
                      }
                      className="mt-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-grade">Grade</Label>
                      <Input
                        id="edit-grade"
                        value={lessonForm.grade}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, grade: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-subject">Subject</Label>
                      <Input
                        id="edit-subject"
                        value={lessonForm.subject}
                        onChange={(e) =>
                          setLessonForm({ ...lessonForm, subject: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={lessonForm.description}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, description: e.target.value })
                      }
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                    <Input
                      id="edit-thumbnail"
                      type="url"
                      value={lessonForm.thumbnailUrl}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, thumbnailUrl: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdateLesson}
                      disabled={isSubmitting || !lessonForm.title.trim()}
                      className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingLesson(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Subtopics List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {lesson.subtopics.map((subtopic) => (
              <div
                key={subtopic.id}
                className={`group rounded-lg border transition-all ${
                  selectedSubtopic === subtopic.id
                    ? 'border-[#4c8bf5] bg-[#F0F9FF]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#C2E2F5]'
                }`}
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    onClick={() => toggleSubtopic(subtopic.id)}
                    className="text-[#9CA3AF] hover:text-[#2B2B2B]"
                  >
                    {expandedSubtopics.has(subtopic.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedSubtopic(subtopic.id)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium text-[#2B2B2B] line-clamp-1">
                      {subtopic.title}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      Order: {subtopic.order_index}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteSubtopic(subtopic.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#EF6161] hover:text-[#DC2626] p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Subtopic Button */}
            <Dialog open={isCreatingSubtopic} onOpenChange={setIsCreatingSubtopic}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 border-[#E5E7EB] hover:border-[#C2E2F5] hover:bg-[#F0F9FF] text-[#2B2B2B]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subtopic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subtopic</DialogTitle>
                  <DialogDescription>
                    Add a new subtopic to organize your lesson content
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubtopic} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="subtopic-title">Title *</Label>
                    <Input
                      id="subtopic-title"
                      value={subtopicForm.title}
                      onChange={(e) =>
                        setSubtopicForm({ ...subtopicForm, title: e.target.value })
                      }
                      placeholder="e.g., Introduction to Verbs"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtopic-description">Description</Label>
                    <Textarea
                      id="subtopic-description"
                      value={subtopicForm.description}
                      onChange={(e) =>
                        setSubtopicForm({ ...subtopicForm, description: e.target.value })
                      }
                      placeholder="Brief description of this subtopic..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !subtopicForm.title.trim()}
                      className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Subtopic'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingSubtopic(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>
      </div>

      {/* Right Content Area - Resource Management */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {currentSubtopic ? (
          <SubtopicContentManager
            subtopic={currentSubtopic}
            lessonId={lesson.id}
            onUpdate={() => router.refresh()}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF] opacity-50" />
              <h3 className="text-lg font-medium text-[#2B2B2B] mb-2">
                No subtopic selected
              </h3>
              <p className="text-[#9CA3AF] mb-4">
                Select a subtopic from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subtopic Content Manager Component
function SubtopicContentManager({
  subtopic,
  lessonId,
  onUpdate,
}: {
  subtopic: Subtopic;
  lessonId: string;
  onUpdate: () => void;
}) {
  const [videos, setVideos] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'quiz'>('video');

  useEffect(() => {
    loadContent();
  }, [subtopic.id]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teacher/subtopic-content?subtopicId=${subtopic.id}`);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      const content = await response.json();
      setVideos(content.videos || []);
      setPdfs(content.pdfs || []);
      setQuestions(content.questions || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Subtopic Header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2">{subtopic.title}</h2>
        {subtopic.description && (
          <p className="text-[#9CA3AF]">{subtopic.description}</p>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex gap-2 border-b border-[#E5E7EB]">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('video')}
          className={`rounded-none border-b-2 ${
            activeTab === 'video'
              ? 'border-[#4c8bf5] text-[#4c8bf5]'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <Video className="w-4 h-4 mr-2" />
          Videos
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('pdf')}
          className={`rounded-none border-b-2 ${
            activeTab === 'pdf'
              ? 'border-[#4c8bf5] text-[#4c8bf5]'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          PDFs
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('quiz')}
          className={`rounded-none border-b-2 ${
            activeTab === 'quiz'
              ? 'border-[#4c8bf5] text-[#4c8bf5]'
              : 'border-transparent text-[#9CA3AF]'
          }`}
        >
          <FileQuestion className="w-4 h-4 mr-2" />
          Quizzes
        </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-[#9CA3AF]">Loading content...</p>
          </div>
        ) : activeTab === 'video' ? (
          <VideoManager subtopicId={subtopic.id} videos={videos} onUpdate={loadContent} />
        ) : activeTab === 'pdf' ? (
          <PDFManager subtopicId={subtopic.id} pdfs={pdfs} onUpdate={loadContent} />
        ) : activeTab === 'quiz' ? (
          <QuizManager subtopicId={subtopic.id} questions={questions} onUpdate={loadContent} />
        ) : (
          <div className="text-center py-12">
            <p className="text-[#9CA3AF] mb-4">Select a tab to manage content</p>
            <p className="text-sm text-[#9CA3AF]">
              Add videos, PDFs, and quizzes to this subtopic
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

