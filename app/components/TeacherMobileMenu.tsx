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
  BookOpen,
  Video,
  FileText,
  Users,
  FileQuestion,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const menuItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Courses', icon: GraduationCap },
  { href: '/teacher/resources', label: 'Resources', icon: Video },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/quizzes', label: 'Quizzes', icon: FileQuestion },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/teacher/communication', label: 'Communication', icon: MessageSquare },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

export default function TeacherMobileMenu() {
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
          <div className="py-4 pl-4 pr-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="SAKURA DREAM" 
                className="h-8 w-8 object-contain flex-shrink-0"
              />
              <img 
                src="/site-name.png" 
                alt="SAKURA DREAM" 
                className="h-6 w-auto object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // For Dashboard (/teacher), only match exactly. For other routes, match the route and its sub-routes
              const isActive = item.href === '/teacher' 
                ? pathname === '/teacher' || pathname === '/teacher/'
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

