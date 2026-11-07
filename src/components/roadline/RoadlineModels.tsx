"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
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

useGLTF.preload(MODEL_PATHS.marcTree);
useGLTF.preload(MODEL_PATHS.quaterniusTrees);
useGLTF.preload(MODEL_PATHS.quaterniusGrass);
useGLTF.preload(MODEL_PATHS.monkeyWukong);
useGLTF.preload(MODEL_PATHS.monkey);
useGLTF.preload(MODEL_PATHS.forest);

/**
 * Merges child meshes that share the same material & attribute signature into single BufferGeometries.
 * Crucial for models like moto_motiva.glb (710 sub-meshes -> ~8 merged meshes), cutting thousands of draw calls.
 */
function mergeStaticMeshes(
  root: THREE.Object3D,
  castShadow: boolean,
  receiveShadow: boolean
): THREE.Group {
  root.updateWorldMatrix(true, true);
  const invRoot = root.matrixWorld.clone().invert();

  const buckets = new Map<
    string,
    {
      material: THREE.Material | THREE.Material[];
      geometries: THREE.BufferGeometry[];
    }
  >();

  const outGroup = new THREE.Group();

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;

    // If multi-material or skinned, keep as-is
    if (
      Array.isArray(mesh.material) ||
      (mesh as THREE.SkinnedMesh).isSkinnedMesh
    ) {
      const cloned = mesh.clone();
      cloned.castShadow = castShadow;
      cloned.receiveShadow = receiveShadow;
      outGroup.add(cloned);
      return;
    }

    const srcGeo = mesh.geometry;
    const posAttr = srcGeo.attributes.position;
    if (!posAttr) return;

    const hasNormal = !!srcGeo.attributes.normal;
    const hasUV = !!srcGeo.attributes.uv;
    const hasColor = !!srcGeo.attributes.color;
    const isIndexed = !!srcGeo.index;
    const key = `${mesh.material.uuid}_${hasNormal ? 1 : 0}_${hasUV ? 1 : 0}_${
      hasColor ? 1 : 0
    }_${isIndexed ? 1 : 0}`;

    const relMatrix = invRoot.clone().multiply(mesh.matrixWorld);
    const g = srcGeo.clone();
    g.applyMatrix4(relMatrix);

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { material: mesh.material, geometries: [] };
      buckets.set(key, bucket);
    }
    bucket.geometries.push(g);
  });

  for (const { material, geometries } of buckets.values()) {
    if (geometries.length === 1) {
      const m = new THREE.Mesh(geometries[0], material);
      m.castShadow = castShadow;
      m.receiveShadow = receiveShadow;
      outGroup.add(m);
      continue;
    }

    let totalVerts = 0;
    let totalIndices = 0;
    const first = geometries[0];
    const hasNormal = !!first.attributes.normal;
    const hasUV = !!first.attributes.uv;
    const hasColor = !!first.attributes.color;
    const isIndexed = !!first.index;

    for (const g of geometries) {
      totalVerts += g.attributes.position.count;
      if (isIndexed && g.index) totalIndices += g.index.count;
    }

    const posArr = new Float32Array(totalVerts * 3);
    const normArr = hasNormal ? new Float32Array(totalVerts * 3) : null;
    const uvArr = hasUV ? new Float32Array(totalVerts * 2) : null;
    const coloritemSize = hasColor ? first.attributes.color.itemSize : 0;
    const colArr = hasColor
      ? new Float32Array(totalVerts * coloritemSize)
      : null;
    const idxArr = isIndexed ? new Uint32Array(totalIndices) : null;

    let vOffset = 0;
    let iOffset = 0;

    for (const g of geometries) {
      const vCount = g.attributes.position.count;
      posArr.set(g.attributes.position.array as Float32Array, vOffset * 3);
      if (normArr && g.attributes.normal) {
        normArr.set(g.attributes.normal.array as Float32Array, vOffset * 3);
      }
      if (uvArr && g.attributes.uv) {
        uvArr.set(g.attributes.uv.array as Float32Array, vOffset * 2);
      }
      if (colArr && g.attributes.color) {
        colArr.set(
          g.attributes.color.array as Float32Array,
          vOffset * coloritemSize
        );
      }
      if (idxArr && g.index) {
        const srcIdx = g.index.array;
        for (let k = 0; k < srcIdx.length; k++) {
          idxArr[iOffset + k] = srcIdx[k] + vOffset;
        }
        iOffset += srcIdx.length;
      }
      vOffset += vCount;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    if (normArr)
      merged.setAttribute("normal", new THREE.BufferAttribute(normArr, 3));
    if (uvArr) merged.setAttribute("uv", new THREE.BufferAttribute(uvArr, 2));
    if (colArr)
      merged.setAttribute(
        "color",
        new THREE.BufferAttribute(colArr, coloritemSize)
      );
    if (idxArr) merged.setIndex(new THREE.BufferAttribute(idxArr, 1));

    const m = new THREE.Mesh(merged, material);
    m.castShadow = castShadow;
    m.receiveShadow = receiveShadow;
    outGroup.add(m);
  }

  return outGroup;
}

