'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/utils/store';
import { FeedParticleNode } from '@/components/3d/FeedParticleNode';
import { PostCard3D } from '@/components/3d/PostCard3D';

function SnowParticleSystem({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial random 3D positions and falling speeds for snow particles
  const [positions, velocities] = useMemo(() => {
    const posArr = new Float32Array(count * 3);
    const velArr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 20; // x
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 15; // z

      velArr[i * 3] = (Math.random() - 0.5) * 0.02; // wind x drift
      velArr[i * 3 + 1] = Math.random() * 0.02 + 0.015; // fall y speed
      velArr[i * 3 + 2] = (Math.random() - 0.5) * 0.01; // wind z drift
    }
    return [posArr, velArr];
  }, [count]);

  // Frame loop animating 3D snow particle fall and wind sway
  useFrame((state) => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const array = positionAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Y fall
      array[i * 3 + 1] -= velocities[i * 3 + 1];
      // X & Z sway
      array[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.003 + velocities[i * 3];
      array[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.002 + velocities[i * 3 + 2];

      // Respawn at top if fallen below threshold
      if (array[i * 3 + 1] < -10) {
        array[i * 3 + 1] = 10;
        array[i * 3] = (Math.random() - 0.5) * 20;
      }
    }
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#E2F1FF"
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const SceneCanvas: React.FC = () => {
  const posts = useAppStore((state) => state.posts);

  const getPosition = (index: number): [number, number, number] => {
    const angle = (index / Math.max(posts.length, 1)) * Math.PI * 2;
    const radius = 3.8 + (index % 3) * 0.6;
    const x = Math.cos(angle) * radius - 1.2;
    const y = Math.sin(index * 1.3) * 1.5;
    const z = Math.sin(angle) * radius - 1.5;
    return [x, y, z];
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto w-full h-full bg-swiss-offwhite">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 8]} intensity={1.5} color="#F0F8FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#00FFFF" />
        <pointLight position={[10, -10, 10]} intensity={0.6} color="#FF00FF" />

        {/* 3D Snow Storm Particle Theme */}
        <SnowParticleSystem count={1500} />

        {posts.map((post, idx) => {
          const pos = getPosition(idx);
          return (
            <React.Fragment key={post.id}>
              <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.4}>
                <FeedParticleNode id={post.id} position={pos} geometryType="icosahedron" />
              </Float>
              <PostCard3D post={post} position={[pos[0], pos[1] + 1.2, pos[2]]} />
            </React.Fragment>
          );
        })}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};
