'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/lib/utils/store';
import { use3DAnimation } from '@/lib/hooks/use3DAnimation';

interface FeedParticleNodeProps {
  id: string;
  position: [number, number, number];
  geometryType?: 'sphere' | 'torus' | 'icosahedron';
}

export const FeedParticleNode: React.FC<FeedParticleNodeProps> = ({
  id,
  position,
  geometryType = 'sphere',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const setHoveredPostId = useAppStore((state) => state.setHoveredPostId);
  const setActivePostId = useAppStore((state) => state.setActivePostId);
  const hoveredPostId = useAppStore((state) => state.hoveredPostId);
  const activePostId = useAppStore((state) => state.activePostId);

  const isHovered = hoveredPostId === id;
  const isActive = activePostId === id;

  use3DAnimation(id, meshRef);

  // Dynamic floating oscillation & rotation physics
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (isHovered ? 0.8 : 0.25);
      meshRef.current.rotation.y += delta * (isHovered ? 1.2 : 0.35);
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.8 + position[0]) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredPostId(id);
      }}
      onPointerOut={() => setHoveredPostId(null)}
      onClick={(e) => {
        e.stopPropagation();
        setActivePostId(isActive ? null : id);
      }}
    >
      {geometryType === 'torus' ? (
        <torusKnotGeometry args={[0.45, 0.18, 64, 16]} />
      ) : geometryType === 'icosahedron' ? (
        <icosahedronGeometry args={[0.55, 1]} />
      ) : (
        <sphereGeometry args={[0.6, 32, 32]} />
      )}

      <meshStandardMaterial
        color={isActive ? '#00FFFF' : isHovered ? '#FF00FF' : '#E0E0E0'}
        roughness={isHovered ? 0.08 : 0.25}
        metalness={isHovered ? 0.98 : 0.75}
        wireframe={false}
      />
    </mesh>
  );
};
