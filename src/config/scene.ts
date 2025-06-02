import { SceneConfig } from "../types/three";

// Configuración principal de la escena del museo
export const MUSEUM_SCENE_CONFIG: SceneConfig = {
  floorY: -1.5,
  cameraHeight: 1.7, // Altura de la cámara, simulando altura de ojos
  playerSpeed: 5.0, // Velocidad de movimiento del jugador
  playerRadius: 0.5, // Radio aproximado del jugador para colisiones básicas
  roomBounds: {
    minX: -10 + 0.5, // -10 + playerRadius
    maxX: 10 - 0.5, // 10 - playerRadius
    minZ: -10 + 0.5, // -10 + playerRadius
    maxZ: 10 - 0.5, // 10 - playerRadius
  },
};

// Configuración del pedestal
export const PEDESTAL_CONFIG = {
  scale: 0.6,
  baseOffset: 0.05,
  estimatedHeight: 1.3172, // Se multiplica por scale para altura real
};

// Rutas de texturas
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
