'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'Courses', icon: GraduationCap },
  { href: '/teacher/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

export default function TeacherMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
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
                'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-all min-w-0',
                isActive
                  ? 'text-[#4c8bf5]'
                  : 'text-[#9CA3AF]'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#4c8bf5] rounded-t-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

