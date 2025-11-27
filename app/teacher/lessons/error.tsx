'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lessons page error:', error);
  }, [error]);

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-[#EF6161]" />
            <CardTitle className="text-[#2B2B2B]">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#9CA3AF] text-sm">
            {error.message || 'An unexpected error occurred while loading lessons.'}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={reset}
              className="bg-[#4c8bf5] hover:bg-[#3a7ae0] text-white"
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/teacher'}
              className="border-[#E5E7EB] text-[#2B2B2B] hover:bg-[#FCE7F3]"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

