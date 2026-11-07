"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  ArrowSign,
  Billboard,
  LampPost,
  Rock,
  StopSign,
} from "../../../model/components";
import {
  getClosestRoadInfo,
  getRoadCurve,
  getRouteFrame,
  getTerrainHeight,
  SCENIC_PULLOUT_FRACTIONS,
  SON_TRA_LANDMARKS,
} from "./roadData";

/** Keep guardrails, shrubs and rocks away from landmark plazas and scenic pullout bays. */
const nearLandmark = (x: number, z: number, r: number) =>
  SON_TRA_LANDMARKS.some(
    (l) => Math.hypot(l.position[0] - x, l.position[2] - z) < r
  );

const nearPullout = (u: number) =>
  SCENIC_PULLOUT_FRACTIONS.some((pf) => Math.abs(u - pf) < 0.022);

function seeded(i: number) {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Guardrails with reflectors, 3D LampPosts, ArrowSigns, Billboards, StopSigns,
 * ferns/shrubs and roadside rocks along the refactored Son Tra mountain pass.
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

    const rail: {
      p: THREE.Vector3;
      q: THREE.Quaternion;
      len: number;
      red: boolean;
    }[] = [];
    for (let i = 0; i < n; i++) {
      if (i < 4 || i > n - 6) continue;
      const u = i / n;
      const u2 = (i + 1) / n;
      if (nearPullout(u)) continue;

      const a = curve.getPointAt(u);
      const b = curve.getPointAt(u2);
      const tan = b.clone().sub(a);
      tan.normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const off = 3.05;
      if (nearLandmark(a.x, a.z, 15)) continue;
      const pa = a.clone().addScaledVector(side, off);
      const pb = b.clone().addScaledVector(side, off);
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        pb.clone().sub(pa).normalize()
      );
      rail.push({ p: mid, q, len: pa.distanceTo(pb), red: i % 4 === 0 });
    }

    const plants: { p: THREE.Vector3; s: number; c: THREE.Color }[] = [];
    const stones: { p: THREE.Vector3; s: THREE.Vector3; r: number }[] = [];
    const greens = [
      "#2f6b36",
      "#3f8a43",
      "#27582f",
      "#4b9a4a",
      "#5aa550",
    ].map((c) => new THREE.Color(c));

    for (let i = 0; i < 380; i++) {
      const u = seeded(i * 3 + 1);
      if (nearPullout(u)) continue;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const sgn = seeded(i * 7 + 2) > 0.5 ? 1 : -1;
      const off = 3.6 + seeded(i * 11 + 3) * 6.5;
      const x = pt.x + side.x * sgn * off;
      const z = pt.z + side.z * sgn * off;
      if (getClosestRoadInfo(x, z).distance < 3.4 || nearLandmark(x, z, 15))
        continue;
      const y = getTerrainHeight(x, z);
      if (y < 0.1) continue;
      plants.push({
        p: new THREE.Vector3(x, y, z),
        s: 0.35 + seeded(i * 13 + 4) * 0.7,
        c: greens[i % greens.length],
      });
    }

    for (let i = 0; i < 90; i++) {
      const u = seeded(i * 5 + 900);
      if (nearPullout(u)) continue;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();
      const sgn = seeded(i * 7 + 5) > 0.5 ? 1 : -1;
      const off = 3.5 + seeded(i * 17 + 6) * 5;
      const x = pt.x + side.x * sgn * off;
      const z = pt.z + side.z * sgn * off;
      if (getClosestRoadInfo(x, z).distance < 3.3 || nearLandmark(x, z, 15))
        continue;
      const y = getTerrainHeight(x, z);
      if (y < 0.1) continue;
      const k = 0.25 + seeded(i * 19 + 7) * 0.7;
      stones.push({
        p: new THREE.Vector3(x, y + k * 0.25, z),
        s: new THREE.Vector3(k * 1.3, k * 0.8, k),
        r: seeded(i) * 6,
      });
    }

    // 3D LampPost positions along the mountain pass
    const lamps = [
      0.03, 0.11, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.75, 0.84, 0.93,
    ].map((f, idx) => {
      const frame = getRouteFrame(f);
      const sgn = idx % 2 === 0 ? -1 : 1;
      const x = frame.point.x + frame.side.x * sgn * 3.1;
      const z = frame.point.z + frame.side.z * sgn * 3.1;
      return {
        position: [x, frame.point.y, z] as [number, number, number],
        rotationY: Math.atan2(-frame.side.x * sgn, -frame.side.z * sgn),
      };
    });

    // 3D ArrowSign curve markers & Banyan trail pointer
    const arrowSigns = [0.15, 0.28, 0.52, 0.64, 0.72, 0.88].map((f, idx) => {
      const frame = getRouteFrame(f);
      const sgn = f === 0.72 ? -1 : idx % 2 === 0 ? 1 : -1;
      const x = frame.point.x + frame.side.x * sgn * 3.25;
      const z = frame.point.z + frame.side.z * sgn * 3.25;
      return {
        position: [x, frame.point.y, z] as [number, number, number],
        rotationY: Math.atan2(frame.tangent.x, frame.tangent.z),
      };
    });

    // 3D Billboards at Trailhead & Wildlife Sanctuary
    const billboards = [0.02, 0.46].map((f) => {
      const frame = getRouteFrame(f);
      const x = frame.point.x - frame.side.x * 4.4;
      const z = frame.point.z - frame.side.z * 4.4;
      return {
        position: [x, frame.point.y + 0.9, z] as [number, number, number],
        rotationY: Math.atan2(frame.side.x, frame.side.z),
      };
    });

    // 3D StopSigns at Trailhead & Summit approach
    const stopSigns = [0.012, 0.985].map((f) => {
      const frame = getRouteFrame(f);
      const x = frame.point.x + frame.side.x * 3.0;
      const z = frame.point.z + frame.side.z * 3.0;
      return {
        position: [x, frame.point.y, z] as [number, number, number],
        rotationY: Math.atan2(-frame.tangent.x, -frame.tangent.z),
      };
    });

    // 3D Quaternius Rocks accenting key mountain switchbacks
    const glbRocks = [0.12, 0.24, 0.37, 0.49, 0.61, 0.76, 0.89].map(
      (f, idx) => {
        const frame = getRouteFrame(f);
        const sgn = idx % 2 === 0 ? -1 : 1;
        const x = frame.point.x + frame.side.x * sgn * 4.6;
        const z = frame.point.z + frame.side.z * sgn * 4.6;
        return {
          position: [x, getTerrainHeight(x, z), z] as [number, number, number],
          rotationY: idx * 1.3,
          scale: 2.2 + (idx % 3) * 0.6,
        };
      }
    );

    return {
      rail,
      plants,
      stones,
      lamps,
      arrowSigns,
      billboards,
      stopSigns,
      glbRocks,
    };
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);

    data.rail.forEach((r, i) => {
      posts.current?.setMatrixAt(
        i,
        m.compose(r.p.clone(), q.identity(), one)
      );
      rails.current?.setMatrixAt(
        i,
        m.compose(
          r.p.clone().add(new THREE.Vector3(0, 0.62, 0)),
          r.q,
          new THREE.Vector3(r.len, 1, 1)
        )
      );
      reflectors.current?.setMatrixAt(
        i,
        m.compose(
          r.p.clone().add(new THREE.Vector3(0, 0.62, 0)),
          r.q,
          new THREE.Vector3(r.red ? 0.5 : 0.001, 1, 1.12)
        )
      );
    });
    [posts, rails, reflectors].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });

    data.plants.forEach((pl, i) => {
      shrubs.current?.setMatrixAt(
        i,
        m.compose(
          pl.p,
          q.setFromEuler(new THREE.Euler(0, i, 0)),
          new THREE.Vector3(pl.s * 1.3, pl.s, pl.s * 1.3)
        )
      );
      shrubs.current?.setColorAt(i, pl.c);
    });
    if (shrubs.current) {
      shrubs.current.instanceMatrix.needsUpdate = true;
      if (shrubs.current.instanceColor)
        shrubs.current.instanceColor.needsUpdate = true;
    }

    data.stones.forEach((st, i) => {
      rocks.current?.setMatrixAt(
        i,
        m.compose(
          st.p,
          q.setFromEuler(new THREE.Euler(st.r, st.r * 2, 0)),
          st.s
        )
      );
    });
    if (rocks.current) rocks.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group name="SonTraRoadsideDetails">
      <instancedMesh
        ref={posts}
        args={[undefined, undefined, data.rail.length]}
        castShadow
      >
        <boxGeometry args={[0.1, 0.9, 0.1]} />
        <meshStandardMaterial color="#c9ccc7" roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh
        ref={rails}
        args={[undefined, undefined, data.rail.length]}
        castShadow
      >
        <boxGeometry args={[1, 0.16, 0.05]} />
        <meshStandardMaterial
          color="#b7bcb8"
          roughness={0.45}
          metalness={0.5}
        />
      </instancedMesh>
      <instancedMesh
        ref={reflectors}
        args={[undefined, undefined, data.rail.length]}
      >
        <boxGeometry args={[1, 0.17, 0.06]} />
        <meshStandardMaterial
          color="#d6322a"
          roughness={0.4}
          emissive="#5a0f0b"
          emissiveIntensity={0.4}
        />
      </instancedMesh>
      <instancedMesh
        ref={shrubs}
        args={[undefined, undefined, data.plants.length]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh
        ref={rocks}
        args={[undefined, undefined, data.stones.length]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#7d7f77" roughness={0.95} flatShading />
      </instancedMesh>

      {/* 3D GLB Roadside Lamp Posts */}
      {data.lamps.map((lamp, i) => (
        <LampPost
          key={`lamp-${i}`}
          position={lamp.position}
          rotation={[0, lamp.rotationY, 0]}
          scale={0.21}
        />
      ))}

      {/* 3D GLB Arrow Signs on Mountain Curves & Banyan Junction */}
      {data.arrowSigns.map((sign, i) => (
        <ArrowSign
          key={`arrow-${i}`}
          position={sign.position}
          rotation={[0, sign.rotationY, 0]}
          scale={1.15}
        />
      ))}

      {/* 3D GLB Information Billboards */}
      {data.billboards.map((board, i) => (
        <Billboard
          key={`billboard-${i}`}
          position={board.position}
          rotation={[0, board.rotationY, 0]}
          scale={3.2}
        />
      ))}

      {/* 3D GLB Stop Signs at Checkpoints */}
      {data.stopSigns.map((stop, i) => (
        <StopSign
          key={`stop-${i}`}
          position={stop.position}
          rotation={[0, stop.rotationY, 0]}
          scale={0.0095}
        />
      ))}

      {/* 3D GLB Boulders */}
      {data.glbRocks.map((rk, i) => (
        <Rock
          key={`glbrock-${i}`}
          position={rk.position}
          rotation={[0, rk.rotationY, 0]}
          scale={rk.scale}
        />
      ))}
    </group>
  );
}
