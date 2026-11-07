"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { LandmarkPoint, SON_TRA_LANDMARKS } from "./roadData";

export function SonTraLandmarks({
  activeLandmarkId,
  discoveredIds,
  onSelectLandmark,
}: {
  activeLandmarkId?: string | null;
  discoveredIds: string[];
  onSelectLandmark?: (landmark: LandmarkPoint) => void;
}) {
  // Aerial roots for the Ancient Banyan Tree
  const banyanRoots = useMemo(() => {
    const roots: { x: number; z: number; height: number; radius: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 1.6 + (i % 3) * 0.85;
      roots.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        height: 3.8 + (i % 2) * 0.6,
        radius: 0.09 + (i % 3) * 0.04,
      });
    }
    return roots;
  }, []);

  return (
    <group name="SonTraLandmarks">
      {/* 1. Trailhead Arch & Signboard at [0, 0.2, 62] */}
      <group position={[0, 0.2, 62]}>
        {/* Wooden Trailhead Arch */}
        <mesh position={[-2.9, 1.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.2, 3.8, 8]} />
          <meshStandardMaterial color="#5c4028" roughness={0.85} />
        </mesh>
        <mesh position={[2.9, 1.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.2, 3.8, 8]} />
          <meshStandardMaterial color="#5c4028" roughness={0.85} />
        </mesh>
        <mesh position={[0, 3.65, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.6, 0.45, 0.4]} />
          <meshStandardMaterial color="#47311e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.02, 0]} castShadow>
          <boxGeometry args={[4.4, 0.48, 0.22]} />
          <meshStandardMaterial color="#1f4d36" roughness={0.6} />
        </mesh>
      </group>

      {/* 2. Linh Ung Pagoda Overlook & White Quan Am Statue at [22, 2.4, 20] */}
      <group position={[26.5, 2.4, 19.5]} rotation={[0, 1.15, 0]}>
        {/* Stone Courtyard & Lotus Pedestal */}
        <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.4, 3.8, 0.6, 12]} />
          <meshStandardMaterial color="#d8ddd8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.85, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.6, 2.1, 0.55, 16]} />
          <meshStandardMaterial color="#e6dfd5" roughness={0.6} />
        </mesh>
        {/* White Lady Buddha (Tượng Phật Bà Quan Âm) facing the East Sea */}
        <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.52, 0.92, 4.6, 16]} />
          <meshStandardMaterial color="#f8faf7" roughness={0.35} />
        </mesh>
        <mesh position={[0, 6.0, 0]} castShadow>
          <sphereGeometry args={[0.46, 16, 16]} />
          <meshStandardMaterial color="#f8faf7" roughness={0.35} />
        </mesh>
        {/* Halo ring behind head */}
        <mesh position={[0, 6.1, -0.25]} castShadow>
          <torusGeometry args={[0.72, 0.05, 8, 24]} />
          <meshStandardMaterial color="#e8c872" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* 3. Ancient Banyan Tree (Cây Đa Ngàn Năm) at [-40, 6.7, -55] */}
      <group position={[-40, 6.7, -55]}>
        {/* Massive Gnarled Main Trunk */}
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 1.75, 5.2, 11]} />
          <meshStandardMaterial color="#4e3b2b" roughness={0.95} />
        </mesh>
        {/* Cascading Aerial Roots (Rễ phụ) */}
        {banyanRoots.map((r, idx) => (
          <mesh key={idx} position={[r.x, r.height / 2, r.z]} castShadow receiveShadow>
            <cylinderGeometry args={[r.radius * 0.7, r.radius, r.height, 6]} />
            <meshStandardMaterial color="#5a4533" roughness={0.92} />
          </mesh>
        ))}
        {/* Multi-layered Giant Banyan Canopy */}
        <mesh position={[0, 5.8, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[4.4, 1]} />
          <meshStandardMaterial color="#275933" roughness={0.85} />
        </mesh>
        <mesh position={[-2.4, 5.1, 1.5]} castShadow receiveShadow>
          <dodecahedronGeometry args={[3.1, 1]} />
          <meshStandardMaterial color="#2f683c" roughness={0.85} />
        </mesh>
        <mesh position={[2.5, 5.2, -1.4]} castShadow receiveShadow>
          <dodecahedronGeometry args={[3.2, 1]} />
          <meshStandardMaterial color="#224e2c" roughness={0.85} />
        </mesh>
      </group>

      {/* 4. Ban Co Peak Summit (Đỉnh Bàn Cờ) at [-10, 13.0, -94] */}
      <group position={[-10, 13.0, -94]}>
        {/* Circular Stone Summit Platform */}
        <mesh position={[0, 0.18, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 5.6, 0.36, 24]} />
          <meshStandardMaterial color="#8d948e" roughness={0.85} />
        </mesh>

        {/* Stone Chess Table (Bàn Cờ) */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.7, 0.6, 12]} />
          <meshStandardMaterial color="#6e736e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.45, 0.1, 1.45]} />
          <meshStandardMaterial color="#c9cec6" roughness={0.6} />
        </mesh>

        {/* Seated Fairy Chess Player Statue (Tượng Đế Thích) */}
        <group position={[-1.25, 0.36, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Stone Stool */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 0.5, 10]} />
            <meshStandardMaterial color="#757a75" roughness={0.85} />
          </mesh>
          {/* Seated Torso */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <capsuleGeometry args={[0.26, 0.55, 6, 12]} />
            <meshStandardMaterial color="#d4cfc4" roughness={0.5} />
          </mesh>
          {/* Head & Beard */}
          <mesh position={[0, 1.45, 0.05]} castShadow>
            <sphereGeometry args={[0.21, 14, 14]} />
            <meshStandardMaterial color="#d4cfc4" roughness={0.5} />
          </mesh>
        </group>

        {/* Empty Stone Stool opposite the player */}
        <mesh position={[1.25, 0.61, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.5, 10]} />
          <meshStandardMaterial color="#757a75" roughness={0.85} />
        </mesh>

        {/* Iconic Summit Milestone Marker (Đỉnh Bàn Cờ 700m) */}
        <group position={[2.6, 0.36, -2.1]} rotation={[0, -0.4, 0]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.55, 1.3, 0.55]} />
            <meshStandardMaterial color="#e8ece6" roughness={0.65} />
          </mesh>
          <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.39, 0.45, 4]} />
            <meshStandardMaterial color="#c9332b" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Interactive Checkpoint Beacons & Floating Labels along the Roadline */}
      {SON_TRA_LANDMARKS.map((lm) => {
        const isActive = activeLandmarkId === lm.id;
        const isDiscovered = discoveredIds.includes(lm.id);
        return (
          <group key={lm.id} position={lm.position}>
            {/* Subtle glowing ground ring on the roadline */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
              <ringGeometry args={[1.6, 1.95, 32]} />
              <meshBasicMaterial
                color={isActive ? "#f5d76e" : isDiscovered ? "#6ee7b7" : "#93c5fd"}
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Floating 3D Badge */}
            <Html position={[0, 3.1, 0]} center distanceFactor={28}>
              <button
                onClick={() => onSelectLandmark?.(lm)}
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: isActive
                    ? "1.5px solid #fde047"
                    : "1px solid rgba(210, 238, 208, 0.45)",
                  background: isActive
                    ? "rgba(20, 62, 42, 0.95)"
                    : "rgba(9, 30, 23, 0.82)",
                  color: "#f3f7f1",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isDiscovered ? "#4ade80" : "#fbbf24",
                    display: "inline-block",
                  }}
                />
                <span>{lm.vietnameseName}</span>
                <span style={{ opacity: 0.75, fontSize: "11px" }}>
                  ({lm.elevationMeters}m)
                </span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
