'use client';

import React from 'react';
import { useRealtimeFeed } from '@/lib/hooks/useRealtimeFeed';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Subscribe to Supabase Realtime CDC feed updates
  useRealtimeFeed('abc-123');

  return (
    <div className="relative min-h-screen w-full bg-swiss-offwhite font-body selection:bg-y2k-cyan selection:text-swiss-black">
      {/* Swiss Grid HUD & Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

