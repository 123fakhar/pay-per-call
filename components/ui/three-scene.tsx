"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import type { Group, Mesh } from "three";

const ORBIT = ["#67efff", "#ff4d9a", "#ffb020", "#3dffb0", "#b79bff"] as const;

function Signal() {
  const rig = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const beads = useRef<Group>(null);

  const beadPositions = useMemo(
    () =>
      ORBIT.map((_, index) => {
        const angle = (index / ORBIT.length) * Math.PI * 2;
        return [Math.cos(angle) * 2.2, Math.sin(angle * 2) * 0.32, Math.sin(angle) * 2.2] as [
          number,
          number,
          number,
        ];
      }),
    [],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (rig.current) {
      rig.current.rotation.y = time * 0.18;
      rig.current.rotation.z = Math.sin(time * 0.32) * 0.07;
    }
    if (core.current) {
      const scale = 1 + Math.sin(time * 1.7) * 0.045;
      core.current.scale.setScalar(scale);
    }
    if (beads.current) beads.current.rotation.y += delta * 0.32;
  });

  return (
    <Float speed={1.15} rotationIntensity={0.12} floatIntensity={0.4}>
      <mesh>
        <sphereGeometry args={[1.05, 72, 72]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          resolution={256}
          thickness={0.62}
          roughness={0.04}
          chromaticAberration={0.08}
          anisotropy={0.2}
          distortion={0.22}
          distortionScale={0.32}
          temporalDistortion={0.1}
          color="#e9fcff"
        />
      </mesh>
      <group ref={rig}>
        <mesh rotation={[Math.PI / 2.15, 0.15, 0]}>
          <torusGeometry args={[1.52, 0.03, 28, 180]} />
          <meshStandardMaterial
            color="#b8fbff"
            metalness={1}
            roughness={0.12}
            emissive="#0e6d7c"
            emissiveIntensity={0.7}
          />
        </mesh>
        <mesh rotation={[0.7, 0.9, 0.25]}>
          <torusGeometry args={[1.24, 0.018, 20, 140]} />
          <meshStandardMaterial
            color="#ff4d9a"
            metalness={1}
            roughness={0.18}
            emissive="#ff4d9a"
            emissiveIntensity={0.7}
          />
        </mesh>
        <mesh rotation={[1.1, 0.2, 1.2]}>
          <torusGeometry args={[1.72, 0.012, 16, 120]} />
          <meshStandardMaterial
            color="#ffb020"
            metalness={1}
            roughness={0.22}
            emissive="#ffb020"
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.46, 1]} />
          <meshStandardMaterial
            color="#22143a"
            emissive="#8b6cff"
            emissiveIntensity={1.8}
            metalness={0.25}
            roughness={0.28}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group ref={beads}>
        {ORBIT.map((color, index) => (
          <mesh key={color} position={beadPositions[index]}>
            <sphereGeometry args={[0.072, 24, 24]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <ringGeometry args={[1.15, 2.15, 80]} />
        <meshStandardMaterial
          color="#67efff"
          emissive="#67efff"
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.25}
          transparent
          opacity={0.45}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[4.5, 5.5, 4]} intensity={28} angle={0.5} penumbra={1} color="#fff4e5" />
      <pointLight position={[-3.6, 1.1, 2.2]} intensity={16} color="#67efff" />
      <pointLight position={[3, -0.4, 1.8]} intensity={12} color="#ff4d9a" />
      <pointLight position={[0, 2.2, -2]} intensity={8} color="#b79bff" />
      <Signal />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} color="#67efff" position={[0, 3, -3]} scale={[8, 2.2, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#ff4d9a" position={[-4, 0.2, 2]} scale={[2, 5, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffb020" position={[4, -1, 1]} scale={[4, 1.2, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 1.5, 4]} scale={2.2} />
      </Environment>
    </>
  );
}

export default function ThreeScene() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  if (!ready || reduced) {
    return (
      <div className="h-full w-full bg-[radial-gradient(circle_at_42%_46%,rgba(103,239,255,0.38),transparent_26%),radial-gradient(circle_at_62%_52%,rgba(255,77,154,0.32),transparent_24%),radial-gradient(circle_at_50%_62%,rgba(139,108,255,0.4),transparent_30%),#05060d]" />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.35], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Scene />
    </Canvas>
  );
}
