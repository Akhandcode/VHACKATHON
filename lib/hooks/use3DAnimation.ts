'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '@/lib/utils/store';

export function use3DAnimation(nodeId: string, meshRef: React.RefObject<any>) {
  const hoveredPostId = useAppStore((state) => state.hoveredPostId);
  const activePostId = useAppStore((state) => state.activePostId);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const isHovered = hoveredPostId === nodeId;
    const isActive = activePostId === nodeId;

    if (isHovered || isActive) {
      gsap.to(meshRef.current.scale, {
        x: 1.35,
        y: 1.35,
        z: 1.35,
        duration: 0.4,
        ease: 'elastic.out(1, 0.3)',
      });
      if (meshRef.current.material) {
        gsap.to(meshRef.current.material, {
          roughness: 0.1,
          metalness: 0.95,
          duration: 0.3,
        });
      }
    } else {
      gsap.to(meshRef.current.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 0.4,
        ease: 'power2.out',
      });
      if (meshRef.current.material) {
        gsap.to(meshRef.current.material, {
          roughness: 0.3,
          metalness: 0.7,
          duration: 0.3,
        });
      }
    }
  }, [hoveredPostId, activePostId, nodeId, meshRef]);
}
