"use client";

import { memo, Suspense } from "react";
import { RoadsideDetails } from "./RoadsideDetails";
import {
  ForestBackdrop,
  ForestTrees,
  RoadSegments,
  RoadsideVehicles,
  RoadsideGrass,
  WildlifeZone,
} from "./RoadlineModels";
import { SonTraLandmarks } from "./SonTraLandmarks";
import { SonTraTerrain } from "./SonTraTerrain";
import { LandmarkPoint } from "./roadData";

export * from "./roadData";
export * from "./RoadlineModels";
export { RoadsideDetails } from "./RoadsideDetails";
export * from "./SonTraLandmarks";
export * from "./SonTraTerrain";

// Static scenery must not re-render every frame when the player position changes.
const StaticTerrain = memo(SonTraTerrain);
const StaticRoad = memo(RoadSegments);
const StaticTrees = memo(ForestTrees);
const StaticBackdrop = memo(ForestBackdrop);
const StaticRoadside = memo(RoadsideDetails);
const StaticGrass = memo(RoadsideGrass);
const StaticVehicles = memo(RoadsideVehicles);
const MemoLandmarks = memo(SonTraLandmarks);

export function SonTraRoadline({
  activeLandmarkId,
  discoveredIds,
  onSelectLandmark,
  playerPosition,
  monkeyPlaying,
  monkeysApproach,
}: {
  activeLandmarkId?: string | null;
  discoveredIds: string[];
  onSelectLandmark?: (landmark: LandmarkPoint) => void;
  playerPosition: [number, number, number];
  monkeyPlaying: boolean;
  monkeysApproach: boolean;
}) {
  return (
    <group name="SonTraWorld">
      <StaticTerrain />
      <Suspense fallback={null}>
        <StaticRoad />
        <StaticTrees />
        <StaticBackdrop />
        <StaticRoadside />
        <StaticGrass />
        <WildlifeZone playerPosition={playerPosition} playing={monkeyPlaying} approachPlayer={monkeysApproach} />
        <StaticVehicles />
      </Suspense>
      <MemoLandmarks
        activeLandmarkId={activeLandmarkId}
        discoveredIds={discoveredIds}
        onSelectLandmark={onSelectLandmark}
      />
    </group>
  );
}
