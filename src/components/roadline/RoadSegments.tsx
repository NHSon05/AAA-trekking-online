"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  getBanyanTrailCurve,
  getRoadCurve,
  getRouteFrame,
  getTerrainHeight,
  SCENIC_PULLOUT_FRACTIONS,
} from "./roadData";

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  let offset = 0;
  for (const g of geos) {
    const p = g.attributes.position.array;
    for (let i = 0; i < p.length; i++) pos.push(p[i]);
    const ix = g.index!.array;
    for (let i = 0; i < ix.length; i++) idx.push(ix[i] + offset);
    offset += p.length / 3;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setIndex(idx);
  out.computeVertexNormals();
  return out;
}

/**
 * Refactored 3D Mountain Roadline for Son Tra Peninsula:
 * - Stone retaining embankment foundation anchored into the mountain slope
 * - Compacted gravel shoulders & crowned asphalt surface
 * - Raised concrete curbs, white edge lines, and yellow center dashes
 * - Paved scenic pullout bays along the mountain pass
 * - Continuous forest trail ribbon & stepping stones to the Ancient Banyan Tree
 */
export function RoadSegments() {
  const {
    embankment,
    shoulders,
    asphalt,
    edgeLines,
    dashes,
    kerbs,
    milestones,
    banyanRibbon,
    trailSteps,
    pullouts,
  } = useMemo(() => {
    const curve = getRoadCurve();
    const length = curve.getLength();
    const perStep = 0.55;
    const samples = curve.getSpacedPoints(Math.ceil(length / perStep));
    const up = new THREE.Vector3(0, 1, 0);

    // Smoothly filtered side vectors so tight curves never self-cross
    const rawSides = samples.map((_, i) => {
      const a = samples[Math.max(0, i - 2)];
      const b = samples[Math.min(samples.length - 1, i + 2)];
      const t = b.clone().sub(a).setY(0).normalize();
      return new THREE.Vector3().crossVectors(t, up).normalize();
    });
    const sides = rawSides.map((_, i) => {
      const prev = rawSides[Math.max(0, i - 1)];
      const curr = rawSides[i];
      const next = rawSides[Math.min(rawSides.length - 1, i + 1)];
      return prev
        .clone()
        .add(curr)
        .add(next)
        .setY(0)
        .normalize();
    });

    const buildRibbon = (
      fromOffset: number,
      toOffset: number,
      liftFrom: number,
      liftTo = liftFrom,
      startIdx = 0,
      endIdx = samples.length - 1
    ) => {
      const pos: number[] = [];
      const idx: number[] = [];
      let n = 0;
      for (let i = startIdx; i <= endIdx; i++) {
        const p = samples[i];
        const s = sides[i];
        pos.push(
          p.x + s.x * fromOffset,
          p.y + liftFrom,
          p.z + s.z * fromOffset,
          p.x + s.x * toOffset,
          p.y + liftTo,
          p.z + s.z * toOffset
        );
        if (i < endIdx) {
          idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        }
        n += 2;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };

    // Crowned asphalt surface: 2 strips meeting at the elevated road crown (offset = 0)
    const CrownLift = 0.085;
    const EdgeLift = 0.06;
    const asphaltGeo = mergeGeometries([
      buildRibbon(-2.48, 0, EdgeLift, CrownLift),
      buildRibbon(0, 2.48, CrownLift, EdgeLift),
    ]);

    // Stone retaining embankment skirt sloping outward and down into the mountain terrain
    const embankmentGeo = mergeGeometries([
      buildRibbon(-3.65, -2.65, -0.45, 0.02),
      buildRibbon(2.65, 3.65, 0.02, -0.45),
      buildRibbon(-2.65, 2.65, 0.02, 0.02),
    ]);

    // Compacted gravel shoulders flanking the curbs
    const shoulderGeos = [
      buildRibbon(-3.2, -2.68, 0.03, 0.045),
      buildRibbon(2.68, 3.2, 0.045, 0.03),
    ];

    // Raised 3D concrete curb along each road edge
    const buildKerb = (sideSign: number) => {
      const inner = sideSign * 2.45;
      const outer = sideSign * 2.72;
      const pos: number[] = [];
      const idx: number[] = [];
      let n = 0;
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        const s = sides[i];
        const y0 = p.y + 0.01;
        const y1 = p.y + 0.19;
        pos.push(
          p.x + s.x * inner,
          y0,
          p.z + s.z * inner,
          p.x + s.x * inner,
          y1,
          p.z + s.z * inner,
          p.x + s.x * outer,
          y1,
          p.z + s.z * outer,
          p.x + s.x * outer,
          y0,
          p.z + s.z * outer
        );
        if (i < samples.length - 1) {
          for (let k = 0; k < 4; k++) {
            const a = n + k;
            const b = n + ((k + 1) % 4);
            idx.push(a, b, a + 4, b, b + 4, a + 4);
          }
        }
        n += 4;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };

    // Dashed yellow center line (2.2m dash, 2.2m gap)
    const dashGeos: THREE.BufferGeometry[] = [];
    const dashLen = Math.round(2.2 / perStep);
    for (let i = 0; i + dashLen < samples.length; i += dashLen * 2) {
      dashGeos.push(
        buildRibbon(-0.085, 0.085, CrownLift + 0.018, CrownLift + 0.018, i, i + dashLen)
      );
    }

    // Milestones every ~36 scene meters
    const kms: { p: THREE.Vector3; s: THREE.Vector3; rotY: number }[] = [];
    const kmStep = Math.round(36.36 / perStep);
    for (let i = kmStep; i < samples.length - 10; i += kmStep) {
      const s = sides[i];
      kms.push({
        p: samples[i],
        s,
        rotY: Math.atan2(-s.z, s.x),
      });
    }

    // Continuous forest trail ribbon & stepping stones to the Ancient Banyan Tree
    const trailCurve = getBanyanTrailCurve();
    const trailPts = trailCurve.getSpacedPoints(48);
    const trailPos: number[] = [];
    const trailIdx: number[] = [];
    let tn = 0;
    for (let i = 0; i < trailPts.length; i++) {
      const p = trailPts[i];
      const a = trailPts[Math.max(0, i - 1)];
      const b = trailPts[Math.min(trailPts.length - 1, i + 1)];
      const t = b.clone().sub(a).setY(0).normalize();
      const s = new THREE.Vector3().crossVectors(t, up).normalize();
      const w = 1.35;
      trailPos.push(
        p.x - s.x * w,
        p.y + 0.035,
        p.z - s.z * w,
        p.x + s.x * w,
        p.y + 0.035,
        p.z + s.z * w
      );
      if (i < trailPts.length - 1) {
        trailIdx.push(tn, tn + 1, tn + 2, tn + 1, tn + 3, tn + 2);
      }
      tn += 2;
    }
    const banyanGeo = new THREE.BufferGeometry();
    banyanGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(trailPos, 3)
    );
    banyanGeo.setIndex(trailIdx);
    banyanGeo.computeVertexNormals();

    const stepCount = 26;
    const steps: { position: [number, number, number]; rotationY: number }[] = [];
    for (let i = 1; i <= stepCount; i++) {
      const u = i / stepCount;
      const pt = trailCurve.getPointAt(u);
      const tan = trailCurve.getTangentAt(u);
      steps.push({
        position: [pt.x, pt.y + 0.045, pt.z],
        rotationY: Math.atan2(tan.x, tan.z),
      });
    }

    // Scenic pullout bays along the mountain pass
    const pulloutList = SCENIC_PULLOUT_FRACTIONS.map((progress, index) => {
      const frame = getRouteFrame(progress);
      const direction = index % 2 === 0 ? 1 : -1;
      const cx = frame.point.x + frame.side.x * 5.8 * direction;
      const cz = frame.point.z + frame.side.z * 5.8 * direction;
      const cy = Math.max(frame.point.y - 0.08, getTerrainHeight(cx, cz));
      return {
        position: [cx, cy, cz] as [number, number, number],
        rotationY: Math.atan2(frame.tangent.x, frame.tangent.z),
      };
    });

    return {
      embankment: embankmentGeo,
      shoulders: shoulderGeos,
      asphalt: asphaltGeo,
      edgeLines: [
        buildRibbon(-2.26, -2.13, EdgeLift + 0.018),
        buildRibbon(2.13, 2.26, EdgeLift + 0.018),
      ],
      dashes: mergeGeometries(dashGeos),
      kerbs: [buildKerb(-1), buildKerb(1)],
      milestones: kms,
      banyanRibbon: banyanGeo,
      trailSteps: steps,
      pullouts: pulloutList,
    };
  }, []);

  return (
    <group name="SonTraRoadline">
      {/* 1. Stone Retaining Embankment Sub-Base */}
      <mesh geometry={embankment} receiveShadow>
        <meshStandardMaterial
          color="#585d56"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Compacted Gravel Shoulders */}
      {shoulders.map((g, i) => (
        <mesh key={`shoulder-${i}`} geometry={g} receiveShadow>
          <meshStandardMaterial
            color="#6b6859"
            roughness={0.94}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 3. Crowned Mountain Asphalt Surface */}
      <mesh geometry={asphalt} receiveShadow>
        <meshStandardMaterial
          color="#32373c"
          roughness={0.88}
          metalness={0.05}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* 4. White Edge Lines & Yellow Dashed Center Line */}
      {edgeLines.map((g, i) => (
        <mesh key={`edge-${i}`} geometry={g}>
          <meshStandardMaterial
            color="#f4f5ef"
            roughness={0.65}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-4}
          />
        </mesh>
      ))}
      <mesh geometry={dashes}>
        <meshStandardMaterial
          color="#f5d142"
          roughness={0.65}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
        />
      </mesh>

      {/* 5. Raised Concrete Curbs */}
      {kerbs.map((g, i) => (
        <mesh key={`kerb-${i}`} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial
            color="#d4d7d1"
            roughness={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 6. Paved Scenic Pullout Bays */}
      {pullouts.map((bay, i) => (
        <group
          key={`pullout-${i}`}
          position={bay.position}
          rotation={[0, bay.rotationY, 0]}
        >
          <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
            <boxGeometry args={[6.4, 0.28, 9.2]} />
            <meshStandardMaterial color="#484d52" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[5.9, 0.04, 8.6]} />
            <meshStandardMaterial color="#5c6268" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* 7. Red-and-White Kilometer Posts */}
      {milestones.map((m, i) => (
        <group
          key={`km-${i}`}
          position={[m.p.x + m.s.x * 3.05, m.p.y, m.p.z + m.s.z * 3.05]}
          rotation={[0, m.rotY, 0]}
        >
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.76, 0.26]} />
            <meshStandardMaterial color="#f2f4f0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.68, 0]} castShadow>
            <boxGeometry args={[0.27, 0.22, 0.27]} />
            <meshStandardMaterial color="#c9332b" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* 8. Banyan Forest Trail Ribbon & Stone Steps */}
      <mesh geometry={banyanRibbon} receiveShadow>
        <meshStandardMaterial
          color="#6b5844"
          roughness={0.96}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      {trailSteps.map((step, idx) => (
        <group
          key={`trail-${idx}`}
          position={step.position}
          rotation={[0, step.rotationY, 0]}
        >
          <mesh receiveShadow castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.85, 0.95, 0.07, 7]} />
            <meshStandardMaterial color="#84725e" roughness={0.94} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
