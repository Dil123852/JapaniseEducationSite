import { redirect } from 'next/navigation';
import { getCurrentUserProfile, getCurrentUser } from '@/app/lib/auth-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  // First check if user is authenticated
  const user = await getCurrentUser();
  
  if (!user) {
    // No authenticated user, redirect to login
    redirect('/auth/login');
  }

  // User is authenticated, now get their profile
  const profile = await getCurrentUserProfile();

  if (!profile) {
    // User exists but no profile - this shouldn't happen if trigger is set up
    // But if it does, redirect to complete profile page
    redirect('/auth/complete-profile');
  }

  // Redirect teachers to teacher dashboard
  if (profile.role === 'teacher') {
    redirect('/teacher');
  }

  const userName = profile.full_name || profile.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-[#2B2B2B]">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg text-[#9CA3AF]">
                Continue your learning journey
              </p>
            </div>
            <div className="hidden md:block w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] text-[#2B2B2B]">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="h-1 w-32 rounded-full bg-[#EF6161]"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Cards */}
            <Card className="bg-white border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2B2B2B]">
                  My Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-[#EF6161]">0</p>
                  <Link href="/student/courses">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3]"
                    >
                      View All
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2B2B2B]">
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-[#EF6161]">0%</p>
                  <div className="h-2 rounded-full bg-[#E5E7EB]">
                    <div 
                      className="h-full rounded-full transition-all bg-[#EF6161]"
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg text-[#2B2B2B]">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#9CA3AF]">
                  No recent activity
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-2 lg:col-span-3 bg-white border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-[#2B2B2B]">Quick Actions</CardTitle>
                <CardDescription className="text-[#9CA3AF]">
                  Get started with your learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Link href="/student/courses">
                    <Button className="bg-[#C2E2F5] text-[#2B2B2B] hover:bg-[#B0D9F0] border-none">
                      Browse Courses
                    </Button>
                  </Link>
                  <Link href="/student/enroll">
                    <Button 
                      variant="outline"
                      className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3]"
                    >
                      Enroll in Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
