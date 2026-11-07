"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const M = {
  white: { color: "#f6f7f3", roughness: 0.35 },
  marble: { color: "#e3e1d8", roughness: 0.5 },
  stone: { color: "#8a8f88", roughness: 0.9 },
  darkStone: { color: "#5f645e", roughness: 0.92 },
  gold: { color: "#d4a93a", roughness: 0.3, metalness: 0.6 },
  red: { color: "#b3261e", roughness: 0.55 },
  wood: { color: "#5c4028", roughness: 0.85 },
  bark: { color: "#4a3a2c", roughness: 0.95 },
};

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Wooden trailhead gate with a sign board, roof tiles and a route map stand. */
export function TrailheadGate() {
  return (
    <group name="TrailheadGate">
      {[-3.2, 3.2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.4, 0.9]} />
            <meshStandardMaterial {...M.stone} />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.26, 3.6, 10]} />
            <meshStandardMaterial {...M.wood} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.6, 0.4, 0.5]} />
        <meshStandardMaterial {...M.wood} />
      </mesh>
      {/* curved tiled roof */}
      <mesh position={[0, 4.35, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[8.4, 0.16, 1.5]} />
        <meshStandardMaterial color="#7a2e22" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.55, 0]} castShadow>
        <boxGeometry args={[8.0, 0.14, 0.5]} />
        <meshStandardMaterial color="#7a2e22" roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 4.25, 4.5, 0]} rotation={[0, 0, s * 0.5]} castShadow>
          <boxGeometry args={[0.7, 0.14, 1.4]} />
          <meshStandardMaterial color="#7a2e22" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 3.85, 0.28]}>
        <boxGeometry args={[4.8, 0.7, 0.06]} />
        <meshStandardMaterial color="#1f4d36" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.85, 0.32]}>
        <boxGeometry args={[4.4, 0.08, 0.02]} />
        <meshStandardMaterial {...M.gold} />
      </mesh>
      {/* Route map board beside the gate */}
      <group position={[-5.6, 0, 1.2]} rotation={[0, 0.4, 0]}>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.85, 0]} castShadow>
            <boxGeometry args={[0.1, 1.7, 0.1]} />
            <meshStandardMaterial {...M.wood} />
          </mesh>
        ))}
        <mesh position={[0, 1.35, 0.02]} castShadow>
          <boxGeometry args={[1.7, 1.0, 0.07]} />
          <meshStandardMaterial color="#e8dfc4" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.35, 0.065]}>
          <boxGeometry args={[1.5, 0.8, 0.01]} />
          <meshStandardMaterial color="#5e8f6a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Lady Buddha (Tượng Phật Bà Quan Âm, Linh Ứng): 3-tier lotus base, tapering robe with
 * folds, hands holding a vase, draped sash, head with crown and halo.
 */
