'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Video,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  LayoutDashboard,
  FileQuestion,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { signOut } from '@/app/lib/auth-client';

const navItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Courses', icon: GraduationCap },
  { href: '/teacher/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/teacher/resources', label: 'Resources', icon: Video },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/quizzes', label: 'Quizzes', icon: FileQuestion },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/teacher/communication', label: 'Communication', icon: MessageSquare },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

export default function TeacherSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E5E7EB] flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <h2 className="text-xl font-semibold text-[#2B2B2B]">Sandali Sensei</h2>
        <p className="text-xs text-[#9CA3AF] mt-1">Teacher Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // For Dashboard (/teacher), only match exactly. For other routes, match the route and its sub-routes
          const isActive = item.href === '/teacher' 
            ? pathname === '/teacher' || pathname === '/teacher/'
            : pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#C2E2F5] text-[#2B2B2B]'
                  : 'text-[#9CA3AF] hover:bg-[#FCE7F3] hover:text-[#2B2B2B]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#EF6161] hover:bg-[#FEF2F2] w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

