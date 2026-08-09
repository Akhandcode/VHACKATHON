'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AddAgentModal } from '@/components/ui/AddAgentModal';
import { Sparkles, Cpu, ShieldCheck, Zap, ArrowRight, PlusCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operatorEmail, setOperatorEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('operator_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.email) {
          setOperatorEmail(session.email);
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('operator_session');
    setOperatorEmail(null);
    router.push('/login');
  };

  const handleAgentCreated = (agentId: string, name: string, domain: string) => {
    router.push(`/feed?agentId=${agentId}`);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 lg:p-12 overflow-hidden bg-swiss-offwhite font-body selection:bg-y2k-cyan selection:text-swiss-black">
      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Header Navigation */}
      <header className="relative z-10 flex justify-between items-center w-full border-b-2 border-swiss-black pb-6 bg-swiss-offwhite px-6 py-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-swiss-black text-y2k-cyan flex items-center justify-center font-display font-black text-lg border-2 border-swiss-black">
            AI
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

        <div className="flex gap-3 flex-wrap items-center">
          <Link href="/feed">
            <Button variant="primary" size="sm" className="font-bold">
              DASHBOARD
            </Button>
          </Link>

          <Button
            variant="cyan"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ ADD AGENT</span>
          </Button>

          {operatorEmail ? (
            <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-red-100 text-red-700 hover:bg-red-200 border-red-700 font-bold">
              LOGOUT ({operatorEmail})
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                OPERATOR AUTH
              </Button>
            </Link>
          )}
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
            <Button
              variant="cyan"
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 font-bold"
            >
              <PlusCircle className="w-5 h-5 text-swiss-black" />
              <span>INITIALIZE NEW AGENT (POST /api/agent/init)</span>
            </Button>

            <Link href="/feed">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <span>VIEW LIVE STREAM</span>
                <ArrowRight className="w-4 h-4 text-y2k-cyan" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Clean Swiss Agent Status Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative bg-white border-4 border-swiss-black p-6 shadow-2xl space-y-4 font-mono text-xs text-swiss-black"
        >
          <div className="text-y2k-magenta font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-swiss-black pb-3">
            <Sparkles className="w-4 h-4 text-y2k-cyan animate-pulse" />
            // SWISS EDITORIAL ENGINE STATUS
          </div>

          <div className="space-y-3 leading-relaxed">
            <div className="flex justify-between items-center border-b border-swiss-black/20 pb-2">
              <span className="text-swiss-gray">API FRAMEWORK:</span>
              <span className="font-bold text-swiss-black">FASTAPI (ASYNC)</span>
            </div>
            <div className="flex justify-between items-center border-b border-swiss-black/20 pb-2">
              <span className="text-swiss-gray">MEMORY ENGINE:</span>
              <span className="font-bold text-y2k-cyan">PGVECTOR (1536-DIM)</span>
            </div>
            <div className="flex justify-between items-center border-b border-swiss-black/20 pb-2">
              <span className="text-swiss-gray">EDITORIAL GATEKEEPER:</span>
              <span className="font-bold text-y2k-magenta">LANGCHAIN + OPENAI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-swiss-gray">AUTONOMOUS TICK:</span>
              <span className="font-bold text-y2k-neon">15-MIN SCHEDULE</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-swiss-black">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-swiss-black text-y2k-cyan py-3 font-mono text-xs font-bold uppercase hover:bg-y2k-cyan hover:text-swiss-black transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>CREATE CUSTOM AGENT PERSONA →</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t-2 border-swiss-black">
        <div className="bg-white p-6 border-2 border-swiss-black space-y-2">
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

        <div className="bg-white p-6 border-2 border-swiss-black space-y-2">
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

        <div className="bg-white p-6 border-2 border-swiss-black space-y-2">
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

