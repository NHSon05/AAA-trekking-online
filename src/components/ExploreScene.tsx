"use client";

import { Environment, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
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
  MONKEY_TERRITORIES,
  ROUTE_START,
  SON_TRA_LANDMARKS,
  SonTraRoadline,
} from "./roadline";

export function ExploreScene() {
  const player = useRef<THREE.Group>(null);
  const [mode, setMode] = useState<CameraMode>("third-person");
  const [autoTrek, setAutoTrek] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [ghostVisible, setGhostVisible] = useState(false);
  const [monkeyPlaying, setMonkeyPlaying] = useState(false);

  // Start at the Son Tra Coastal Trailhead facing up the roadline
  const initialHeading = useMemo(() => {
    const tan = getRoadCurve().getTangentAt(0);
    return Math.atan2(tan.x, tan.z);
  }, []);

  const [spawnState, setSpawnState] = useState<{
    position: [number, number, number];
    rotationY: number;
  }>({
    position: ROUTE_START,
    rotationY: initialHeading,
  });

  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>(ROUTE_START);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(["trailhead"]);
  const [selectedLandmark, setSelectedLandmark] =
    useState<LandmarkPoint | null>(null);

  const roadInfo = useMemo(
    () => getClosestRoadInfo(playerPosition[0], playerPosition[2]),
    [playerPosition[0], playerPosition[2]]
  );
  const monkeyCenters = useMemo(() => MONKEY_TERRITORIES.map((territory) => {
    const landmark = SON_TRA_LANDMARKS.find(({ id }) => id === territory.landmarkId)!;
    return [landmark.position[0] + territory.offset[0], landmark.position[2] + territory.offset[2]] as const;
  }), []);
  const monkeysApproach = monkeyCenters.some(([x, z]) => Math.hypot(playerPosition[0] - x, playerPosition[2] - z) < 19);

  // Keep the apparition rare and brief so the night ride stays surprising.
  useEffect(() => {
    setGhostVisible(false);
    if (!isNight) return;
    let hideTimer: number | undefined;
    let interval: number | undefined;
    const schedule = () => {
      interval = window.setTimeout(() => {
        setGhostVisible(true);
        hideTimer = window.setTimeout(() => {
          setGhostVisible(false);
          schedule();
        }, 6500);
      }, 14000 + Math.random() * 16000);
    };
    schedule();
    return () => {
      window.clearTimeout(interval);
      window.clearTimeout(hideTimer);
    };
  }, [isNight]);

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
      if (e.code === "KeyF" && monkeysApproach && !e.repeat) {
        setMonkeyPlaying((playing) => !playing);
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
  }, [nearbyLandmark, monkeysApproach]);

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
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: true }}
        camera={{ position: [0, 4, 70], fov: 55, near: 0.1, far: 900 }}
      >
        <color attach="background" args={[isNight ? "#07111e" : "#9bc8d4"]} />
        <fog attach="fog" args={[
          isNight ? "#101a2b" : "#9bc8d4",
          mode === "overview" ? 300 : isNight ? 22 : 45,
          mode === "overview" ? 700 : isNight ? 105 : 210,
        ]} />

        <Sky
          distance={450000}
          sunPosition={isNight ? [0, -8, 0] : [80, 45, 40]}
          inclination={0.52}
          azimuth={0.25}
        />
        <ambientLight intensity={isNight ? 0.28 : 1.35} color={isNight ? "#91a8d8" : "#ffffff"} />
        {isNight && <hemisphereLight args={["#546b9e", "#10140f", 0.45]} />}
        <directionalLight
          castShadow
          position={[45, 65, 35]}
          intensity={isNight ? 0.22 : 2.6}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-90}
          shadow-camera-right={90}
          shadow-camera-top={110}
          shadow-camera-bottom={-110}
        />
        <Environment preset="forest" />
        <pointLight position={[playerPosition[0], 5, playerPosition[2]]} color="#ffd78a" intensity={isNight ? 2.4 : 0} distance={25} />
        {isNight && ghostVisible && <NightGhost position={[playerPosition[0] + 7, playerPosition[1] + 0.3, playerPosition[2] - 13]} />}

        {/* 3D Son Tra Peninsula Terrain, Roadline Models, Forest, Wildlife & Landmarks */}
        <SonTraRoadline
          activeLandmarkId={selectedLandmark?.id ?? nearbyLandmark?.id}
          discoveredIds={discoveredIds}
          onSelectLandmark={handleSelectCheckpoint}
          playerPosition={playerPosition}
          monkeyPlaying={monkeyPlaying}
          monkeysApproach={monkeysApproach}
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
          target={[0, 0, -10]}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={12}
          maxDistance={320}
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
        isNight={isNight}
        onToggleNight={() => setIsNight((night) => !night)}
        ghostVisible={ghostVisible}
        monkeysNearby={monkeysApproach}
        monkeyPlaying={monkeyPlaying}
        onToggleMonkeyPlay={() => setMonkeyPlaying((playing) => !playing)}
      />
    </div>
  );
}

function NightGhost({ position }: { position: [number, number, number] }) {
  const ghost = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ghost.current) return;
    const t = clock.elapsedTime;
    ghost.current.position.y = position[1] + Math.sin(t * 1.7) * 0.28;
    ghost.current.rotation.y = Math.sin(t * 0.55) * 0.18;
  });
  return (
    <group ref={ghost} position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.63, 1.3, 8, 16]} />
        <meshStandardMaterial color="#dce4ef" transparent opacity={0.72} emissive="#9aafd4" emissiveIntensity={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.56, 20, 16]} />
        <meshStandardMaterial color="#e7ecf4" transparent opacity={0.78} emissive="#aebddd" emissiveIntensity={0.32} />
      </mesh>
      {[-0.2, 0.2].map((x) => <mesh key={x} position={[x, 2.13, 0.49]}><sphereGeometry args={[0.065, 10, 10]} /><meshBasicMaterial color="#11182a" /></mesh>)}
      <pointLight position={[0, 1.5, 0]} color="#b8c9ff" intensity={1.2} distance={8} />
    </group>
  );
}
