"use client";

import { Environment, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  CameraMode,
  PlayerCamera,
  PlayerController,
  PlayerHUD,
} from "./player";
import {
  getClosestRoadInfo,
  getRoadCurve,
  LandmarkPoint,
  SON_TRA_LANDMARKS,
  SonTraRoadline,
} from "./roadline";

export function ExploreScene() {
  const player = useRef<THREE.Group>(null);
  const [mode, setMode] = useState<CameraMode>("third-person");
  const [autoTrek, setAutoTrek] = useState(false);

  // Start at the Son Tra Coastal Trailhead facing up the roadline
  const initialHeading = useMemo(() => {
    const tan = getRoadCurve().getTangentAt(0);
    return Math.atan2(tan.x, tan.z);
  }, []);

  const [spawnState, setSpawnState] = useState<{
    position: [number, number, number];
    rotationY: number;
  }>({
    position: [0, 0.2, 62],
    rotationY: initialHeading,
  });

  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([
    0, 0.2, 62,
  ]);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(["trailhead"]);
  const [selectedLandmark, setSelectedLandmark] =
    useState<LandmarkPoint | null>(null);

  const roadInfo = useMemo(
    () => getClosestRoadInfo(playerPosition[0], playerPosition[2]),
    [playerPosition[0], playerPosition[2]]
  );

  // Detect if player is close to any landmark along the roadline
  const nearbyLandmark = useMemo(() => {
    for (const lm of SON_TRA_LANDMARKS) {
      const dx = lm.position[0] - playerPosition[0];
      const dz = lm.position[2] - playerPosition[2];
      if (Math.hypot(dx, dz) < 7.5) {
        return lm;
      }
    }
    return null;
  }, [playerPosition[0], playerPosition[2]]);

  // Mark landmark as discovered when player reaches it
  useEffect(() => {
    if (nearbyLandmark && !discoveredIds.includes(nearbyLandmark.id)) {
      setDiscoveredIds((prev) => [...prev, nearbyLandmark.id]);
    }
  }, [nearbyLandmark, discoveredIds]);

  // Press E to inspect nearby landmark
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && nearbyLandmark) {
        setSelectedLandmark((prev) =>
          prev?.id === nearbyLandmark.id ? null : nearbyLandmark
        );
      }
      if (
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.code
        )
      ) {
        setAutoTrek(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nearbyLandmark]);

  const handleSelectCheckpoint = useCallback((lm: LandmarkPoint) => {
    setAutoTrek(false);
    const info = getClosestRoadInfo(lm.position[0], lm.position[2]);
    const tan = getRoadCurve().getTangentAt(Math.min(0.99, info.t));
    const heading = Math.atan2(tan.x, tan.z);

    setSpawnState({
      position: [...lm.position],
      rotationY: heading,
    });
    setPlayerPosition([...lm.position]);
    setSelectedLandmark(lm);
    setDiscoveredIds((prev) => (prev.includes(lm.id) ? prev : [...prev, lm.id]));
  }, []);

  return (
    <div className="explore-page">
      <Canvas
        className="scene-canvas"
        shadows
        camera={{ position: [0, 4, 70], fov: 55, near: 0.1, far: 450 }}
      >
        <color attach="background" args={["#9bc8d4"]} />
        <fog attach="fog" args={["#9bc8d4", 45, 210]} />

        <Sky
          distance={450000}
          sunPosition={[80, 45, 40]}
          inclination={0.52}
          azimuth={0.25}
        />
        <ambientLight intensity={1.35} />
        <directionalLight
          castShadow
          position={[45, 65, 35]}
          intensity={2.6}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-90}
          shadow-camera-right={90}
          shadow-camera-top={110}
          shadow-camera-bottom={-110}
        />
        <Environment preset="forest" />

        {/* 3D Son Tra Peninsula Terrain, Roadline Models, Forest, Wildlife & Landmarks */}
        <SonTraRoadline
          activeLandmarkId={selectedLandmark?.id ?? nearbyLandmark?.id}
          discoveredIds={discoveredIds}
          onSelectLandmark={handleSelectCheckpoint}
        />

        {/* Trekker Character Controller */}
        <PlayerController
          ref={player}
          position={spawnState.position}
          rotationY={spawnState.rotationY}
          autoTrek={autoTrek}
          onAutoTrekComplete={() => setAutoTrek(false)}
          onPositionChange={setPlayerPosition}
        />

        <PlayerCamera target={player} mode={mode} />
        <OrbitControls
          enabled={mode === "overview"}
          target={[0, 6, -15]}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={12}
          maxDistance={165}
        />
      </Canvas>

      <PlayerHUD
        mode={mode}
        onChangeMode={setMode}
        playerPosition={playerPosition}
        roadProgress={roadInfo.t}
        autoTrek={autoTrek}
        onToggleAutoTrek={() => setAutoTrek((v) => !v)}
        nearbyLandmark={nearbyLandmark}
        selectedLandmark={selectedLandmark}
        onCloseLandmark={() => setSelectedLandmark(null)}
        onSelectCheckpoint={handleSelectCheckpoint}
        discoveredIds={discoveredIds}
      />
    </div>
  );
}
