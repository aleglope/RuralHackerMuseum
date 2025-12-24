/**
 * 🎯 TIPOS ESPECÍFICOS PARA SISTEMA DE MODELOS
 * Definiciones precisas para preservar configuraciones exactas
 */

import { GroupProps } from "@react-three/fiber";
import { Vector3Object, Vector3Tuple } from "../types";

// ===== TIPOS BASE =====
export interface BaseModelConfig {
  path: string;
  scale?: Vector3Object | Vector3Tuple | number;
  position?: Vector3Object | Vector3Tuple;
  rotation?: Vector3Object | Vector3Tuple;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface ModelTransformation {
  center?: boolean; // Si debe centrar el modelo
  customTransforms?: (model: unknown) => void; // Transformaciones customizadas
}

export interface ModelBehavior {
  type: string;
  config?: unknown;
}

// ===== CONFIGURACIONES ESPECÍFICAS POR MODELO =====

// Pepe - Configuración completa preservada
export interface PepeModelConfig extends BaseModelConfig {
  type: "PEPE";
  initialPosition: Vector3Object;
  initialRotation: Vector3Object;
  scale: Vector3Object;
  windowPosition: Vector3Object;
  proximityDistance: number;
  animationSpeed: number;
  animationConfig: {
    walking1Duration: number;
    rotatingDuration: number;
    walkingDistance: number;
    finalRotationY: number;
    resetDistanceThreshold: number;
  };
  behaviors: ["proximity", "movement", "animation"];
}

// Window - Configuración de materiales preservada
export interface WindowModelConfig extends BaseModelConfig {
  type: "WINDOW";
  glassConfig: {
    opacity: number;
    color: string;
    reflectivity: number;
    roughness: number;
    keywords: string[];
    materialProps: {
      transmission: (opacity: number) => number;
      clearcoat: number;
      clearcoatRoughness: number;
      thickness: number;
      envMapIntensity: number;
    };
  };
  behaviors: ["glassMaterial"];
}

// WindowView - Configuración Leva preservada
export interface WindowViewModelConfig extends BaseModelConfig {
  type: "WINDOW_VIEW";
  levaControls: {
    position: Vector3Object;
    rotation: Vector3Object;
    scale: Vector3Object;
    showAxes: boolean;
    axesSize: number;
  };
  materialEnhancement: {
    envMapIntensity: number;
  };
  behaviors: ["levaControls", "materialEnhancement"];
}

// Anceu - Transformaciones complejas preservadas
export interface AnceuModelConfig extends BaseModelConfig {
  type: "ANCEU";
  transformSequence: {
    centerModel: boolean;
    basePosition: Vector3Object;
    baseRotation: Vector3Object;
    specificRotations: {
      x: number; // Math.PI / 2
      y: number; // Math.PI
      z: number; // Math.PI / 0.65
    };
    positionOffset: {
      y: number; // +1.5
    };
    scaleCalculation: {
      desiredBaseDisplaySize: number;
      scaleMultiplier: number;
    };
  };
  behaviors: ["complexTransform"];
}

// Bench - Configuración específica preservada
export interface BenchModelConfig extends BaseModelConfig {
  type: "BENCH";
  geometry: {
    nodeKey: string; // "Object_4"
    materialKey: string; // "Metal"
  };
  behaviors: ["staticModel"];
}

// ManOnForest - Configuración para FogScene con controles Leva
export interface ManOnForestModelConfig extends BaseModelConfig {
  type: "MAN_ON_FOREST";
  levaControls: {
    position: Vector3Object;
    rotation: Vector3Object;
    scale: Vector3Object;
    showAxes: boolean;
    axesSize: number;
  };
  materialEnhancement: {
    envMapIntensity: number;
  };
  behaviors: ["levaControls", "materialEnhancement"];
}

// Genéricos - Plants y Lamps
export interface GenericModelConfig extends BaseModelConfig {
  type: "PLANT" | "LAMP" | "GENERIC";
  behaviors: ["staticModel"];
}

// ===== UNION TYPE PARA TODAS LAS CONFIGURACIONES =====
export type ModelConfig =
  | PepeModelConfig
  | WindowModelConfig
  | WindowViewModelConfig
  | AnceuModelConfig
  | BenchModelConfig
  | ManOnForestModelConfig
  | GenericModelConfig;

// ===== PROPS PARA BaseModel3D =====
export interface BaseModel3DProps extends GroupProps {
  modelId: string;
  config?: ModelConfig;
  // Override props opcionales
  overridePosition?: Vector3Tuple;
  overrideRotation?: Vector3Tuple;
  overrideScale?: Vector3Tuple | number;
}

// ===== TIPOS PARA BEHAVIORS =====
export interface ProximityBehaviorState {
  hasTriggered: boolean;
  isNearWindow: boolean;
  activeGLBAction: unknown;
  sequenceTriggeredByProximity: boolean;
}

export interface AnimationBehaviorState {
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

// ===== FACTORY TYPES =====
export interface ModelFactory {
  createModel: (
    modelId: string,
    props?: Partial<BaseModel3DProps>
  ) => JSX.Element;
  getConfig: (modelId: string) => ModelConfig | undefined;
  registerModel: (modelId: string, config: ModelConfig) => void;
}

// ===== REGISTRY TYPES =====
export interface ModelRegistryEntry {
  id: string;
  config: ModelConfig;
  component?: React.ComponentType<BaseModel3DProps>;
  preloaded?: boolean;
}

export type ModelRegistry = Map<string, ModelRegistryEntry>;

// ===== VALIDATION TYPES =====
export interface ModelValidationResult {
  valid: boolean;
  modelId: string;
  errors: string[];
  warnings: string[];
  configType: string;
}

// ===== BEHAVIOR SYSTEM TYPES =====
export interface BehaviorHandler {
  type: string;
  initialize?: (model: unknown, config: ModelConfig) => void;
  update?: (model: unknown, config: ModelConfig, delta: number) => void;
  cleanup?: (model: unknown, config: ModelConfig) => void;
}

export type BehaviorRegistry = Map<string, BehaviorHandler>;

// ===== HELPER TYPES =====
export type Vector3Like = Vector3Object | Vector3Tuple | number;

export interface TransformUtils {
  toVector3Object: (value: Vector3Like) => Vector3Object;
  toVector3Tuple: (value: Vector3Like) => Vector3Tuple;
  calculateBoundingBox: (model: unknown) => {
    center: Vector3Object;
    size: Vector3Object;
  };
}

// No default export needed - all types exported individually
