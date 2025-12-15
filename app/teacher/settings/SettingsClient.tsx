'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Globe, Bell, Palette, Save, Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUserProfileClient, signOut } from '@/app/lib/auth-client';
import type { UserProfile } from '@/app/lib/auth-types';
import TeacherMobileMenu from '@/app/components/TeacherMobileMenu';

interface SettingsClientProps {
  initialProfile: UserProfile;
}

export default function SettingsClient({ initialProfile }: SettingsClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [email, setEmail] = useState(initialProfile.email);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Site settings
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    // Load updated profile
    const loadProfile = async () => {
      const updatedProfile = await getCurrentUserProfileClient();
      if (updatedProfile) {
        setProfile(updatedProfile);
        setFullName(updatedProfile.full_name || '');
        setEmail(updatedProfile.email);
      }
    };
    loadProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile({ ...profile, full_name: fullName });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiteSettingsSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save site settings to localStorage (or API if you have a preferences table)
      const settings = {
        language,
        theme,
        emailNotifications,
        pushNotifications,
      };
      localStorage.setItem('siteSettings', JSON.stringify(settings));

      setMessage({ type: 'success', text: 'Site settings saved successfully!' });
      
      // Apply theme if changed
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load saved site settings
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setLanguage(settings.language || 'en');
        setTheme(settings.theme || 'light');
        setEmailNotifications(settings.emailNotifications !== false);
        setPushNotifications(settings.pushNotifications !== false);
      } catch (e) {
        console.error('Failed to load site settings:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0 safe-area-bottom">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Mobile Header with Hamburger */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <TeacherMobileMenu />
          <h1 className="text-xl sm:text-2xl font-bold text-[#2B2B2B]">Settings</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2B2B2B] mb-2">
            Settings
          </h1>
          <p className="text-sm md:text-base text-[#9CA3AF]">
            Manage your profile and application preferences
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-[10px] text-sm sm:text-base ${
              message.type === 'success'
                ? 'bg-[#F0FDF4] border border-[#CFE3C1] text-[#166534]'
                : 'bg-[#FEF2F2] border border-[#F7DDE2] text-[#991B1B]'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Profile Settings */}
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#2B2B2B]" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#2B2B2B]">Profile Settings</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#9CA3AF]">
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-[#2B2B2B]">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 sm:pl-12 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#2B2B2B]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="pl-10 sm:pl-12 bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF] text-base cursor-not-allowed rounded-[10px]"
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF]">Email cannot be changed</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all touch-target touch-feedback disabled:opacity-50"
                >
                  {isLoading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-[#2B2B2B]" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#2B2B2B]">Change Password</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#9CA3AF]">
                    Update your password to keep your account secure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-[#2B2B2B]">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 sm:pl-12 pr-10 sm:pr-12 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#2B2B2B] touch-target"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-[#2B2B2B]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 sm:pl-12 pr-10 sm:pr-12 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#2B2B2B] touch-target"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#2B2B2B]">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#9CA3AF]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 sm:pl-12 pr-10 sm:pr-12 border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] text-base"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#2B2B2B] touch-target"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all touch-target touch-feedback disabled:opacity-50"
                >
                  {isLoading ? (
                    <>Changing Password...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Site Settings */}
          <Card className="bg-white border-[#E5E7EB] rounded-[24px] soft-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#2B2B2B]" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#2B2B2B]">Site Settings</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#9CA3AF]">
                    Customize your application preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="language" className="text-sm font-medium text-[#2B2B2B] flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#C2E2F5]" />
                        Language
                      </Label>
                      <p className="text-xs text-[#9CA3AF]">Select your preferred language</p>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full sm:w-[140px] md:w-[180px] border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB] rounded-lg">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                        <SelectItem value="es">Español (Spanish)</SelectItem>
                        <SelectItem value="fr">Français (French)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-[#E5E7EB]" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="theme" className="text-sm font-medium text-[#2B2B2B] flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#C2E2F5]" />
                        Theme
                      </Label>
                      <p className="text-xs text-[#9CA3AF]">Choose your preferred theme</p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-full sm:w-[140px] md:w-[180px] border-[#E5E7EB] focus:border-[#C2E2F5] focus:ring-2 focus:ring-[#C2E2F5]/20 rounded-[10px] min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E7EB] rounded-lg">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-[#E5E7EB]" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label htmlFor="emailNotifications" className="text-sm font-medium text-[#2B2B2B] flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#C2E2F5] flex-shrink-0" />
                        Email Notifications
                      </Label>
                      <p className="text-xs text-[#9CA3AF]">Receive email notifications about important updates</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      className="flex-shrink-0"
                    />
                  </div>

                  <Separator className="bg-[#E5E7EB]" />

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label htmlFor="pushNotifications" className="text-sm font-medium text-[#2B2B2B] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#C2E2F5] flex-shrink-0" />
                        Push Notifications
                      </Label>
                      <p className="text-xs text-[#9CA3AF]">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSiteSettingsSave}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#C2E2F5] to-[#F7DDE2] hover:from-[#B0D9F0] hover:to-[#F0D1D8] text-[#2B2B2B] font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all touch-target touch-feedback disabled:opacity-50"
                >
                  {isLoading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="bg-white border-[#EF6161]/30 rounded-[24px] soft-shadow bg-gradient-to-br from-[#FEF2F2]/30 to-white">
            <CardHeader className="p-4 sm:p-6 border-b border-[#EF6161]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EF6161] to-[#EF4444] flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-[#2B2B2B]">Account Actions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-[#9CA3AF]">
                    Manage your account session
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="space-y-4">
                <p className="text-sm text-[#9CA3AF]">
                  Sign out of your account. You'll need to sign in again to access your courses and materials.
                </p>
                <Button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to logout?')) return;
                    setIsLoggingOut(true);
                    try {
                      await signOut();
                      router.push('/auth/login');
                    } catch (error: any) {
                      console.error('Logout error:', error);
                      setMessage({ type: 'error', text: 'Failed to logout. Please try again.' });
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="w-full sm:w-auto bg-[#EF6161] hover:bg-[#EF4444] text-white font-medium min-h-[48px] shadow-sm hover:shadow-md transition-all touch-target touch-feedback disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>Logging out...</>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

