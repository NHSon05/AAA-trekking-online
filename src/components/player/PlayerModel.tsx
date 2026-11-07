"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = ThreeElements["group"] & { modelPath?: string; moving?: boolean };

function PlaceholderExplorer({ moving }: { moving: boolean }) {
  const group = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const tiltTarget = moving ? Math.sin(t * 9) * 0.05 : 0;
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      tiltTarget,
      8,
      delta
    );
    const swing = moving ? Math.sin(t * 9) * 0.45 : 0;
    if (leftLeg.current) {
      leftLeg.current.rotation.x = THREE.MathUtils.damp(
        leftLeg.current.rotation.x,
        swing,
        10,
        delta
      );
    }
    if (rightLeg.current) {
      rightLeg.current.rotation.x = THREE.MathUtils.damp(
        rightLeg.current.rotation.x,
        -swing,
        10,
        delta
      );
    }
  });

  return (
    <group ref={group}>
      {/* Torso / Outdoor Jacket */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.68, 6, 12]} />
        <meshStandardMaterial color="#2e6f40" roughness={0.7} />
      </mesh>
      {/* Trekking Backpack (on back, local -Z) */}
      <mesh position={[0, 1.18, -0.24]} castShadow>
        <boxGeometry args={[0.38, 0.56, 0.24]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.23, 20, 14]} />
        <meshStandardMaterial color="#e0ac8b" roughness={0.6} />
      </mesh>
      {/* Sun Hat */}
      <mesh position={[0, 1.88, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.36, 0.14, 20]} />
        <meshStandardMaterial color="#856544" roughness={0.8} />
      </mesh>
      {/* Legs */}
      <mesh ref={leftLeg} position={[-0.13, 0.47, 0]} castShadow>
        <capsuleGeometry args={[0.095, 0.5, 5, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.85} />
      </mesh>
      <mesh ref={rightLeg} position={[0.13, 0.47, 0]} castShadow>
        <capsuleGeometry args={[0.095, 0.5, 5, 8]} />
        <meshStandardMaterial color="#374151" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function PlayerModel({ modelPath, moving = false, ...props }: Props) {
  const group = useRef<THREE.Group>(null);
  const gltf = modelPath ? useGLTF(modelPath) : null;
  const clonedScene = useMemo(() => gltf?.scene.clone(true), [gltf]);
  const { actions } = useAnimations(gltf?.animations ?? [], group);

  useEffect(() => {
    if (!actions) return;
    const action =
      actions.Walk ??
      actions.walk ??
      actions.Idle ??
      actions.idle ??
      Object.values(actions)[0];
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    if (!moving) action.paused = true;
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, moving]);

  return (
    <group ref={group} {...props}>
      {clonedScene ? (
        <primitive object={clonedScene} />
      ) : (
        <PlaceholderExplorer moving={moving} />
      )}
    </group>
  );
}
