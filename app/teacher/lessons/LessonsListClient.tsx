'use client';

import { useState } from 'react';
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
  Plus,
  BookOpen,
  Edit,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  grade?: string;
  subject?: string;
  thumbnail_url?: string;
  order_index: number;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Props {
  courses: Course[];
}

export default function LessonsListClient({ courses }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    subject: '',
    thumbnailUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          ...formData,
          thumbnailUrl: formData.thumbnailUrl || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      router.refresh();
      setIsCreating(false);
      setFormData({ title: '', description: '', grade: '', subject: '', thumbnailUrl: '' });
      setSelectedCourse('');
    } catch (error: any) {
      alert(error.message || 'Failed to create lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <TeacherMobileMenu />
        <h1 className="text-xl font-bold text-[#2B2B2B]">Lessons</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">Lessons</h1>
        <p className="text-[#9CA3AF]">Manage your lessons and learning content</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-end md:justify-end">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px] px-4 md:px-6 w-full md:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden md:inline">Create Lesson</span>
              <span className="md:hidden">Create Lesson</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#2B2B2B]">Create New Lesson</DialogTitle>
              <DialogDescription className="text-[#9CA3AF]">
                Add a new lesson to your course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLesson} className="space-y-5 mt-4">
              <div>
                <Label htmlFor="course" className="text-[#2B2B2B]">
                  Course <span className="text-[#EF6161]">*</span>
                </Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title" className="text-[#2B2B2B]">
                  Lesson Title <span className="text-[#EF6161]">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Japanese Grammar"
                  className="mt-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade" className="text-[#2B2B2B]">Grade / Level</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., Beginner, N5"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-[#2B2B2B]">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Grammar, Vocabulary"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-[#2B2B2B]">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what students will learn..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="thumbnail" className="text-[#2B2B2B]">
                  Thumbnail Image URL (Optional)
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedCourse || !formData.title.trim()}
                  className="flex-1 bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white min-h-[48px]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Lesson'}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-white border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{totalLessons}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">{courses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#E5E7EB]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-sm font-medium text-[#9CA3AF]">
              Average per Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-[#2B2B2B]">
              {courses.length > 0 ? Math.round(totalLessons / courses.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons by Course */}
      {courses.length === 0 ? (
        <Card className="bg-white border-[#E5E7EB]">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#9CA3AF] opacity-50" />
            <h3 className="text-lg font-medium text-[#2B2B2B] mb-2">No courses yet</h3>
            <p className="text-[#9CA3AF] mb-4">Create a course first to add lessons</p>
            <Link href="/teacher/courses/create">
              <Button className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white">
                Create Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white border-[#E5E7EB]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg md:text-xl text-[#2B2B2B] mb-1">
                      {course.title}
                    </CardTitle>
                    {course.description && (
                      <CardDescription className="text-[#9CA3AF]">
                        {course.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className="bg-[#C2E2F5] text-[#2B2B2B]">
                    {course.lessons.length} {course.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-[#9CA3AF]">
                    <p className="mb-4">No lessons in this course yet</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        setIsCreating(true);
                      }}
                      className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] min-h-[48px] text-base md:text-sm"
                    >
                      <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" />
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/teacher/lessons/${lesson.id}`}
                        className="group"
                      >
                        <Card className="bg-[#FAFAFA] border-[#E5E7EB] hover:border-[#C2E2F5] hover:shadow-md transition-all h-full">
                          <CardContent className="p-4">
                            {lesson.thumbnail_url ? (
                              <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-[#E5E7EB]">
                                <img
                                  src={lesson.thumbnail_url}
                                  alt={lesson.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-32 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center mb-3">
                                <BookOpen className="w-8 h-8 text-[#2B2B2B] opacity-50" />
                              </div>
                            )}
                            <h3 className="font-semibold text-[#2B2B2B] mb-2 group-hover:text-[#4c8bf5] transition-colors line-clamp-2">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {lesson.grade && (
                                <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                                  {lesson.grade}
                                </Badge>
                              )}
                              {lesson.subject && (
                                <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF]">
                                  {lesson.subject}
                                </Badge>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-3">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#9CA3AF]">
                                Order: {lesson.order_index}
                              </span>
                              <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#4c8bf5] transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedCourse(course.id);
                        setIsCreating(true);
                      }}
                      className="group"
                    >
                      <Card className="bg-[#FAFAFA] border-2 border-dashed border-[#E5E7EB] hover:border-[#C2E2F5] transition-all h-full flex items-center justify-center min-h-[200px]">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#C2E2F5] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#4c8bf5] transition-colors">
                            <Plus className="w-6 h-6 text-[#2B2B2B] group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-[#2B2B2B]">Add Lesson</p>
                        </CardContent>
                      </Card>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

