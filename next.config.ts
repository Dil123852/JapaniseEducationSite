import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Note: Source map warnings from @supabase/auth-js are suppressed
  // via a client-side script in layout.tsx. This is a known issue with
  // Next.js 16 + Turbopack + Supabase packages and doesn't affect functionality.
};

export default nextConfig;