/**
 * Clone & normalize a glTF scene to `size` metres with feet at y = 0, centered on x/z,
 * and merge sub-meshes sharing materials to minimize draw calls.
 */
function normalizeModel(
  scene: THREE.Object3D,
  size: number,
  axis: "y" | "xz" = "y",
  options: { castShadow?: boolean; receiveShadow?: boolean } = {}
) {
  const { castShadow = true, receiveShadow = true } = options;
  const merged = mergeStaticMeshes(scene, castShadow, receiveShadow);
  const box = new THREE.Box3().setFromObject(merged);
  const dim = box.getSize(new THREE.Vector3());
  const s = size / (axis === "y" ? dim.y || 1 : Math.max(dim.x, dim.z) || 1);
  const center = box.getCenter(new THREE.Vector3());
  merged.scale.multiplyScalar(s);
  merged.position.set(-center.x * s, -box.min.y * s, -center.z * s);
  const wrapper = new THREE.Group();
  wrapper.add(merged);
  return wrapper;
}

/**
 * Deterministic pseudo-random generator for consistent placement across renders
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface MeshPrimitivePart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
}

function extractNormalizedParts(
  root: THREE.Object3D,
  localOffset: THREE.Vector3,
  localScale: number
): MeshPrimitivePart[] {
  const clone = root.clone(true);
  clone.position.copy(localOffset);
  const wrapper = new THREE.Group();
  wrapper.add(clone);
  wrapper.scale.setScalar(localScale);
  wrapper.updateWorldMatrix(true, true);

  const parts: MeshPrimitivePart[] = [];
  wrapper.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry.clone();
      geo.applyMatrix4(mesh.matrixWorld);
      parts.push({ geometry: geo, material: mesh.material });
    }
  });
  return parts;
}

/**
 * GPU-Instanced Tropical Forest Trees along both sides of the Son Tra roadline.
 * Converts ~476 individual tree mesh draw calls into just 12 GPU InstancedMesh draw calls!
 */
