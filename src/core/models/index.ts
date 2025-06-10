/**
 * 🎯 SISTEMA DE MODELOS 3D UNIFICADO
 * Exporta toda la arquitectura centralizada
 */

// ===== IMPORTACIONES PARA DEFAULT EXPORT =====
import BaseModel3DComponent, { preloadModel, useModel } from "./BaseModel3D";
import modelRegistryInstance, {
  validateModelRegistry,
  logModelRegistry,
} from "./ModelRegistry";
import type { BaseModel3DProps } from "./types";

// ===== COMPONENTE PRINCIPAL =====
export { default as BaseModel3D, preloadModel, useModel } from "./BaseModel3D";

// ===== SISTEMA DE REGISTRO =====
export {
  default as modelRegistry,
  ModelRegistryManager,
  getModelConfig,
  getAllModelConfigs,
  hasModel,
  registerModel,
  validateModelRegistry,
  logModelRegistry,
} from "./ModelRegistry";

// ===== BEHAVIORS =====
export {
  PepeBehaviors,
  WindowBehaviors,
  WindowViewBehaviors,
  AnceuBehaviors,
} from "./behaviors";

// ===== UTILITIES =====
export {
  toVector3Object,
  toVector3Tuple,
  extractVector3Coords,
  scaleToArray,
  getModelScale,
  getModelPosition,
  getModelRotation,
  isValidVector3,
} from "./utils";

// ===== TIPOS =====
export type {
  BaseModel3DProps,
  ModelConfig,
  ModelRegistryEntry,
  ModelRegistry,
  PepeModelConfig,
  WindowModelConfig,
  WindowViewModelConfig,
  AnceuModelConfig,
  BenchModelConfig,
  GenericModelConfig,
  ProximityBehaviorState,
  AnimationBehaviorState,
  BehaviorHandler,
  BehaviorRegistry,
  ModelValidationResult,
  TransformUtils,
  Vector3Like,
} from "./types";

// ===== FACTORY FUNCTIONS =====

/**
 * Factory para crear modelos 3D unificados
 */
export const createModel3D = (
  modelId: string,
  props?: Partial<BaseModel3DProps>
) => {
  return BaseModel3DComponent({ modelId, ...props });
};

/**
 * Factory para precargar múltiples modelos
 */
export const preloadModels = (modelIds: string[]) => {
  modelIds.forEach((id) => preloadModel(id));
};

/**
 * Validar todo el sistema de modelos
 */
export const validateModelSystem = () => {
  const registryValidation = validateModelRegistry();

  return {
    ...registryValidation,
    systemReady: registryValidation.valid,
  };
};

// ===== CONFIGURACIÓN RÁPIDA =====

/**
 * Inicializar sistema de modelos con configuración por defecto
 */
export const initializeModelSystem = () => {
  const validation = validateModelSystem();

  if (validation.systemReady) {
    console.log("🎯 Sistema de Modelos 3D inicializado correctamente");
    logModelRegistry();
  } else {
    console.error(
      "❌ Error al inicializar Sistema de Modelos:",
      validation.errors
    );
  }

  return validation;
};

export default {
  BaseModel3D: BaseModel3DComponent,
  modelRegistry: modelRegistryInstance,
  createModel3D,
  preloadModels,
  validateModelSystem,
  initializeModelSystem,
};
