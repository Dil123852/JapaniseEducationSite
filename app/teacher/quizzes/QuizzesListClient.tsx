'use client';

import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  FileQuestion,
  Edit,
  Trash2,
  MoreVertical,
  Lock,
  Unlock,
  Clock,
  Copy,
  CheckCircle2,
  Eye,
  Search,
  X,
} from 'lucide-react';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';
interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  password?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function QuizzesListClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    password: '',
  });

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/teacher/quizzes');
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          password: formData.password || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quiz');
      }

      const newQuiz = await response.json();
      setQuizzes((prev) => [newQuiz, ...prev]);
      setIsCreating(false);
      setFormData({ title: '', description: '', duration: '', password: '' });
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/quizzes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: editingQuiz.id,
          title: formData.title,
          description: formData.description || undefined,
          duration: formData.duration ? parseInt(formData.duration) : undefined,
          password: formData.password || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quiz');
      }

      const updatedQuiz = await response.json();
      setQuizzes((prev) => prev.map((q) => (q.id === updatedQuiz.id ? updatedQuiz : q)));
      setEditingQuiz(null);
      setFormData({ title: '', description: '', duration: '', password: '' });
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to update quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/quizzes?quizId=${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete quiz');
      }

      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete quiz');
    }
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(password);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const openEditDialog = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      duration: quiz.duration?.toString() || '',
      password: quiz.password || '',
    });
  };

  const closeEditDialog = () => {
    setEditingQuiz(null);
    setFormData({ title: '', description: '', duration: '', password: '' });
  };

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter((quiz) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(query) ||
      (quiz.description && quiz.description.toLowerCase().includes(query)) ||
      (quiz.password && quiz.password.toLowerCase().includes(query))
    );
  });

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
        {/* Mobile Header with Hamburger */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <TeacherMobileMenu />
          <h1 className="text-xl font-bold text-[#2B2B2B]">Quizzes</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">Quizzes</h1>
          <p className="text-[#9CA3AF] text-sm md:text-base">
            Create and manage quizzes with password protection
          </p>
        </div>
        <div className="text-center py-12 text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <TeacherMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B]">Quizzes</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">Quizzes</h1>
        <p className="text-[#9CA3AF]">Create and manage quizzes with password protection</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-end md:justify-end">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px] px-4 md:px-6 w-full md:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden md:inline">Create Quiz</span>
              <span className="md:hidden">Create Quiz</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2B2B2B]">Create New Quiz</DialogTitle>
              <DialogDescription className="text-[#9CA3AF]">
                Add a new quiz to your course with optional password protection
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateQuiz} className="space-y-5 mt-4">
              <div>
                <Label htmlFor="create-title" className="text-[#2B2B2B]">
                  Quiz Title <span className="text-[#EF6161]">*</span>
                </Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Midterm Exam - Chapter 5"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="create-description" className="text-[#2B2B2B]">
                  Description
                </Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the quiz..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-duration" className="text-[#2B2B2B]">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="create-duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 60"
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="create-password" className="text-[#2B2B2B]">
                      Password (Optional)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="text-xs"
                    >
                      Generate
                    </Button>
                  </div>
                  <Input
                    id="create-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value.toUpperCase() })}
                    placeholder="Leave empty for no password"
                    className="mt-2 font-mono"
                    maxLength={20}
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Students will need this password to attempt the quiz
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Quiz'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="min-h-[48px]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none z-10" />
        <Input
          type="text"
          placeholder="Search quizzes by title, description, or password..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 md:h-11 text-base md:text-sm border-[#E5E7EB] bg-white focus:border-[#4c8bf5] focus:ring-2 focus:ring-[#4c8bf5]/20 w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-[#FCE7F3] transition-colors z-10"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="text-sm text-[#9CA3AF] mt-2">
          Found {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'}
        </p>
      )}

      {/* Quizzes List */}
      {isLoading ? (
        <Card className="bg-white border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <div className="text-[#9CA3AF]">Loading quizzes...</div>
          </CardContent>
        </Card>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="bg-white border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF] opacity-50" />
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-2">
              {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
            </h3>
            <p className="text-[#9CA3AF] mb-4">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first quiz to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px]"
              >
                Create Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Card Layout */}
          <div className="md:hidden space-y-4">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white border-[#E5E7EB]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link href={`/teacher/quizzes/${quiz.id}/questions`}>
                        <CardTitle className="text-base font-semibold text-[#2B2B2B] mb-1 line-clamp-2 hover:text-[#4c8bf5] transition-colors cursor-pointer">
                          {quiz.title}
                        </CardTitle>
                      </Link>
                      {quiz.description && (
                        <CardDescription className="text-sm text-[#9CA3AF] line-clamp-2">
                          {quiz.description}
                        </CardDescription>
                      )}
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
                        <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <Link href={`/teacher/quizzes/${quiz.id}/questions`}>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Manage Questions
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="text-[#EF6161]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    {quiz.duration && (
                      <div className="flex items-center gap-1 text-[#9CA3AF]">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.duration} min</span>
                      </div>
                    )}
                    <div className="text-[#9CA3AF] text-xs">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {quiz.password ? (
                        <>
                          <Lock className="w-4 h-4 text-[#EF6161] flex-shrink-0" />
                          <span className="font-mono text-sm text-[#2B2B2B] truncate">
                            {quiz.password}
                          </span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                          <span className="text-xs text-[#9CA3AF]">No password</span>
                        </>
                      )}
                    </div>
                    {quiz.password && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPassword(quiz.password!)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        {copiedPassword === quiz.password ? (
                          <CheckCircle2 className="w-4 h-4 text-[#7fd1a1]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#9CA3AF]" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table Layout */}
          <Card className="hidden md:block bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-[#2B2B2B]">All Quizzes</CardTitle>
              <CardDescription className="text-[#9CA3AF]">
                Manage your standalone quizzes with password protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E5E7EB]">
                      <TableHead className="text-[#9CA3AF]">Title</TableHead>
                      <TableHead className="text-[#9CA3AF]">Description</TableHead>
                      <TableHead className="text-[#9CA3AF]">Duration</TableHead>
                      <TableHead className="text-[#9CA3AF]">Password</TableHead>
                      <TableHead className="text-[#9CA3AF]">Created</TableHead>
                      <TableHead className="text-[#9CA3AF] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="border-[#E5E7EB]">
                      <TableCell className="font-medium text-[#2B2B2B]">
                        <Link
                          href={`/teacher/quizzes/${quiz.id}/questions`}
                          className="hover:text-[#4c8bf5] transition-colors"
                        >
                          {quiz.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[#9CA3AF] text-sm max-w-xs truncate">
                        {quiz.description || '-'}
                      </TableCell>
                      <TableCell className="text-[#9CA3AF]">
                        {quiz.duration ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{quiz.duration} min</span>
                          </div>
                        ) : (
                          <span className="text-xs">No limit</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {quiz.password ? (
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#EF6161]" />
                            <span className="font-mono text-sm text-[#2B2B2B]">
                              {quiz.password}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPassword(quiz.password!)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedPassword === quiz.password ? (
                                <CheckCircle2 className="w-3 h-3 text-[#7fd1a1]" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#9CA3AF]" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[#9CA3AF]">
                            <Unlock className="w-4 h-4" />
                            <span className="text-xs">No password</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-[#9CA3AF] text-sm">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <Link href={`/teacher/quizzes/${quiz.id}/questions`}>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Manage Questions
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="text-[#EF6161]"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Quiz Dialog */}
      <Dialog open={editingQuiz !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2B2B2B]">Edit Quiz</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">Update quiz details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateQuiz} className="space-y-5 mt-4">
            <div>
              <Label htmlFor="edit-title" className="text-[#2B2B2B]">
                Quiz Title <span className="text-[#EF6161]">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-[#2B2B2B]">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration" className="text-[#2B2B2B]">
                  Duration (minutes)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="edit-password" className="text-[#2B2B2B]">
                    Password
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePassword}
                    className="text-xs"
                  >
                    Generate New
                  </Button>
                </div>
                <Input
                  id="edit-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value.toUpperCase() })}
                  className="mt-2 font-mono"
                  maxLength={20}
                  placeholder="Leave empty to remove password"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
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

