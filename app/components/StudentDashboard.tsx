'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserProfileClient } from '@/app/lib/auth-client';
import { useI18n } from '@/app/lib/i18n/context';
import Link from 'next/link';

export default function StudentDashboard() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      await getCurrentUserProfileClient();
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/student/courses"
            className="bg-white p-8 rounded-[18px] soft-shadow border border-[#E5E7EB] hover:shadow-md hover:-translate-y-1 transition-all min-h-[160px] flex flex-col justify-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faBookOpen} className="text-xl text-[#2B2B2B]" />
            </div>
            <h2 className="text-xl font-[500] text-[#2B2B2B] mb-2">{t.myCourses}</h2>
            <p className="text-sm text-[#9CA3AF] font-light">View enrolled courses</p>
          </Link>

          <Link
            href="/student/enroll"
            className="bg-white p-8 rounded-[18px] soft-shadow border border-[#E5E7EB] hover:shadow-md hover:-translate-y-1 transition-all min-h-[160px] flex flex-col justify-center group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C2E2F5] to-[#CFE3C1] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faPlus} className="text-xl text-[#2B2B2B]" />
            </div>
            <h2 className="text-xl font-[500] text-[#2B2B2B] mb-2">{t.enrollCourse}</h2>
            <p className="text-sm text-[#9CA3AF] font-light">Enroll in a new course</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

