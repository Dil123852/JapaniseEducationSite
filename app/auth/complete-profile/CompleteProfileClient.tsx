"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

export default function CompleteProfileClient() {
  const router = useRouter();
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call server API to create profile. Server will validate the session
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, full_name: fullName }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Failed to create profile');

      // On success, go to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to create profile:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Complete your profile</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} style={{ padding: 8 }}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ padding: '8px 14px' }}>
          {loading ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </div>
  );
}
