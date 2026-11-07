"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getClosestRoadInfo, getTerrainHeight } from "./roadData";

export function SonTraTerrain() {
  const terrainGeometry = useMemo(() => {
    const width = 180;
    const depth = 230;
    const segX = 140;
    const segZ = 180;

    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      // Shift center slightly North-West so the peninsula roadline fits comfortably
      const x = posAttr.getX(i) - 6;
      const z = posAttr.getZ(i) - 18;
      const y = getTerrainHeight(x, z);

      posAttr.setXYZ(i, x, y, z);

      const roadInfo = getClosestRoadInfo(x, z);

      if (y < -0.35) {
        // Underwater / wet coastal sand
        color.set("#bba67b");
      } else if (y < 0.25 && (x > 26 || z > 64)) {
        // Coastal golden beach sand
        color.set("#d8c596");
      } else if (roadInfo.distance < 3.5) {
        // Earthy road shoulder blend
        color.set("#4d5d44");
      } else if (y > 9.5) {
        // High mountain ridge moss & granite
        color.set("#385d3c");
      } else if (y > 4.5) {
        // Mid-mountain dense tropical forest floor
        color.set("#294f34");
      } else {
        // Lower coastal forest floor
        color.set("#315b3a");
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group name="SonTraPeninsulaTerrain">
      {/* Sculpted Peninsula Mountain Mesh */}
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Da Nang Bay & East Sea Ocean Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[35, -0.45, 20]}
        receiveShadow
      >
        <planeGeometry args={[280, 320]} />
        <meshStandardMaterial
          color="#1b6ca8"
          roughness={0.25}
          metalness={0.15}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}
