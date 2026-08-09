'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { InteractivePoster3D } from '@/components/3d/InteractivePoster3D';

export const SceneCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-auto w-full h-full bg-swiss-offwhite">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[10, 10, 8]} intensity={1.6} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00FFFF" />
        <pointLight position={[0, 0, 10]} intensity={0.8} color="#FF00FF" />

        {/* 3D Interactive Cursor-Tracked Poster Mesh */}
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <InteractivePoster3D />
          </Float>
        </Suspense>

        {/* Orbit Controls allowing full cursor movement and rotation */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          rotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};
