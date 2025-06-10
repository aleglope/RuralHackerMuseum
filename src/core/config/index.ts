/**
 * 🎯 CONFIGURACIÓN MAESTRA DEL PROYECTO
 * Centralización de toda la configuración eliminando fragmentación
 */

import {
  RoomDimensions,
  SceneConfig,
  ImageMetadata,
  PepeConfig,
  WindowConfig,
  AnceuConfig,
  Vector3Object,
  LightConfig,
} from "../types";

// ===== PATHS DE MODELOS 3D =====
export const MODEL_PATHS = {
  PLANTS: {
    PLANT_1: "/models/planta1.glb",
    PLANT_2: "/models/planta2.glb",
    PLANT_3: "/models/planta3.glb",
    PLANT_4: "/models/planta4.glb",
    PLANT_EXTERIOR: "/models/planta_exterior.glb",
  },
  LAMPS: {
    CEILING_MOON: "/models/lampara_de_techo_moon_metal_negro.glb",
    CEILING_2: "/models/lampara_2.glb",
  },
  FURNITURE: {
    METAL_BENCH: "/models/metal_bench.glb", // ✅ Ahora centralizado (era hardcoded)
  },
  ARCHITECTURE: {
    WINDOW: "/models/window.glb",
    WINDOW_VIEW: "/models/window-view.glb",
    PEPE: "/models/pepe.glb",
  },
  MAIN: {
    ANCEU: "/models/Anceu-Coliving-30-5-2025-textured_model.glb",
  },
} as const;

// Lista de todos los modelos para preloading
export const ALL_MODEL_PATHS = Object.values(MODEL_PATHS).flatMap((category) =>
  Object.values(category)
);

// ===== CONFIGURACIÓN DE ESCENAS =====

// Museo principal
export const MUSEUM_SCENE_CONFIG: SceneConfig = {
  floorY: -1.5,
  cameraHeight: 1.7,
  playerSpeed: 5.0,
  playerRadius: 0.5,
  roomBounds: {
    minX: -10 + 0.5,
    maxX: 10 - 0.5,
    minZ: -10 + 0.5,
    maxZ: 10 - 0.5,
  },
};

// Pedestal configuration
export const PEDESTAL_CONFIG = {
  scale: 0.6,
  baseOffset: 0.05,
  estimatedHeight: 1.3172, // Multiplied by scale for real height
};

// Dimensiones del museo
export const ROOM_DIMENSIONS: RoomDimensions = {
  width: 10,
  length: 20,
  height: 4,
  wallTiltAngle: 0.22,
};

// ===== CONFIGURACIÓN DE MODELOS ESPECÍFICOS =====

// Pepe - Configuración completa
export const PEPE_CONFIG: PepeConfig = {
  INITIAL_POSITION: { x: -19.1, y: -2.5, z: -7.4 },
  INITIAL_ROTATION: { x: 0.0, y: 0.0, z: 0.0 },
  SCALE: { x: 100.0, y: 100.0, z: 100.0 },
  WINDOW_POSITION: { x: -10.0, y: 0.0, z: -8.0 },
  PROXIMITY_DISTANCE: 5.0,
  ANIMATION_SPEED: 1.0,
};

// Constantes adicionales de Pepe - ACTUALIZADAS PARA COINCIDIR CON ORIGINAL
export const PEPE_ANIMATION_CONFIG = {
  WALKING1_DURATION: 3.0, // Actualizado: era 5.0
  ROTATING_DURATION: 2.0,
  WALKING_DISTANCE: 2.4, // Actualizado: distance from Z -7.4 to -5.0 = 2.4 units
  FINAL_ROTATION_Y: -0.9,
  RESET_DISTANCE_THRESHOLD: 7.0, // PROXIMITY_DISTANCE + 2.0
};

