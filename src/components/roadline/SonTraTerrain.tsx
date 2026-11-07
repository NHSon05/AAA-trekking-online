"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getClosestRoadInfo, getTerrainHeight } from "./roadData";

export function SonTraTerrain() {
  const terrainGeometry = useMemo(() => {
    const width = 180;
    const depth = 230;
    const segX = 110;
    const segZ = 140;

    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i) - 6;
      const z = posAttr.getZ(i) - 18;
      posAttr.setXYZ(i, x, getTerrainHeight(x, z), z);
    }
    geo.computeVertexNormals();
    const normals = geo.attributes.normal;
    const jitter = (x: number, z: number) =>
      (Math.sin(x * 1.7 + z * 2.3) * 0.5 + Math.sin(x * 0.6 - z * 0.9) * 0.5) *
        0.5 +
      0.5;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);
      const slope = 1 - normals.getY(i);
      const roadInfo = getClosestRoadInfo(x, z);
      const j = jitter(x, z);

      if (y < -0.35) {
        color.set("#a99a72");
      } else if (y < 0.35 && (x > 76 || z > 64 || y < 0.1)) {
        color.set("#dccb9c").lerp(new THREE.Color("#c9b886"), j * 0.5);
      } else if (roadInfo.distance < 3.6) {
        color.set("#5a5a48");
      } else if (slope > 0.16) {
        color.set("#7a7468").lerp(new THREE.Color("#5c5a52"), j);
      } else if (y > 9.5) {
        color.set("#3f6b43").lerp(new THREE.Color("#2f5636"), j);
      } else if (y > 4.5) {
        color.set("#2d5a38").lerp(new THREE.Color("#3d7243"), j);
      } else {
        color.set("#3a6c3e").lerp(new THREE.Color("#4c8048"), j);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <group name="SonTraPeninsulaTerrain">
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.04} />
      </mesh>
      <Sea />
    </group>
  );
}

/**
 * Optimized Sea mesh:
 * - Uses a 48x48 grid (5x fewer vertices than 110x110)
 * - Throttles wave displacement updates to ~20 FPS and skips costly per-frame computeVertexNormals()
 */
function Sea() {
  const mesh = useRef<THREE.Mesh>(null);
  const lastUpdate = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(440, 440, 48, 48);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const deep = new THREE.Color("#14548a");
    const mid = new THREE.Color("#1f8aa8");
    const shallow = new THREE.Color("#52c4c0");
    const foam = new THREE.Color("#eaf7f4");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = getTerrainHeight(pos.getX(i) + 20, pos.getZ(i));
      if (h > -0.55) c.copy(foam);
      else if (h > -1.3) c.copy(shallow);
      else if (h > -3.5) c.copy(mid).lerp(shallow, Math.max(0, (h + 3.5) / 2.2));
      else c.copy(deep).lerp(mid, Math.max(0, (h + 9) / 5.5));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const base = useMemo(
    () => Float32Array.from(geometry.attributes.position.array as Float32Array),
    [geometry]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (t - lastUpdate.current < 0.05) return;
    lastUpdate.current = t;

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      pos.setY(
        i,
        Math.sin(x * 0.12 + t * 0.9) * 0.1 +
          Math.cos(z * 0.1 + t * 0.7) * 0.08
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[20, -0.45, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.18}
        metalness={0.2}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}
