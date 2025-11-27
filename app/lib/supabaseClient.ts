'use client';

import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
╔══════════════════════════════════════════════════════════════╗
║  Missing Supabase Environment Variables                      ║
╠══════════════════════════════════════════════════════════════╣
║  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}                                    ║
║  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '✗ Missing'}                          ║
╠══════════════════════════════════════════════════════════════╣
║  Please create a .env.local file in your project root with:  ║
║                                                              ║
║  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url                  ║
║  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key                 ║
║                                                              ║
║  See SETUP.md for detailed instructions.                     ║
╚══════════════════════════════════════════════════════════════╝
  `;
  console.error(errorMessage);
}

// Create browser client with SSR cookie handling
// This ensures sessions are stored in cookies for server-side access
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
