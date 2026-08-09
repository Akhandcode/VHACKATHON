'use client';

import React from 'react';
import { SceneCanvas } from '@/components/3d/SceneCanvas';
import { useRealtimeFeed } from '@/lib/hooks/useRealtimeFeed';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Subscribe to Supabase Realtime CDC feed updates
  useRealtimeFeed('abc-123');

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-swiss-offwhite">
      {/* Layer Z-0: The WebGL Void Canvas */}
      <SceneCanvas />

      {/* Layer Z-10: The Swiss Grid HUD & Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
