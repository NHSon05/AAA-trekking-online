"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { Human } from "../figures/Human";
import { BanCoSummit, BanyanTree, LinhUngStatue, TrailheadGate } from "./LandmarkModels";
import { getClosestRoadInfo, getRoadCurve, getRouteFrame, getTerrainHeight, LandmarkPoint, SON_TRA_LANDMARKS } from "./roadData";

const LM = Object.fromEntries(SON_TRA_LANDMARKS.map((l) => [l.id, l.position])) as Record<string, [number, number, number]>;
const START_TAN = getRoadCurve().getTangentAt(0);
const START_HEADING = Math.atan2(START_TAN.x, START_TAN.z);

// Put the Linh Ung plaza on whichever side of the road has more open ground, facing the road.
const PLAZA = (() => {
  const f = getRouteFrame(0.04);
  const candidates = [1, -1].map((sgn) => {
    const x = f.point.x + f.side.x * sgn * 12;
    const z = f.point.z + f.side.z * sgn * 12;
    return { sgn, x, z, open: getClosestRoadInfo(x, z).distance };
  });
  const best = candidates.reduce((a, b) => (b.open > a.open ? b : a));
  const toRoad = Math.atan2(-f.side.x * best.sgn, -f.side.z * best.sgn);
  const front = [best.x - f.side.x * best.sgn * 7.5, best.z - f.side.z * best.sgn * 7.5] as const;
  return { x: best.x, z: best.z, y: getTerrainHeight(best.x, best.z), rotY: toRoad, front };
})();

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
      {/* 1. Trailhead gate */}
      <group position={LM.trailhead} rotation={[0, START_HEADING, 0]}>
        <TrailheadGate />
      </group>

      {/* 2. Linh Ung Lady Buddha */}
      <group position={[PLAZA.x, PLAZA.y, PLAZA.z]} rotation={[0, PLAZA.rotY, 0]}>
        <LinhUngStatue />
      </group>

      {/* 3. Ancient Banyan Tree */}
      <group position={LM["banyan-tree"]}>
        <BanyanTree />
      </group>

      {/* Resting hikers beneath the banyan */}
      <group position={[LM["banyan-tree"][0] + 4.5, LM["banyan-tree"][1] + 0.05, LM["banyan-tree"][2] + 3.5]} rotation={[0, -0.55, 0]}>
        <Human pose="sit" shirt="#34495e" hat="cap" position={[-0.8, 0, 0]} rotation={[0, 0.6, 0]} />
        <Human pose="sit" shirt="#d9d0bd" hat="non-la" skin="#c88f6b" position={[0.9, 0, -0.35]} rotation={[0, -0.7, 0]} />
        <mesh position={[0.05, 0.25, 0.9]} castShadow>
          <boxGeometry args={[0.55, 0.38, 0.4]} />
          <meshStandardMaterial color="#b77639" roughness={0.9} />
        </mesh>
      </group>

      {/* Two visitors in front of the Lady Buddha */}
      <group name="PlazaVisitors" position={[PLAZA.front[0], PLAZA.y, PLAZA.front[1]]} rotation={[0, PLAZA.rotY + Math.PI, 0]}>
        <Human pose="stand" shirt="#d7d0c2" hat="cap" pole position={[-0.7, 0, 0]} rotation={[0, 0.3, 0]} />
        <Human pose="stand" shirt="#263b4a" hat="non-la" skin="#c88f6b" position={[0.8, 0, -0.4]} rotation={[0, -0.3, 0]} />
      </group>

      {/* 4. Ban Co Peak Summit */}
      <group position={LM["ban-co-peak"]}>
        <BanCoSummit />
      </group>

      {/* Rocky Son Tra shoreline cove with sea stacks and small surf */}
      <group name="BaiDaCove" position={[-30, -0.05, 66]}>
        {[
          { p: [0, 0.7, 0] as [number, number, number], s: [5.5, 2.1, 3.2] as [number, number, number], c: "#555b56" },
          { p: [5.2, 1.1, -2.4] as [number, number, number], s: [3.1, 3.3, 2.6] as [number, number, number], c: "#686b62" },
          { p: [-5.3, 0.65, -2.1] as [number, number, number], s: [4.3, 1.8, 3] as [number, number, number], c: "#464d49" },
          { p: [2.2, 0.4, 3.7] as [number, number, number], s: [3.7, 1.1, 2.4] as [number, number, number], c: "#77796e" },
          { p: [-8, 2.4, -5.5] as [number, number, number], s: [5.2, 5.2, 3.3] as [number, number, number], c: "#515950" },
        ].map((rock, index) => (
          <mesh key={index} position={rock.p} scale={rock.s} rotation={[0.1 * index, 0.23 * index, 0.06 * index]} castShadow receiveShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={rock.c} roughness={0.96} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0.15, 8]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[10, 32]} />
          <meshStandardMaterial color="#3ca6b7" transparent opacity={0.62} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.22, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6.8, 8.1, 32]} />
          <meshBasicMaterial color="#e8f5e9" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
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
