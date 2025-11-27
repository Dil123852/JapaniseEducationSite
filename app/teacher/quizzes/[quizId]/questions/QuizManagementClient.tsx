'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  FileQuestion,
  Lock,
  Unlock,
  Clock,
  GripVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { QuizWithQuestions, QuizQuestion, QuizQuestionType } from '@/app/lib/db/quizzes';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';

interface Props {
  quiz: QuizWithQuestions;
}

export default function QuizManagementClient({ quiz: initialQuiz }: Props) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(initialQuiz);
  const [questions, setQuestions] = useState(quiz.questions);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice' as QuizQuestionType,
    correct_answer: '',
    options: ['', '', '', ''],
    points: '1',
    order_index: '0',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }, [quiz.id]);

  useEffect(() => {
    if (mounted) {
      loadQuestions();
    }
  }, [mounted, loadQuestions]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim() || !formData.correct_answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: formData.question_text,
          question_type: formData.question_type,
          correct_answer: formData.correct_answer,
          options: formData.question_type === 'multiple_choice' ? formData.options.filter(o => o.trim()) : undefined,
          points: parseInt(formData.points) || 1,
          order_index: parseInt(formData.order_index) || questions.length,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create question';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get text instead
          const text = await response.text();
          errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const newQuestion = await response.json();
      setQuestions((prev) => [...prev, newQuestion]);
      setIsAddingQuestion(false);
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        correct_answer: '',
        options: ['', '', '', ''],
        points: '1',
        order_index: String(questions.length + 1),
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !formData.question_text.trim() || !formData.correct_answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/questions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          question_text: formData.question_text,
          question_type: formData.question_type,
          correct_answer: formData.correct_answer,
          options: formData.question_type === 'multiple_choice' ? formData.options.filter(o => o.trim()) : undefined,
          points: parseInt(formData.points) || 1,
          order_index: parseInt(formData.order_index) || editingQuestion.order_index,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update question';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get text instead
          const text = await response.text();
          errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedQuestion = await response.json();
      setQuestions((prev) => prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
      setEditingQuestion(null);
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        correct_answer: '',
        options: ['', '', '', ''],
        points: '1',
        order_index: '0',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to update question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/questions?questionId=${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete question';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get text instead
          const text = await response.text();
          errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete question');
    }
  };

  const openEditDialog = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      correct_answer: question.correct_answer,
      options: question.options && Array.isArray(question.options) ? question.options : ['', '', '', ''],
      points: String(question.points),
      order_index: String(question.order_index),
    });
  };

  const closeEditDialog = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      question_type: 'multiple_choice',
      correct_answer: '',
      options: ['', '', '', ''],
      points: '1',
      order_index: String(questions.length),
    });
  };

  if (!mounted) {
    return (
      <div className="p-4 md:p-8 space-y-6 pb-20 md:pb-8">
        <div className="text-center py-12 text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <TeacherMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B] line-clamp-1 flex-1 text-center px-2">{quiz.title}</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block space-y-4">
        <Link
          href="/teacher/quizzes"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-[#2B2B2B] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-[#9CA3AF] text-sm md:text-base mb-3">{quiz.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {quiz.duration && (
              <Badge variant="outline" className="border-[#E5E7EB] text-[#9CA3AF]">
                <Clock className="w-3 h-3 mr-1" />
                {quiz.duration} min
              </Badge>
            )}
            {quiz.password ? (
              <Badge className="bg-[#EF6161] text-white">
                <Lock className="w-3 h-3 mr-1" />
                Password Protected
              </Badge>
            ) : (
              <Badge variant="outline" className="border-[#E5E7EB] text-[#9CA3AF]">
                <Unlock className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
            <Badge variant="outline" className="border-[#E5E7EB] text-[#9CA3AF]">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card className="bg-white border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF] opacity-50" />
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-2">No questions yet</h3>
            <p className="text-[#9CA3AF] mb-6">Add your first question to get started</p>
            <Button
              onClick={() => setIsAddingQuestion(true)}
              className="group relative bg-gradient-to-r from-[#4c8bf5] to-[#5a9bf5] hover:from-[#3a7ae0] hover:to-[#4a8af0] text-white min-h-[56px] px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:bg-white/40 transition-all duration-300"></div>
                  <div className="relative bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                    <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold">Add First Question</span>
                  <span className="text-sm text-white/80 font-normal">Start building your quiz</span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full"></div>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions
            .sort((a, b) => a.order_index - b.order_index)
            .map((question, index) => (
              <Card key={question.id} className="bg-white border-[#E5E7EB]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C2E2F5] flex items-center justify-center text-sm font-semibold text-[#2B2B2B]">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle className="text-base md:text-lg text-[#2B2B2B] line-clamp-2">
                            {question.question_text}
                          </CardTitle>
                          <Badge variant="outline" className="border-[#E5E7EB] text-[#9CA3AF] text-xs flex-shrink-0">
                            {question.question_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="border-[#E5E7EB] text-[#9CA3AF] text-xs flex-shrink-0">
                            {question.points} {question.points === 1 ? 'point' : 'points'}
                          </Badge>
                        </div>
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className="space-y-2 mt-3">
                            {question.options.map((option: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-3 rounded-lg border ${
                                  option === question.correct_answer
                                    ? 'bg-[#D1FAE5] border-[#7fd1a1] text-[#065F46]'
                                    : 'bg-[#FAFAFA] border-[#E5E7EB] text-[#9CA3AF]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span>{option}</span>
                                  {option === question.correct_answer && (
                                    <CheckCircle2 className="w-4 h-4 ml-auto text-[#7fd1a1]" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.question_type === 'true_false' && (
                          <div className="mt-3 space-y-2">
                            {['True', 'False'].map((opt) => (
                              <div
                                key={opt}
                                className={`text-sm p-3 rounded-lg border ${
                                  opt.toLowerCase() === question.correct_answer.toLowerCase()
                                    ? 'bg-[#D1FAE5] border-[#7fd1a1] text-[#065F46]'
                                    : 'bg-[#FAFAFA] border-[#E5E7EB] text-[#9CA3AF]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{opt}</span>
                                  {opt.toLowerCase() === question.correct_answer.toLowerCase() && (
                                    <CheckCircle2 className="w-4 h-4 ml-auto text-[#7fd1a1]" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.question_type === 'short_answer' && (
                          <div className="mt-3 p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]">
                            <p className="text-sm text-[#9CA3AF] mb-1">Expected Answer:</p>
                            <p className="text-sm text-[#2B2B2B]">{question.correct_answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(question)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-[#EF6161]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          
          {/* Add Question Button - Below Questions List */}
          <div className="pt-6 pb-4">
            <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
              <DialogTrigger asChild>
                <Button className="group relative bg-gradient-to-r from-[#4c8bf5] to-[#5a9bf5] hover:from-[#3a7ae0] hover:to-[#4a8af0] text-white min-h-[56px] px-6 md:px-8 py-3 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-white/20">
                  <div className="flex items-center gap-3 w-full justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:bg-white/40 transition-all duration-300"></div>
                      <div className="relative bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300">
                        <Plus className="w-5 h-5 md:w-6 md:h-6 transform group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base md:text-lg font-semibold">Add New Question</span>
                      <span className="text-xs md:text-sm text-white/80 font-normal">Create a question for this quiz</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full"></div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl text-[#2B2B2B]">Add New Question</DialogTitle>
                  <DialogDescription className="text-[#9CA3AF]">
                    Create a question for this quiz
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddQuestion} className="space-y-5 mt-4">
                <div>
                  <Label htmlFor="add-question-text" className="text-[#2B2B2B]">
                    Question Text <span className="text-[#EF6161]">*</span>
                  </Label>
                  <Textarea
                    id="add-question-text"
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter your question..."
                    className="mt-2 min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="add-question-type" className="text-[#2B2B2B]">
                      Question Type <span className="text-[#EF6161]">*</span>
                    </Label>
                    <Select
                      value={formData.question_type}
                      onValueChange={(value: QuizQuestionType) =>
                        setFormData({ ...formData, question_type: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-points" className="text-[#2B2B2B]">
                      Points
                    </Label>
                    <Input
                      id="add-points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                {(formData.question_type === 'multiple_choice' || formData.question_type === 'true_false') && (
                  <>
                    {formData.question_type === 'multiple_choice' && (
                      <div>
                        <Label className="text-[#2B2B2B]">Options <span className="text-[#EF6161]">*</span></Label>
                        <div className="space-y-2 mt-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#9CA3AF] w-6">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...formData.options];
                                  newOptions[index] = e.target.value;
                                  setFormData({ ...formData, options: newOptions });
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="add-correct-answer" className="text-[#2B2B2B]">
                        Correct Answer <span className="text-[#EF6161]">*</span>
                      </Label>
                      {formData.question_type === 'multiple_choice' ? (
                        <Select
                          value={(() => {
                            // Find the matching option and return the value with separator
                            const matchingOpt = formData.options
                              .map((opt, idx) => ({ value: opt, index: idx }))
                              .find(opt => opt.value === formData.correct_answer);
                            return matchingOpt ? `${formData.correct_answer}|||${matchingOpt.index}` : formData.correct_answer;
                          })()}
                          onValueChange={(value) => {
                            // Extract the actual value if it contains the index separator
                            const actualValue = value.includes('|||') ? value.split('|||')[0] : value;
                            setFormData({ ...formData, correct_answer: actualValue });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.options
                              .map((opt, idx) => ({ value: opt, label: `${String.fromCharCode(65 + idx)}. ${opt}`, index: idx }))
                              .filter((opt) => opt.value.trim())
                              .map((opt, mapIdx) => (
                                <SelectItem key={`add-option-${opt.index}-${mapIdx}`} value={`${opt.value}|||${opt.index}`}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select
                          value={formData.correct_answer}
                          onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </>
                )}

                {formData.question_type === 'short_answer' && (
                  <div>
                    <Label htmlFor="add-correct-answer" className="text-[#2B2B2B]">
                      Expected Answer <span className="text-[#EF6161]">*</span>
                    </Label>
                    <Textarea
                      id="add-correct-answer"
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      placeholder="Enter the expected answer or grading criteria..."
                      className="mt-2"
                      rows={3}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="add-order-index" className="text-[#2B2B2B]">
                    Order Index
                  </Label>
                  <Input
                    id="add-order-index"
                    type="number"
                    min="0"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                    className="mt-2"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.question_text.trim() || !formData.correct_answer.trim()}
                    className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px]"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Question'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingQuestion(false)}
                    className="min-h-[48px]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      )}

      {/* Edit Question Dialog */}
      <Dialog open={editingQuestion !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2B2B2B]">Edit Question</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">Update question details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateQuestion} className="space-y-5 mt-4">
            <div>
              <Label htmlFor="edit-question-text" className="text-[#2B2B2B]">
                Question Text <span className="text-[#EF6161]">*</span>
              </Label>
              <Textarea
                id="edit-question-text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                className="mt-2 min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-question-type" className="text-[#2B2B2B]">
                  Question Type <span className="text-[#EF6161]">*</span>
                </Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value: QuizQuestionType) =>
                    setFormData({ ...formData, question_type: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-points" className="text-[#2B2B2B]">
                  Points
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            {(formData.question_type === 'multiple_choice' || formData.question_type === 'true_false') && (
              <>
                {formData.question_type === 'multiple_choice' && (
                  <div>
                    <Label className="text-[#2B2B2B]">Options <span className="text-[#EF6161]">*</span></Label>
                    <div className="space-y-2 mt-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#9CA3AF] w-6">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-correct-answer" className="text-[#2B2B2B]">
                    Correct Answer <span className="text-[#EF6161]">*</span>
                  </Label>
                  {formData.question_type === 'multiple_choice' ? (
                    <Select
                      value={(() => {
                        // Find the matching option and return the value with separator
                        const matchingOpt = formData.options
                          .map((opt, idx) => ({ value: opt, index: idx }))
                          .find(opt => opt.value === formData.correct_answer);
                        return matchingOpt ? `${formData.correct_answer}|||${matchingOpt.index}` : formData.correct_answer;
                      })()}
                      onValueChange={(value) => {
                        // Extract the actual value if it contains the index separator
                        const actualValue = value.includes('|||') ? value.split('|||')[0] : value;
                        setFormData({ ...formData, correct_answer: actualValue });
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.options
                          .map((opt, idx) => ({ value: opt, label: `${String.fromCharCode(65 + idx)}. ${opt}`, index: idx }))
                          .filter((opt) => opt.value.trim())
                          .map((opt, mapIdx) => (
                            <SelectItem key={`edit-option-${opt.index}-${mapIdx}`} value={`${opt.value}|||${opt.index}`}>
                              {opt.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={formData.correct_answer}
                      onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            )}

            {formData.question_type === 'short_answer' && (
              <div>
                <Label htmlFor="edit-correct-answer" className="text-[#2B2B2B]">
                  Expected Answer <span className="text-[#EF6161]">*</span>
                </Label>
                <Textarea
                  id="edit-correct-answer"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="mt-2"
                  rows={3}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit-order-index" className="text-[#2B2B2B]">
                Order Index
              </Label>
              <Input
                id="edit-order-index"
                type="number"
                min="0"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.question_text.trim() || !formData.correct_answer.trim()}
                className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                className="min-h-[48px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

