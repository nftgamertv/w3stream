// components/Hero.tsx
'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Float, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, GodRays } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
// Custom 3D Scene Components
function StreamingStage() {
  return (
    <group position={[0, -1, 0]}>
      {/* Stage Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Camera Model */}
      <group position={[-2, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.8, 0.6]} />
          <meshStandardMaterial color="#ff69b4" emissive="#ff1493" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* Microphone Model */}
      <group position={[2, 1, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 32]} />
          <meshStandardMaterial color="#4b0082" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#9370db" emissive="#8a2be2" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Floating Orbs representing Web3 elements */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 2, -3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      </Float>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
        <mesh position={[-3, 3, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} transparent opacity={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

type SunProps = {
  sunRef: React.RefObject<THREE.Mesh | null>;
};

function Sun({ sunRef }: SunProps) {
  return (
    <mesh ref={sunRef} position={[5, 5, -10]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#ffd700" />
    </mesh>
  );
}

export default function Hero() {
  const sunRef = React.useRef<THREE.Mesh | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <Environment preset="city">
            <Lightformer intensity={0.5} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          </Environment>
          <StreamingStage />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={200} scale={10} size={6} speed={0.4} noise={0.2} color="#ffffff" />
          <Sun sunRef={sunRef} />
          {isMounted && sunRef.current && (
            <EffectComposer>
              <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
              <GodRays sun={sunRef.current} blendFunction={BlendFunction.SCREEN} samples={60} density={0.96} decay={0.9} weight={0.4} exposure={0.6} clampMax={1} width={typeof window !== 'undefined' ? window.innerWidth : 1920} height={typeof window !== 'undefined' ? window.innerHeight : 1080} kernelSize={5} blur />
            </EffectComposer>
          )}
          <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-7xl font-bold tracking-wide drop-shadow-lg hero-title"
        >
          w3Stream
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          className="text-3xl mt-4 drop-shadow-md hero-subtitle "
        >
          Next-Generation Streaming Platform
        </motion.p>
     
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2, type: 'spring', stiffness: 120 }}
          onClick={() => { router.push('/join'); }}
          className="mt-8 px-8 py-4 bg-purple-600 rounded-full text-lg font-semibold hover:bg-purple-500 transition pointer-events-auto"
        >
          Get Started Free
        </motion.button>
                <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2, type: 'spring', stiffness: 120 }}
          onClick={() => { router.push('/dashboard'); }}
          className="mt-8 px-8 py-4 bg-purple-600 rounded-full text-lg font-semibold hover:bg-purple-500 transition pointer-events-auto"
        >
        dashboard
        </motion.button>
      </div>
    </section>
  );
}