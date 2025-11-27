'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Video,
  FileText,
  FileQuestion,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';

interface ContentManagerProps {
  subtopicId: string;
  videos: any[];
  pdfs: any[];
  questions: any[];
  onUpdate: () => void;
}

export function VideoManager({ subtopicId, videos, onUpdate }: { subtopicId: string; videos: any[]; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    videoId: '',
    description: '',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/subtopic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtopicId,
          type: 'video',
          title: formData.title,
          videoId: formData.videoId,
          description: formData.description || undefined,
          orderIndex: videos.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add video');
      }

      onUpdate();
      setIsAdding(false);
      setFormData({ title: '', videoId: '', description: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to add video');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2B2B2B]">Videos</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
              <DialogDescription>
                Add a video to this subtopic (YouTube link or video ID)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Video title"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="video-id">Video ID or URL *</Label>
                <Input
                  id="video-id"
                  value={formData.videoId}
                  onChange={(e) => setFormData({ ...formData, videoId: e.target.value })}
                  placeholder="YouTube video ID or URL"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="video-description">Description</Label>
                <Textarea
                  id="video-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.videoId}
                  className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
                >
                  {isSubmitting ? 'Adding...' : 'Add Video'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {videos.length === 0 ? (
        <Card className="border-[#E5E7EB] bg-[#FAFAFA]">
          <CardContent className="py-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF] opacity-50" />
            <p className="text-[#9CA3AF]">No videos added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <Card key={video.id} className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2B2B2B] mb-1">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-[#9CA3AF] mb-2">{video.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                        ID: {video.video_id}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                        Order: {video.order_index}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#EF6161] hover:text-[#DC2626]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function PDFManager({ subtopicId, pdfs, onUpdate }: { subtopicId: string; pdfs: any[]; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileUrl: '',
    fileSize: '',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fileUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/subtopic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtopicId,
          type: 'pdf',
          title: formData.title,
          fileUrl: formData.fileUrl,
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : undefined,
          orderIndex: pdfs.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add PDF');
      }

      onUpdate();
      setIsAdding(false);
      setFormData({ title: '', fileUrl: '', fileSize: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to add PDF');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2B2B2B]">PDFs & Documents</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add PDF
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add PDF</DialogTitle>
              <DialogDescription>
                Add a PDF or document to this subtopic
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="pdf-title">Title *</Label>
                <Input
                  id="pdf-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Document title"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pdf-url">File URL *</Label>
                <Input
                  id="pdf-url"
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pdf-size">File Size (bytes, optional)</Label>
                <Input
                  id="pdf-size"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  placeholder="e.g., 1024000"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.fileUrl}
                  className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
                >
                  {isSubmitting ? 'Adding...' : 'Add PDF'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pdfs.length === 0 ? (
        <Card className="border-[#E5E7EB] bg-[#FAFAFA]">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF] opacity-50" />
            <p className="text-[#9CA3AF]">No PDFs added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pdfs.map((pdf) => (
            <Card key={pdf.id} className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2B2B2B] mb-1">{pdf.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                        Order: {pdf.order_index}
                      </Badge>
                      {pdf.file_size && (
                        <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                          {(pdf.file_size / 1024).toFixed(1)} KB
                        </Badge>
                      )}
                      <a
                        href={pdf.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4c8bf5] hover:underline text-xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#EF6161] hover:text-[#DC2626]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuizManager({ subtopicId, questions, onUpdate }: { subtopicId: string; questions: any[]; onUpdate: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'multiple_choice' as 'multiple_choice' | 'structured' | 'short_answer',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: '1',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/subtopic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtopicId,
          type: 'question',
          questionText: formData.questionText,
          questionType: formData.questionType,
          options: formData.questionType === 'multiple_choice' ? formData.options.filter(o => o.trim()) : undefined,
          correctAnswer: formData.correctAnswer || undefined,
          points: parseInt(formData.points) || 1,
          orderIndex: questions.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add question');
      }

      onUpdate();
      setIsAdding(false);
      setFormData({
        questionText: '',
        questionType: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: '1',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#2B2B2B]">Quiz Questions</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Quiz Question</DialogTitle>
              <DialogDescription>
                Create a question for this subtopic's quiz
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="question-text">Question *</Label>
                <Textarea
                  id="question-text"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter your question..."
                  className="mt-2"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="question-type">Question Type *</Label>
                <Select
                  value={formData.questionType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, questionType: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.questionType === 'multiple_choice' && (
                <>
                  <div>
                    <Label>Options *</Label>
                    <div className="space-y-2 mt-2">
                      {formData.options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.options];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="correct-answer">Correct Answer *</Label>
                    <Input
                      id="correct-answer"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      placeholder="Enter the correct answer"
                      className="mt-2"
                      required
                    />
                  </div>
                </>
              )}

              {(formData.questionType === 'structured' || formData.questionType === 'short_answer') && (
                <div>
                  <Label htmlFor="correct-answer">Expected Answer (Optional)</Label>
                  <Textarea
                    id="correct-answer"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    placeholder="Expected answer or grading criteria"
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.questionText}
                  className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
                >
                  {isSubmitting ? 'Adding...' : 'Add Question'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {questions.length === 0 ? (
        <Card className="border-[#E5E7EB] bg-[#FAFAFA]">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF] opacity-50" />
            <p className="text-[#9CA3AF]">No questions added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id} className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#4c8bf5] text-white">Q{index + 1}</Badge>
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                        {question.question_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-[#2B2B2B] mb-2">{question.question_text}</h4>
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-1 mt-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`text-sm p-2 rounded ${
                              option === question.correct_answer
                                ? 'bg-[#D1FAE5] text-[#065F46] border border-[#7fd1a1]'
                                : 'bg-[#FAFAFA] text-[#9CA3AF]'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#EF6161] hover:text-[#DC2626]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