export function ForestTrees() {
  const marcGltf = useGLTF(MODEL_PATHS.marcTree);
  const quatGltf = useGLTF(MODEL_PATHS.quaterniusTrees);

  const { batches } = useMemo(() => {
    // 1. Extract normalized geometry parts for all 6 tree variants
    const variantParts: MeshPrimitivePart[][] = [];

    variantParts.push(
      extractNormalizedParts(
        marcGltf.scene,
        new THREE.Vector3(0, 1.2466, 0),
        2.4
      )
    );

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
        variantParts.push(
          extractNormalizedParts(found, new THREE.Vector3(0, 0, 0), 1.15)
        );
      }
    }

    // 2. Compute placements grouped by tree variant (0..5)
    const matricesByVariant: THREE.Matrix4[][] = variantParts.map(() => []);
    const curve = getRoadCurve();
    const up = new THREE.Vector3(0, 1, 0);
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();

    const addPlacement = (
      wx: number,
      wy: number,
      wz: number,
      rotY: number,
      scaleVal: number,
      variantIdx: number
    ) => {
      pos.set(wx, wy, wz);
      quat.setFromEuler(euler.set(0, rotY, 0));
      scl.setScalar(scaleVal);
      mat.compose(pos, quat, scl);
      matricesByVariant[variantIdx % matricesByVariant.length].push(
        mat.clone()
      );
    };

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

      if (nearLandmark(wx, wz, "ban-co-peak", 8)) continue;
      if (nearScenicPullout(wx, wz, 5.5)) continue;

      const wy = getTerrainHeight(wx, wz);
      addPlacement(
        wx,
        wy - 0.08,
        wz,
        seededRandom(i * 31) * Math.PI * 2,
        0.85 + seededRandom(i * 43) * 0.55,
        i % 6
      );
    }

    const forestCount = 150;
    for (let i = 0; i < forestCount; i++) {
      const seed = i + 200;
      const wx = (seededRandom(seed * 11) - 0.5) * 165 - 6;
      const wz = (seededRandom(seed * 19) - 0.5) * 140 - 5;

      if (wx > 78 || wz > 70) continue;
      const roadInfo = getClosestRoadInfo(wx, wz);
      if (roadInfo.distance < 4.0) continue;
      if (nearLandmark(wx, wz, "banyan-tree", 7.5)) continue;
      if (nearLandmark(wx, wz, "ban-co-peak", 8.5)) continue;
      if (nearLandmark(wx, wz, "linh-ung", 7)) continue;
      if (nearScenicPullout(wx, wz, 5.5)) continue;

      const wy = getTerrainHeight(wx, wz);
      if (wy < -0.2) continue;

      addPlacement(
        wx,
        wy - 0.1,
        wz,
        seededRandom(seed * 29) * Math.PI * 2,
        0.9 + seededRandom(seed * 37) * 0.75,
        i % 6
      );
    }

    // Flatten into instanced draw batches
    const list: {
      geometry: THREE.BufferGeometry;
      material: THREE.Material | THREE.Material[];
      matrices: THREE.Matrix4[];
    }[] = [];

    variantParts.forEach((parts, vIdx) => {
      const matrices = matricesByVariant[vIdx];
      if (matrices.length === 0) return;
      for (const part of parts) {
        list.push({
          geometry: part.geometry,
          material: part.material,
          matrices,
        });
      }
    });

    return { batches: list };
  }, [marcGltf, quatGltf]);

  return (
    <group name="SonTraForestTrees">
      {batches.map((batch, idx) => (
        <InstancedBatch
          key={idx}
          geometry={batch.geometry}
          material={batch.material}
          matrices={batch.matrices}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

function InstancedBatch({
  geometry,
  material,
  matrices,
  castShadow = false,
  receiveShadow = true,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  matrices: THREE.Matrix4[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < matrices.length; i++) {
      ref.current.setMatrixAt(i, matrices[i]);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [matrices]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, matrices.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/**
 * GPU-Instanced 3D Grass Tufts ("Grass by Quaternius") along the roadline shoulders.
 * Collapses 110 clones into just 2 GPU InstancedMesh draw calls!
 */
export function RoadsideGrass() {
  const grassGltf = useGLTF(MODEL_PATHS.quaterniusGrass);

  const batches = useMemo(() => {
    const variantParts: MeshPrimitivePart[][] = [];
    for (const name of ["Grass_Large_Extruded", "Grass_Small"]) {
      const node = grassGltf.scene.getObjectByName(name);
      if (node) {
        variantParts.push(
          extractNormalizedParts(node, new THREE.Vector3(0, 0, 0), 1.35)
        );
      }
    }
    if (variantParts.length === 0) return [];

    const matricesByVariant: THREE.Matrix4[][] = variantParts.map(() => []);
    const curve = getRoadCurve();
    const up = new THREE.Vector3(0, 1, 0);
    const total = 110;
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();

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

      pos.set(wx, wy, wz);
      quat.setFromEuler(euler.set(0, seededRandom(i * 23) * Math.PI * 2, 0));
      scl.setScalar(0.9 + seededRandom(i * 41) * 0.8);
      mat.compose(pos, quat, scl);
      matricesByVariant[i % variantParts.length].push(mat.clone());
    }

    const list: {
      geometry: THREE.BufferGeometry;
      material: THREE.Material | THREE.Material[];
      matrices: THREE.Matrix4[];
    }[] = [];

    variantParts.forEach((parts, vIdx) => {
      const matrices = matricesByVariant[vIdx];
      if (matrices.length === 0) return;
      for (const part of parts) {
        list.push({
          geometry: part.geometry,
          material: part.material,
          matrices,
        });
      }
    });
    return list;
  }, [grassGltf]);

  return (
    <group name="RoadsideGrass">
      {batches.map((batch, idx) => (
        <InstancedBatch
          key={idx}
          geometry={batch.geometry}
          material={batch.material}
          matrices={batch.matrices}
          castShadow={false}
          receiveShadow
        />
      ))}
    </group>
  );
}

/**
 * Places and animates 3D Monkey troops at the visitor areas.
 * Optimized:
 * - Pre-clones monkey meshes once inside useMemo (eliminating 60 FPS .clone(true) calls!)
 * - Disables expensive shadow map casting on the 457k-vertex monkey.glb mesh
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
      normalizeModel(wukongGltf.scene, 1.1, "y", {
        castShadow: true,
        receiveShadow: true,
      }),
      // monkey.glb has 457,214 vertices; disable real-time shadow-map casting on it to save ~3.6M shadow vertices/frame
      normalizeModel(monkeyGltf.scene, 0.8, "y", {
        castShadow: false,
        receiveShadow: true,
      }),
    ],
    [wukongGltf, monkeyGltf]
  );

  const sites = useMemo(
    () =>
      MONKEY_TERRITORIES.map((territory) => {
        const landmark = SON_TRA_LANDMARKS.find(
          ({ id }) => id === territory.landmarkId
        )!;
        const x = landmark.position[0] + territory.offset[0];
        const z = landmark.position[2] + territory.offset[2];
        return {
          center: [x, getTerrainHeight(x, z), z] as [number, number, number],
        };
      }),
    []
  );

  const nearestSite = sites.reduce(
    (best, site, index) => {
      const distance = Math.hypot(
        playerPosition[0] - site.center[0],
        playerPosition[2] - site.center[2]
      );
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY }
  );

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
  const playerPosRef = useRef(playerPosition);
  playerPosRef.current = playerPosition;

  const animals = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * Math.PI * 2 + 0.3;
        const radius = index === 0 ? 1.5 : 2.8 + (index % 2) * 1.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return {
          offset: [
            x,
            getTerrainHeight(center[0] + x, center[2] + z) - center[1],
            z,
          ] as [number, number, number],
          rockScale: [
            0.85 + (index % 3) * 0.18,
            0.5 + (index % 2) * 0.16,
            0.8 + (index % 2) * 0.2,
          ] as [number, number, number],
        };
      }),
    [center]
  );

  // Memoize cloned monkey objects once so re-renders never clone 457k-vertex geometries
  const clonedActors = useMemo(
    () =>
      animals.map((_, index) => primates[index === 0 ? 0 : 1].clone(true)),
    [animals, primates]
  );

  useEffect(() => {
    targetRefs.current = animals.map(
      ({ offset }) => new THREE.Vector3(...offset)
    );
    nextWanderAt.current = animals.map(() => 0);
  }, [animals]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const pPos = playerPosRef.current;

    animals.forEach((animal, idx) => {
      const actor = actorRefs.current[idx];
      const target = targetRefs.current[idx];
      if (!actor || !target) return;

      if (playing && idx === 0) {
        const angle = t * 0.9;
        const worldX = pPos[0] + Math.cos(angle) * 2.7;
        const worldZ = pPos[2] + Math.sin(angle) * 2.7;
        target.set(
          worldX - center[0],
          getTerrainHeight(worldX, worldZ) - center[1],
          worldZ - center[2]
        );
      } else if (approachPlayer && idx === 0) {
        const dx = pPos[0] - center[0];
        const dz = pPos[2] - center[2];
        const length = Math.hypot(dx, dz) || 1;
        const worldX = pPos[0] - (dx / length) * 2.8;
        const worldZ = pPos[2] - (dz / length) * 2.8;
        target.set(
          worldX - center[0],
          getTerrainHeight(worldX, worldZ) - center[1],
          worldZ - center[2]
        );
      } else if (t >= nextWanderAt.current[idx]) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.2 + Math.random() * 3.2;
        const worldX = center[0] + animal.offset[0] + Math.cos(angle) * radius;
        const worldZ = center[2] + animal.offset[2] + Math.sin(angle) * radius;
        target.set(
          worldX - center[0],
          getTerrainHeight(worldX, worldZ) - center[1],
          worldZ - center[2]
        );
        nextWanderAt.current[idx] = t + 3 + Math.random() * 4;
      }

      const oldX = actor.position.x;
      const oldZ = actor.position.z;
      actor.position.x = THREE.MathUtils.damp(
        oldX,
        target.x,
        playing && idx === 0 ? 2.2 : 0.9,
        delta
      );
      actor.position.z = THREE.MathUtils.damp(
        oldZ,
        target.z,
        playing && idx === 0 ? 2.2 : 0.9,
        delta
      );
      actor.position.y = THREE.MathUtils.damp(
        actor.position.y,
        target.y,
        2.2,
        delta
      );
      const moved = Math.hypot(
        actor.position.x - oldX,
        actor.position.z - oldZ
      );
      if (moved > 0.0001) {
        actor.rotation.y = Math.atan2(
          actor.position.x - oldX,
          actor.position.z - oldZ
        );
      }
      const model = actor.getObjectByName("PrimateModel");
      if (model) {
        const playful = playing && idx === 0;
        const speed = playful ? 8 : moved > 0.003 ? 5 : 1.2;
        model.position.y =
          0.42 +
          Math.abs(Math.sin(t * speed + idx)) *
            (playful ? 0.22 : moved > 0.003 ? 0.09 : 0.025);
        model.rotation.z =
          Math.sin(t * speed * 0.5 + idx) * (playful ? 0.12 : 0.04);
      }
    });
  });

  return (
    <group position={center}>
      {animals.map((animal, index) => (
        <group key={`rock-${index}`} position={animal.offset}>
          <mesh
            position={[0, 0.22, 0]}
            scale={animal.rockScale}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#676d66" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {animals.map((animal, index) => (
        <group
          key={`monkey-${index}`}
          ref={(node) => {
            actorRefs.current[index] = node;
          }}
          position={animal.offset}
        >
          <group name="PrimateModel" position={[0, 0.42, 0]}>
            <primitive object={clonedActors[index]} />
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * Roadside viewpoints populated with downloaded scooters and small sightseeing groups.
 * Optimized: merges the 710 sub-meshes of moto_motiva.glb by material inside normalizeModel,
 * eliminating ~6,300 draw calls per frame!
 */
export function RoadsideVehicles() {
  const motivaGltf = useGLTF("/models/moto_motiva.glb");
  const vespaGltf = useGLTF("/models/moto_vespa.glb");

  const stops = useMemo(
    () =>
      SCENIC_PULLOUT_FRACTIONS.map((progress, index) => {
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
      }),
    []
  );

  const scooters = useMemo(
    () =>
      [motivaGltf.scene, vespaGltf.scene].map((scene) =>
        normalizeModel(scene, 2.35, "y", {
          castShadow: false,
          receiveShadow: true,
        })
      ),
    [motivaGltf, vespaGltf]
  );

  // Pre-clone all scooter instances once
  const stopData = useMemo(
    () =>
      stops.map((stop) => ({
        ...stop,
        vehicles: Array.from({ length: stop.vehicleCount }, (_, index) => {
          const along = (index - (stop.vehicleCount - 1) / 2) * 1.85;
          const sideDistance = 1.1 + (index % 2) * 0.7;
          const x = stop.tangent.x * along + stop.side.x * sideDistance;
          const z = stop.tangent.z * along + stop.side.z * sideDistance;
          const worldX = stop.position[0] + x;
          const worldZ = stop.position[2] + z;
          return {
            pos: [
              x,
              getTerrainHeight(worldX, worldZ) - stop.position[1],
              z,
            ] as [number, number, number],
            clone: scooters[(index + stop.id) % scooters.length].clone(true),
          };
        }),
      })),
    [stops, scooters]
  );

  return (
    <group name="ScenicRoadsideStops">
      {stopData.map((stop) => (
        <group
          key={stop.id}
          name={`Viewpoint-${stop.id}`}
          position={stop.position}
        >
          {stop.vehicles.map((veh, index) => (
            <group
              key={index}
              position={veh.pos}
              rotation={[0, stop.roadFacing + Math.PI / 2, 0]}
            >
              <primitive object={veh.clone} />
              <mesh position={[0, 0.12, 0.35]}>
                <boxGeometry args={[0.46, 0.04, 0.025]} />
                <meshStandardMaterial
                  color={stop.id % 2 ? "#31c48d" : "#52d4ba"}
                  emissive="#0b7652"
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          ))}
          {Array.from(
            { length: stop.id % 2 === 0 ? 4 : 3 },
            (_, index) => {
              const along = 3.2 + index * 0.85;
              const sideDistance = 2.1 + (index % 2) * 0.75;
              const x = stop.tangent.x * along + stop.side.x * sideDistance;
              const z = stop.tangent.z * along + stop.side.z * sideDistance;
              const worldX = stop.position[0] + x;
              const worldZ = stop.position[2] + z;
              const shirts = ["#e7e2d6", "#397862", "#d49b55", "#718db0"];
              return (
                <group
                  key={`visitor-${index}`}
                  position={[
                    x,
                    getTerrainHeight(worldX, worldZ) - stop.position[1],
                    z,
                  ]}
                  rotation={[0, stop.facing + (index - 1) * 0.12, 0]}
                >
                  <SightseeingVisitor
                    shirt={shirts[(index + stop.id) % shirts.length]}
                    pose={index % 2 === 0 ? "camera" : "point"}
                  />
                </group>
              );
            }
          )}
          <mesh
            position={[stop.side.x * 3.5, 0.75, stop.side.z * 3.5]}
            rotation={[0, stop.facing, 0]}
            castShadow
          >
            <boxGeometry args={[5.4, 0.12, 0.16]} />
            <meshStandardMaterial color="#71593d" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SightseeingVisitor({
  shirt,
  pose,
}: {
  shirt: string;
  pose: "camera" | "point";
}) {
  return (
    <group>
      <mesh position={[0, 1.08, 0]} castShadow>
        <capsuleGeometry args={[0.23, 0.62, 5, 9]} />
        <meshStandardMaterial color={shirt} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.69, 0]} castShadow>
        <sphereGeometry args={[0.19, 12, 10]} />
        <meshStandardMaterial color="#c99272" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.86, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.29, 0.1, 12]} />
        <meshStandardMaterial color="#30383a" roughness={0.8} />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} castShadow>
          <capsuleGeometry args={[0.085, 0.5, 4, 7]} />
          <meshStandardMaterial color="#343e44" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[-0.29, 1.08, -0.13]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.3]} />
        <meshStandardMaterial color="#a65532" roughness={0.85} />
      </mesh>
      {pose === "camera" ? (
        <>
          <mesh
            position={[0.24, 1.42, 0.28]}
            rotation={[0.25, 0.1, -0.55]}
          >
            <capsuleGeometry args={[0.055, 0.38, 4, 7]} />
            <meshStandardMaterial color="#c99272" />
          </mesh>
          <mesh position={[0.22, 1.52, 0.42]}>
            <boxGeometry args={[0.18, 0.12, 0.1]} />
            <meshStandardMaterial color="#263b3b" metalness={0.45} />
          </mesh>
        </>
      ) : (
        <mesh position={[0.3, 1.3, 0.25]} rotation={[0.1, 0, -1.1]}>
          <capsuleGeometry args={[0.055, 0.5, 4, 7]} />
          <meshStandardMaterial color="#c99272" />
        </mesh>
      )}
    </group>
  );
}

/**
 * Dense "Forest environnement" backdrop clumps placed off the road on the mountain flanks.
 * Optimized: disables shadow casting on distant 42k-vertex backdrop meshes and memoizes clones.
 */
export function ForestBackdrop() {
  const gltf = useGLTF(MODEL_PATHS.forest);
  const proto = useMemo(
    () =>
      normalizeModel(gltf.scene, 34, "xz", {
        castShadow: false,
        receiveShadow: true,
      }),
    [gltf]
  );

  const spots = useMemo(() => {
    const out: { pos: [number, number, number]; clone: THREE.Group }[] = [];
    for (const [x, z] of [
      [-60, -60],
      [60, -50],
      [-70, 10],
      [20, 60],
      [60, 40],
      [-20, -90],
      [0, -70],
    ]) {
      if (
        getClosestRoadInfo(x, z).distance > 30 &&
        getTerrainHeight(x, z) > 0.5
      ) {
        out.push({
          pos: [x, getTerrainHeight(x, z), z],
          clone: proto.clone(true),
        });
      }
      if (out.length === 4) break;
    }
    return out;
  }, [proto]);

  return (
    <group name="SonTraForestBackdrop">
      {spots.map((item, i) => (
        <group key={i} position={item.pos} rotation={[0, i * 1.7, 0]}>
          <primitive object={item.clone} />
        </group>
      ))}
    </group>
  );
}
