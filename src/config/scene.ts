import { SceneConfig } from "../types/three";

// Main museum scene configuration
export const MUSEUM_SCENE_CONFIG: SceneConfig = {
  floorY: -1.5,
  cameraHeight: 1.7, // Camera height, simulating eye level
  playerSpeed: 5.0, // Player movement speed
  playerRadius: 0.5, // Approximate player radius for basic collisions
  roomBounds: {
    minX: -10 + 0.5, // -10 + playerRadius
    maxX: 10 - 0.5, // 10 - playerRadius
    minZ: -10 + 0.5, // -10 + playerRadius
    maxZ: 10 - 0.5, // 10 - playerRadius
  },
};

// Pedestal configuration
export const PEDESTAL_CONFIG = {
  scale: 0.6,
  baseOffset: 0.05,
  estimatedHeight: 1.3172, // Multiplied by scale for real height
};

// Texture paths
export const TEXTURE_PATHS = {
  ROCK_WALL: {
    base: "/textures/rock-wall-mortar-ue/",
    albedo: "rock-wall-mortar_albedo.png",
    normal: "rock-wall-mortar_normal-dx.png",
    roughness: "rock-wall-mortar_roughness.png",
    metallic: "rock-wall-mortar_metallic.png",
    ao: "rock-wall-mortar_ao.png",
    height: "rock-wall-mortar_height.png",
  },
  BAMBOO: {
    base: "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/",
    albedo: "bamboo-wood-semigloss-albedo.png",
    normal: "bamboo-wood-semigloss-normal.png",
    ao: "bamboo-wood-semigloss-ao.png",
  },
} as const;
