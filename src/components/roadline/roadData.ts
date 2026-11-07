import * as THREE from "three";

export interface LandmarkPoint {
  id: string;
  name: string;
  vietnameseName: string;
  category: "trailhead" | "pagoda" | "wildlife" | "nature" | "summit";
  position: [number, number, number];
  elevationMeters: number;
  distanceKm: number;
  description: string;
  highlights: string[];
  tips: string;
}

/**
 * Control points defining the winding Son Tra Peninsula trekking roadline.
 * Coordinates are in scene meters (X: West-East, Y: Elevation, Z: North-South).
 * Starts near the coastal base (South-East) and climbs up the winding mountain pass
 * to Ban Co Peak (North-West summit).
 */
export const ROAD_CONTROL_POINTS: [number, number, number][] = [
  [0, 0.2, 62],       // 0: Coastal Trailhead Entrance
  [6, 0.6, 50],       // 1: Coastal Curve
  [16, 1.5, 36],      // 2: Bai But / Linh Ung Approach
  [22, 2.4, 20],      // 3: Linh Ung Pagoda Overlook
  [14, 3.4, 4],       // 4: Winding Mountain Switchback 1
  [0, 4.4, -8],       // 5: Mid-Mountain Forest Pass
  [-16, 5.4, -16],    // 6: Wildlife Sanctuary / Primate Observation Curve
  [-24, 6.4, -30],    // 7: Deep Tropical Canopy Pass
  [-12, 7.5, -44],    // 8: Ancient Banyan Junction
  [6, 8.8, -54],      // 9: Upper Ridge Switchback
  [18, 10.2, -68],    // 10: Cloud Ridge Approach
  [4, 11.8, -82],     // 11: Summit Approach
  [-10, 13.0, -94],   // 12: Ban Co Peak Summit (Đỉnh Bàn Cờ)
];

/**
 * Secondary forest trekking trail spur branching toward the Ancient Banyan Tree.
 */
export const BANYAN_TRAIL_POINTS: [number, number, number][] = [
  [-12, 7.5, -44],
  [-22, 7.2, -48],
  [-32, 6.9, -52],
  [-40, 6.7, -55],
];

let cachedRoadCurve: THREE.CatmullRomCurve3 | null = null;
let cachedTrailCurve: THREE.CatmullRomCurve3 | null = null;
let cachedSampledPoints: THREE.Vector3[] | null = null;

export function getRoadCurve(): THREE.CatmullRomCurve3 {
  if (!cachedRoadCurve) {
    cachedRoadCurve = new THREE.CatmullRomCurve3(
      ROAD_CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      "catmullrom",
      0.45
    );
  }
  return cachedRoadCurve;
}

export function getBanyanTrailCurve(): THREE.CatmullRomCurve3 {
  if (!cachedTrailCurve) {
    cachedTrailCurve = new THREE.CatmullRomCurve3(
      BANYAN_TRAIL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      "catmullrom",
      0.5
    );
  }
  return cachedTrailCurve;
}

export function getSampledRoadPoints(divisions = 240): THREE.Vector3[] {
  if (!cachedSampledPoints) {
    cachedSampledPoints = getRoadCurve().getSpacedPoints(divisions);
  }
  return cachedSampledPoints;
}

/**
 * Finds the closest point on the main roadline to (x, z), returning its elevation,
 * horizontal distance, and normalized progress t in [0, 1].
 */
export function getClosestRoadInfo(x: number, z: number): {
  point: THREE.Vector3;
  distance: number;
  t: number;
} {
  const samples = getSampledRoadPoints(240);
  let bestIdx = 0;
  let bestDistSq = Infinity;

  for (let i = 0; i < samples.length; i++) {
    const dx = samples[i].x - x;
    const dz = samples[i].z - z;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestIdx = i;
    }
  }

  return {
    point: samples[bestIdx],
    distance: Math.sqrt(bestDistSq),
    t: bestIdx / (samples.length - 1),
  };
}

/**
 * Deterministic terrain height function for Son Tra Peninsula.
 * Blends smoothly into the roadline and Banyan trail elevations so the 3D road
 * sits naturally on the mountain slope without floating or burying.
 */
