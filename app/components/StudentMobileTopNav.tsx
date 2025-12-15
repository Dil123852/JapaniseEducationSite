'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookOpen, FileQuestion, TrendingUp } from 'lucide-react';

const mobileNavItems = [
  { href: '/student/lessons', label: 'My Lessons', icon: BookOpen },
  { href: '/student/quizzes', label: 'Quizzes', icon: FileQuestion },
  { href: '/student/progress', label: 'Progress', icon: TrendingUp },
];

export default function StudentMobileTopNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden sticky top-[64px] z-20 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {mobileNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap group flex items-center gap-2',
                  'hover:bg-[#FCE7F3] rounded-t-lg active:scale-[0.98]',
                  isActive
                    ? 'text-[#2B2B2B]'
                    : 'text-[#9CA3AF] hover:text-[#2B2B2B]'
                )}
                style={{
                  animation: `fadeInSlide 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#C2E2F5] rounded-t-full w-full"
                    style={{ animation: 'widthIn 0.3s ease-out' }}
                  />
                )}
                {!isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#C2E2F5] rounded-t-full opacity-0 group-hover:opacity-100 group-hover:w-full w-0 transition-all duration-300 ease-in-out" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes widthIn {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </nav>
  );
}

