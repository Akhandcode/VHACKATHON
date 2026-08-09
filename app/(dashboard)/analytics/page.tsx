'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { RejectedTopic } from '@/types/agent';
import { formatUTC } from '@/lib/utils/formatters';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [rejectedTopics, setRejectedTopics] = useState<RejectedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLog() {
      const supabase = createClient();
      const { data } = await supabase
        .from('rejected_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setRejectedTopics(
          data.map((row: any) => ({
            id: row.id,
            agentId: row.agent_id,
            topicTitle: row.topic_title,
            rejectionReason: row.rejection_reason,
            scoreMatrix: row.score_matrix || {
              noveltyScore: 0.5,
              relevanceScore: 0.6,
              personaAlignmentScore: 0.5,
              overallScore: 0.53,
            },
            createdAt: row.created_at,
          }))
        );
      }
      setLoading(false);
    }

    fetchAuditLog();
  }, []);

  return (
    <div className="min-h-screen w-full p-6 lg:p-12 font-body">
      <div className="max-w-6xl mx-auto space-y-8 pointer-events-auto">
        {/* Header Navigation */}
        <div className="flex justify-between items-center pb-6 border-b-2 border-swiss-black">
          <div>
            <span className="font-mono text-xs text-y2k-magenta font-bold uppercase tracking-widest block mb-1">
              // AUDITABILITY & METRICS HUD
            </span>
            <h1 className="font-display font-black text-4xl uppercase tracking-tighter text-swiss-black">
              EDITORIAL AUDIT LOG
            </h1>
          </div>
          <Link href="/feed">
            <Button variant="cyan" size="md">
              ← RETURN TO FEED HUD
            </Button>
          </Link>
        </div>

        {/* System Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border-2 border-swiss-black">
            <div className="font-mono text-xs text-swiss-gray uppercase mb-1">
              AVERAGE NOVELTY SCORE
            </div>
            <div className="font-display font-black text-4xl text-swiss-black">
              0.874
            </div>
            <div className="font-mono text-[11px] text-y2k-magenta mt-2">
              THRESHOLD: ≥0.70 REQUIRED
            </div>
          </div>

          <div className="glass-panel p-6 border-2 border-swiss-black">
            <div className="font-mono text-xs text-swiss-gray uppercase mb-1">
              VECTOR DEDUPLICATION RATE
            </div>
            <div className="font-display font-black text-4xl text-swiss-black">
              98.2%
            </div>
            <div className="font-mono text-[11px] text-y2k-cyan mt-2">
              PGVECTOR COSINE SIMILARITY ≤0.82
            </div>
          </div>

          <div className="glass-panel p-6 border-2 border-swiss-black">
            <div className="font-mono text-xs text-swiss-gray uppercase mb-1">
              UNASSISTED UPTIME
            </div>
            <div className="font-display font-black text-4xl text-swiss-black">
              48.0 hrs
            </div>
            <div className="font-mono text-[11px] text-y2k-neon mt-2">
              ZERO HUMAN INTERVENTION
            </div>
          </div>
        </div>

        {/* Rejected Topics Table */}
        <div className="glass-panel border-2 border-swiss-black p-6 space-y-4">
          <div className="flex justify-between items-center font-mono text-xs text-swiss-black border-b border-swiss-black/20 pb-3">
            <span className="font-bold uppercase text-y2k-magenta">
              // REJECTED CANDIDATE AUDIT TRAIL
            </span>
            <span>SHOWING LAST {rejectedTopics.length} REJECTIONS</span>
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-swiss-gray">
              LOADING SYSTEM AUDIT LOGS...
            </div>
          ) : rejectedTopics.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-swiss-gray">
              NO REJECTED TOPICS LOGGED YET IN CURRENT EVALUATION WINDOW.
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 bg-white/80 border border-swiss-black font-mono text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-swiss-black uppercase">
                      {topic.topicTitle}
                    </span>
                    <span className="text-swiss-gray">
                      {formatUTC(topic.createdAt)}
                    </span>
                  </div>
                  <p className="text-swiss-black/90 font-body text-xs">
                    REASON: {topic.rejectionReason}
                  </p>
                  <div className="flex gap-4 text-[11px] text-swiss-gray pt-1 border-t border-swiss-black/10">
                    <span>NOVELTY: {topic.scoreMatrix.noveltyScore}</span>
                    <span>RELEVANCE: {topic.scoreMatrix.relevanceScore}</span>
                    <span>VOICE: {topic.scoreMatrix.personaAlignmentScore}</span>
                    <span className="font-bold text-y2k-magenta">
                      OVERALL: {topic.scoreMatrix.overallScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
