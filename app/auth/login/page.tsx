'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { signIn } from '@/app/lib/auth-client';
import { useI18n } from '@/app/lib/i18n/context';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import Link from 'next/link';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(data.email, data.password);
      
      // Use window.location for full page reload to ensure cookies are synced
      // This ensures the server-side dashboard page can read the session
      // The signIn function already waits for session to be established
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center sakura-gradient px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[24px] soft-shadow border border-[#E5E7EB] p-8 md:p-10 space-y-8">
          {/* Language Switcher */}
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-block mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F7DDE2] to-[#C2E2F5] flex items-center justify-center mx-auto">
                <FontAwesomeIcon icon={faCircle} className="text-2xl text-[#F7DDE2]" />
              </div>
            </div>
            <h1 className="text-3xl font-[500] text-[#2B2B2B] tracking-tight">
              {t.login}
            </h1>
            <p className="text-sm text-[#9CA3AF] font-light">
              Learn Japanese the Calm Way
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#EF6161] px-4 py-3 rounded-[10px] text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-[500] text-[#2B2B2B] mb-2">
                {t.email}
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#C2E2F5] focus:border-[#C2E2F5] text-base bg-white transition-all"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[#EF6161]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-[500] text-[#2B2B2B] mb-2">
                {t.password}
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#C2E2F5] focus:border-[#C2E2F5] text-base bg-white transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[#EF6161]">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C2E2F5] text-[#2B2B2B] py-3 rounded-[24px] font-[500] text-base hover:bg-[#B0D9F0] border border-[#E5E7EB] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] soft-shadow hover:shadow-md"
            >
              {isLoading ? 'Logging in...' : t.login}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center pt-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#9CA3AF]">
              {"Don't have an account?"}{' '}
              <Link href="/auth/signup" className="text-[#2B2B2B] font-[500] hover:text-[#C2E2F5] transition-colors">
                {t.signup}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

