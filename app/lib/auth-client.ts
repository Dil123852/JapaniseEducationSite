'use client';

import { supabase } from './supabaseClient';
import { UserRole, UserProfile } from './auth-types';

// Client-side functions only
// Sign up with email/password only - no metadata
// User data (role, full_name) is stored in profiles table
export async function signUp(email: string, password: string, role: UserRole, fullName?: string) {
  // Sign up with email and password only - no metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Do NOT send role or full_name in metadata
    // All user data is stored in profiles table
  });

  if (error) throw error;

  // Profile creation is handled by database trigger automatically
  // The trigger creates a profile with role 'student' when a user signs up
  // We'll update the profile with full_name via API route after signup
  if (data.user && fullName) {
    // Wait a bit for the session to be established and trigger to run
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to update the profile via API route (server-side, handles RLS better)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'student', // All signups are students
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Could not update profile full_name immediately:', errorData);
        // Don't throw - profile exists, full_name can be updated later
      }
    } catch (err) {
      // Network error or other issue - not critical, profile exists
      console.warn('Could not update profile full_name immediately:', err);
      // Don't throw - profile exists, full_name can be updated later
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Wait for session to be established and cookies to be set
  // This ensures the server-side can read the session
  if (data.session) {
    // Small delay to ensure cookies are set
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify session is accessible
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Session not established. Please try again.');
    }
  }

  return data;
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // If it's a network error, still try to clear local session
      if (error.message.includes('fetch') || 
          error.message.includes('network') || 
          error.message.includes('Failed to fetch') ||
          error.name === 'AuthRetryableFetchError') {
        console.warn('Network error during sign out, clearing local session as fallback');
        // Clear local storage as fallback
        if (typeof window !== 'undefined') {
          // Clear all Supabase-related items
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
          // Also clear session storage
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        // Don't throw - we've cleared the session locally
        return;
      }
      throw error;
    }
  } catch (err: any) {
    // Handle network errors gracefully
    if (err?.message?.includes('fetch') || 
        err?.message?.includes('Failed to fetch') ||
        err?.name === 'AuthRetryableFetchError' ||
        err?.name === 'TypeError') {
      console.warn('Network error during sign out, clearing local session as fallback');
      if (typeof window !== 'undefined') {
        // Clear all Supabase-related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        // Also clear session storage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      // Don't throw - we've cleared the session locally
      return;
    }
    // Re-throw other errors
    throw err;
  }
}

// Client-side profile functions
export async function getCurrentUserProfileClient(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

