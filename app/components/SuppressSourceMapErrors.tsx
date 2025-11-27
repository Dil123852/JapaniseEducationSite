'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless source map warnings from node_modules (like @supabase/auth-js)
 * in development. These warnings don't affect functionality and are a known issue
 * with Next.js 16 + Turbopack + some packages.
 */
export default function SuppressSourceMapErrors() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      
      console.error = function(...args: any[]) {
        // Don't suppress React internal errors
        const message = args.join(' ');
        if (
          message.includes('Internal React error') ||
          message.includes('Expected static flag') ||
          message.includes('React team')
        ) {
          // Always show React internal errors
          return originalError.apply(console, args);
        }
        
        // Suppress source map warnings from Supabase and other node_modules
        if (
          message.includes('Invalid source map') ||
          message.includes('sourceMapURL could not be parsed') ||
          (message.includes('@supabase') && message.includes('source map'))
        ) {
          // Silently ignore these warnings
          return;
        }
        
        // Call original error for everything else
        return originalError.apply(console, args);
      };

      // Cleanup on unmount
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return null;
}

