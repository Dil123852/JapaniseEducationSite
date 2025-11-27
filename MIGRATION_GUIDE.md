# Migration Guide: Remove Metadata, Use Profiles Table Only

## Overview

This update removes user data (role, full_name) from Supabase auth metadata and stores everything in the `profiles` table instead.

## What Changed

### Before
- User role and full_name were stored in `auth.users.raw_user_meta_data`
- Data was sent during signup via `options.data`

### After
- User role and full_name are stored ONLY in `profiles` table
- No metadata is sent during signup
- All role-based logic uses the `profiles` table

## Database Updates Required

### Step 1: Add INSERT Policy to Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow users to create their own profile after signup
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**OR** use the complete updated schema from `supabase-schema-updated.sql`

### Step 2: Verify Your Schema

Make sure your `profiles` table has:
- `id` (UUID, references auth.users)
- `email` (TEXT)
- `role` (TEXT, CHECK constraint: 'teacher' or 'student')
- `full_name` (TEXT, nullable)
- `created_at` and `updated_at` timestamps

## Code Changes

### ✅ Already Updated

1. **`app/lib/auth-client.ts`**
   - Removed `options.data` from `signUp()` function
   - Profile creation happens after signup in the `profiles` table

2. **`supabase-schema.sql`**
   - Added INSERT policy for profiles table

## How It Works Now

### Signup Flow

1. User signs up with email/password only
   ```typescript
   supabase.auth.signUp({ email, password })
   // NO metadata sent
   ```

2. After successful signup, profile is created in `profiles` table
   ```typescript
   supabase.from('profiles').insert({
     id: user.id,
     email: user.email,
     role: 'student' | 'teacher',
     full_name: '...'
   })
   ```

### Authentication Flow

1. User signs in with email/password
2. App fetches user profile from `profiles` table
3. Role-based access control uses `profiles.role`

### Complete Profile Flow

If a user signs up but profile creation fails, they'll be redirected to `/auth/complete-profile` where they can:
- Select their role (teacher/student)
- Enter their full name
- Profile is created via the API route (which uses RLS policies)

## Testing Checklist

- [ ] Run the updated schema SQL in Supabase
- [ ] Test new user signup (should create profile in profiles table)
- [ ] Test login (should fetch role from profiles table)
- [ ] Test complete profile page (if profile missing)
- [ ] Verify no data in `auth.users.raw_user_meta_data` (except default fields)

## Important Notes

- **No metadata**: Role and full_name are NOT stored in auth metadata
- **Profiles table is source of truth**: All role checks use `profiles.role`
- **RLS policies**: Ensure INSERT policy is added for profiles table
- **Existing users**: If you have existing users, you may need to migrate their metadata to profiles table

## Migration for Existing Users

If you have existing users with data in metadata, run this SQL to migrate:

```sql
-- Migrate existing user metadata to profiles table
INSERT INTO profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'role', 'student')::text as role,
  COALESCE(raw_user_meta_data->>'full_name', '')::text as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

