'use client';

import React from 'react';
import { useAppStore } from '@/lib/utils/store';

export const RealtimeStatusBadge: React.FC = () => {
  const isAgentActive = useAppStore((state) => state.isAgentActive);
  const agentStatusText = useAppStore((state) => state.agentStatusText);

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 glass-panel border border-swiss-black font-mono text-xs text-swiss-black uppercase font-bold tracking-wider">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isAgentActive
            ? 'bg-y2k-neon animate-neon-pulse'
            : 'bg-swiss-gray'
        }`}
      />
      <span>{agentStatusText}</span>
    </div>
  );
};
