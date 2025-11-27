# How to Create Teacher Accounts

## Overview

Student accounts can be created through the signup page and will automatically get a profile with role "student" via database trigger. Teacher accounts must be created directly in Supabase.

## Automatic Profile Creation

**Important**: A database trigger automatically creates a profile entry with role "student" whenever a new user is created in Supabase Authentication. See `AUTO_CREATE_PROFILE_TRIGGER.sql` for details.

## Method 1: Create Teacher via Supabase Dashboard

### Step 1: Create User in Supabase Auth

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Create new user"**
4. Fill in:
   - **Email**: teacher's email address
   - **Password**: Set a temporary password (teacher can change it later)
   - **Auto Confirm User**: ✅ Check this (so they can login immediately)
5. Click **"Create user"**

### Step 2: Update Profile Role to Teacher

After creating the user, the trigger will automatically create a profile with role "student". You need to update it to "teacher":

1. Go to **Table Editor** → **profiles**
2. Find the row with the teacher's email
3. Click **"Edit row"**
4. Change **role** from `student` to `teacher`
5. Update **full_name** if needed
6. Click **"Save"**

**OR** use SQL:

```sql
-- Replace 'teacher@example.com' with the teacher's email
UPDATE profiles 
SET role = 'teacher', full_name = 'Teacher Name'
WHERE email = 'teacher@example.com';
```

## Method 2: Create Teacher via SQL (Recommended)

This method creates both the auth user and profile in one go:

```sql
-- Step 1: Create auth user (you'll need to do this via Dashboard or Admin API)
-- The user will be created with email/password in auth.users

-- Step 2: After user is created, get their ID and run:
-- Replace 'user-uuid-here' with the actual user ID from auth.users
-- Replace 'teacher@example.com' with the teacher's email
-- Replace 'Teacher Name' with the teacher's full name

-- Option A: Update the auto-created profile
UPDATE profiles 
SET role = 'teacher', full_name = 'Teacher Name'
WHERE id = 'user-uuid-here';

-- Option B: Insert profile with teacher role (if trigger hasn't run yet)
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'user-uuid-here',  -- Get this from auth.users table
  'teacher@example.com',
  'teacher',
  'Teacher Name'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'teacher', full_name = 'Teacher Name';
```

## Method 3: Using Supabase Admin API (Programmatic)

If you want to create teachers programmatically, you can use the Supabase Admin API:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create teacher user and profile
async function createTeacher(email: string, password: string, fullName: string) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm
  });

  if (authError) throw authError;

  // 2. Update profile to teacher (trigger will create student profile first)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      role: 'teacher',
      full_name: fullName,
    })
    .eq('id', authData.user.id);

  if (profileError) throw profileError;

  return authData.user;
}
```

## Important Notes

- **Students**: Automatically get a profile with role "student" when they sign up (via trigger)
- **Teachers**: Must be created by an admin in Supabase, then profile role updated to "teacher"
- **After creating the auth user**, the trigger will create a profile with role "student" automatically
- **You must update the role** to "teacher" after creating the auth user
- **Teachers can then login** using their email and password through the login page
- The system will automatically detect their role from the `profiles` table and show the teacher dashboard

## Verification

After creating a teacher:

1. Check `auth.users` table - user should exist
2. Check `profiles` table - profile should exist with `role = 'teacher'`
3. Teacher should be able to login at `/auth/login`
4. After login, they should see the Teacher Dashboard
