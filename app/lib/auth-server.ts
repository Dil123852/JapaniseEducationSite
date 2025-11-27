import { createClient } from './supabase-server';
import { User } from '@supabase/supabase-js';
import { UserProfile } from './auth-types';

// Server-side functions only
export async function getCurrentUser(): Promise<User | null> {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    try {
      // Log useful details from the error for debugging
      console.error('Error fetching profile:', {
        message: (error as any)?.message,
        details: (error as any)?.details,
        code: (error as any)?.code,
        hint: (error as any)?.hint,
        status: (error as any)?.status,
      });
    } catch (_) {
      console.error('Error fetching profile (unserializable):', error);
    }
    return null;
  }

  if (!data) {
    console.warn('No profile row found for userId:', userId);
    return null;
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getUserProfile(user.id);
}

