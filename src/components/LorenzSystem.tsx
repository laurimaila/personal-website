'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { fetchLorenzStream, type LorenzParams } from '@/lib/api/physicsApi';

// Max points in memory
const MAX_POINTS = 10000;

function LorenzTrajectory({ sigma = 10, rho = 28, beta = 2.6667 }: LorenzParams) {
  const lineRef = useRef<THREE.Line>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Stable arrays for buffers
  const points = useMemo(() => new Float32Array(MAX_POINTS * 3), []);
  const colors = useMemo(() => new Float32Array(MAX_POINTS * 3), []);
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current = 0; // Reset points on parameter change

    if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, 0);
    }

    const controller = new AbortController();

    fetchLorenzStream(
      { sigma, rho, beta },
      (point) => {
        const idx = countRef.current;
        if (idx < MAX_POINTS) {
          // Update position buffer
          points[idx * 3] = point.x;
          points[idx * 3 + 1] = point.y;
          points[idx * 3 + 2] = point.z;

          // Change point color based on z-value
          const color = new THREE.Color().setHSL(0.6 + point.z / 50, 1.0, 0.5);
          colors[idx * 3] = color.r;
          colors[idx * 3 + 1] = color.g;
          colors[idx * 3 + 2] = color.b;

          countRef.current++;
        }
      },
      controller.signal,
    ).catch((error) => console.error('Stream error:', error));

    return () => {
      controller.abort();
    };
  }, [sigma, rho, beta, points, colors]);

  useFrame(() => {
    // Update geometry every frame to show new points
    if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, countRef.current);

      if (geometryRef.current.attributes.position) {
        geometryRef.current.attributes.position.needsUpdate = true;
      }
      if (geometryRef.current.attributes.color) {
        geometryRef.current.attributes.color.needsUpdate = true;
      }
    }
  });

  return (
    <line ref={lineRef as any}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <lineBasicMaterial vertexColors linewidth={1} />
    </line>
  );
}

function CameraLogger() {
  const { camera } = useThree();
  const ref = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (ref.current) {
      const { x, y, z } = camera.position;
      ref.current.innerText = `x: ${x.toFixed(1)} y: ${y.toFixed(1)} z: ${z.toFixed(1)}`;
    }
  });

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div ref={ref} className="absolute bottom-4 left-4 font-mono text-xs text-zinc-500" />
    </Html>
  );
}

export default function LorenzSystem(props: LorenzParams) {
  return (
    <div className="h-full w-full bg-black/60">
      <Canvas camera={{ position: [-2.9, 5.0, 103.4], fov: 45 }}>
        <LorenzTrajectory {...props} />
        <OrbitControls />
        <CameraLogger />
      </Canvas>
    </div>
  );
}
