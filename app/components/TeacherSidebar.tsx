'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  Video,
  Users,
  FileQuestion,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Courses', icon: GraduationCap },
  { href: '/teacher/resources', label: 'Resources', icon: Video },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/quizzes', label: 'Quizzes', icon: FileQuestion },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/teacher/communication', label: 'Communication', icon: MessageSquare },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Desktop Sidebar - Collapsible Hover Drawer */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] flex-col z-40 transition-all duration-300 ease-in-out"
        style={{ width: isHovered ? '250px' : '60px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo/Header - Only show when expanded */}
        {isHovered && (
          <Link href="/teacher" className="px-15 py-4 pl-2 border-b border-[#E5E7EB] transition-opacity duration-300 ease-in-out block hover:opacity-80">
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
          </Link>
        )}

        {/* Icon-only logo when collapsed */}
        {!isHovered && (
          <Link href="/teacher" className="p-3 border-b border-[#E5E7EB] flex items-center justify-center hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="SAKURA DREAM" 
              className="w-8 h-8 object-contain"
            />
          </Link>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
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
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out group relative',
                  isActive
                    ? 'bg-[#C2E2F5] text-[#2B2B2B]'
                    : 'text-[#9CA3AF] hover:bg-[#FCE7F3] hover:text-[#2B2B2B]',
                  !isHovered && 'justify-center'
                )}
                title={!isHovered ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={cn(
                    'transition-opacity duration-300 ease-in-out whitespace-nowrap',
                    isHovered
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4 w-0 overflow-hidden'
                  )}
                >
                  {item.label}
                </span>
                {!isHovered && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C2E2F5] rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