// Window - Configuración completa
export const WINDOW_CONFIG: WindowConfig = {
  position: { x: -9.8, y: -0.3, z: -8.5 },
  rotation: { x: 0, y: Math.PI / 2, z: 0 },
  scale: { x: 0.9, y: 0.9, z: 0.9 },
  glassOpacity: 0.25,
  glassColor: "#87CEEB",
  glassReflectivity: 0.8,
  glassRoughness: 0.1,
};

export const WINDOW_GLASS_KEYWORDS = [
  "glass",
  "vidrio",
  "crystal",
  "window",
  "transparent",
];

export const WINDOW_MATERIAL_CONFIG = {
  transmission: (opacity: number) => Math.max(0, 1 - opacity),
  clearcoat: 0.8,
  clearcoatRoughness: 0.1,
  thickness: 0.1,
  envMapIntensity: 1.5,
};

// WindowView - Configuración de Leva controls
export const WINDOW_VIEW_CONFIG = {
  position: { x: -25.0, y: 18.5, z: 6.0 },
  rotation: { x: 1.6, y: -Math.PI, z: -1.5 },
  scale: { x: 2.5, y: 2.5, z: 2.5 },
  showAxes: true,
  axesSize: 3.0,
  envMapIntensity: 1.2,
};

// Anceu Model - Configuración completa
export const ANCEU_CONFIG: AnceuConfig = {
  DEFAULT_POSITION: { x: 0, y: 0, z: 0 },
  DEFAULT_ROTATION_DEGREES: { x: 0, y: 0, z: 0 },
  DEFAULT_ROTATION_RADIANS: { x: 0, y: 0, z: 0 },
  desiredBaseDisplaySize: 1.5,
  scaleMultiplier: 4,
  specificRotations: {
    x: Math.PI / 2, // 90 degrees
    y: Math.PI, // 180 degrees
    z: Math.PI / 0.65, // ~276.9 degrees
  },
  positionOffset: {
    y: 1.5,
  },
};

// Bench - Configuración ahora centralizada
export const BENCH_CONFIG = {
  path: MODEL_PATHS.FURNITURE.METAL_BENCH,
  scale: { x: 0.45, y: 0.5, z: 0.4 },
  material: "Metal", // Material auto-generated name
};

// ===== CONFIGURACIÓN DE TEXTURAS =====
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

// ===== CONFIGURACIÓN DE FRAMES/IMÁGENES =====
export const FRAME_CONFIG = {
  HEIGHT_OF_FRAMES: 2,
  WALL_DISTRIBUTION: {
    LEFT_WALL_FRAMES: 3,
    RIGHT_WALL_FRAMES: 3,
    FRONT_WALL_FRAMES: 2,
  },
};

