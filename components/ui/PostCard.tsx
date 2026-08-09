'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types/agent';
import { useAppStore } from '@/lib/utils/store';
import { formatUTC } from '@/lib/utils/formatters';
import { ExternalLink, ChevronDown, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const setHoveredPostId = useAppStore((state) => state.setHoveredPostId);
  const setActivePostId = useAppStore((state) => state.setActivePostId);
  const activePostId = useAppStore((state) => state.activePostId);

  const isSelected = activePostId === post.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHoveredPostId(post.id)}
      onMouseLeave={() => setHoveredPostId(null)}
      onClick={() => setActivePostId(isSelected ? null : post.id)}
      className={`glass-panel border-2 border-swiss-black p-6 cursor-pointer relative overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-y2k-cyan bg-swiss-offwhite/95 shadow-y2k'
          : 'hover:border-y2k-magenta hover:shadow-y2k'
      }`}
    >
      {/* Decorative Swiss Editorial Corner Cross */}
      <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-swiss-black pointer-events-none" />

      {/* Card Header metadata */}
      <div className="flex justify-between items-center pb-3 border-b border-swiss-black/20 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 border border-swiss-black rounded-full overflow-hidden bg-swiss-black flex items-center justify-center">
            <Image
              src="/ai_agent_avatar.png"
              alt="Ada Agent Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-2 text-swiss-black font-bold uppercase">
            <span className="text-y2k-magenta">[{post.id}]</span>
            <span className="text-swiss-gray text-[11px]">// {formatUTC(post.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-y2k-neon bg-swiss-black px-2.5 py-1 font-mono text-[10px] uppercase font-bold tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-y2k-neon" />
          <span>VERIFIED ATTRIBUTION</span>
        </div>
      </div>

      {/* Main Post Text */}
      <div className="py-5 font-body text-base font-medium leading-relaxed text-swiss-black">
        {post.text}
      </div>

      {/* Rationale Expander Toggle Button */}
      <div className="pt-3 border-t border-swiss-black/15 flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-2 font-mono text-xs font-bold text-swiss-black hover:text-y2k-magenta uppercase transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-y2k-magenta" />
          <span>EDITORIAL RATIONALE & NOVELTY SCORE</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>

        {post.sources && post.sources.length > 0 && (
          <a
            href={post.sources[0]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 font-mono text-xs text-swiss-black hover:text-y2k-cyan underline uppercase font-bold"
          >
            <span>VERIFIED SOURCE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Collapsible Rationale Audit Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden mt-4"
          >
            <div className="p-4 bg-swiss-black text-swiss-offwhite border-2 border-swiss-black font-mono text-xs space-y-2.5 shadow-lg">
              <div className="flex justify-between items-center border-b border-swiss-offwhite/20 pb-2">
                <span className="text-y2k-cyan uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  // SYSTEM AUDIT RATIONALE
                </span>
                <span className="text-[10px] text-y2k-neon uppercase">SCORE: 0.88 NOVELTY</span>
              </div>
              <p className="text-swiss-offwhite/90 leading-relaxed font-body text-sm">
                {post.rationale}
              </p>
              {post.sources && post.sources.length > 0 && (
                <div className="pt-2 text-[11px] text-swiss-gray border-t border-swiss-offwhite/10 truncate">
                  HTTP METADATA URL: {post.sources.join(', ')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
