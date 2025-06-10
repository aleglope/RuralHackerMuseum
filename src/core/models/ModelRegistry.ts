/**
 * Central Model Registry
 * Preserves all exact configurations from the current system
 */

import {
  ModelConfig,
  ModelRegistry,
  ModelRegistryEntry,
  PepeModelConfig,
  WindowModelConfig,
  WindowViewModelConfig,
  AnceuModelConfig,
  BenchModelConfig,
  GenericModelConfig,
} from "./types";

import {
  MODEL_PATHS,
  PEPE_CONFIG,
  PEPE_ANIMATION_CONFIG,
  WINDOW_CONFIG,
  WINDOW_GLASS_KEYWORDS,
  WINDOW_MATERIAL_CONFIG,
  WINDOW_VIEW_CONFIG,
  ANCEU_CONFIG,
  BENCH_CONFIG,
} from "../config";

// PEPE - Complete configuration with all animations
const PEPE_MODEL_CONFIG: PepeModelConfig = {
  type: "PEPE",
  path: MODEL_PATHS.ARCHITECTURE.PEPE,
  initialPosition: PEPE_CONFIG.INITIAL_POSITION,
  initialRotation: PEPE_CONFIG.INITIAL_ROTATION,
  scale: PEPE_CONFIG.SCALE,
  windowPosition: PEPE_CONFIG.WINDOW_POSITION,
  proximityDistance: PEPE_CONFIG.PROXIMITY_DISTANCE,
  animationSpeed: PEPE_CONFIG.ANIMATION_SPEED,
  animationConfig: {
    walking1Duration: PEPE_ANIMATION_CONFIG.WALKING1_DURATION,
    rotatingDuration: PEPE_ANIMATION_CONFIG.ROTATING_DURATION,
    walkingDistance: PEPE_ANIMATION_CONFIG.WALKING_DISTANCE,
    finalRotationY: PEPE_ANIMATION_CONFIG.FINAL_ROTATION_Y,
    resetDistanceThreshold: PEPE_ANIMATION_CONFIG.RESET_DISTANCE_THRESHOLD,
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["proximity", "movement", "animation"],
};

// WINDOW - Complete glass materials configuration
const WINDOW_MODEL_CONFIG: WindowModelConfig = {
  type: "WINDOW",
  path: MODEL_PATHS.ARCHITECTURE.WINDOW,
  position: WINDOW_CONFIG.position,
  rotation: WINDOW_CONFIG.rotation,
  scale: WINDOW_CONFIG.scale,
  glassConfig: {
    opacity: WINDOW_CONFIG.glassOpacity,
    color: WINDOW_CONFIG.glassColor,
    reflectivity: WINDOW_CONFIG.glassReflectivity,
    roughness: WINDOW_CONFIG.glassRoughness,
    keywords: WINDOW_GLASS_KEYWORDS,
    materialProps: {
      transmission: WINDOW_MATERIAL_CONFIG.transmission,
      clearcoat: WINDOW_MATERIAL_CONFIG.clearcoat,
      clearcoatRoughness: WINDOW_MATERIAL_CONFIG.clearcoatRoughness,
      thickness: WINDOW_MATERIAL_CONFIG.thickness,
      envMapIntensity: WINDOW_MATERIAL_CONFIG.envMapIntensity,
    },
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["glassMaterial"],
};

// WINDOW_VIEW - Complete Leva controls configuration
const WINDOW_VIEW_MODEL_CONFIG: WindowViewModelConfig = {
  type: "WINDOW_VIEW",
  path: MODEL_PATHS.ARCHITECTURE.WINDOW_VIEW,
  levaControls: {
    position: WINDOW_VIEW_CONFIG.position,
    rotation: WINDOW_VIEW_CONFIG.rotation,
    scale: WINDOW_VIEW_CONFIG.scale,
    showAxes: WINDOW_VIEW_CONFIG.showAxes,
    axesSize: WINDOW_VIEW_CONFIG.axesSize,
  },
  materialEnhancement: {
    envMapIntensity: WINDOW_VIEW_CONFIG.envMapIntensity,
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["levaControls", "materialEnhancement"],
};

// ANCEU - Complete complex transformations configuration
const ANCEU_MODEL_CONFIG: AnceuModelConfig = {
  type: "ANCEU",
  path: MODEL_PATHS.MAIN.ANCEU,
  transformSequence: {
    centerModel: true,
    basePosition: ANCEU_CONFIG.DEFAULT_POSITION,
    baseRotation: ANCEU_CONFIG.DEFAULT_ROTATION_RADIANS,
    specificRotations: ANCEU_CONFIG.specificRotations,
    positionOffset: ANCEU_CONFIG.positionOffset,
    scaleCalculation: {
      desiredBaseDisplaySize: ANCEU_CONFIG.desiredBaseDisplaySize,
      scaleMultiplier: ANCEU_CONFIG.scaleMultiplier,
    },
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["complexTransform"],
};

// METAL_BENCH - Configuration for museum
const METAL_BENCH_MODEL_CONFIG: BenchModelConfig = {
  type: "BENCH",
  path: BENCH_CONFIG.path,
  scale: BENCH_CONFIG.scale,
  geometry: {
    nodeKey: "Object_4",
    materialKey: "Metal",
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["staticModel"],
};

// GALLERY_BENCH - Configuration for 3D viewer
const GALLERY_BENCH_MODEL_CONFIG: BenchModelConfig = {
  type: "BENCH",
  path: BENCH_CONFIG.path,
  scale: BENCH_CONFIG.scale,
  geometry: {
    nodeKey: "Object_4",
    materialKey: "Metal",
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["staticModel"],
};

const createPlantConfig = (
  plantKey: keyof typeof MODEL_PATHS.PLANTS
): GenericModelConfig => ({
  type: "PLANT",
  path: MODEL_PATHS.PLANTS[plantKey],
  castShadow: true,
  receiveShadow: true,
  behaviors: ["staticModel"],
});

const createLampConfig = (
  lampKey: keyof typeof MODEL_PATHS.LAMPS
): GenericModelConfig => ({
  type: "LAMP",
  path: MODEL_PATHS.LAMPS[lampKey],
  castShadow: true,
  receiveShadow: true,
  behaviors: ["staticModel"],
});

class ModelRegistryManager {
  private registry: ModelRegistry = new Map();

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry(): void {
    this.registerModel("PEPE", PEPE_MODEL_CONFIG);
    this.registerModel("WINDOW", WINDOW_MODEL_CONFIG);
    this.registerModel("WINDOW_VIEW", WINDOW_VIEW_MODEL_CONFIG);
    this.registerModel("ANCEU", ANCEU_MODEL_CONFIG);
    this.registerModel("METAL_BENCH", METAL_BENCH_MODEL_CONFIG);
    this.registerModel("GALLERY_BENCH", GALLERY_BENCH_MODEL_CONFIG);

    this.registerModel("PLANT_1", createPlantConfig("PLANT_1"));
    this.registerModel("PLANT_2", createPlantConfig("PLANT_2"));
    this.registerModel("PLANT_3", createPlantConfig("PLANT_3"));
    this.registerModel("PLANT_4", createPlantConfig("PLANT_4"));
    this.registerModel("PLANT_EXTERIOR", createPlantConfig("PLANT_EXTERIOR"));

    this.registerModel("CEILING_MOON", createLampConfig("CEILING_MOON"));
    this.registerModel("CEILING_2", createLampConfig("CEILING_2"));
    this.registerModel("LAMP_1", createLampConfig("CEILING_MOON"));
    this.registerModel("LAMP_2", createLampConfig("CEILING_2"));
  }

  registerModel(id: string, config: ModelConfig): void {
    this.registry.set(id, {
      id,
      config,
      preloaded: false,
    });
  }

  getModel(id: string): ModelRegistryEntry | undefined {
    return this.registry.get(id);
  }

  getConfig(id: string): ModelConfig | undefined {
    return this.registry.get(id)?.config;
  }

  getAllModels(): ModelRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  getAllModelIds(): string[] {
    return Array.from(this.registry.keys());
  }

  hasModel(id: string): boolean {
    return this.registry.has(id);
  }

  markAsPreloaded(id: string): void {
    const entry = this.registry.get(id);
    if (entry) {
      entry.preloaded = true;
    }
  }

  getModelsByType(type: string): ModelRegistryEntry[] {
    return this.getAllModels().filter((entry) => entry.config.type === type);
  }

  validateRegistry(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [id, entry] of this.registry) {
      if (!entry.config.path) {
        errors.push(`Model ${id}: Missing path`);
      }

      if (!entry.config.type) {
        errors.push(`Model ${id}: Missing type`);
      }

      if (entry.config.type === "PEPE" && !("windowPosition" in entry.config)) {
        errors.push(`Model ${id}: PEPE type missing windowPosition`);
      }

      if (entry.config.type === "WINDOW" && !("glassConfig" in entry.config)) {
        errors.push(`Model ${id}: WINDOW type missing glassConfig`);
      }

      if (
        entry.config.type === "WINDOW_VIEW" &&
        !("levaControls" in entry.config)
      ) {
        errors.push(`Model ${id}: WINDOW_VIEW type missing levaControls`);
      }

      if (
        entry.config.type === "ANCEU" &&
        !("transformSequence" in entry.config)
      ) {
        errors.push(`Model ${id}: ANCEU type missing transformSequence`);
      }

      if (entry.config.type === "BENCH" && !("geometry" in entry.config)) {
        errors.push(`Model ${id}: BENCH type missing geometry`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  logRegistry(): void {
    console.log("🗂️ Model Registry State:");
    console.log(`Total models: ${this.registry.size}`);

    for (const [id, entry] of this.registry) {
      console.log(
        `  ${id}: ${entry.config.type} | Preloaded: ${entry.preloaded}`
      );
    }

    const validation = this.validateRegistry();
    if (!validation.valid) {
      console.warn("❌ Registry validation errors:");
      validation.errors.forEach((error) => console.warn(`  - ${error}`));
    } else {
      console.log("✅ Registry validation passed");
    }
  }
}

const modelRegistry = new ModelRegistryManager();

export { ModelRegistryManager, modelRegistry };
export const getModelConfig = (id: string) => modelRegistry.getConfig(id);
export const getAllModelConfigs = () => modelRegistry.getAllModels();
export const hasModel = (id: string) => modelRegistry.hasModel(id);
export const registerModel = (id: string, config: ModelConfig) =>
  modelRegistry.registerModel(id, config);

export const markModelAsPreloaded = (id: string) =>
  modelRegistry.markAsPreloaded(id);
export const validateModelRegistry = () => modelRegistry.validateRegistry();
export const getModelsByType = (type: string) =>
  modelRegistry.getModelsByType(type);
export const logModelRegistry = () => modelRegistry.logRegistry();

export default modelRegistry;
