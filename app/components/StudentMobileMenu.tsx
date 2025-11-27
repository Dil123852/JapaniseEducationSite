'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { signOut } from '@/app/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileQuestion,
  TrendingUp,
  FolderOpen,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: GraduationCap },
  { href: '/student/lessons', label: 'My Lessons', icon: BookOpen },
  { href: '/student/quizzes', label: 'My Quizzes', icon: FileQuestion },
  { href: '/student/progress', label: 'Progress', icon: TrendingUp },
  { href: '/student/resources', label: 'Resources', icon: FolderOpen },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/profile', label: 'Profile / Settings', icon: Settings },
];

export default function StudentMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 rounded-lg hover:bg-[#FCE7F3] transition-colors">
          <Menu className="w-6 h-6 text-[#2B2B2B]" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-[#2B2B2B]">Sandali Sensei</h2>
            </div>
            <p className="text-xs text-[#9CA3AF]">Student Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // For Dashboard (/dashboard), only match exactly. For other routes, match the route and its sub-routes
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' || pathname === '/dashboard/'
                : pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-[#EF6161] hover:bg-[#FEF2F2] w-full transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

