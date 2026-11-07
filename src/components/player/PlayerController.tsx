"use client";

import { useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getClosestRoadInfo, getRoadCurve, getTerrainHeight, ROUTE_START } from "../roadline/roadData";
import { PlayerModel } from "./PlayerModel";
import { PlayerProps } from "./types";

const keyMap: Record<string, string> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
};

export const PlayerController = forwardRef<THREE.Group, PlayerProps>(
  function PlayerController(
    {
      position = ROUTE_START,
      rotationY = Math.PI,
      speed = 4.6,
      modelPath,
      scale = 1,
      autoTrek = false,
      onAutoTrekComplete,
      getGroundHeight = getTerrainHeight,
      onPositionChange,
    },
    forwardedRef
  ) {
    const ref = useRef<THREE.Group>(null);
    const setRef = (node: THREE.Group | null) => {
      ref.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const [input, setInput] = useState<Record<string, boolean>>({});
    const [moving, setMoving] = useState(false);
    const movingRef = useRef(false);
    const lastPosition = useRef(new THREE.Vector3(...position));
    const autoProgress = useRef(0);

    const updateMoving = (next: boolean) => {
      if (movingRef.current !== next) {
        movingRef.current = next;
        setMoving(next);
      }
    };

    // Sync position & rotation when external teleport / checkpoint selection changes `position`
    useEffect(() => {
      if (!ref.current) return;
      const [px, py, pz] = position;
      ref.current.position.set(px, py, pz);
      ref.current.rotation.y = rotationY;
      const info = getClosestRoadInfo(px, pz);
      autoProgress.current = info.t;
      onPositionChange?.([px, py, pz]);
    }, [position[0], position[1], position[2], rotationY]);

    useEffect(() => {
      const setKey = (event: KeyboardEvent, value: boolean) => {
        const key = keyMap[event.code];
        if (key) {
          event.preventDefault();
          setInput((state) => ({ ...state, [key]: value }));
        }
      };
      const down = (event: KeyboardEvent) => setKey(event, true);
      const up = (event: KeyboardEvent) => setKey(event, false);
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);

    useFrame((_, delta) => {
      if (!ref.current) return;

      // Auto-trek mode along the 3D Son Tra roadline curve
      if (autoTrek) {
        const curve = getRoadCurve();
        const totalLength = curve.getLength();
        const stepU = ((speed * 1.35) / totalLength) * delta;
        autoProgress.current = Math.min(1, autoProgress.current + stepU);

        const pt = curve.getPointAt(autoProgress.current);
        const tan = curve.getTangentAt(autoProgress.current);
        const groundY = getGroundHeight(pt.x, pt.z);

        ref.current.position.set(pt.x, groundY, pt.z);
        ref.current.rotation.y = Math.atan2(tan.x, tan.z);
        updateMoving(autoProgress.current < 1);

        if (lastPosition.current.distanceToSquared(ref.current.position) > 0.12) {
          lastPosition.current.copy(ref.current.position);
          onPositionChange?.([
            ref.current.position.x,
            ref.current.position.y,
            ref.current.position.z,
          ]);
        }

        if (autoProgress.current >= 1) {
          onAutoTrekComplete?.();
        }
        return;
      }

      // Manual keyboard control: A/D rotates character heading, W/S moves forward/backward
      const turnInput = Number(!!input.left) - Number(!!input.right);
      const moveInput = Number(!!input.forward) - Number(!!input.backward);

      if (turnInput !== 0) {
        ref.current.rotation.y += turnInput * 2.1 * delta;
      }

      const isMoving = moveInput !== 0 || turnInput !== 0;
      updateMoving(isMoving);

      if (moveInput !== 0) {
        const currentSpeed = speed * (input.sprint ? 1.75 : 1) * moveInput;
        const forwardVec = new THREE.Vector3(
          Math.sin(ref.current.rotation.y),
          0,
          Math.cos(ref.current.rotation.y)
        );
        ref.current.position.addScaledVector(forwardVec, currentSpeed * delta);
      }

      // Keep character on terrain surface
      const targetY = getGroundHeight(
        ref.current.position.x,
        ref.current.position.z
      );
      ref.current.position.y = THREE.MathUtils.damp(
        ref.current.position.y,
        targetY,
        14,
        delta
      );

      // Update closest road progress for seamless switching to autoTrek
      if (moveInput !== 0) {
        const info = getClosestRoadInfo(
          ref.current.position.x,
          ref.current.position.z
        );
        autoProgress.current = info.t;
      }

      if (lastPosition.current.distanceToSquared(ref.current.position) > 0.12) {
        lastPosition.current.copy(ref.current.position);
        onPositionChange?.([
          ref.current.position.x,
          ref.current.position.y,
          ref.current.position.z,
        ]);
      }
    });

    return (
      <group ref={setRef} position={position} rotation={[0, rotationY, 0]}>
        <PlayerModel modelPath={modelPath} moving={moving} scale={scale} />
      </group>
    );
  }
);
