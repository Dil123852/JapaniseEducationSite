# Setup Guide

## Supabase Configuration

The "Failed to fetch" error typically means your Supabase environment variables are not configured correctly.

### Step 1: Create `.env.local` file

Create a `.env.local` file in the root of your project with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Get your Supabase credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Example `.env.local` file

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Restart your development server

After creating/updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Verify your database schema

Make sure you've run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor.

Also, make sure you've added the INSERT policy for profiles table:

```sql
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Troubleshooting

### Error: "Failed to fetch"

**Possible causes:**
1. ✅ Environment variables not set → Create `.env.local` file
2. ✅ Wrong Supabase URL → Check your project URL in Supabase dashboard
3. ✅ Wrong API key → Make sure you're using the `anon/public` key, not the `service_role` key
4. ✅ Network/CORS issue → Check if your Supabase project allows requests from `localhost:3000`

### Error: "Missing Supabase environment variables"

This means the environment variables are not loaded. Make sure:
- The file is named exactly `.env.local` (not `.env` or `.env.example`)
- The file is in the root directory (same level as `package.json`)
- You've restarted the dev server after creating the file

### Still having issues?

1. Check the browser console for more detailed error messages
2. Verify your Supabase project is active and accessible
3. Check your Supabase project logs in the dashboard
4. Make sure your database tables are created (run `supabase-schema.sql`)

