'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircle, 
  faUser, 
  faBook, 
  faUsers, 
  faGear, 
  faRightFromBracket,
  faChevronDown,
  faBars,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserProfileClient, signOut } from '@/app/lib/auth-client';
import { UserProfile } from '@/app/lib/auth-types';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const userProfile = await getCurrentUserProfileClient();
      setProfile(userProfile);
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.push('/auth/login');
  };

  // Hide navbar on teacher routes (they have their own sidebar)
  if (pathname?.startsWith('/teacher')) {
    return null;
  }

  // Hide navbar on student routes (they have their own sidebar)
  if (pathname?.startsWith('/student') || pathname === '/dashboard') {
    return null;
  }

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';

  // Student navigation items
  const studentNavItems: NavItem[] = [
    { href: '/student/courses', label: 'Lessons' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  // Teacher navigation - will be redesigned
  const teacherNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <>
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#F7DDE2] to-[#C2E2F5]"></div>

      {/* Main navbar */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faCircle} className="text-[#F7DDE2] text-sm" />
                </div>
                <span className="text-lg font-[500] text-[#2B2B2B] hidden sm:block">Sandali Sensei</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 rounded-[10px] text-sm font-[500] transition-all ${
                        isActive
                          ? 'text-[#2B2B2B]'
                          : 'text-[#9CA3AF] hover:text-[#2B2B2B] hover:bg-[#FCE7F3]'
                      }`}
                    >
                      {item.label}
                      {item.icon && (
                        <span className="ml-1 text-[#EF6161] font-bold">{item.icon}</span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#EF6161] rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - Profile */}
            {!isLoading && (
              <div className="flex items-center space-x-4">
                {profile ? (
                  <div className="relative" ref={dropdownRef}>
                    {/* Profile Avatar */}
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#C2E2F5] rounded-full transition-all hover:scale-105"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] border-2 border-[#E5E7EB] flex items-center justify-center text-sm font-[500] text-[#2B2B2B]">
                        {getInitials()}
                      </div>
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className={`w-3 h-3 text-[#9CA3AF] transition-transform ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-[14px] soft-shadow border border-[#E5E7EB] overflow-hidden animate-fadeIn">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#FAFAFA]">
                          <p className="text-sm font-[500] text-[#2B2B2B]">
                            {profile.full_name || 'User'}
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">{profile.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#FCE7F3] transition-colors"
                          >
                            <FontAwesomeIcon icon={faUser} className="mr-3 w-4 h-4" />
                            My Profile
                          </Link>
                          
                          {!isTeacher && (
                            <Link
                              href="/student/courses"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#FCE7F3] transition-colors"
                            >
                              <FontAwesomeIcon icon={faBook} className="mr-3 w-4 h-4" />
                              My Lessons
                            </Link>
                          )}

                          <Link
                            href="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#FCE7F3] transition-colors"
                          >
                            <FontAwesomeIcon icon={faGear} className="mr-3 w-4 h-4" />
                            Settings
                          </Link>

                          <div className="border-t border-[#E5E7EB] my-1"></div>

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-[#EF6161] hover:bg-[#FEF2F2] transition-colors"
                          >
                            <FontAwesomeIcon icon={faRightFromBracket} className="mr-3 w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-[10px] text-sm font-[500] text-[#2B2B2B] hover:bg-[#FCE7F3] transition-colors"
                  >
                    Login
                  </Link>
                )}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-[10px] text-[#2B2B2B] hover:bg-[#FCE7F3] transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={isMobileMenuOpen ? faXmark : faBars} 
                    className="w-5 h-5"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white animate-slideDown">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-[10px] text-sm font-[500] transition-colors ${
                      isActive
                        ? 'bg-[#FCE7F3] text-[#2B2B2B]'
                        : 'text-[#9CA3AF] hover:bg-[#FCE7F3] hover:text-[#2B2B2B]'
                    }`}
                  >
                    {item.label}
                    {item.icon && (
                      <span className="ml-1 text-[#EF6161] font-bold">{item.icon}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

