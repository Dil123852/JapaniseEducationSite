'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, MessageSquare, Search, Sparkles, User, Settings, LogOut } from 'lucide-react';
import { getCurrentUserProfileClient, signOut } from '@/app/lib/auth-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAIAssistant } from '@/app/components/AIAssistantContext';

export default function StudentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { openDialog } = useAIAssistant();
  const [profile, setProfile] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const userProfile = await getCurrentUserProfileClient();
      setProfile(userProfile);
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const name = profile.full_name || profile.email || 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Search:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Ask AI button, Search bar */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 max-w-2xl">
            {/* Ask AI button */}
            <button
              onClick={openDialog}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, lessons..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2E2F5] focus:border-transparent text-sm bg-[#FAFAFA]"
                />
              </div>
            </form>

            {/* Mobile Search Icon */}
            <Link
              href="/student/search"
              className="md:hidden p-2 rounded-lg hover:bg-[#FCE7F3] transition-colors"
            >
              <Search className="w-5 h-5 text-[#2B2B2B]" />
            </Link>
          </div>

          {/* Right side - Notifications, Messages, Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <Link
              href="/student/notifications"
              className="relative p-2 rounded-lg hover:bg-[#FCE7F3] transition-colors"
            >
              <Bell className="w-5 h-5 text-[#2B2B2B]" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#EF6161] text-white text-xs rounded-full">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </Link>

            {/* Messages */}
            <Link
              href="/student/messages"
              className="relative p-2 rounded-lg hover:bg-[#FCE7F3] transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-[#2B2B2B]" />
              {unreadMessages > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#EF6161] text-white text-xs rounded-full">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
              )}
            </Link>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-[#FCE7F3] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] border-2 border-[#E5E7EB] flex items-center justify-center text-sm font-medium text-[#2B2B2B]">
                    {getInitials()}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-[#E5E7EB] rounded-lg shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href="/student/profile"
                    className="flex items-center gap-2 cursor-pointer text-[#2B2B2B] hover:bg-[#FCE7F3]"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-[#EF6161] hover:bg-[#FCE7F3] focus:bg-[#FCE7F3]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