export function getTerrainHeight(x: number, z: number): number {
  // Base peninsula slope rising from South-East (sea level) to North-West (mountain peak)
  const coastalDrop = (z - 55) * -0.11 - x * 0.035;
  const ridgeWave =
    Math.sin(x * 0.055) * Math.cos(z * 0.045) * 2.2 +
    Math.sin((x - z) * 0.03) * 1.6 +
    Math.cos(x * 0.11 + z * 0.08) * 0.45;

  let naturalHeight = Math.max(-1.8, coastalDrop + ridgeWave);

  // East / South-East coastline slopes into Da Nang Bay water
  if (x > 34 || z > 74) {
    const seaFactor = Math.max((x - 34) * 0.12, (z - 74) * 0.14);
    naturalHeight -= seaFactor * 2.2;
  }

  // Blend with main roadline corridor so roadbed is flush
  const roadInfo = getClosestRoadInfo(x, z);
  const roadHalfWidth = 3.2;
  const shoulderWidth = 9.5;

  if (roadInfo.distance <= roadHalfWidth) {
    return roadInfo.point.y;
  }

  if (roadInfo.distance < shoulderWidth) {
    const alpha = (roadInfo.distance - roadHalfWidth) / (shoulderWidth - roadHalfWidth);
    const smooth = alpha * alpha * (3 - 2 * alpha);
    naturalHeight = THREE.MathUtils.lerp(roadInfo.point.y, naturalHeight, smooth);
  }

  // Also blend with the Banyan forest spur trail
  const trailSamples = getBanyanTrailCurve().getSpacedPoints(40);
  let minTrailDistSq = Infinity;
  let trailY = naturalHeight;
  for (let i = 0; i < trailSamples.length; i++) {
    const dx = trailSamples[i].x - x;
    const dz = trailSamples[i].z - z;
    const dSq = dx * dx + dz * dz;
    if (dSq < minTrailDistSq) {
      minTrailDistSq = dSq;
      trailY = trailSamples[i].y;
    }
  }
  const trailDist = Math.sqrt(minTrailDistSq);
  if (trailDist < 5.5) {
    const alpha = Math.max(0, (trailDist - 1.8) / (5.5 - 1.8));
    const smooth = alpha * alpha * (3 - 2 * alpha);
    naturalHeight = THREE.MathUtils.lerp(trailY, naturalHeight, smooth);
  }

  return naturalHeight;
}

export const SON_TRA_LANDMARKS: LandmarkPoint[] = [
  {
    id: "trailhead",
    name: "Son Tra Coastal Trailhead",
    vietnameseName: "Trạm Xuất Phát Bán Đảo Sơn Trà",
    category: "trailhead",
    position: [0, 0.2, 62],
    elevationMeters: 45,
    distanceKm: 0.0,
    description:
      "Starting point of the coastal-to-summit trekking roadline on Son Tra Peninsula. Check your trekking gear, water supply, and route map before ascending the mountain pass.",
    highlights: [
      "Route information signboard & milestone 0 km",
      "Views toward Da Nang Bay coastline",
      "Paved mountain road entry with forest canopy ahead",
    ],
    tips: "Start early in the morning for cool mountain air and clear visibility.",
  },
  {
    id: "linh-ung",
    name: "Linh Ung Coastal Overlook",
    vietnameseName: "Chùa Linh Ứng — Bãi Bụt",
    category: "pagoda",
    position: [22, 2.4, 20],
    elevationMeters: 190,
    distanceKm: 2.4,
    description:
      "Home to the iconic 67-meter white Lady Buddha (Tượng Phật Bà Quan Âm) overlooking the East Sea and Da Nang Bay, nestled against the lush slopes of Son Tra.",
    highlights: [
      "67m white Quan Am statue facing the sea",
      "Traditional curved-roof temple architecture",
      "Panoramic ocean and bay viewpoint",
    ],
    tips: "Respectful attire is recommended when visiting the pagoda courtyard.",
  },
  {
    id: "wildlife-sanctuary",
    name: "Primate Conservation Zone",
    vietnameseName: "Khu Bảo Tồn Voọc & Linh Trưởng Sơn Trà",
    category: "wildlife",
    position: [-16, 5.4, -16],
    elevationMeters: 380,
    distanceKm: 5.1,
    description:
      "Mid-mountain old-growth tropical forest canopy inhabited by the endangered Red-shanked Douc Langur (Voọc chà vá chân nâu) and forest primates.",
    highlights: [
      "Natural habitat observation along the forest roadline",
      "Multi-layered tropical rainforest canopy",
      "Eco-protection zone — observe quietly from the road",
    ],
    tips: "Keep a respectful distance, avoid loud noises, and never feed wildlife.",
  },
  {
    id: "banyan-tree",
    name: "Ancient Banyan Tree Trail",
    vietnameseName: "Cây Đa Ngàn Năm Sơn Trà",
    category: "nature",
    position: [-40, 6.7, -55],
    elevationMeters: 490,
    distanceKm: 7.3,
    description:
      "A majestic ancient heritage banyan tree with dozens of massive aerial roots cascading into the forest floor, reached via the shaded forest trail spur.",
    highlights: [
      "Massive aerial root network forming a natural cathedral",
      "Shaded forest trail branching off the main roadline",
      "Vietnam Heritage Tree conservation site",
    ],
    tips: "Stay on the marked forest trail to protect the surrounding surface roots.",
  },
  {
    id: "ban-co-peak",
    name: "Ban Co Peak Summit",
    vietnameseName: "Đỉnh Bàn Cờ — Nóc Nhà Sơn Trà",
    category: "summit",
    position: [-10, 13.0, -94],
    elevationMeters: 696,
    distanceKm: 9.8,
    description:
      "The highest panoramic peak of Son Tra Peninsula featuring the legendary Fairy Chess Table statue (Tượng Đế Thích đánh cờ) surrounded by mountain clouds and sweeping views of Da Nang.",
    highlights: [
      "Iconic seated Fairy Chess Player & stone chessboard",
      "700m elevation stone milestone marker",
      "360-degree panorama of Son Tra forest, ocean, and city",
    ],
    tips: "Mountain breezes can be strong at the summit; hold onto hats and gear.",
  },
];
