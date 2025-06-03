import { GroupProps } from "@react-three/fiber";

// Basic types for 3D positioning
export type Vector3Tuple = [number, number, number];

// Shared props for 3D model components
export interface Model3DProps extends GroupProps {
  modelType?: string;
  scale?: number | Vector3Tuple;
}

// Light configuration
export interface LightConfig {
  position: Vector3Tuple;
  intensity: number;
  angle?: number;
  color?: string;
  penumbra?: number;
  decay?: number;
  distance?: number;
}

// 3D scene configuration
export interface SceneConfig {
  floorY: number;
  roomBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  cameraHeight: number;
  playerSpeed: number;
  playerRadius: number;
}

// Props for museum components
export interface MuseumComponentProps extends GroupProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number | Vector3Tuple;
}
