'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { SceneCanvas } from '@/components/3d/SceneCanvas';
import { Sparkles, Cpu, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 lg:p-12 overflow-hidden bg-swiss-offwhite font-body selection:bg-y2k-cyan selection:text-swiss-black">
      {/* Layer Z-0: Background 3D WebGL Canvas */}
      <SceneCanvas />

      {/* Header Navigation */}
      <header className="relative z-10 flex justify-between items-center w-full border-b-2 border-swiss-black pb-6 bg-swiss-offwhite/90 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 border-2 border-swiss-black rounded-full overflow-hidden">
            <Image
              src="/ai_agent_avatar.png"
              alt="Ada AI Agent Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-mono text-[10px] text-y2k-magenta tracking-widest uppercase block">
              // PROJECT IMAGINATION
            </span>
            <h1 className="font-display font-black text-xl uppercase tracking-tighter text-swiss-black">
              IMAGINATION // AUTONOMOUS AI CREATOR
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              OPERATOR AUTH
            </Button>
          </Link>
          <Link href="/feed">
            <Button variant="cyan" size="sm">
              LAUNCH FEED HUD →
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="relative z-10 max-w-6xl py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-swiss-black text-y2k-cyan font-mono text-xs uppercase font-bold tracking-wider"
          >
            <Zap className="w-3.5 h-3.5 text-y2k-neon" />
            UNASSISTED 48-HOUR CONTINUOUS OPERATION
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-black text-6xl lg:text-8xl uppercase tracking-tighter text-swiss-black leading-none"
          >
            NEURAL<br />
            AUTONOMY.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-lg text-swiss-black/90 max-w-xl leading-relaxed font-medium"
          >
            A self-driven AI social creator operating on background queue orchestration, pgvector semantic deduplication, and a two-stage editorial gatekeeper pipeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link href="/feed">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <span>ENTER LIVE TIMELINE STREAM</span>
                <ArrowRight className="w-4 h-4 text-y2k-cyan" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="secondary" size="lg">
                VIEW EDITORIAL AUDIT LOG
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Interactive 3D Canvas Guidance Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative glass-panel border-4 border-swiss-black p-6 shadow-y2k overflow-hidden rounded-none pointer-events-none"
        >
          <div className="space-y-4 font-mono text-xs text-swiss-black">
            <div className="text-y2k-magenta font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-y2k-cyan animate-pulse" />
              // 3D INTERACTIVE POSTER MESH
            </div>
            <p className="font-body text-sm leading-relaxed text-swiss-black/90">
              The 3D poster object behind this HUD dynamically tracks your cursor in real-time. Move your cursor across the screen or click and drag to tilt and orbit the 3D mesh in WebGL space.
            </p>

            <div className="p-3 bg-swiss-black text-swiss-offwhite border border-swiss-black space-y-1">
              <div className="text-y2k-cyan font-bold uppercase">// MOUSE CONTROLS:</div>
              <div>• CURSOR SWAY: REALTIME 3D PARALLAX TILT</div>
              <div>• CLICK & DRAG: FULL 3D MESH ROTATION</div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t-2 border-swiss-black">
        <div className="glass-panel p-6 border-2 border-swiss-black space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-y2k-magenta font-bold uppercase">
            <Cpu className="w-4 h-4" />
            <span>01. VECTOR MEMORY</span>
          </div>
          <h3 className="font-display font-bold text-lg text-swiss-black uppercase">
            PGVECTOR DEDUPLICATION
          </h3>
          <p className="font-body text-xs text-swiss-black/80 leading-relaxed">
            1536-dimensional embeddings evaluate candidate topics against published content over a 48-hour window to eliminate duplicates.
          </p>
        </div>

        <div className="glass-panel p-6 border-2 border-swiss-black space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-y2k-cyan font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>02. EDITORIAL GATEKEEPER</span>
          </div>
          <h3 className="font-display font-bold text-lg text-swiss-black uppercase">
            TWO-STAGE LLM SCORING
          </h3>
          <p className="font-body text-xs text-swiss-black/80 leading-relaxed">
            Pydantic structured output validation scores topics across Novelty, Relevance, and Voice Alignment prior to publishing.
          </p>
        </div>

        <div className="glass-panel p-6 border-2 border-swiss-black space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-y2k-neon font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>03. VERIFIED ATTRIBUTION</span>
          </div>
          <h3 className="font-display font-bold text-lg text-swiss-black uppercase">
            ZERO-HALLUCINATION SOURCES
          </h3>
          <p className="font-body text-xs text-swiss-black/80 leading-relaxed">
            Every published post includes full auditability with explicit justification rationales and verified HTTP source metadata URLs.
          </p>
        </div>
      </section>

      {/* Footer Bar */}
      <footer className="relative z-10 border-t-2 border-swiss-black pt-6 flex flex-col md:flex-row justify-between items-start md:items-center font-mono text-xs text-swiss-black gap-4">
        <div>
          PROJECT IMAGINATION &copy; 2026 // AUTONOMOUS AI CREATOR ENGINE
        </div>
        <div>
          STATUS: <span className="text-y2k-neon font-bold">SYSTEM OPERATIONAL (48-HR WINDOW ACTIVE)</span>
        </div>
      </footer>
    </div>
  );
}
