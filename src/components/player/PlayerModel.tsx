"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Human } from "../figures/Human";

type Props = ThreeElements["group"] & { modelPath?: string; moving?: boolean };

function PlaceholderExplorer({ moving }: { moving: boolean }) {
  return (
    <Human
      pose="walk"
      moving={moving}
      pole
      hat="non-la"
      shirt="#2e6f40"
      pants="#3b4350"
    />
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
