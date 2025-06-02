/*
Model Preloader Component
Handles preloading of all 3D models for better performance
*/

import { useEffect } from "react";
import { ALL_MODEL_PATHS } from "../../config/models";
import { preloadModels } from "./GenericModel3D";

export function ModelPreloader() {
  useEffect(() => {
    // Precargar todos los modelos al montar el componente
    preloadModels(ALL_MODEL_PATHS);

    console.log(`Preloading ${ALL_MODEL_PATHS.length} 3D models...`);
  }, []);

  // Este componente no renderiza nada, solo maneja la precarga
  return null;
}
