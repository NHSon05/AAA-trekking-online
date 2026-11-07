export type CameraMode = "first-person" | "third-person" | "overview";

export type PlayerInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
};

export type PlayerProps = {
  modelPath?: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  speed?: number;
  autoTrek?: boolean;
  onAutoTrekComplete?: () => void;
  getGroundHeight?: (x: number, z: number) => number;
  onPositionChange?: (position: [number, number, number]) => void;
};
