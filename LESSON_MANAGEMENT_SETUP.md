# Lesson Management System - Setup Guide

## Overview

This is a **professional, modern lesson management system** built with Next.js, Tailwind CSS, and shadcn/ui. It provides a clean, sidebar-based editor for teachers to create and manage structured lessons with subtopics containing videos, PDFs, and quizzes.

## Features

✅ **Lesson Creation**
- Create lessons with title, grade, subject, description, and thumbnail
- Organize lessons by course
- Edit lesson details anytime

✅ **Subtopic Management**
- Add multiple subtopics to each lesson
- Collapsible sidebar navigation
- Reorder subtopics (drag-and-drop coming soon)

✅ **Resource Management**
- **Videos**: Add YouTube links or video IDs
- **PDFs**: Upload documents via URL
- **Quizzes**: Create multiple choice, structured, or short answer questions

✅ **Modern UI/UX**
- Sidebar-based lesson editor
- Clean, professional design
- Mobile-responsive layout
- Smooth animations and transitions

## Database Schema

The system uses the existing database schema. No additional tables are required! The following tables are used:

- `lessons` - Main lesson data
- `subtopics` - Lesson subtopics
- `videos` - Video content (linked to subtopics)
- `pdfs` - PDF documents (linked to subtopics)
- `subtopic_questions` - Quiz questions (linked to subtopics)

## API Routes

### `/api/teacher/lessons`
- `POST` - Create a new lesson
- `PATCH` - Update lesson details
- `DELETE` - Delete a lesson

### `/api/teacher/subtopics`
- `POST` - Create a new subtopic
- `PATCH` - Update subtopic details
- `DELETE` - Delete a subtopic

### `/api/teacher/subtopic-content`
- `POST` - Add content (video, PDF, or question) to a subtopic
- `GET` - Fetch all content for a subtopic

## Pages

### `/teacher/lessons`
- Lists all lessons organized by course
- Shows lesson statistics
- Create new lessons via dialog

### `/teacher/lessons/[lessonId]`
- Sidebar-based lesson editor
- Left sidebar: Lesson outline with subtopics
- Right panel: Content management (videos, PDFs, quizzes)
- Tab-based interface for different content types

## Usage

1. **Navigate to Lessons**: Go to `/teacher/lessons`
2. **Create a Lesson**: Click "Create Lesson" button
   - Select a course
   - Enter lesson details
   - Add optional thumbnail URL
3. **Edit Lesson**: Click on a lesson card to open the editor
4. **Add Subtopics**: Click "Add Subtopic" in the sidebar
5. **Manage Content**: Select a subtopic, then use the tabs to add:
   - Videos (YouTube links)
   - PDFs (document URLs)
   - Quiz questions

## Future Enhancements

- [ ] Drag-and-drop reordering for subtopics
- [ ] Drag-and-drop reordering for content items
- [ ] Video upload (currently supports YouTube links)
- [ ] PDF upload (currently supports URLs)
- [ ] Question bank/reuse functionality
- [ ] Bulk operations
- [ ] Lesson templates
- [ ] Preview mode for students

## Mobile Responsiveness

The system is fully responsive:
- Sidebar collapses on mobile
- Cards stack vertically
- Touch-friendly buttons (minimum 48px height)
- Optimized spacing and typography

## Color Palette

- Primary Blue: `#4c8bf5`
- Background: `#FAFAFA`
- Cards: White with `#E5E7EB` borders
- Text: `#2B2B2B` (primary), `#9CA3AF` (secondary)
- Accent: `#EF6161` (errors/delete)

## Components Used

- `shadcn/ui` components (Card, Button, Dialog, Input, etc.)
- `lucide-react` icons
- Custom components for content management

## Notes

- All API routes include authentication checks
- Teachers can only manage their own courses/lessons
- Content is automatically linked to subtopics and courses
- Order indices are maintained for proper sequencing

