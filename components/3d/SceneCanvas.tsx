'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/utils/store';
import { FeedParticleNode } from '@/components/3d/FeedParticleNode';
import { PostCard3D } from '@/components/3d/PostCard3D';

function AmbientChromeRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <mesh position={[-4, 2, -2]}>
        <torusKnotGeometry args={[1.2, 0.25, 128, 32]} />
        <meshStandardMaterial color="#00FFFF" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[5, -2, -3]}>
        <torusGeometry args={[1.8, 0.15, 32, 100]} />
        <meshStandardMaterial color="#FF00FF" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

export const SceneCanvas: React.FC = () => {
  const posts = useAppStore((state) => state.posts);

  const getPosition = (index: number): [number, number, number] => {
    const angle = (index / Math.max(posts.length, 1)) * Math.PI * 2;
    const radius = 3.6 + (index % 3) * 0.7;
    const x = Math.cos(angle) * radius - 1.2;
    const y = Math.sin(index * 1.4) * 1.6;
    const z = Math.sin(angle) * radius - 1.8;
    return [x, y, z];
  };

  const getGeometryType = (index: number): 'sphere' | 'torus' | 'icosahedron' => {
    const types: ('sphere' | 'torus' | 'icosahedron')[] = ['sphere', 'torus', 'icosahedron'];
    return types[index % types.length];
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto w-full h-full bg-swiss-offwhite">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.4} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00FFFF" />
        <pointLight position={[10, -10, 10]} intensity={0.8} color="#FF00FF" />

        <AmbientChromeRings />

        {posts.map((post, idx) => {
          const pos = getPosition(idx);
          const geomType = getGeometryType(idx);
          return (
            <React.Fragment key={post.id}>
              <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <FeedParticleNode id={post.id} position={pos} geometryType={geomType} />
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
