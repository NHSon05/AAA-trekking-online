"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getClosestRoadInfo, getRoadCurve, getTerrainHeight, SON_TRA_LANDMARKS } from "./roadData";

/** Keep guardrails, shrubs and rocks away from landmark plazas. */
const nearLandmark = (x: number, z: number, r: number) =>
  SON_TRA_LANDMARKS.some((l) => Math.hypot(l.position[0] - x, l.position[2] - z) < r);

function seeded(i: number) {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Guardrails with reflectors, ferns/shrubs and roadside rocks (all instanced) so the
 * mountain road reads like a real coastal pass instead of a bare ribbon.
 */
export function RoadsideDetails() {
  const posts = useRef<THREE.InstancedMesh>(null);
  const rails = useRef<THREE.InstancedMesh>(null);
  const reflectors = useRef<THREE.InstancedMesh>(null);
  const shrubs = useRef<THREE.InstancedMesh>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const curve = getRoadCurve();
    const length = curve.getLength();
    const up = new THREE.Vector3(0, 1, 0);
    const spacing = 3.35;
    const n = Math.floor(length / spacing);

    const rail: { p: THREE.Vector3; q: THREE.Quaternion; len: number; red: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      // Skip the trailhead gate and summit platform
      if (i < 4 || i > n - 6) continue;
      const u = i / n;
      const u2 = (i + 1) / n;
      const a = curve.getPointAt(u);
      const b = curve.getPointAt(u2);
      const tan = b.clone().sub(a);
      const len = tan.length();
      tan.normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      // Guardrail on the right-hand edge only (leave the mountain side open)
      const off = 3.05;
      if (nearLandmark(a.x, a.z, 18)) continue;
      const pa = a.clone().addScaledVector(side, off);
      const pb = b.clone().addScaledVector(side, off);
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), pb.clone().sub(pa).normalize());
      rail.push({ p: mid, q, len: pa.distanceTo(pb), red: i % 4 === 0 });
    }

    const plants: { p: THREE.Vector3; s: number; c: THREE.Color }[] = [];
    const stones: { p: THREE.Vector3; s: THREE.Vector3; r: number }[] = [];
    const greens = ["#2f6b36", "#3f8a43", "#27582f", "#4b9a4a", "#5aa550"].map((c) => new THREE.Color(c));
    for (let i = 0; i < 420; i++) {
      const u = seeded(i * 3 + 1);
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const sgn = seeded(i * 7 + 2) > 0.5 ? 1 : -1;
      const off = 3.4 + seeded(i * 11 + 3) * 6.5;
      const x = pt.x + side.x * sgn * off;
      const z = pt.z + side.z * sgn * off;
      if (getClosestRoadInfo(x, z).distance < 3.3 || nearLandmark(x, z, 16)) continue;
      const y = getTerrainHeight(x, z);
      if (y < 0.1) continue;
      plants.push({
        p: new THREE.Vector3(x, y, z),
        s: 0.35 + seeded(i * 13 + 4) * 0.7,
        c: greens[i % greens.length],
      });
    }
    for (let i = 0; i < 110; i++) {
      const u = seeded(i * 5 + 900);
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const sgn = seeded(i * 7 + 5) > 0.5 ? 1 : -1;
      const off = 3.3 + seeded(i * 17 + 6) * 5;
      const x = pt.x + side.x * sgn * off;
      const z = pt.z + side.z * sgn * off;
      if (getClosestRoadInfo(x, z).distance < 3.1 || nearLandmark(x, z, 16)) continue;
      const y = getTerrainHeight(x, z);
      if (y < 0.1) continue;
      const k = 0.25 + seeded(i * 19 + 7) * 0.7;
      stones.push({ p: new THREE.Vector3(x, y + k * 0.25, z), s: new THREE.Vector3(k * 1.3, k * 0.8, k), r: seeded(i) * 6 });
    }
    return { rail, plants, stones };
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);

    data.rail.forEach((r, i) => {
      posts.current?.setMatrixAt(i, m.compose(r.p.clone().add(new THREE.Vector3(0, 0.0, 0)), q.identity(), one));
      rails.current?.setMatrixAt(i, m.compose(r.p.clone().add(new THREE.Vector3(0, 0.62, 0)), r.q, new THREE.Vector3(r.len, 1, 1)));
      reflectors.current?.setMatrixAt(i, m.compose(r.p.clone().add(new THREE.Vector3(0, 0.62, 0.0)), r.q, new THREE.Vector3(r.red ? 0.5 : 0.001, 1, 1.12)));
    });
    [posts, rails, reflectors].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });

    data.plants.forEach((pl, i) => {
      shrubs.current?.setMatrixAt(i, m.compose(pl.p, q.setFromEuler(new THREE.Euler(0, i, 0)), new THREE.Vector3(pl.s * 1.3, pl.s, pl.s * 1.3)));
      shrubs.current?.setColorAt(i, pl.c);
    });
    if (shrubs.current) {
      shrubs.current.instanceMatrix.needsUpdate = true;
      if (shrubs.current.instanceColor) shrubs.current.instanceColor.needsUpdate = true;
    }
    data.stones.forEach((st, i) => {
      rocks.current?.setMatrixAt(i, m.compose(st.p, q.setFromEuler(new THREE.Euler(st.r, st.r * 2, 0)), st.s));
    });
    if (rocks.current) rocks.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group name="SonTraRoadsideDetails">
      <instancedMesh ref={posts} args={[undefined, undefined, data.rail.length]} castShadow>
        <boxGeometry args={[0.1, 0.9, 0.1]} />
        <meshStandardMaterial color="#c9ccc7" roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[undefined, undefined, data.rail.length]} castShadow>
        <boxGeometry args={[1, 0.16, 0.05]} />
        <meshStandardMaterial color="#b7bcb8" roughness={0.45} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={reflectors} args={[undefined, undefined, data.rail.length]}>
        <boxGeometry args={[1, 0.17, 0.06]} />
        <meshStandardMaterial color="#d6322a" roughness={0.4} emissive="#5a0f0b" emissiveIntensity={0.4} />
      </instancedMesh>
      <instancedMesh ref={shrubs} args={[undefined, undefined, data.plants.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[undefined, undefined, data.stones.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#7d7f77" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}
