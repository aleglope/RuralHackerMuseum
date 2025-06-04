// Centralized 3D models configuration
export const MODEL_PATHS = {
  // Plants
  PLANTS: {
    PLANT_1: "/models/planta1.glb",
    PLANT_2: "/models/planta2.glb",
    PLANT_3: "/models/planta3.glb",
    PLANT_4: "/models/planta4.glb",
    PLANT_EXTERIOR: "/models/planta_exterior.glb",
  },

  // Lamps
  LAMPS: {
    CEILING_MOON: "/models/lampara_de_techo_moon_metal_negro.glb",
    CEILING_2: "/models/lampara_2.glb",
  },

  // Furniture
  FURNITURE: {
    METAL_BENCH: "/models/metal_bench.glb",
    PEDESTAL: "/models/pedestal.gltf",
  },

  // Architecture
  ARCHITECTURE: {
    WINDOW: "/models/window.glb",
    WINDOW_VIEW: "/models/window-view.glb",
  },

  // Main model
  MAIN: {
    ANCEU: "/models/Anceu-Coliving-30-5-2025-textured_model.glb",
  },
} as const;

// List of all models for preloading
export const ALL_MODEL_PATHS = Object.values(MODEL_PATHS).flatMap((category) =>
  Object.values(category)
);
