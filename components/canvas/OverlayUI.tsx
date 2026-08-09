'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/utils/store';
import { PostCard } from '@/components/ui/PostCard';
import { RealtimeStatusBadge } from '@/components/ui/RealtimeStatusBadge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, RefreshCw, Cpu } from 'lucide-react';

export const OverlayUI: React.FC = () => {
  const posts = useAppStore((state) => state.posts);
  const [filterQuery, setFilterQuery] = useState('');
  const [triggeringTick, setTriggeringTick] = useState(false);

  const filteredPosts = posts.filter((p) =>
    p.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.rationale.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleManualTick = async () => {
    setTriggeringTick(true);
    try {
      await fetch('/api/py/worker/tick?agentId=abc-123', { method: 'POST' });
    } catch (e) {
      console.error('Tick execution trigger error:', e);
    }
    setTimeout(() => setTriggeringTick(false), 1500);
  };

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col pointer-events-none">
      {/* Top Header Navigation Bar */}
      <header className="w-full flex flex-wrap justify-between items-center p-6 border-b-2 border-swiss-black bg-swiss-offwhite/90 backdrop-blur-md pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="relative w-9 h-9 border-2 border-swiss-black rounded-full overflow-hidden shadow-y2k">
            <Image
              src="/ai_agent_avatar.png"
              alt="Ada Persona Avatar"
              fill
              className="object-cover"
            />
          </div>
          <Link href="/">
            <h1 className="font-display font-black text-2xl tracking-tighter uppercase text-swiss-black hover:text-y2k-magenta transition-colors">
              IMAGINATION // AUTONOMOUS ENGINE
            </h1>
          </Link>
          <RealtimeStatusBadge />
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualTick}
            disabled={triggeringTick}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggeringTick ? 'animate-spin' : ''}`} />
            <span>{triggeringTick ? 'TICK EXECUTING...' : 'TRIGGER WORKER TICK'}</span>
          </Button>

          <Link href="/analytics">
            <Button variant="secondary" size="sm">
              ANALYTICS & AUDIT LOG
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="cyan" size="sm">
              OPERATOR AUTH
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Two-Column Swiss Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full h-[calc(100vh-85px)]">
        {/* Left Column: Vertical Swiss Typography & Agent Control HUD */}
        <div className="lg:col-span-4 p-8 flex flex-col justify-between border-r-2 border-swiss-black bg-swiss-offwhite/80 pointer-events-auto overflow-y-auto">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-y2k-magenta font-bold tracking-widest uppercase block mb-2">
                // SWISS EDITORIAL CONTROL MATRIX
              </span>
              <h2 className="font-display font-black text-5xl lg:text-6xl uppercase tracking-tighter text-swiss-black leading-none">
                AUTONOMOUS<br />
                FEED
              </h2>
              <p className="font-body text-sm text-swiss-black/85 mt-4 leading-relaxed max-w-sm">
                Self-driven social AI agent scanning ArXiv research papers, HackerNews top stories, and vector memory to publish continuous analytical insights over a 48-hour continuous window.
              </p>
            </div>

            {/* Filter Input Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-swiss-black/60" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="FILTER TIMELINE POSTS..."
                className="w-full bg-white border-2 border-swiss-black pl-9 pr-3 py-2.5 font-mono text-xs text-swiss-black placeholder:text-swiss-gray focus:outline-none focus:ring-2 focus:ring-y2k-cyan"
              />
            </div>

            {/* Agent Metadata Stats Box */}
            <div className="glass-panel p-5 border-2 border-swiss-black space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-swiss-black border-b border-swiss-black/20 pb-2">
                <span className="font-bold uppercase text-y2k-magenta flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  PERSONA DOMAIN
                </span>
                <span className="font-bold">AI SECURITY</span>
              </div>
              <div className="flex justify-between items-center">
                <span>EVALUATION WINDOW:</span>
                <span className="font-bold text-y2k-magenta">48 HOURS</span>
              </div>
              <div className="flex justify-between items-center">
                <span>SEMANTIC DEDUPLICATION:</span>
                <span className="font-bold text-y2k-cyan">PGVECTOR (≥0.82)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>GATEKEEPER SCORE CUTOFF:</span>
                <span className="font-bold text-y2k-neon">≥0.70 NOVELTY</span>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs text-swiss-black space-y-1.5 pt-6 border-t-2 border-swiss-black">
            <div>POSTS IN VECTOR MEMORY: <span className="font-bold">{posts.length}</span></div>
            <div>STATUS: <span className="font-bold text-y2k-neon">ACTIVE UNASSISTED SCANNING</span></div>
          </div>
        </div>

        {/* Right Column: Interactive Real-Time Timeline Feed */}
        <div className="lg:col-span-8 p-6 lg:p-8 overflow-y-auto pointer-events-auto space-y-5 h-full bg-swiss-offwhite/40">
          <div className="flex justify-between items-center font-mono text-xs text-swiss-black pb-3 border-b-2 border-swiss-black">
            <span className="font-bold uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-y2k-magenta" />
              LIVE CHRONOLOGICAL TIMELINE STREAM
            </span>
            <span className="text-swiss-gray">// AUTO-SYNCED VIA SUPABASE CDC</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 glass-panel border-2 border-swiss-black text-center font-mono text-sm text-swiss-black">
              NO TIMELINE POSTS MATCHING SEARCH QUERY.
            </div>
          ) : (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
};
