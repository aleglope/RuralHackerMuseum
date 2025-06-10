/**
 * 🎯 ÍNDICE DE COMPONENTES MODEL-VIEWER
 * Exporta todos los componentes especializados
 */

// Re-export all components for easy importing
export { BlackHoleLoader } from "./BlackHoleLoader";
export { ProgressTracker } from "./ProgressTracker";
export { EmptyFallback } from "./EmptyFallback";
export { ViewerControls } from "./ViewerControls";

// Gallery components restaurados
export {
  Floor,
  Ceiling,
  GalleryWalls,
  GalleryLights,
  GalleryBenches,
  GalleryPlants,
  CeilingFixtures,
  // Sistema de controles de jugador
  TouchCameraControls,
  PlayerControllerWithTouch,
} from "./GalleryComponents";

/**
 * 🎯 EXPORTS FEATURES MODEL-VIEWER COMPONENTS
 * Exportaciones centralizadas para todos los componentes del model viewer
 */

// Tipos
export type { ViewerControlsProps } from "./ViewerControls";
