"use client";

import { Suspense } from "react";
import {
  ForestTrees,
  RoadSegments,
  RoadsideGrass,
  WildlifeZone,
} from "./RoadlineModels";
import { SonTraLandmarks } from "./SonTraLandmarks";
import { SonTraTerrain } from "./SonTraTerrain";
import { LandmarkPoint } from "./roadData";

export * from "./roadData";
export * from "./RoadlineModels";
export * from "./SonTraLandmarks";
export * from "./SonTraTerrain";

export function SonTraRoadline({
  activeLandmarkId,
  discoveredIds,
  onSelectLandmark,
}: {
  activeLandmarkId?: string | null;
  discoveredIds: string[];
  onSelectLandmark?: (landmark: LandmarkPoint) => void;
}) {
  return (
    <group name="SonTraWorld">
      <SonTraTerrain />
      <Suspense fallback={null}>
        <RoadSegments />
        <ForestTrees />
        <RoadsideGrass />
        <WildlifeZone />
      </Suspense>
      <SonTraLandmarks
        activeLandmarkId={activeLandmarkId}
        discoveredIds={discoveredIds}
        onSelectLandmark={onSelectLandmark}
      />
    </group>
  );
}