export function QuanAmStatue() {
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2), []);
  return (
    <group name="QuanAmStatue">
      {/* Courtyard + stepped plinth */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[5.2, 5.4, 0.3, 32]} />
        <meshStandardMaterial {...M.marble} />
      </mesh>
      {[4.0, 3.2, 2.5].map((r, i) => (
        <mesh key={r} position={[0, 0.45 + i * 0.35, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[r, r + 0.25, 0.35, 24]} />
          <meshStandardMaterial {...M.marble} />
        </mesh>
      ))}
      {/* Lotus petals around the base */}
      {petals.map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 2.2, 1.75, Math.sin(a) * 2.2]}
          rotation={[Math.sin(a) * 0.6, -a, -Math.cos(a) * 0.6]}
          scale={[0.55, 1, 0.22]}
          castShadow
        >
          <sphereGeometry args={[0.8, 10, 8]} />
          <meshStandardMaterial color="#f7e6ee" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 2.0, 0.5, 20]} />
        <meshStandardMaterial {...M.white} />
      </mesh>

      <group position={[0, 2.1, 0]}>
        {/* Robe: lathe profile for a flowing taper */}
        <mesh castShadow receiveShadow>
          <latheGeometry
            args={[
              [
                [1.15, 0],
                [1.0, 0.6],
                [0.82, 1.6],
                [0.7, 2.8],
                [0.68, 3.6],
                [0.52, 4.3],
                [0.36, 4.7],
                [0.22, 4.9],
              ].map(([x, y]) => new THREE.Vector2(x, y)),
              28,
            ]}
          />
          <meshStandardMaterial {...M.white} side={THREE.DoubleSide} />
        </mesh>
        {/* Robe folds */}
        {Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={i}
            position={[Math.sin(i * 0.9 - 2.6) * 0.62, 1.6, Math.cos(i * 0.9 - 2.6) * 0.62]}
            rotation={[0, i * 0.9 - 2.6, 0]}
            scale={[0.08, 1, 0.14]}
          >
            <cylinderGeometry args={[1, 1.4, 3.0, 5]} />
            <meshStandardMaterial {...M.white} />
          </mesh>
        ))}
        {/* Sash draped from shoulder */}
        <mesh position={[0.05, 3.5, 0.5]} rotation={[0.1, 0, 0.45]} scale={[1, 1, 0.22]} castShadow>
          <cylinderGeometry args={[0.22, 0.16, 2.4, 10]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        {/* Hands + vase */}
        <mesh position={[0.18, 3.55, 0.64]} castShadow>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        <mesh position={[-0.35, 3.8, 0.55]} rotation={[0, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        <mesh position={[0.3, 3.7, 0.62]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.25, 10]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        {/* Shoulders / neck / head */}
        <mesh position={[0, 4.35, 0]} scale={[1.2, 0.5, 0.8]} castShadow>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        <mesh position={[0, 4.78, 0.02]} castShadow>
          <cylinderGeometry args={[0.14, 0.18, 0.3, 10]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        <mesh position={[0, 5.15, 0.04]} scale={[0.9, 1.1, 1]} castShadow>
          <sphereGeometry args={[0.34, 20, 16]} />
          <meshStandardMaterial {...M.white} />
        </mesh>
        {/* Hair bun / crown */}
        <mesh position={[0, 5.55, 0]} castShadow>
          <coneGeometry args={[0.22, 0.4, 10]} />
          <meshStandardMaterial color="#e9edf0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 5.4, 0.0]} castShadow>
          <torusGeometry args={[0.3, 0.035, 8, 20]} />
          <meshStandardMaterial {...M.gold} />
        </mesh>
        {/* Halo */}
        <mesh position={[0, 5.2, -0.3]}>
          <torusGeometry args={[0.95, 0.04, 8, 36]} />
          <meshStandardMaterial {...M.gold} />
        </mesh>
        <mesh position={[0, 5.2, -0.31]}>
          <circleGeometry args={[0.93, 36]} />
          <meshStandardMaterial color="#f8e7a3" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/** Ancient heritage banyan: several twisted trunks, curved aerial roots, layered canopy. */
export function BanyanTree() {
  const { roots, trunks, canopy } = useMemo(() => {
    const roots = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + seeded(i) * 0.3;
      const r0 = 1.2 + seeded(i + 40) * 3.2;
      const top = new THREE.Vector3(Math.cos(a) * r0 * 0.5, 4.8 + seeded(i + 9) * 0.8, Math.sin(a) * r0 * 0.5);
      const bottom = new THREE.Vector3(Math.cos(a) * r0, 0, Math.sin(a) * r0);
      const mid = top.clone().lerp(bottom, 0.5).add(new THREE.Vector3(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35));
      return {
        geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top, mid, bottom]), 14, 0.07 + seeded(i + 3) * 0.1, 6),
      };
    });
    const trunks = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      const base = new THREE.Vector3(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55);
      const pts = [
        base,
        base.clone().add(new THREE.Vector3(Math.cos(a) * 0.25, 1.6, Math.sin(a) * 0.25 + 0.2)),
        base.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, 3.2, -Math.sin(a) * 0.3)),
        base.clone().add(new THREE.Vector3(Math.cos(a) * 0.9, 4.8, Math.sin(a) * 0.3)),
      ];
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.55 - i * 0.04, 9);
    });
    const canopy = Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2;
      const d = 1.2 + seeded(i + 70) * 3.6;
      return {
        p: [Math.cos(a) * d, 5.2 + seeded(i + 5) * 1.7, Math.sin(a) * d] as [number, number, number],
        s: 1.9 + seeded(i + 11) * 1.5,
        c: ["#1f5230", "#2a6a3a", "#245a32", "#337a43"][i % 4],
      };
    });
    return { roots, trunks, canopy };
  }, []);

  return (
    <group name="BanyanTree">
      {trunks.map((g, i) => (
        <mesh key={`t${i}`} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial {...M.bark} />
        </mesh>
      ))}
      {/* buttress base */}
      <mesh position={[0, 0.35, 0]} scale={[1, 0.55, 1]} castShadow receiveShadow>
        <sphereGeometry args={[1.9, 14, 10]} />
        <meshStandardMaterial {...M.bark} />
      </mesh>
      {roots.map((r, i) => (
        <mesh key={`r${i}`} geometry={r.geo} castShadow>
          <meshStandardMaterial color="#5d4936" roughness={0.92} />
        </mesh>
      ))}
      {canopy.map((c, i) => (
        <mesh key={`c${i}`} position={c.p} castShadow receiveShadow>
          <icosahedronGeometry args={[c.s, 1]} />
          <meshStandardMaterial color={c.c} roughness={0.85} flatShading />
        </mesh>
      ))}
      {/* sacred red cloth + shrine stone */}
      <mesh position={[1.9, 0.55, 1.5]} rotation={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1.1, 0.5]} />
        <meshStandardMaterial {...M.stone} />
      </mesh>
      <mesh position={[1.9, 0.9, 1.78]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.55, 0.3, 0.02]} />
        <meshStandardMaterial {...M.red} />
      </mesh>
    </group>
  );
}

