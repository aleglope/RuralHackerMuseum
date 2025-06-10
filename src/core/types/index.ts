/**
 * 🎯 TIPOS UNIFICADOS DEL PROYECTO
 * Centralización de todos los tipos para eliminar duplicación
 */

import { GroupProps } from "@react-three/fiber";

// ===== TIPOS BÁSICOS 3D =====
export type Vector3Tuple = [number, number, number];
export type Vector3Object = { x: number; y: number; z: number };

// ===== TIPOS DE MUSEO =====
export type FramePosition = [number, number, number];
export type FrameRotation = [number, number, number];

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
  wallTiltAngle: number;
}

export interface FramePositioningResult {
  framePositions: FramePosition[];
  frameRotations: FrameRotation[];
}

export interface ImageMetadata {
  url: string;
  title: string;
  artist: string;
  date: string;
  description: string;
  link: string;
  modelViewerPath?: string;
}

// ===== TIPOS DE MODELOS 3D =====
export interface BaseModel3DProps extends GroupProps {
  modelPath?: string;
  modelType?: string;
  scale?: number | Vector3Tuple;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface Model3DProps extends GroupProps {
  modelPath?: string;
  modelType?: string;
  scale?: number | Vector3Tuple;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// ===== TIPOS DE CONFIGURACIÓN =====
export interface LightConfig {
  position: Vector3Tuple;
  intensity: number;
  angle?: number;
  color?: string;
  penumbra?: number;
  decay?: number;
  distance?: number;
}

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

// ===== TIPOS DE COMPONENTES ESPECÍFICOS =====

// Pepe configuration
export interface PepeConfig {
  INITIAL_POSITION: Vector3Object;
  INITIAL_ROTATION: Vector3Object;
  SCALE: Vector3Object;
  WINDOW_POSITION: Vector3Object;
  PROXIMITY_DISTANCE: number;
  ANIMATION_SPEED: number;
}

export interface PepeAnimationState {
  isActive: boolean;
  phase: "idle" | "walking1" | "rotating" | "walking2" | "completed";
  startTime: number;
  currentPosition: Vector3Object;
  currentRotationY: number;
  autoTriggered: boolean;
  finalPosition: Vector3Object;
  finalRotationY: number;
  isVisible: boolean;
}

export interface PepeProximityState {
  hasTriggered: boolean;
  isNearWindow: boolean;
  activeGLBAction: any;
  sequenceTriggeredByProximity: boolean;
}

// Window configuration
export interface WindowConfig {
  position?: Vector3Object;
  rotation?: Vector3Object;
  scale?: Vector3Object;
  glassOpacity: number;
  glassColor: string;
  glassReflectivity: number;
  glassRoughness: number;
}

// Anceu model configuration
export interface AnceuConfig {
  DEFAULT_POSITION: Vector3Object;
  DEFAULT_ROTATION_DEGREES: Vector3Object;
  DEFAULT_ROTATION_RADIANS: Vector3Object;
  desiredBaseDisplaySize: number;
  scaleMultiplier: number;
  specificRotations: {
    x: number; // Math.PI / 2
    y: number; // Math.PI
    z: number; // Math.PI / 0.65
  };
  positionOffset: {
    y: number; // +1.5
  };
}

// ===== TIPOS DE CONTEXTOS =====

// Animation Context
export type ScreenState = "loading" | "title" | "scene";

export interface AnimationContextType {
  currentScreen: ScreenState;
  assetsReady: boolean;
  sceneOpacity: number;
  sceneBlur: number;
  setCurrentScreen: (screen: ScreenState) => void;
  setAssetsReady: (ready: boolean) => void;
  handleLoadingComplete: () => void;
  handleTitleFading: () => void;
  handleTitleComplete: () => void;
  handleAssetsLoaded: () => void;
}

// Tour Context
export interface TourContextType {
  isTourStarted: boolean;
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
  totalFrames: number;
  startTour: () => void;
  nextFrame: () => void;
  previousFrame: () => void;
  quitTour: () => void;
}

// Zoom Context
export interface ZoomContextType {
  zoomedFrameId: number | null;
  setZoomedFrameId: (id: number | null) => void;
}

// ===== TIPOS DE VISOR 3D =====
export type ViewState = "gallery" | "modelViewer";

export interface Model3DViewerProps {
  modelUrl: string;
  onBack: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  assetsReady: boolean;
}

// ===== TIPOS DE PLANTAS Y LÁMPARAS =====
export interface PlantProps extends GroupProps {
  plantType: keyof typeof MODEL_PATHS.PLANTS;
}

export interface LampProps extends GroupProps {
  lampType: keyof typeof MODEL_PATHS.LAMPS;
}

// ===== TIPOS DE VALIDACIÓN =====
export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

// ===== TIPOS DE MODELO REGISTRY =====
export interface ModelRegistryEntry {
  id: string;
  path: string;
  config?: any;
  transformations?: any;
  behaviors?: string[];
}

// ===== TIPOS PARA COMPATIBILIDAD =====
// Mantener compatibilidad con imports existentes
export interface MuseumComponentProps extends GroupProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number | Vector3Tuple;
}

// Re-export para compatibilidad
export type { GroupProps } from "@react-three/fiber";

// ===== CONSTANTES DE TIPOS =====
export const MODEL_CATEGORIES = {
  PLANTS: "PLANTS",
  LAMPS: "LAMPS",
  FURNITURE: "FURNITURE",
  ARCHITECTURE: "ARCHITECTURE",
  MAIN: "MAIN",
} as const;

export type ModelCategory = keyof typeof MODEL_CATEGORIES;

// Temporal - será reemplazado por configuración real
declare global {
  const MODEL_PATHS: {
    PLANTS: Record<string, string>;
    LAMPS: Record<string, string>;
    FURNITURE: Record<string, string>;
    ARCHITECTURE: Record<string, string>;
    MAIN: Record<string, string>;
  };
}
