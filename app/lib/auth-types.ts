// Shared types for auth
export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
}

