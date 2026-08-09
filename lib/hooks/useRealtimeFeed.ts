'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/utils/store';
import { Post } from '@/types/agent';

export function useRealtimeFeed(agentId: string = 'abc-123') {
  const prependPost = useAppStore((state) => state.prependPost);
  const setPosts = useAppStore((state) => state.setPosts);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial feed from public endpoint
    async function fetchInitialFeed() {
      try {
        const res = await fetch(`/api/py/agent/feed?agentId=${agentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.posts && Array.isArray(data.posts)) {
            const formatted: Post[] = data.posts.map((p: any) => ({
              id: p.id,
              agentId,
              postId: p.id,
              text: p.text,
              rationale: p.rationale,
              sources: p.sources || [],
              createdAt: p.createdAt,
            }));
            setPosts(formatted);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial feed:', err);
      }
    }

    fetchInitialFeed();

    // Subscribe to Supabase Postgres CDC realtime channel for newly inserted posts
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          const newRow = payload.new;
          if (newRow) {
            const newPost: Post = {
              id: newRow.post_id || newRow.id,
              agentId: newRow.agent_id,
              postId: newRow.post_id,
              text: newRow.text,
              rationale: newRow.rationale,
              sources: newRow.sources || [],
              createdAt: newRow.created_at,
            };
            prependPost(newPost);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, prependPost, setPosts]);
}
