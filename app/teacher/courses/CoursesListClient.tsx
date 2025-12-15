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
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Users,
  Key,
  Copy,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { CourseWithStats } from '@/app/lib/db/courses';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  courses: CourseWithStats[];
}

export default function CoursesListClient({ courses: initialCourses }: Props) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    enrollmentKey: '',
  });

  const generateEnrollmentKey = () => {
    // Generate a random 8-character alphanumeric key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 8; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, enrollmentKey: key });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.enrollmentKey.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          enrollmentKey: formData.enrollmentKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }

      const newCourse = await response.json();
      setCourses([newCourse, ...courses]);
      setIsCreating(false);
      setFormData({ title: '', description: '', enrollmentKey: '' });
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/teacher/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: editingCourse,
          title: formData.title,
          description: formData.description || undefined,
          enrollmentKey: formData.enrollmentKey || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      setCourses(
        courses.map((c) => (c.id === editingCourse ? { ...c, ...updatedCourse } : c))
      );
      setEditingCourse(null);
      setFormData({ title: '', description: '', enrollmentKey: '' });
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this course? This will also delete all course materials and student enrollments. This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/courses?courseId=${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      setCourses(courses.filter((c) => c.id !== courseId));
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to delete course');
    }
  };

  const copyEnrollmentKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openEditDialog = (course: CourseWithStats) => {
    setEditingCourse(course.id);
    setFormData({
      title: course.title,
      description: course.description || '',
      enrollmentKey: course.enrollment_key,
    });
  };

  const closeEditDialog = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', enrollmentKey: '' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 pb-20 md:pb-8 safe-area-bottom">
      {/* Mobile Header with Hamburger */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <TeacherMobileMenu />
        <h1 className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">Courses</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-2">Courses</h1>
        <p className="text-sm md:text-base text-[#9CA3AF]">Manage your courses and organize your teaching content</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] px-4 md:px-6 w-full sm:w-auto shadow-sm hover:shadow-md transition-all touch-target touch-feedback">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>Create Course</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E5E7EB] rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-[#2B2B2B] font-semibold">Create New Course</DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-[#9CA3AF]">
                Add a new course to start organizing your lessons
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-5 mt-4">
              <div>
                <Label htmlFor="create-title" className="text-sm font-medium text-[#2B2B2B]">
                  Course Title <span className="text-[#EF6161]">*</span>
                </Label>
                <Input
                  id="create-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Japanese Language Basics"
                  className="mt-2 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                  required
                />
              </div>

              <div>
                <Label htmlFor="create-description" className="text-sm font-medium text-[#2B2B2B]">
                  Description
                </Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the course..."
                  className="mt-2 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                  rows={4}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="create-key" className="text-sm font-medium text-[#2B2B2B]">
                    Enrollment Key <span className="text-[#EF6161]">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateEnrollmentKey}
                    className="text-xs border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] hover:border-[#C2E2F5]"
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="create-key"
                  value={formData.enrollmentKey}
                  onChange={(e) => setFormData({ ...formData, enrollmentKey: e.target.value.toUpperCase() })}
                  placeholder="e.g., JAPAN101"
                  className="mt-2 font-mono border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                  required
                  maxLength={20}
                />
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Students will use this key to enroll in your course
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !formData.enrollmentKey.trim()}
                  className="flex-1 bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="min-h-[48px] border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] hover:border-[#C2E2F5]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-0 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#9CA3AF]">Total Courses</CardTitle>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2E2F5]" />
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#2B2B2B]">{courses.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-0 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#9CA3AF]">Total Students</CardTitle>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2E2F5]" />
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#2B2B2B]">
              {courses.reduce((sum, c) => sum + (c.student_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-0 px-4 md:px-6 pt-4 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#9CA3AF]">Total Groups</CardTitle>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2E2F5]" />
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
            <div className="text-2xl sm:text-3xl font-bold text-[#2B2B2B]">
              {courses.reduce((sum, c) => sum + (c.group_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
          <CardContent className="py-12 sm:py-16 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#C2E2F5] opacity-50" />
            <h3 className="text-lg sm:text-xl font-medium text-[#2B2B2B] mb-2">No courses yet</h3>
            <p className="text-sm sm:text-base text-[#9CA3AF] mb-6">Create your first course to get started</p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] text-base shadow-sm hover:shadow-md transition-all touch-target touch-feedback"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-white border-[#E5E7EB] rounded-[18px] sm:rounded-[24px] soft-shadow hover:shadow-md active:shadow-sm transition-all group touch-feedback"
            >
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <BookOpen className="w-5 h-5 text-[#C2E2F5] flex-shrink-0 mt-0.5" />
                    <CardTitle className="text-base sm:text-lg md:text-xl text-[#2B2B2B] line-clamp-2 flex-1">
                      {course.title}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-target">
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-[#E5E7EB] rounded-lg">
                      <DropdownMenuLabel className="text-[#2B2B2B]">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                      <DropdownMenuItem onClick={() => openEditDialog(course)} className="text-[#2B2B2B] hover:bg-[#FCE7F3] cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-[#EF6161] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {course.description && (
                  <CardDescription className="text-sm sm:text-base text-[#9CA3AF] line-clamp-2 mt-2">
                    {course.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                {/* Enrollment Key */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-[#FAFAFA] rounded-[10px] border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2E2F5] flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-mono text-[#2B2B2B] truncate">
                      {course.enrollment_key}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyEnrollmentKey(course.enrollment_key)}
                    className="h-8 w-8 p-0 flex-shrink-0 hover:bg-[#FCE7F3] touch-target"
                  >
                    {copiedKey === course.enrollment_key ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E]" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C2E2F5]" />
                    <span className="text-[#2B2B2B] font-medium">
                      {course.student_count || 0}
                    </span>
                    <span className="text-[#9CA3AF]">students</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-[#E5E7EB] text-[#9CA3AF] bg-white">
                    {course.group_count || 0} groups
                  </Badge>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <Link href={`/teacher/courses/${course.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] text-sm sm:text-base shadow-sm hover:shadow-md transition-all touch-feedback">
                      View Course
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Course Dialog */}
      <Dialog open={editingCourse !== null} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E5E7EB] rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-[#2B2B2B] font-semibold">Edit Course</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-[#9CA3AF]">
              Update course details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCourse} className="space-y-5 mt-4">
            <div>
              <Label htmlFor="edit-title" className="text-sm font-medium text-[#2B2B2B]">
                Course Title <span className="text-[#EF6161]">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium text-[#2B2B2B]">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="edit-key" className="text-sm font-medium text-[#2B2B2B]">
                  Enrollment Key
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateEnrollmentKey}
                  className="text-xs border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] hover:border-[#C2E2F5]"
                >
                  Generate New
                </Button>
              </div>
              <Input
                id="edit-key"
                value={formData.enrollmentKey}
                onChange={(e) => setFormData({ ...formData, enrollmentKey: e.target.value.toUpperCase() })}
                className="mt-2 font-mono border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                maxLength={20}
              />
              <p className="text-xs text-[#9CA3AF] mt-1">
                Changing the enrollment key will require students to re-enroll
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex-1 bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                className="min-h-[48px] border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3] hover:border-[#C2E2F5]"
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

