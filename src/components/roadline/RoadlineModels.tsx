"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  getBanyanTrailCurve,
  getClosestRoadInfo,
  getRoadCurve,
  getTerrainHeight,
} from "./roadData";

const MODEL_PATHS = {
  roadBlock: "/models/Road block by Luca Regazzi (okon3) - e3QRTZLNQU5.glb",
  marcTree: "/models/Tree by Marc Solà - 6Yjt8nIwLsD.glb",
  quaterniusTrees: "/models/Trees by Quaternius - etFGNvsiFv.glb",
  quaterniusGrass: "/models/Grass by Quaternius - UGTOzcO3P2.glb",
  baboon: "/models/Baboon by Poly by Google - aeLFKp6X19x.glb",
  monkeyWukong: "/models/monkey-wukong.glb",
  monkey: "/models/monkey.glb",
  forest: "/models/forest.glb",
} as const;

// Preload all 5 3D models
useGLTF.preload(MODEL_PATHS.roadBlock);
useGLTF.preload(MODEL_PATHS.marcTree);
useGLTF.preload(MODEL_PATHS.quaterniusTrees);
useGLTF.preload(MODEL_PATHS.quaterniusGrass);
useGLTF.preload(MODEL_PATHS.baboon);
useGLTF.preload(MODEL_PATHS.monkeyWukong);
useGLTF.preload(MODEL_PATHS.monkey);
useGLTF.preload(MODEL_PATHS.forest);

/** Clone a glTF scene, scale it to `height` metres (or `width` if given) and put feet at y = 0, centred on x/z. */
function normalizeModel(scene: THREE.Object3D, size: number, axis: "y" | "xz" = "y") {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const dim = box.getSize(new THREE.Vector3());
  const s = size / (axis === "y" ? dim.y || 1 : Math.max(dim.x, dim.z) || 1);
  const center = box.getCenter(new THREE.Vector3());
  clone.scale.multiplyScalar(s);
  clone.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  const wrapper = new THREE.Group();
  wrapper.add(clone);
  return wrapper;
}

/**
 * Deterministic pseudo-random generator for consistent placement across renders
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Builds the 3D winding mountain roadline using the "Road block by Luca Regazzi" 3D GLB model,
 * supplemented by a continuous terrain-hugging sub-base, forest trail stones to the Ancient Banyan,
 * and Vietnam-style red-and-white kilometer milestones along the climb.
 */
