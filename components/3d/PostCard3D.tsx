'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { Post } from '@/types/agent';
import { useAppStore } from '@/lib/utils/store';

interface PostCard3DProps {
  post: Post;
  position: [number, number, number];
}

export const PostCard3D: React.FC<PostCard3DProps> = ({ post, position }) => {
  const activePostId = useAppStore((state) => state.activePostId);
  const isSelected = activePostId === post.id;

  if (!isSelected) return null;

  return (
    <Html position={position} center distanceFactor={10}>
      <div className="glass-panel p-4 border-2 border-swiss-black w-64 text-swiss-black font-mono text-xs shadow-y2k pointer-events-auto">
        <div className="font-bold text-y2k-magenta uppercase mb-1">
          // 3D NODE INSPECTOR [{post.id}]
        </div>
        <p className="font-body text-xs leading-snug line-clamp-3 text-swiss-black">
          {post.text}
        </p>
      </div>
    </Html>
  );
};
