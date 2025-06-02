import { GroupProps } from "@react-three/fiber";

// Tipos básicos para posicionamiento 3D
export type Vector3Tuple = [number, number, number];

// Props compartidas para componentes de modelos 3D
export interface Model3DProps extends GroupProps {
  modelPath: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// Configuración de luces
export interface LightConfig {
  position: Vector3Tuple;
  intensity: number;
  angle?: number;
  color?: string;
  penumbra?: number;
  decay?: number;
  distance?: number;
}

// Configuración de escena 3D
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

// Props para componentes del museo
export interface MuseumItemProps extends GroupProps {
  floorY?: number;
}