export function RoadSegments() {
  const roadGltf = useGLTF(MODEL_PATHS.roadBlock);

  // Compute transformations for each 3D Road Block model along the Son Tra roadline curve
  const segments = useMemo(() => {
    const curve = getRoadCurve();
    const totalLength = curve.getLength();
    // Each Road Block is ~0.67 units long in local X; at scale 5.4 it covers ~3.55m
    const segmentSpacing = 3.35;
    const count = Math.floor(totalLength / segmentSpacing);
    const items: {
      position: [number, number, number];
      quaternion: THREE.Quaternion;
      isMilestone: boolean;
      kmLabel: number;
    }[] = [];

    const up = new THREE.Vector3(0, 1, 0);
    const dummy = new THREE.Object3D();

    for (let i = 0; i <= count; i++) {
      const u = i / count;
      const point = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u).normalize();

      dummy.position.copy(point);
      dummy.up.copy(up);
      dummy.lookAt(point.clone().add(tangent));

      items.push({
        position: [point.x, point.y + 0.04, point.z],
        quaternion: dummy.quaternion.clone(),
        isMilestone: i > 0 && i % 10 === 0,
        kmLabel: Math.round(u * 10),
      });
    }
    return items;
  }, []);

  // Clone a clean prototype of the Road Block GLB where local +Z is forward along the road
  const roadPrototype = useMemo(() => {
    const wrapper = new THREE.Group();
    const clone = roadGltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // In the GLB, the road direction (dashed line & curbs) runs along local X.
    // Rotate +90 deg around Y so local +Z aligns with lookAt(tangent).
    clone.rotation.set(0, Math.PI / 2, 0);
    clone.scale.set(5.4, 5.0, 5.8);
    wrapper.add(clone);
    return wrapper;
  }, [roadGltf]);

  // Continuous roadbed ribbon under the 3D road blocks so steep curves have zero gaps
  const roadbedGeometry = useMemo(() => {
    const curve = getRoadCurve();
    const points = curve.getSpacedPoints(220);
    const halfWidth = 2.35;
    const positions: number[] = [];
    const indices: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const tangent =
        i < points.length - 1
          ? points[i + 1].clone().sub(p).normalize()
          : p.clone().sub(points[i - 1]).normalize();
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      const left = p.clone().addScaledVector(side, -halfWidth);
      const right = p.clone().addScaledVector(side, halfWidth);

      positions.push(left.x, left.y - 0.03, left.z);
      positions.push(right.x, right.y - 0.03, right.z);

      if (i < points.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Stepping trail segments for the Ancient Banyan forest trail spur
  const trailSteps = useMemo(() => {
    const trailCurve = getBanyanTrailCurve();
    const count = 26;
    const steps: {
      position: [number, number, number];
      rotationY: number;
    }[] = [];

    for (let i = 1; i <= count; i++) {
      const u = i / count;
      const pt = trailCurve.getPointAt(u);
      const tan = trailCurve.getTangentAt(u);
      steps.push({
        position: [pt.x, pt.y + 0.03, pt.z],
        rotationY: Math.atan2(tan.x, tan.z),
      });
    }
    return steps;
  }, []);

  return (
    <group name="SonTraRoadline">
      {/* Continuous dark-stone mountain roadbed base */}
      <mesh geometry={roadbedGeometry} receiveShadow>
        <meshStandardMaterial color="#2b3135" roughness={0.92} />
      </mesh>

      {/* 3D Road Block models placed along the entire curve */}
      {segments.map((seg, idx) => (
        <group key={idx} position={seg.position} quaternion={seg.quaternion}>
          <primitive object={roadPrototype.clone(true)} />

          {/* Roadside Vietnamese mountain pass milestone post & guardrail on outer curves */}
          {seg.isMilestone && (
            <group position={[2.45, 0, 0]}>
              <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.26, 0.76, 0.26]} />
                <meshStandardMaterial color="#f2f4f0" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.68, 0]} castShadow>
                <boxGeometry args={[0.27, 0.22, 0.27]} />
                <meshStandardMaterial color="#c9332b" roughness={0.5} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Secondary Dirt & Stone Trekking Trail to the Ancient Banyan Tree */}
      {trailSteps.map((step, idx) => (
        <group
          key={`trail-${idx}`}
          position={step.position}
          rotation={[0, step.rotationY, 0]}
        >
          <mesh receiveShadow castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.95, 1.05, 0.08, 7]} />
            <meshStandardMaterial color="#7b6853" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Normalizes and places tropical forest trees along both sides of the Son Tra roadline
 * using both "Tree by Marc Solà" and all 5 tree variants from "Trees by Quaternius".
 */
export function ForestTrees() {
  const marcGltf = useGLTF(MODEL_PATHS.marcTree);
  const quatGltf = useGLTF(MODEL_PATHS.quaterniusTrees);

  // Extract and normalize all 6 distinct 3D tree prototypes so each has its trunk base at (0, 0, 0)
  const treePrototypes = useMemo(() => {
    const prototypes: THREE.Group[] = [];

    // 1. Tree by Marc Solà (min Y is -1.2466, max Y is 0.495)
    const marcWrapper = new THREE.Group();
    const marcClone = marcGltf.scene.clone(true);
    marcClone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    marcClone.position.set(0, 1.2466, 0);
    marcWrapper.add(marcClone);
    marcWrapper.scale.setScalar(2.4);
    prototypes.push(marcWrapper);

    // 2. Quaternius NormalTree_1 .. NormalTree_5 (reset baked X translation of ~200 units to 0)
    const treeNames = [
      "NormalTree_1",
      "NormalTree_2",
      "NormalTree_3",
      "NormalTree_4",
      "NormalTree_5",
    ];
    for (const name of treeNames) {
      const found = quatGltf.scene.getObjectByName(name);
      if (found) {
        const wrapper = new THREE.Group();
        const cloned = found.clone(true);
        cloned.position.set(0, 0, 0);
        cloned.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        wrapper.add(cloned);
        wrapper.scale.setScalar(1.15);
        prototypes.push(wrapper);
      }
    }

    return prototypes;
  }, [marcGltf, quatGltf]);

  // Generate tree positions flanking the roadline and covering Son Tra's slopes
  const treePlacements = useMemo(() => {
    const placements: {
      position: [number, number, number];
      rotationY: number;
      scale: number;
      variant: number;
    }[] = [];

    const curve = getRoadCurve();
    const up = new THREE.Vector3(0, 1, 0);

    // A. Roadside avenue trees lining both sides of the trekking roadline
    const roadsideCount = 68;
    for (let i = 0; i < roadsideCount; i++) {
      const u = (i + 0.5) / roadsideCount;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();

      const sideSign = i % 2 === 0 ? 1 : -1;
      const offsetDist = 4.2 + seededRandom(i * 17 + 1) * 4.5;
      const wx = pt.x + side.x * sideSign * offsetDist;
      const wz = pt.z + side.z * sideSign * offsetDist;

      // Keep clear of the Banyan spur trail and summit platform
      if (Math.hypot(wx - -10, wz - -94) < 8) continue;

      const wy = getTerrainHeight(wx, wz);
      placements.push({
        position: [wx, wy - 0.08, wz],
        rotationY: seededRandom(i * 31) * Math.PI * 2,
        scale: 0.85 + seededRandom(i * 43) * 0.55,
        variant: i % 6,
      });
    }

    // B. Deeper mountain forest canopy clusters across the peninsula
    const forestCount = 95;
    for (let i = 0; i < forestCount; i++) {
      const seed = i + 200;
      const wx = (seededRandom(seed * 11) - 0.52) * 115;
      const wz = (seededRandom(seed * 19) - 0.58) * 165;

      // Don't place trees in the ocean (East/South-East) or directly on the roadbed
      if (wx > 31 || wz > 70) continue;
      const roadInfo = getClosestRoadInfo(wx, wz);
      if (roadInfo.distance < 4.0) continue;
      if (Math.hypot(wx - -40, wz - -55) < 7.5) continue; // Keep Banyan clearing open
      if (Math.hypot(wx - -10, wz - -94) < 8.5) continue; // Keep Ban Co Peak open
      if (Math.hypot(wx - 22, wz - 20) < 7.0) continue;   // Keep Linh Ung overlook open

      const wy = getTerrainHeight(wx, wz);
      if (wy < -0.2) continue;

      placements.push({
        position: [wx, wy - 0.1, wz],
        rotationY: seededRandom(seed * 29) * Math.PI * 2,
        scale: 0.9 + seededRandom(seed * 37) * 0.75,
        variant: i % 6,
      });
    }

    return placements;
  }, []);

  return (
    <group name="SonTraForestTrees">
      {treePlacements.map((tree, idx) => {
        const proto = treePrototypes[tree.variant % treePrototypes.length];
        if (!proto) return null;
        return (
          <group
            key={idx}
            position={tree.position}
            rotation={[0, tree.rotationY, 0]}
            scale={tree.scale}
          >
            <primitive object={proto.clone(true)} />
          </group>
        );
      })}
    </group>
  );
}

/**
 * Normalizes and scatters 3D grass tufts ("Grass by Quaternius") along the roadline shoulders.
 */
export function RoadsideGrass() {
  const grassGltf = useGLTF(MODEL_PATHS.quaterniusGrass);

  const grassPrototypes = useMemo(() => {
    const list: THREE.Group[] = [];
    for (const name of ["Grass_Large_Extruded", "Grass_Small"]) {
      const node = grassGltf.scene.getObjectByName(name);
      if (node) {
        const wrapper = new THREE.Group();
        const cloned = node.clone(true);
        cloned.position.set(0, 0, 0);
        cloned.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.receiveShadow = true;
          }
        });
        wrapper.add(cloned);
        wrapper.scale.setScalar(1.35);
        list.push(wrapper);
      }
    }
    return list;
  }, [grassGltf]);

  const grassPatches = useMemo(() => {
    const patches: {
      position: [number, number, number];
      rotationY: number;
      scale: number;
      variant: number;
    }[] = [];

    const curve = getRoadCurve();
    const up = new THREE.Vector3(0, 1, 0);
    const total = 110;

    for (let i = 0; i < total; i++) {
      const u = (i + 0.25) / total;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      const side = new THREE.Vector3().crossVectors(tan, up).normalize();

      const sideSign = i % 2 === 0 ? 1 : -1;
      const dist = 2.35 + seededRandom(i * 13 + 7) * 2.2;
      const wx = pt.x + side.x * sideSign * dist;
      const wz = pt.z + side.z * sideSign * dist;
      const wy = getTerrainHeight(wx, wz);

      patches.push({
        position: [wx, wy, wz],
        rotationY: seededRandom(i * 23) * Math.PI * 2,
        scale: 0.9 + seededRandom(i * 41) * 0.8,
        variant: i % 2,
      });
    }
    return patches;
  }, []);

  if (grassPrototypes.length === 0) return null;

  return (
    <group name="RoadsideGrass">
      {grassPatches.map((patch, idx) => (
        <group
          key={idx}
          position={patch.position}
          rotation={[0, patch.rotationY, 0]}
          scale={patch.scale}
        >
          <primitive
            object={grassPrototypes[patch.variant % grassPrototypes.length].clone(
              true
            )}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Places the 3D Primate models ("Baboon by Poly by Google") at the Son Tra Primate Sanctuary
 * along the mid-mountain curve, perched on natural rocks and observing from a safe distance.
 */
export function WildlifeZone() {
  const wukongGltf = useGLTF(MODEL_PATHS.monkeyWukong);
  const monkeyGltf = useGLTF(MODEL_PATHS.monkey);
  const groupRef = useRef<THREE.Group>(null);

  // Index 0 = Sun Wukong monkey king (1.1 m), index 1 = regular monkey (0.8 m)
  const primates = useMemo(
    () => [
      normalizeModel(wukongGltf.scene, 1.1),
      normalizeModel(monkeyGltf.scene, 0.8),
    ],
    [wukongGltf, monkeyGltf]
  );

  const troop = useMemo(() => {
    const spots: {
      pos: [number, number, number];
      rotY: number;
      rockScale: [number, number, number];
      phase: number;
    }[] = [
      { pos: [-20.2, getTerrainHeight(-20.2, -14.5), -14.5], rotY: 0.9, rockScale: [1.3, 0.7, 1.1], phase: 0 },
      { pos: [-12.0, getTerrainHeight(-12.0, -18.2), -18.2], rotY: -1.8, rockScale: [1.1, 0.55, 0.9], phase: 2.1 },
      { pos: [-22.5, getTerrainHeight(-22.5, -22.0), -22.0], rotY: 0.4, rockScale: [1.5, 0.85, 1.3], phase: 4.2 },
    ];
    return spots;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, idx) => {
      const primate = child.getObjectByName("PrimateActor");
      if (primate) {
        primate.rotation.y = Math.sin(t * 1.1 + idx * 1.7) * 0.28;
        primate.position.y = 0.42 + Math.abs(Math.sin(t * 1.6 + idx)) * 0.04;
      }
    });
  });

  return (
    <group ref={groupRef} name="SonTraWildlifeSanctuary">
      {troop.map((item, idx) => (
        <group key={idx} position={item.pos} rotation={[0, item.rotY, 0]}>
          {/* Natural forest boulder perch */}
          <mesh position={[0, 0.22, 0]} scale={item.rockScale} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#676d66" roughness={0.9} />
          </mesh>
          <group name="PrimateActor" position={[0, 0.42, 0]}>
            <primitive object={primates[idx === 0 ? 0 : 1].clone(true)} />
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * Dense "Forest environnement" backdrop clumps placed off the road on the mountain flanks.
 */
export function ForestBackdrop() {
  const gltf = useGLTF(MODEL_PATHS.forest);
  const proto = useMemo(() => normalizeModel(gltf.scene, 34, "xz"), [gltf]);
  const spots: [number, number, number][] = [
    [-45, 0, -10],
    [45, 0, -40],
    [-40, 0, -70],
    [40, 0, 20],
  ];
  return (
    <group name="SonTraForestBackdrop">
      {spots.map(([x, , z], i) => (
        <group key={i} position={[x, getTerrainHeight(x, z), z]} rotation={[0, i * 1.7, 0]}>
          <primitive object={proto.clone(true)} />
        </group>
      ))}
    </group>
  );
}
