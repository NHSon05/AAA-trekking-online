"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export type HumanPose = "walk" | "stand" | "sit";

interface HumanProps {
  shirt?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  hat?: "non-la" | "cap" | "none";
  backpack?: boolean;
  pole?: boolean;
  pose?: HumanPose;
  /** Only used for pose="walk": animate the stride. */
  moving?: boolean;
  /** Offset so several people don't swing in unison. */
  phase?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Articulated low-poly trekker (~1.72 m tall), facing local +Z, feet at y = 0.
 * Hip/knee/shoulder/elbow joints are real pivots so walking and sitting look natural.
 */
export function Human({
  shirt = "#2e6f40",
  pants = "#3b4350",
  skin = "#d9a07f",
  hair = "#1d1a18",
  hat = "non-la",
  backpack = true,
  pole = false,
  pose = "stand",
  moving = false,
  phase = 0,
  position,
  rotation,
  scale = 1,
}: HumanProps) {
  const root = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const shoL = useRef<THREE.Group>(null);
  const shoR = useRef<THREE.Group>(null);
  const elbL = useRef<THREE.Group>(null);
  const elbR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const amp = useRef(0);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * 8.5 + phase;
    const sit = pose === "sit";
    const walking = pose === "walk" && moving;
    amp.current = THREE.MathUtils.damp(amp.current, walking ? 1 : 0, 9, delta);
    const a = amp.current;
    const swing = Math.sin(t) * 0.62 * a;
    const lift = (v: number) => Math.max(0, v);

    if (hipL.current) hipL.current.rotation.x = sit ? -1.5 : swing;
    if (hipR.current) hipR.current.rotation.x = sit ? -1.35 : -swing;
    if (kneeL.current) kneeL.current.rotation.x = sit ? 1.45 : lift(-Math.sin(t)) * 0.9 * a;
    if (kneeR.current) kneeR.current.rotation.x = sit ? 1.3 : lift(Math.sin(t)) * 0.9 * a;
    if (shoL.current) shoL.current.rotation.x = sit ? -0.5 : -swing * 0.8;
    if (shoR.current) shoR.current.rotation.x = sit ? -0.55 : pole ? -0.5 : swing * 0.8;
    if (elbL.current) elbL.current.rotation.x = sit ? -0.9 : -0.25 - a * 0.35;
    if (elbR.current) elbR.current.rotation.x = sit ? -0.8 : pole ? -0.9 : -0.25 - a * 0.35;
    if (body.current) {
      body.current.position.y = (sit ? 0.46 : 0) + Math.abs(Math.sin(t)) * 0.035 * a;
      body.current.rotation.x = a * 0.07 + (sit ? 0.12 : 0);
    }
    if (root.current) root.current.rotation.z = Math.sin(t) * 0.025 * a;
  });

  const limb = (len: number, r: number, color: string) => (
    <mesh position={[0, -len / 2, 0]} castShadow>
      <capsuleGeometry args={[r, len - r * 1.6, 4, 8]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      <group ref={body}>
        {/* Legs: hip pivot -> thigh -> knee pivot -> shin -> boot */}
        {(
          [
            [-0.105, hipL, kneeL],
            [0.105, hipR, kneeR],
          ] as const
        ).map(([x, hip, knee]) => (
          <group key={x} ref={hip} position={[x, 0.93, 0]}>
            {limb(0.46, 0.082, pants)}
            <group ref={knee} position={[0, -0.46, 0]}>
              {limb(0.45, 0.07, pants)}
              <mesh position={[0, -0.46, 0.05]} castShadow>
                <boxGeometry args={[0.13, 0.1, 0.27]} />
                <meshStandardMaterial color="#4a3a2c" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.51, 0.05]}>
                <boxGeometry args={[0.135, 0.03, 0.28]} />
                <meshStandardMaterial color="#1c1c1c" roughness={0.95} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Pelvis & torso */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.3, 0.16, 0.18]} />
          <meshStandardMaterial color={pants} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.3, 6, 12]} />
          <meshStandardMaterial color={shirt} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.4, 0]} scale={[1.45, 0.45, 0.78]} castShadow>
          <sphereGeometry args={[0.17, 14, 10]} />
          <meshStandardMaterial color={shirt} roughness={0.75} />
        </mesh>

        {/* Arms: shoulder pivot -> upper arm -> elbow pivot -> forearm -> hand */}
        {(
          [
            [-0.245, shoL, elbL],
            [0.245, shoR, elbR],
          ] as const
        ).map(([x, sho, elb]) => (
          <group key={x} ref={sho} position={[x, 1.4, 0]}>
            {limb(0.3, 0.055, shirt)}
            <group ref={elb} position={[0, -0.3, 0]}>
              {limb(0.28, 0.048, skin)}
              <mesh position={[0, -0.3, 0]} castShadow>
                <sphereGeometry args={[0.052, 10, 8]} />
                <meshStandardMaterial color={skin} roughness={0.7} />
              </mesh>
              {pole && x > 0 && (
                <mesh position={[0, -0.45, 0.02]} castShadow>
                  <cylinderGeometry args={[0.014, 0.014, 1.25, 6]} />
                  <meshStandardMaterial color="#c9a227" metalness={0.4} roughness={0.5} />
                </mesh>
              )}
            </group>
          </group>
        ))}

        {/* Neck & head */}
        <mesh position={[0, 1.53, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 0.1, 8]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        <group position={[0, 1.64, 0.01]}>
          <mesh castShadow scale={[0.92, 1.08, 1]}>
            <sphereGeometry args={[0.108, 18, 14]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          {[-0.04, 0.04].map((ex) => (
            <mesh key={ex} position={[ex, 0.02, 0.095]}>
              <sphereGeometry args={[0.009, 6, 6]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          ))}
          <mesh position={[0, 0.03, -0.03]} scale={[0.95, 0.8, 0.95]}>
            <sphereGeometry args={[0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {hat === "non-la" && (
            <group position={[0, 0.07, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.3, 0.17, 24, 1, true]} />
                <meshStandardMaterial color="#d9c07a" roughness={0.85} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, -0.075, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.1, 0.006, 6, 20]} />
                <meshStandardMaterial color="#8a2f2f" />
              </mesh>
            </group>
          )}
          {hat === "cap" && (
            <group position={[0, 0.06, 0.01]}>
              <mesh castShadow>
                <sphereGeometry args={[0.115, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#1f3b5c" roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.005, 0.12]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[0.16, 0.012, 0.1]} />
                <meshStandardMaterial color="#1f3b5c" roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>

        {/* Trekking backpack on the back (-Z) with straps, flap and sleeping mat */}
        {backpack && (
          <group position={[0, 1.2, -0.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.34, 0.5, 0.2]} />
              <meshStandardMaterial color="#c2570c" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.27, -0.01]} castShadow>
              <boxGeometry args={[0.32, 0.08, 0.22]} />
              <meshStandardMaterial color="#9a4309" roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.32, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.38, 10]} />
              <meshStandardMaterial color="#2b4a6b" roughness={0.9} />
            </mesh>
            {[-0.1, 0.1].map((sx) => (
              <mesh key={sx} position={[sx, 0.02, 0.11]}>
                <boxGeometry args={[0.04, 0.4, 0.02]} />
                <meshStandardMaterial color="#222222" roughness={0.9} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
}