// Imágenes del museo (centralizado desde imagesConfig.ts)
export const GALLERY_IMAGES: ImageMetadata[] = [
  {
    url: "./Picture1.jpg",
    title: "Nocturnal Forest Mural",
    artist: "Unknown Artist",
    date: "Unknown",
    link: "",
    description:
      "A detailed and atmospheric mural hung on a tree in the middle of a forest, depicting a nocturnal scene with mystical and natural elements.",
  },
  {
    url: "./picture2.jpg",
    title: "Artist with Nature Creation",
    artist: "Unknown Artist",
    date: "Unknown",
    link: "",
    description:
      "A smiling artist proudly poses next to her colorful painting, which is mounted on a tree in a sunny forest environment.",
  },
  {
    url: "./picture3.jpg",
    title: "Pictorial Adventure Map",
    artist: "Unknown Artist",
    date: "Unknown",
    link: "",
    description:
      "A cartographic-style painting with warm and earthy tones, displayed on a tree, that seems to narrate a journey or story through landscapes and symbols.",
  },
  {
    url: "./picture4.jpg",
    title: "Natural Tapestry",
    artist: "Unknown Artist",
    date: "Unknown",
    link: "https://www.instagram.com/p/DAmL2-mMgoB/?img_index=1",
    description:
      "An artist presents a large tapestry made with natural elements like branches, leaves and flowers, demonstrating a deep connection with art and nature.",
    modelViewerPath: MODEL_PATHS.MAIN.ANCEU, // ✅ Ahora usa config centralizada
  },
  {
    url: "./LogoRHackers.svg",
    title: "Rural Digital Education",
    artist: "RuralHackers",
    date: "2024",
    link: "https://ruralhackers.org/educacion",
    description:
      "Democratizing access to technological education in rural communities through online platforms and workshops.",
  },
  {
    url: "./LogoRHackers.svg",
    title: "Tech Sustainability",
    artist: "RuralHackers",
    date: "2024",
    link: "https://ruralhackers.org/sostenibilidad",
    description:
      "Developing sustainable technological solutions that respect the environment and strengthen local economies.",
  },
  {
    url: "./LogoRHackers.svg",
    title: "Rural Entrepreneurship",
    artist: "RuralHackers",
    date: "2024",
    link: "https://ruralhackers.org/emprendimiento",
    description:
      "Fostering the entrepreneurial ecosystem in rural areas through digital tools and technological mentorship.",
  },
  {
    url: "./LogoRHackers.svg",
    title: "Collaboration Network",
    artist: "RuralHackers",
    date: "2024",
    link: "https://ruralhackers.org/colaboracion",
    description:
      "Creating a global network of rural hackers collaborating on social and technological impact projects.",
  },
];

// ===== CONFIGURACIÓN DE LUCES =====
export const LIGHTING_CONFIG = {
  ambient: {
    intensity: 0.3,
  },
  directional: {
    intensity: 2.5,
    position: [0, -100, 5] as const,
  },
  ceiling: [
    { position: [-0.75, 3.95, 5] as const },
    { position: [0.75, 3.95, 5] as const },
    { position: [-0.95, 3.95, 8] as const },
    { position: [0.95, 3.95, 8] as const },
    { position: [-1.15, 3.95, 11] as const },
    { position: [1.15, 3.95, 11] as const },
  ],
};

// ===== CONFIGURACIÓN DE BLACKHOLE LOADER =====
export const BLACKHOLE_CONFIG = {
  particles: {
    count: 60, // Reducido de 150 para performance
    speed: 0.02,
    rotationSpeed: 0.05,
  },
  animation: {
    duration: 2000,
    easingFactor: 0.1,
  },
  colors: {
    primary: "#ff6b35",
    secondary: "#f7931e",
  },
};

// ===== CONFIGURACIÓN DE VALIDACIÓN =====
export const VALIDATION_CONFIG = {
  required_models: ALL_MODEL_PATHS.length,
  performance_thresholds: {
    min_fps: 30,
    max_load_time: 10000, // 10 seconds
  },
  critical_components: ["Pepe", "Window", "Anceu", "BlackHoleLoader"],
};

// ===== EXPORTACIONES PARA COMPATIBILIDAD =====
// Mantener nombres antiguos para transición gradual
export const defaultRoomDimensions = ROOM_DIMENSIONS;
export const drawingImages = GALLERY_IMAGES;

// Funciones helper para conversión
export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

// Helper para validar configuración
export const validateConfiguration = () => {
  const errors: string[] = [];

  if (ALL_MODEL_PATHS.length === 0) {
    errors.push("No model paths configured");
  }

  if (!MUSEUM_SCENE_CONFIG.roomBounds) {
    errors.push("Room bounds not configured");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  MODEL_PATHS,
  ALL_MODEL_PATHS,
  MUSEUM_SCENE_CONFIG,
  ROOM_DIMENSIONS,
  PEPE_CONFIG,
  WINDOW_CONFIG,
  ANCEU_CONFIG,
  BENCH_CONFIG,
  GALLERY_IMAGES,
  LIGHTING_CONFIG,
  BLACKHOLE_CONFIG,
};
