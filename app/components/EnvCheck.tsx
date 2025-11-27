'use client';

import { useEffect, useState } from 'react';

/**
 * Client-side component to check if Supabase environment variables are configured.
 * Shows a helpful error message if they're missing.
 */
export default function EnvCheck() {
  const [showError, setShowError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    url: boolean;
    key: boolean;
  } | null>(null);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Check environment variables (they should be available in the browser for NEXT_PUBLIC_* vars)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url === 'your_supabase_project_url' || key === 'your_supabase_anon_key') {
      setShowError(true);
      setErrorDetails({
        url: !url || url === 'your_supabase_project_url',
        key: !key || key === 'your_supabase_anon_key',
      });
    }
  }, []);

  if (!showError) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-2">Supabase Configuration Missing</h3>
            <p className="text-sm text-red-700 mb-3">
              Your Supabase environment variables are not configured correctly.
            </p>
            <div className="text-xs text-red-600 space-y-1 mb-3">
              {errorDetails?.url && (
                <div>✗ NEXT_PUBLIC_SUPABASE_URL is missing or not set</div>
              )}
              {errorDetails?.key && (
                <div>✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or not set</div>
              )}
            </div>
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded mb-3">
              <strong>Quick fix:</strong> Create a <code>.env.local</code> file in your project root with your Supabase credentials. See <code>SETUP.md</code> for details.
            </div>
            <button
              onClick={() => setShowError(false)}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

