"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  getClosestRoadInfo,
  getRoadCurve,
  getRouteFrame,
  getTerrainHeight,
  MONKEY_TERRITORIES,
  SCENIC_PULLOUT_FRACTIONS,
  SON_TRA_LANDMARKS,
} from "./roadData";

export { RoadSegments } from "./RoadSegments";

function nearLandmark(x: number, z: number, id: string, r: number) {
  const lm = SON_TRA_LANDMARKS.find((l) => l.id === id);
  return !!lm && Math.hypot(x - lm.position[0], z - lm.position[2]) < r;
}

function nearScenicPullout(x: number, z: number, radius: number) {
  return SCENIC_PULLOUT_FRACTIONS.some((progress, index) => {
    const frame = getRouteFrame(progress);
    const direction = index % 2 === 0 ? 1 : -1;
    const centerX = frame.point.x + frame.side.x * 5.8 * direction;
    const centerZ = frame.point.z + frame.side.z * 5.8 * direction;
    return Math.hypot(x - centerX, z - centerZ) < radius;
  });
}

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
      if (nearLandmark(wx, wz, "ban-co-peak", 8)) continue;
      if (nearScenicPullout(wx, wz, 5.5)) continue;

      const wy = getTerrainHeight(wx, wz);
      placements.push({
        position: [wx, wy - 0.08, wz],
        rotationY: seededRandom(i * 31) * Math.PI * 2,
        scale: 0.85 + seededRandom(i * 43) * 0.55,
        variant: i % 6,
      });
    }

    // B. Deeper mountain forest canopy clusters across the peninsula
    const forestCount = 170;
    for (let i = 0; i < forestCount; i++) {
      const seed = i + 200;
      const wx = (seededRandom(seed * 11) - 0.5) * 165 - 6;
      const wz = (seededRandom(seed * 19) - 0.5) * 140 - 5;

      // Don't place trees in the ocean (East/South-East) or directly on the roadbed
      if (wx > 78 || wz > 70) continue;
      const roadInfo = getClosestRoadInfo(wx, wz);
      if (roadInfo.distance < 4.0) continue;
      if (nearLandmark(wx, wz, "banyan-tree", 7.5)) continue; // Keep Banyan clearing open
      if (nearLandmark(wx, wz, "ban-co-peak", 8.5)) continue; // Keep Ban Co Peak open
      if (nearLandmark(wx, wz, "linh-ung", 7)) continue;      // Keep Linh Ung overlook open
      if (nearScenicPullout(wx, wz, 5.5)) continue;

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
export function WildlifeZone({
  playerPosition,
  playing,
  approachPlayer,
}: {
  playerPosition: [number, number, number];
  playing: boolean;
  approachPlayer: boolean;
}) {
  const wukongGltf = useGLTF(MODEL_PATHS.monkeyWukong);
  const monkeyGltf = useGLTF(MODEL_PATHS.monkey);
  const primates = useMemo(
    () => [
      normalizeModel(wukongGltf.scene, 1.1),
      normalizeModel(monkeyGltf.scene, 0.8),
    ],
    [wukongGltf, monkeyGltf]
  );
  const sites = useMemo(() => MONKEY_TERRITORIES.map((territory) => {
    const landmark = SON_TRA_LANDMARKS.find(({ id }) => id === territory.landmarkId)!;
    const x = landmark.position[0] + territory.offset[0];
    const z = landmark.position[2] + territory.offset[2];
    return { center: [x, getTerrainHeight(x, z), z] as [number, number, number] };
  }), []);
  const nearestSite = sites.reduce((best, site, index) => {
    const distance = Math.hypot(playerPosition[0] - site.center[0], playerPosition[2] - site.center[2]);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Number.POSITIVE_INFINITY });

  return (
    <group name="SonTraMonkeyAreas">
      {sites.map((site, index) => (
        <MonkeyTroop
          key={index}
          center={site.center}
          primates={primates}
          playerPosition={playerPosition}
          playing={playing && nearestSite.index === index}
          approachPlayer={approachPlayer && nearestSite.index === index}
        />
      ))}
    </group>
  );
}

function MonkeyTroop({
  center,
  primates,
  playerPosition,
  playing,
  approachPlayer,
}: {
  center: [number, number, number];
  primates: THREE.Group[];
  playerPosition: [number, number, number];
  playing: boolean;
  approachPlayer: boolean;
}) {
  const actorRefs = useRef<(THREE.Group | null)[]>([]);
  const targetRefs = useRef<THREE.Vector3[]>([]);
  const nextWanderAt = useRef<number[]>([]);
  const animals = useMemo(() => Array.from({ length: 5 }, (_, index) => {
    const angle = (index / 5) * Math.PI * 2 + 0.3;
    const radius = index === 0 ? 1.5 : 2.8 + (index % 2) * 1.3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return {
      offset: [x, getTerrainHeight(center[0] + x, center[2] + z) - center[1], z] as [number, number, number],
      rockScale: [0.85 + (index % 3) * 0.18, 0.5 + (index % 2) * 0.16, 0.8 + (index % 2) * 0.2] as [number, number, number],
    };
  }), [center]);

  useEffect(() => {
    targetRefs.current = animals.map(({ offset }) => new THREE.Vector3(...offset));
    nextWanderAt.current = animals.map(() => 0);
  }, [animals]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    animals.forEach((animal, idx) => {
      const actor = actorRefs.current[idx];
      const target = targetRefs.current[idx];
      if (!actor || !target) return;

      if (playing && idx === 0) {
        const angle = t * 0.9;
        const worldX = playerPosition[0] + Math.cos(angle) * 2.7;
        const worldZ = playerPosition[2] + Math.sin(angle) * 2.7;
        target.set(worldX - center[0], getTerrainHeight(worldX, worldZ) - center[1], worldZ - center[2]);
      } else if (approachPlayer && idx === 0) {
        const dx = playerPosition[0] - center[0];
        const dz = playerPosition[2] - center[2];
        const length = Math.hypot(dx, dz) || 1;
        const worldX = playerPosition[0] - (dx / length) * 2.8;
        const worldZ = playerPosition[2] - (dz / length) * 2.8;
        target.set(worldX - center[0], getTerrainHeight(worldX, worldZ) - center[1], worldZ - center[2]);
      } else if (t >= nextWanderAt.current[idx]) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.2 + Math.random() * 3.2;
        const worldX = center[0] + animal.offset[0] + Math.cos(angle) * radius;
        const worldZ = center[2] + animal.offset[2] + Math.sin(angle) * radius;
        target.set(worldX - center[0], getTerrainHeight(worldX, worldZ) - center[1], worldZ - center[2]);
        nextWanderAt.current[idx] = t + 3 + Math.random() * 4;
      }

      const oldX = actor.position.x;
      const oldZ = actor.position.z;
      actor.position.x = THREE.MathUtils.damp(oldX, target.x, playing && idx === 0 ? 2.2 : 0.9, delta);
      actor.position.z = THREE.MathUtils.damp(oldZ, target.z, playing && idx === 0 ? 2.2 : 0.9, delta);
      actor.position.y = THREE.MathUtils.damp(actor.position.y, target.y, 2.2, delta);
      const moved = Math.hypot(actor.position.x - oldX, actor.position.z - oldZ);
      if (moved > 0.0001) actor.rotation.y = Math.atan2(actor.position.x - oldX, actor.position.z - oldZ);
      const model = actor.getObjectByName("PrimateModel");
      if (model) {
        const playful = playing && idx === 0;
        const speed = playful ? 8 : moved > 0.003 ? 5 : 1.2;
        model.position.y = 0.42 + Math.abs(Math.sin(t * speed + idx)) * (playful ? 0.22 : moved > 0.003 ? 0.09 : 0.025);
        model.rotation.z = Math.sin(t * speed * 0.5 + idx) * (playful ? 0.12 : 0.04);
      }
    });
  });

  return (
    <group position={center}>
      {animals.map((animal, index) => (
        <group key={`rock-${index}`} position={animal.offset}>
          <mesh position={[0, 0.22, 0]} scale={animal.rockScale} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#676d66" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {animals.map((animal, index) => (
        <group key={`monkey-${index}`} ref={(node) => { actorRefs.current[index] = node; }} position={animal.offset}>
          <group name="PrimateModel" position={[0, 0.42, 0]}>
            <primitive object={primates[index === 0 ? 0 : 1].clone(true)} />
          </group>
        </group>
      ))}
    </group>
  );
}

