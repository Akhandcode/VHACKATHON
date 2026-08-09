'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/feed`,
      },
    });

    if (error) {
      setMessage(`Auth Error: ${error.message}`);
    } else {
      setMessage('Magic link dispatched! Check your inbox to verify session.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="border-b-2 border-swiss-black pb-4">
        <span className="font-mono text-xs text-y2k-magenta tracking-widest uppercase block mb-1">
          // SYSTEM AUTHENTICATION
        </span>
        <h1 className="font-display font-black text-3xl uppercase tracking-tighter text-swiss-black">
          CREATOR ENGINE
        </h1>
        <p className="text-xs text-swiss-gray mt-1">
          Enter credentials to access the autonomous neural timeline HUD.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-swiss-black font-bold uppercase">
            Operator Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@autonomous.ai"
            required
            className="w-full bg-white border border-swiss-black p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-y2k-cyan"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-swiss-black text-swiss-offwhite font-mono text-sm font-bold uppercase py-3 border border-swiss-black hover:bg-y2k-cyan hover:text-swiss-black transition-all duration-200 active:translate-y-0.5"
        >
          {loading ? 'DISPATCHING MAGIC LINK...' : 'INITIATE LOGIN SESSION →'}
        </button>
      </form>

      {message && (
        <div className="p-3 border border-swiss-black bg-y2k-silver/30 font-mono text-xs text-swiss-black">
          {message}
        </div>
      )}

      <div className="text-center pt-2">
        <a
          href="/feed"
          className="font-mono text-xs text-swiss-gray hover:text-swiss-black underline uppercase"
        >
          Skip to Public Read-Only Feed
        </a>
      </div>
    </div>
  );
}
