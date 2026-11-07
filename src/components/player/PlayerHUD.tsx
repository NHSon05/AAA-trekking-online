"use client";

import { useMemo } from "react";
import {
  BANYAN_TRAIL_POINTS,
  LandmarkPoint,
  ROAD_CONTROL_POINTS,
  SON_TRA_LANDMARKS,
} from "../roadline/roadData";
import { CameraMode } from "./types";

interface PlayerHUDProps {
  mode: CameraMode;
  onChangeMode: (mode: CameraMode) => void;
  playerPosition: [number, number, number];
  roadProgress: number;
  autoTrek: boolean;
  onToggleAutoTrek: () => void;
  nearbyLandmark: LandmarkPoint | null;
  selectedLandmark: LandmarkPoint | null;
  onCloseLandmark: () => void;
  onSelectCheckpoint: (landmark: LandmarkPoint) => void;
  discoveredIds: string[];
}

function toMiniMapCoord(x: number, z: number): [number, number] {
  // Map world X [-55, 45], Z [-105, 75] into SVG [0..140, 0..160]
  const svgX = ((x + 55) / 100) * 120 + 10;
  const svgY = ((z + 105) / 180) * 140 + 10;
  return [svgX, svgY];
}

export function PlayerHUD({
  mode,
  onChangeMode,
  playerPosition,
  roadProgress,
  autoTrek,
  onToggleAutoTrek,
  nearbyLandmark,
  selectedLandmark,
  onCloseLandmark,
  onSelectCheckpoint,
  discoveredIds,
}: PlayerHUDProps) {
  const elevationMeters = Math.round(45 + Math.max(0, playerPosition[1]) * 50);
  const distanceKm = (roadProgress * 9.8).toFixed(1);

  const mainRoadPolyline = useMemo(() => {
    return ROAD_CONTROL_POINTS.map(([x, , z]) =>
      toMiniMapCoord(x, z).join(",")
    ).join(" ");
  }, []);

  const banyanTrailPolyline = useMemo(() => {
    return BANYAN_TRAIL_POINTS.map(([x, , z]) =>
      toMiniMapCoord(x, z).join(",")
    ).join(" ");
  }, []);

  const [playerSvgX, playerSvgY] = toMiniMapCoord(
    playerPosition[0],
    playerPosition[2]
  );

  return (
    <div className="hud">
      {/* Top Bar */}
      <div className="hud__top">
        <div className="hud__card hud__brand-card">
          <div className="hud__brand">Son Tra · Beyond the Map</div>
          <div className="hud__title">3D Island Trekking Roadline</div>
          <div className="hud__stats">
            <span>Elevation: {elevationMeters}m</span>
            <span>·</span>
            <span>Route: {distanceKm} / 9.8 km</span>
            <span>·</span>
            <span>
              Discovered: {discoveredIds.length}/{SON_TRA_LANDMARKS.length}
            </span>
          </div>
        </div>

        <div className="hud__right-stack">
          <div className="hud__controls-group">
            <button
              className={`hud__card hud__control ${
                autoTrek ? "hud__control--active" : ""
              }`}
              onClick={onToggleAutoTrek}
            >
              {autoTrek ? "⏸ Stop Auto-Trek" : "▶ Auto-Trek Roadline"}
            </button>
            <button
              className={`hud__card hud__control ${
                mode === "third-person" ? "hud__control--active" : ""
              }`}
              onClick={() => onChangeMode("third-person")}
            >
              3rd Person
            </button>
            <button
              className={`hud__card hud__control ${
                mode === "first-person" ? "hud__control--active" : ""
              }`}
              onClick={() => onChangeMode("first-person")}
            >
              1st Person
            </button>
            <button
              className={`hud__card hud__control ${
                mode === "overview" ? "hud__control--active" : ""
              }`}
              onClick={() => onChangeMode("overview")}
            >
              3D Road Map
            </button>
          </div>

          {/* Mini-Map of Son Tra Roadline */}
          <div className="hud__card hud__minimap">
            <div className="hud__minimap-header">
              <span>SON TRA ROADLINE</span>
              <span>{Math.round(roadProgress * 100)}%</span>
            </div>
            <svg viewBox="0 0 140 160" className="hud__minimap-svg">
              {/* Banyan Spur Trail */}
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="2.2"
                strokeDasharray="3 3"
                points={banyanTrailPolyline}
              />
              {/* Main Son Tra Mountain Roadline */}
              <polyline
                fill="none"
                stroke="#86efac"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={mainRoadPolyline}
              />
              {/* Landmark Checkpoints */}
              {SON_TRA_LANDMARKS.map((lm) => {
                const [cx, cy] = toMiniMapCoord(lm.position[0], lm.position[2]);
                const done = discoveredIds.includes(lm.id);
                return (
                  <circle
                    key={lm.id}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={done ? "#4ade80" : "#facc15"}
                    stroke="#062016"
                    strokeWidth="1.2"
                  />
                );
              })}
              {/* Live Player Marker */}
              <circle
                cx={playerSvgX}
                cy={playerSvgY}
                r={4.5}
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Center Interaction Prompt & Active Landmark Modal */}
      <div className="hud__center">
        {nearbyLandmark && !selectedLandmark && (
          <button
            className="hud__card hud__prompt"
            onClick={() => onSelectCheckpoint(nearbyLandmark)}
          >
            <span className="hud__key">E</span>
            <span>
              Explore <strong>{nearbyLandmark.vietnameseName}</strong>
            </span>
          </button>
        )}

        {selectedLandmark && (
          <div className="hud__card hud__modal">
            <div className="hud__modal-header">
              <div>
                <div className="hud__brand">
                  {selectedLandmark.category.toUpperCase()} ·{" "}
                  {selectedLandmark.elevationMeters}m ASL · KM{" "}
                  {selectedLandmark.distanceKm}
                </div>
                <h3 className="hud__modal-title">
                  {selectedLandmark.vietnameseName}
                </h3>
                <div className="hud__modal-subtitle">
                  {selectedLandmark.name}
                </div>
              </div>
              <button className="hud__close-btn" onClick={onCloseLandmark}>
                ✕
              </button>
            </div>
            <p className="hud__modal-desc">{selectedLandmark.description}</p>
            <ul className="hud__modal-list">
              {selectedLandmark.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="hud__modal-tip">
              <strong>Trekking Tip:</strong> {selectedLandmark.tips}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Checkpoints along the Roadline + Controls */}
      <div className="hud__bottom-wrap">
        <div className="hud__checkpoints">
          {SON_TRA_LANDMARKS.map((lm, index) => {
            const isDiscovered = discoveredIds.includes(lm.id);
            const isCurrent = nearbyLandmark?.id === lm.id;
            return (
              <button
                key={lm.id}
                className={`hud__card hud__checkpoint-btn ${
                  isCurrent ? "hud__checkpoint-btn--active" : ""
                }`}
                onClick={() => onSelectCheckpoint(lm)}
              >
                <span className="hud__checkpoint-step">
                  {isDiscovered ? "✓" : index + 1}
                </span>
                <span className="hud__checkpoint-text">
                  <strong>{lm.vietnameseName}</strong>
                  <small>
                    {lm.distanceKm} km · {lm.elevationMeters}m
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="hud__bottom">
          <div className="hud__card hud__hint">
            W/S or ↑/↓ to walk · A/D or ←/→ to steer along roadline · Shift to
            run · Click any checkpoint to teleport
          </div>
          <div className="hud__card hud__meter">
            <div className="hud__meter-label">
              <span>Roadline Progress</span>
              <span>{Math.round(roadProgress * 100)}%</span>
            </div>
            <div className="hud__meter-track">
              <div
                className="hud__meter-fill"
                style={{ width: `${Math.max(4, Math.round(roadProgress * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
