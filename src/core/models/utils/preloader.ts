import { useGLTF } from "@react-three/drei";
import { getModelConfig } from "../ModelRegistry";

/**
 * Preload a model by its ID
 */
export const preloadModel = (modelId: string) => {
  const config = getModelConfig(modelId);
  if (config) {
    useGLTF.preload(config.path);
  }
};

/**
 * Preload multiple models
 */
export const preloadModels = (modelIds: string[]) => {
  modelIds.forEach(preloadModel);
};

export default {
  preloadModel,
  preloadModels,
};
