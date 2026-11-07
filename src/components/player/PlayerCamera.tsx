"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CameraMode } from "./types";

export function PlayerCamera({
  target,
  mode,
}: {
  target: React.RefObject<THREE.Object3D | null>;
  mode: CameraMode;
}) {
  const { camera } = useThree();
  const smoothed = useRef(new THREE.Vector3());

  useEffect(() => {
    if (mode === "overview") {
      camera.position.set(45, 42, 65);
      camera.lookAt(0, 6, -15);
    }
  }, [mode, camera]);

  useFrame((_, delta) => {
    if (mode === "overview" || !target.current) return;
    const player = target.current;
    const offset =
      mode === "first-person"
        ? new THREE.Vector3(0, 1.65, -0.15)
        : new THREE.Vector3(0, 2.8, -6.2);
    offset.applyQuaternion(player.quaternion);
    const desired = player.position.clone().add(offset);
    if (smoothed.current.lengthSq() === 0) {
      smoothed.current.copy(desired);
    } else {
      smoothed.current.lerp(desired, 1 - Math.pow(0.001, delta));
    }
    camera.position.copy(smoothed.current);
    if (mode === "first-person") {
      camera.lookAt(
        player.position
          .clone()
          .add(new THREE.Vector3(0, 1.55, 4).applyQuaternion(player.quaternion))
      );
    } else {
      camera.lookAt(
        player.position
          .clone()
          .add(new THREE.Vector3(0, 1.3, 2).applyQuaternion(player.quaternion))
      );
    }
  });
  return null;
}
