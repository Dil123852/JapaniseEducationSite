# Automatic Profile Creation Setup

## Overview

This setup automatically creates a profile entry in the `profiles` table with role "student" whenever a new user is created in Supabase Authentication.

## How It Works

1. **User signs up** → A new row is created in `auth.users`
2. **Database trigger fires** → Automatically creates a profile in `profiles` table with:
   - `id` = user's UUID
   - `email` = user's email
   - `role` = 'student' (default)
   - `full_name` = NULL (can be updated later)
3. **Application code updates** → Updates the profile with `full_name` from the signup form

## Setup Instructions

### Step 1: Run the Trigger SQL

Run the SQL script in your Supabase SQL Editor:

```bash
# Open AUTO_CREATE_PROFILE_TRIGGER.sql and run it in Supabase SQL Editor
```

Or copy and paste this:

```sql
-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (NEW.id, NEW.email, 'student', NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Verify RLS Policies

Make sure you have these RLS policies on the `profiles` table:

```sql
-- View own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Insert own profile (for manual inserts if needed)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update own profile (for updating full_name after signup)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

These should already exist if you've run `DATABASE_MIGRATION.sql` or `supabase-schema-updated.sql`.

## Testing

### Test Student Signup

1. Go to `/auth/signup`
2. Fill in the form (email, password, full name)
3. Submit
4. Check `profiles` table in Supabase:
   - A new row should exist
   - `role` should be `'student'`
   - `full_name` should match what you entered
   - `email` should match the signup email

### Test Teacher Creation

1. Create a user in Supabase Dashboard (Authentication → Users)
2. Check `profiles` table:
   - A row should be automatically created with `role = 'student'`
3. Update the role to `'teacher'`:
   ```sql
   UPDATE profiles 
   SET role = 'teacher', full_name = 'Teacher Name'
   WHERE email = 'teacher@example.com';
   ```
4. Teacher can now login and see the teacher dashboard

## How the Code Works

### Signup Flow (`app/lib/auth-client.ts`)

```typescript
// 1. User signs up (creates auth.users row)
const { data } = await supabase.auth.signUp({ email, password });

// 2. Trigger automatically creates profile with role 'student'

// 3. Code updates profile with full_name
await supabase.from('profiles').upsert({
  id: data.user.id,
  email: data.user.email,
  role: 'student',
  full_name: fullName,
}, { onConflict: 'id' });
```

The `upsert` ensures:
- If trigger hasn't run yet → creates profile
- If trigger already created it → updates with `full_name`

## Benefits

✅ **Automatic**: No need to manually create profiles  
✅ **Consistent**: All users get a profile automatically  
✅ **Safe**: Uses `ON CONFLICT DO NOTHING` to prevent errors  
✅ **Flexible**: Teachers can be created manually and updated later  

## Troubleshooting

### Profile not created automatically?

1. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Check if function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. If missing, run `AUTO_CREATE_PROFILE_TRIGGER.sql` again

### Error: "duplicate key value violates unique constraint"

This means the profile already exists. The trigger uses `ON CONFLICT DO NOTHING` to handle this, so it's safe. The application code will update it with `full_name`.

### Teacher profile shows as "student"

When creating a teacher manually:
1. Create the auth user first
2. The trigger will create a profile with `role = 'student'`
3. Update it to `role = 'teacher'`:
   ```sql
   UPDATE profiles SET role = 'teacher' WHERE id = 'user-uuid';
   ```

## Notes

- The trigger uses `SECURITY DEFINER` to bypass RLS, allowing it to insert profiles
- The trigger fires **AFTER** INSERT on `auth.users`
- All signups automatically get `role = 'student'`
- Teachers must be created manually and their role updated to `'teacher'`