const BAN_CO_MODEL_PATH = "/models/ban-co-summit/ban-co-summit.gltf";
const BAN_CO_MODEL_WIDTH = 7.1;
const BAN_CO_MODEL_BASE = 0.72;

/** Ban Co Peak: imported scanned summit model on a stone platform. */
export function BanCoSummit() {
  const gltf = useGLTF(BAN_CO_MODEL_PATH);
  const summitModel = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const dimensions = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = BAN_CO_MODEL_WIDTH / (Math.max(dimensions.x, dimensions.z) || 1);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, BAN_CO_MODEL_BASE - box.min.y * scale, -center.z * scale);
    const wrapper = new THREE.Group();
    wrapper.add(clone);
    return wrapper;
  }, [gltf]);
  return (
    <group name="BanCoSummit">
      {/* Layered stone platform with steps */}
      {[6.0, 5.2].map((r, i) => (
        <mesh key={r} position={[0, 0.2 + i * 0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[r, r + 0.4, 0.4, 28]} />
          <meshStandardMaterial {...M.stone} />
        </mesh>
      ))}
      {/* Rock outcrop */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 6.4, 0.4, Math.sin(a) * 6.4]}
            scale={[1.2 + seeded(i) * 0.8, 0.8 + seeded(i + 9) * 0.9, 1 + seeded(i + 3) * 0.6]}
            rotation={[seeded(i), seeded(i + 4) * 3, 0]}
            castShadow
          >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial {...M.darkStone} flatShading />
          </mesh>
        );
      })}

      <primitive object={summitModel} />

      {/* Elevation marker + flag pole */}
      <group position={[3.0, 0.7, -2.4]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.6, 1.4, 0.5]} />
          <meshStandardMaterial color="#e8ece6" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.43, 0.5, 4]} />
          <meshStandardMaterial {...M.red} />
        </mesh>
      </group>
      <group position={[-3.2, 0.7, 2.6]}>
        <mesh position={[0, 3, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 6, 8]} />
          <meshStandardMaterial color="#d9d9d9" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.65, 5.3, 0]} castShadow>
          <boxGeometry args={[1.3, 0.85, 0.03]} />
          <meshStandardMaterial {...M.red} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.65, 5.3, 0.02]}>
          <circleGeometry args={[0.24, 5]} />
          <meshStandardMaterial color="#f5d142" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/** Linh Ung Lady Buddha scanned model (public/models/linh-ung.glb, ~120k tris) on a stone courtyard. */
const LINH_UNG_PATH = "/models/linh-ung.glb";
const LINH_UNG_HEIGHT = 15;
const LINH_UNG_BASE = 0.9;

export function LinhUngStatue() {
  const gltf = useGLTF(LINH_UNG_PATH);
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const dim = box.getSize(new THREE.Vector3());
    const s = LINH_UNG_HEIGHT / (dim.y || 1);
    const c = box.getCenter(new THREE.Vector3());
    clone.scale.multiplyScalar(s);
    clone.position.set(-c.x * s, LINH_UNG_BASE - box.min.y * s, -c.z * s);
    const wrap = new THREE.Group();
    wrap.add(clone);
    return wrap;
  }, [gltf]);
  return (
    <group name="LinhUngStatue">
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[5.4, 5.6, 0.3, 32]} />
        <meshStandardMaterial {...M.marble} />
      </mesh>
      {[4.2, 3.4].map((r, i) => (
        <mesh key={r} position={[0, 0.45 + i * 0.22, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[r, r + 0.25, 0.25, 28]} />
          <meshStandardMaterial {...M.marble} />
        </mesh>
      ))}
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(LINH_UNG_PATH);
useGLTF.preload(BAN_CO_MODEL_PATH);
