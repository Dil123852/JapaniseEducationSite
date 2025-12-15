import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/app/lib/supabase-server';

export async function PATCH(req: Request) {
  try {
    const serverClient = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await serverClient.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { full_name } = body;

    // Update profile
    const { error: updateError } = await serverClient
      .from('profiles')
      .update({
        full_name: full_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await serverClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Ensure we have a logged-in user via the server-side client (reads user from cookies)
    const serverClient = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await serverClient.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { role, full_name } = body;

    // Check if profile already exists (created by trigger)
    const { data: existingProfile } = await serverClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists, update it (especially full_name)
      const { error: updateError } = await serverClient
        .from('profiles')
        .update({
          full_name: full_name || null,
          // Don't update role if it's already set (trigger sets it to 'student')
        })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // Profile doesn't exist, create it
      const { error: insertError } = await serverClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        role: role || 'student',
        full_name: full_name || null,
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
