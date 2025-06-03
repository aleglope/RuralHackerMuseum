/*
Model Preloader Component
Handles preloading of all 3D models for better performance
*/

import { useEffect } from "react";
import { ALL_MODEL_PATHS } from "../../config/models";
import { preloadModels } from "./GenericModel3D";

export function ModelPreloader() {
  useEffect(() => {
    // Preload all models when component mounts
    preloadModels(ALL_MODEL_PATHS);

    console.log(`Preloading ${ALL_MODEL_PATHS.length} 3D models...`);
  }, []);

  // This component renders nothing, only handles preloading
  return null;
}