/** Roadside viewpoints populated with downloaded scooters and small sightseeing groups. */
export function RoadsideVehicles() {
  const motivaGltf = useGLTF("/models/moto_motiva.glb");
  const vespaGltf = useGLTF("/models/moto_vespa.glb");
  const stops = useMemo(() => SCENIC_PULLOUT_FRACTIONS.map((progress, index) => {
    const frame = getRouteFrame(progress);
    const direction = index % 2 === 0 ? 1 : -1;
    const side = frame.side.clone().multiplyScalar(4.4 * direction);
    const x = frame.point.x + side.x;
    const z = frame.point.z + side.z;
    const y = Math.max(frame.point.y, getTerrainHeight(x, z));
    return {
      id: index,
      position: [x, y, z] as [number, number, number],
      facing: Math.atan2(side.x, side.z),
      roadFacing: Math.atan2(frame.tangent.x, frame.tangent.z),
      tangent: frame.tangent,
      side: frame.side.clone().multiplyScalar(direction),
      vehicleCount: index % 3 === 0 ? 3 : 2,
    };
  }), []);
  const scooters = useMemo(() => [motivaGltf.scene, vespaGltf.scene].map((scene) => normalizeModel(scene, 2.35)), [motivaGltf, vespaGltf]);

  return (
    <group name="ScenicRoadsideStops">
      {stops.map((stop) => (
        <group key={stop.id} name={`Viewpoint-${stop.id}`} position={stop.position}>
          {Array.from({ length: stop.vehicleCount }, (_, index) => {
            const along = (index - (stop.vehicleCount - 1) / 2) * 1.85;
            const sideDistance = 1.1 + (index % 2) * 0.7;
            const x = stop.tangent.x * along + stop.side.x * sideDistance;
            const z = stop.tangent.z * along + stop.side.z * sideDistance;
            const worldX = stop.position[0] + x;
            const worldZ = stop.position[2] + z;
            return (
              <group key={index} position={[x, getTerrainHeight(worldX, worldZ) - stop.position[1], z]} rotation={[0, stop.roadFacing + Math.PI / 2, 0]}>
                <primitive object={scooters[(index + stop.id) % scooters.length].clone(true)} />
                <mesh position={[0, 0.12, 0.35]}><boxGeometry args={[0.46, 0.04, 0.025]} /><meshStandardMaterial color={stop.id % 2 ? "#31c48d" : "#52d4ba"} emissive="#0b7652" emissiveIntensity={0.4} /></mesh>
              </group>
            );
          })}
          {Array.from({ length: stop.id % 2 === 0 ? 4 : 3 }, (_, index) => {
            const along = 3.2 + index * 0.85;
            const sideDistance = 2.1 + (index % 2) * 0.75;
            const x = stop.tangent.x * along + stop.side.x * sideDistance;
            const z = stop.tangent.z * along + stop.side.z * sideDistance;
            const worldX = stop.position[0] + x;
            const worldZ = stop.position[2] + z;
            const shirts = ["#e7e2d6", "#397862", "#d49b55", "#718db0"];
            return (
              <group key={`visitor-${index}`} position={[x, getTerrainHeight(worldX, worldZ) - stop.position[1], z]} rotation={[0, stop.facing + (index - 1) * 0.12, 0]}>
                <SightseeingVisitor shirt={shirts[(index + stop.id) % shirts.length]} pose={index % 2 === 0 ? "camera" : "point"} />
              </group>
            );
          })}
          <mesh position={[stop.side.x * 3.5, 0.75, stop.side.z * 3.5]} rotation={[0, stop.facing, 0]} castShadow>
            <boxGeometry args={[5.4, 0.12, 0.16]} /><meshStandardMaterial color="#71593d" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SightseeingVisitor({ shirt, pose }: { shirt: string; pose: "camera" | "point" }) {
  return (
    <group>
      <mesh position={[0, 1.08, 0]} castShadow><capsuleGeometry args={[0.23, 0.62, 5, 9]} /><meshStandardMaterial color={shirt} roughness={0.78} /></mesh>
      <mesh position={[0, 1.69, 0]} castShadow><sphereGeometry args={[0.19, 12, 10]} /><meshStandardMaterial color="#c99272" roughness={0.75} /></mesh>
      <mesh position={[0, 1.86, 0]} castShadow><cylinderGeometry args={[0.24, 0.29, 0.1, 12]} /><meshStandardMaterial color="#30383a" roughness={0.8} /></mesh>
      {[-0.12, 0.12].map((x) => <mesh key={x} position={[x, 0.36, 0]} castShadow><capsuleGeometry args={[0.085, 0.5, 4, 7]} /><meshStandardMaterial color="#343e44" roughness={0.85} /></mesh>)}
      <mesh position={[-0.29, 1.08, -0.13]} castShadow><boxGeometry args={[0.16, 0.4, 0.3]} /><meshStandardMaterial color="#a65532" roughness={0.85} /></mesh>
      {pose === "camera" ? <>
        <mesh position={[0.24, 1.42, 0.28]} rotation={[0.25, 0.1, -0.55]}><capsuleGeometry args={[0.055, 0.38, 4, 7]} /><meshStandardMaterial color="#c99272" /></mesh>
        <mesh position={[0.22, 1.52, 0.42]}><boxGeometry args={[0.18, 0.12, 0.1]} /><meshStandardMaterial color="#263b3b" metalness={0.45} /></mesh>
      </> : <mesh position={[0.3, 1.3, 0.25]} rotation={[0.1, 0, -1.1]}><capsuleGeometry args={[0.055, 0.5, 4, 7]} /><meshStandardMaterial color="#c99272" /></mesh>}
    </group>
  );
}

/**
 * Dense "Forest environnement" backdrop clumps placed off the road on the mountain flanks.
 */
export function ForestBackdrop() {
  const gltf = useGLTF(MODEL_PATHS.forest);
  const proto = useMemo(() => normalizeModel(gltf.scene, 34, "xz"), [gltf]);
  // Pick 4 spread-out land spots at least 30 m from the road
  const spots = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const [x, z] of [[-60, -60], [60, -50], [-70, 10], [20, 60], [60, 40], [-20, -90], [0, -70]]) {
      if (getClosestRoadInfo(x, z).distance > 30 && getTerrainHeight(x, z) > 0.5) out.push([x, 0, z]);
      if (out.length === 4) break;
    }
    return out;
  }, []);
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
