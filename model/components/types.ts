import type { ThreeElements } from "@react-three/fiber";

export type GLBComponentProps = ThreeElements["group"] & {
  /** Optional path override for a processed/replaced version of the same asset. */
  src?: string;
};
