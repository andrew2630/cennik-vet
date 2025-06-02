'use client';

import { useEffect, useRef } from 'react';
import { cnjoin } from '@/lib/utils';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function AuroraMesh() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.001;
    }
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial
        emissive={new THREE.Color('#7f5af0')}
        emissiveIntensity={1}
        color="#fff"
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

export function AuroraBackground({ className = '' }: { className?: string }) {
  return (
    <div className={cnjoin('absolute inset-0 w-full h-full z-0', className)}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AuroraMesh />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}