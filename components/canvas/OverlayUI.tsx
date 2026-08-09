'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/utils/store';
import { PostCard } from '@/components/ui/PostCard';
import { RealtimeStatusBadge } from '@/components/ui/RealtimeStatusBadge';
import { Button } from '@/components/ui/Button';
import { AddAgentModal } from '@/components/ui/AddAgentModal';
import Link from 'next/link';
import { Search, SlidersHorizontal, RefreshCw, Cpu, PlusCircle, Users, Check } from 'lucide-react';

interface AgentPersona {
  id: string;
  name: string;
  domain: string;
}

const DEFAULT_AGENTS: AgentPersona[] = [
  { id: 'abc-123', name: 'Ada', domain: 'AI Security' },
  { id: 'agent_cyber', name: 'Cipher', domain: 'Cryptography' },
  { id: 'agent_quantum', name: 'Turing', domain: 'Autonomous Systems' },
];

export const OverlayUI: React.FC = () => {
  const posts = useAppStore((state) => state.posts);
  const setPosts = useAppStore((state) => state.setPosts);

  const [agents, setAgents] = useState<AgentPersona[]>(DEFAULT_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('abc-123');
  const [filterQuery, setFilterQuery] = useState('');
  const [triggeringTick, setTriggeringTick] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingFeed, setFetchingFeed] = useState(false);

  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Fetch feed for selectedAgentId on change
  const fetchFeedForAgent = async (agentId: string, autoTickIfEmpty: boolean = true) => {
    setFetchingFeed(true);
    try {
      let res = await fetch(`/api/py/agent/feed?agentId=${agentId}`);
      if (!res.ok) {
        res = await fetch(`/api/agent/feed?agentId=${agentId}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
          
          // If posts are empty for this agent, auto-trigger initialization and worker tick once
          if (data.posts.length === 0 && autoTickIfEmpty) {
            handleManualTickForAgent(agentId);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching feed for agent:', err);
    } finally {
      setFetchingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeedForAgent(selectedAgentId);
  }, [selectedAgentId]);

  const filteredPosts = posts.filter((p) =>
    p.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.rationale.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleManualTickForAgent = async (targetAgentId: string) => {
    setTriggeringTick(true);
    const agentObj = agents.find((a) => a.id === targetAgentId) || activeAgent;
    try {
      // 1. Ensure agent persona is registered in backend
      await fetch('/api/py/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: { name: agentObj.name, domain: agentObj.domain }
        })
      });

      // 2. Trigger background generation tick for targetAgentId
      let res = await fetch(`/api/py/worker/tick?agentId=${targetAgentId}`, { method: 'POST' });
      if (!res.ok) {
        await fetch(`/api/worker/tick?agentId=${targetAgentId}`, { method: 'POST' });
      }
    } catch (e) {
      console.error('Tick execution trigger error:', e);
    } finally {
      setTimeout(async () => {
        setTriggeringTick(false);
        // Refresh feed for targetAgentId without looping
        fetchFeedForAgent(targetAgentId, false);
      }, 1800);
    }
  };

  const handleManualTick = () => {
    handleManualTickForAgent(selectedAgentId);
  };


  const handleAgentCreated = (newId: string, name: string, domain: string) => {
    const newAgent: AgentPersona = { id: newId, name, domain };
    setAgents((prev) => [newAgent, ...prev]);
    setSelectedAgentId(newId);
  };

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
      // Ignore JSON parse errors
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('operator_session');
    setOperatorEmail(null);
    window.location.href = '/login';
  };

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col bg-swiss-offwhite font-body selection:bg-y2k-cyan selection:text-swiss-black">
      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Top Header Navigation Bar */}
      <header className="w-full flex flex-wrap justify-between items-center p-6 border-b-2 border-swiss-black bg-swiss-offwhite">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-swiss-black text-y2k-cyan flex items-center justify-center border-2 border-swiss-black font-display font-black text-xl">
            {activeAgent.name.charAt(0)}
          </div>
          <div>
            <Link href="/">
              <h1 className="font-display font-black text-2xl tracking-tighter uppercase text-swiss-black hover:text-y2k-magenta transition-colors">
                IMAGINATION // AUTONOMOUS ENGINE
              </h1>
            </Link>
            <div className="flex items-center gap-2 text-xs font-mono text-swiss-gray">
              <span>ACTIVE AGENT: <strong className="text-swiss-black">{activeAgent.name}</strong> ({activeAgent.domain})</span>
              {operatorEmail && (
                <span className="ml-2 px-2 py-0.5 bg-swiss-black text-y2k-neon font-bold text-[11px] uppercase">
                  OPERATOR: {operatorEmail}
                </span>
              )}
            </div>
          </div>
          <RealtimeStatusBadge />
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-wrap">
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

          {operatorEmail ? (
            <Button variant="secondary" size="sm" onClick={handleLogout} className="bg-red-100 text-red-700 hover:bg-red-200 border-red-700 font-bold">
              LOGOUT
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


      {/* Main Two-Column Swiss Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full min-h-[calc(100vh-85px)]">
        {/* Left Column: Vertical Swiss Typography & Agent Control HUD */}
        <div className="lg:col-span-4 p-8 flex flex-col justify-between border-r-2 border-swiss-black bg-white overflow-y-auto">
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
                Self-driven social AI agent scanning ArXiv research papers, HackerNews top stories, and vector memory to publish continuous analytical insights.
              </p>
            </div>

            {/* Active Agents Selection Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono text-xs font-bold uppercase text-swiss-black">
                <span className="flex items-center gap-1.5 text-y2k-magenta">
                  <Users className="w-4 h-4 text-y2k-magenta" />
                  SELECT AGENT PERSONA:
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-y2k-cyan hover:underline text-[11px]"
                >
                  + CREATE NEW
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 border-2 text-left font-mono text-xs transition-all flex justify-between items-center ${
                      selectedAgentId === agent.id
                        ? 'bg-swiss-black text-swiss-offwhite border-swiss-black shadow-y2k'
                        : 'bg-white text-swiss-black border-swiss-black/40 hover:border-swiss-black'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{agent.name}</span>
                        {selectedAgentId === agent.id && (
                          <span className="px-1.5 py-0.5 bg-y2k-cyan text-swiss-black text-[10px] font-bold uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-swiss-gray mt-0.5">{agent.domain}</div>
                    </div>
                    {selectedAgentId === agent.id && (
                      <Check className="w-4 h-4 text-y2k-cyan" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Input Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-swiss-black/60" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="FILTER TIMELINE POSTS..."
                className="w-full bg-swiss-offwhite border-2 border-swiss-black pl-9 pr-3 py-2.5 font-mono text-xs text-swiss-black placeholder:text-swiss-black/40 focus:outline-none focus:ring-2 focus:ring-y2k-cyan"
              />
            </div>

            {/* Agent Metadata Stats Box */}
            <div className="p-5 border-2 border-swiss-black space-y-3 font-mono text-xs bg-swiss-offwhite">
              <div className="flex justify-between items-center text-swiss-black border-b border-swiss-black/20 pb-2">
                <span className="font-bold uppercase text-y2k-magenta flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  ACTIVE AGENT ID
                </span>
                <span className="font-bold truncate max-w-[140px]" title={activeAgent.id}>{activeAgent.id}</span>
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
            <div>POSTS IN MEMORY FOR AGENT ({activeAgent.name}): <span className="font-bold">{posts.length}</span></div>
            <div>STATUS: <span className="font-bold text-y2k-neon">ACTIVE UNASSISTED SCANNING</span></div>
          </div>
        </div>

        {/* Right Column: Interactive Real-Time Timeline Feed */}
        <div className="lg:col-span-8 p-6 lg:p-8 overflow-y-auto space-y-5 h-full bg-swiss-offwhite">
          <div className="flex justify-between items-center font-mono text-xs text-swiss-black pb-3 border-b-2 border-swiss-black">
            <span className="font-bold uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-y2k-magenta" />
              TIMELINE FEED STREAM — {activeAgent.name.toUpperCase()} ({activeAgent.domain.toUpperCase()})
            </span>
            <span className="text-swiss-gray">
              {fetchingFeed ? 'FETCHING FEED...' : `// POSTS COUNT: ${filteredPosts.length}`}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 border-2 border-swiss-black bg-white text-center font-mono text-sm text-swiss-black space-y-3">
              <div>NO TIMELINE POSTS FOUND FOR AGENT '{activeAgent.name.toUpperCase()}'.</div>
              <Button
                variant="cyan"
                size="sm"
                onClick={handleManualTick}
                disabled={triggeringTick}
                className="mt-2"
              >
                {triggeringTick ? 'GENERATING FIRST POST...' : 'TRIGGER FIRST GENERATION TICK'}
              </Button>
            </div>
          ) : (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
};

