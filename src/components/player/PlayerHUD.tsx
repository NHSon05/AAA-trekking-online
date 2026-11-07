"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BANYAN_TRAIL_POINTS,
  LandmarkPoint,
  ROAD_CONTROL_POINTS,
  ROUTE_LENGTH_KM,
  sceneToLatLon,
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
  isNight: boolean;
  onToggleNight: () => void;
  ghostVisible: boolean;
  monkeysNearby: boolean;
  monkeyPlaying: boolean;
  onToggleMonkeyPlay: () => void;
}

function toMiniMapCoord(x: number, z: number): [number, number] {
  // Map world X [-80, 80], Z [-50, 50] uniformly into SVG [0..140, 0..160]
  const svgX = ((x + 80) / 160) * 120 + 10;
  const svgY = ((z + 50) / 160) * 120 + 35;
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
  isNight,
  onToggleNight,
  ghostVisible,
  monkeysNearby,
  monkeyPlaying,
  onToggleMonkeyPlay,
}: PlayerHUDProps) {
  const [mapLayer, setMapLayer] = useState<"route" | "osm">("osm");
  const [ghostModelOpen, setGhostModelOpen] = useState(false);

  // Live OSM tracking: scene position -> real lat/lon, debounced so the embed isn't reloaded every frame
  const [lat, lon] = sceneToLatLon(playerPosition[0], playerPosition[2]);
  const [trackedPos, setTrackedPos] = useState<[number, number]>([lat, lon]);
  useEffect(() => {
    const t = window.setTimeout(() => setTrackedPos([lat, lon]), 1200);
    return () => window.clearTimeout(t);
  }, [lat, lon]);
  const osmSrc = useMemo(() => {
    const [la, lo] = trackedPos;
    const d = 0.006;
    const bbox = [lo - d, la - d * 0.6, lo + d, la + d * 0.6].map((n) => n.toFixed(5)).join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la.toFixed(5)}%2C${lo.toFixed(5)}`;
  }, [trackedPos]);

  const elevationMeters = Math.round(45 + Math.max(0, playerPosition[1]) * 50);
  const distanceKm = (roadProgress * ROUTE_LENGTH_KM).toFixed(1);

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
            <span>Route: {distanceKm} / {ROUTE_LENGTH_KM.toFixed(1)} km</span>
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
            <button className={`hud__card hud__control ${isNight ? "hud__control--active hud__night-control" : ""}`} onClick={onToggleNight}>
              {isNight ? "☾ Ban đêm" : "☀ Ban ngày"}
            </button>
          </div>

          {/* Mini-Map of Son Tra Roadline */}
          <div className="hud__card hud__minimap">
            <div className="hud__minimap-header">
              <span>{mapLayer === "osm" ? "OPENSTREETMAP · SƠN TRÀ" : "SON TRA ROADLINE"}</span>
              <button className="hud__map-toggle" onClick={() => setMapLayer((layer) => layer === "route" ? "osm" : "route")}>
                {mapLayer === "osm" ? "Tuyến 3D" : "OSM"}
              </button>
            </div>
            {mapLayer === "osm" ? (
              <div className="hud__osm-map">
                <iframe
                  title="Bản đồ OpenStreetMap bán đảo Sơn Trà"
                  loading="lazy"
                  src={osmSrc}
                />
                <a href={`https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lon.toFixed(5)}#map=16/${lat.toFixed(5)}/${lon.toFixed(5)}`} target="_blank" rel="noreferrer">Vị trí {lat.toFixed(5)}, {lon.toFixed(5)} · Mở bản đồ lớn ↗</a>
              </div>
            ) : <>
            <div className="hud__minimap-progress">Tiến độ tuyến: {Math.round(roadProgress * 100)}%</div>
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
            </>}
          </div>
        </div>
      </div>

      {ghostVisible && isNight && (
        <div className="hud__card ghost-alert">
          <span>👻</span><strong>Bạn vừa thấy gì đó trong rừng…</strong>
          <button onClick={() => setGhostModelOpen((open) => !open)}>{ghostModelOpen ? "Ẩn mô hình" : "Xem ma 3D"}</button>
          {ghostModelOpen && <div className="service-model"><iframe title="Mô hình ma Sketchfab" allow="autoplay; fullscreen; xr-spatial-tracking" src="https://sketchfab.com/models/fe09a57ad1be46d39a1475e4ff6fefdf/embed?autostart=1&ui_theme=dark" /><a href="https://sketchfab.com/3d-models/gost-fe09a57ad1be46d39a1475e4ff6fefdf" target="_blank" rel="noreferrer">Mở mô hình ma trên Sketchfab ↗</a></div>}
        </div>
      )}

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

        {monkeysNearby && !selectedLandmark && (
          <button className="hud__card hud__prompt hud__monkey-prompt" onClick={onToggleMonkeyPlay}>
            <span className="hud__key">F</span>
            <span>{monkeyPlaying ? <>Đang chơi cùng khỉ · <strong>Dừng chơi</strong></> : <>Khỉ Sơn Trà tò mò · <strong>Chơi cùng khỉ</strong></>}</span>
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
