'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function InteractivePoster3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/agent_imagination_hero.png');
  const { pointer } = useThree();

  // Mouse cursor tracking: smooth 3D tilt & rotation towards cursor
  useFrame(() => {
    if (!meshRef.current) return;

    // Target rotation based on normalized cursor position pointer (-1 to +1)
    const targetRotY = pointer.x * 0.45;
    const targetRotX = -pointer.y * 0.35;

    // Smooth lerp interpolation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY,
      0.08
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotX,
      0.08
    );
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main 3D Poster Mesh textured with Agent Image */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 5.2, 0.12]} />
        {/* Front Face: Agent Poster Texture */}
        <meshStandardMaterial
          attach="material-4"
          map={texture}
          roughness={0.2}
          metalness={0.1}
        />
        {/* Back and Side Edges: Swiss Dark Metallic Frame */}
        <meshStandardMaterial attach="material-0" color="#111111" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-1" color="#111111" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-2" color="#111111" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-3" color="#111111" metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-5" color="#111111" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}
