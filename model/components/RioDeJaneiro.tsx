"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { GLBComponentProps } from "./types";
import { glbAssetPaths } from "./assetPaths";

export function RioDeJaneiro({ src = glbAssetPaths.rioDeJaneiro, ...props }: GLBComponentProps) {
  const { scene } = useGLTF(src);
  return <group {...props}><Clone object={scene} castShadow receiveShadow /></group>;
}

useGLTF.preload(glbAssetPaths.rioDeJaneiro);
