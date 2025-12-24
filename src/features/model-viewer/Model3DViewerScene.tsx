import React, { useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { Leva } from "leva";
import SafeEnvironment from "../../components/ui/SafeEnvironment";

// Componentes extraídos
import {
  BlackHoleLoader,
  ProgressTracker,
  EmptyFallback,
  ViewerControls,
  Floor,
  Ceiling,
  GalleryWalls,
  GalleryLights,
  GalleryBenches,
  GalleryPlants,
  CeilingFixtures,
  PlayerControllerWithTouch,
} from "./components";

// Hooks extraídos
import { useModelLoading, useViewerState } from "./hooks";

// Modelo migrado
import Model3DComponent from "./Model3DComponent";

// Configuración importada
import { MUSEUM_SCENE_CONFIG, PEDESTAL_CONFIG } from "../../core/config";

const {
  floorY,
  cameraHeight: CAMERA_HEIGHT_ABOVE_FLOOR,
  playerSpeed: PLAYER_SPEED,
} = MUSEUM_SCENE_CONFIG;

interface Model3DViewerSceneProps {
  modelUrl: string;
  onBack: () => void;
}

/**
 * 🏛️ MODELO 3D VIEWER SCENE - COMPLETAMENTE RESTAURADO
 *
 * ✅ Estructura completa de galería restaurada
 * ✅ Sistema de paredes, suelo, techo con texturas
 * ✅ Iluminación completa con lámparas del techo
 * ✅ Mobiliario: bancos y plantas decorativas
 * ✅ Elementos interactivos: Window, WindowView, Pepe
 * ✅ Controles completos para PC y móvil
 * ✅ Arquitectura modular mantenida
 */
const Model3DViewerScene: React.FC<Model3DViewerSceneProps> = ({
  modelUrl,
  onBack,
}) => {
  // Loading state management
  const { state: loadingState, handlers: loadingHandlers } = useModelLoading();
  const { isLoading, progress, assetsReady, loaded, total, item, sceneReady } =
    loadingState;
  const { handleProgressUpdate, handleAssetsLoaded, handleMetaUpdate } =
    loadingHandlers;

  // Viewer state management
  const {
    state: viewerState,
    handlers: viewerHandlers,
    setters: viewerSetters,
  } = useViewerState();
  const { isPointerLockActive, isMobile } = viewerState;
  const { handleCanvasClick, handleTouchMove, handleBack } = viewerHandlers;
  const { setTouchControlsRef } = viewerSetters;

  // Canvas click handler
  const onCanvasClick = useCallback(() => {
    handleCanvasClick(sceneReady);
  }, [handleCanvasClick, sceneReady]);

  // Back handler
  const onBackClick = useCallback(() => {
    handleBack(onBack);
  }, [handleBack, onBack]);

  // Pedestal configuration usando configuración centralizada
  const pedestalBaseDesiredY = floorY + PEDESTAL_CONFIG.baseOffset;
  const pedestalPosition: [number, number, number] = [
    0,
    pedestalBaseDesiredY,
    0,
  ];

  // Main model configuration
  const estimatedPedestalHeight =
    PEDESTAL_CONFIG.estimatedHeight * PEDESTAL_CONFIG.scale;
  const anceuModelBaseY = pedestalPosition[1] + estimatedPedestalHeight;
  const anceuModelGroupPosition: [number, number, number] = [
    0,
    anceuModelBaseY,
    0,
  ];

  return (
    <>
      {/* Loading Screen with BlackHole Animation */}
      {isLoading && (
        <BlackHoleLoader
          progress={progress}
          assetsReady={assetsReady}
          meta={{ loaded, total, item }}
          onComplete={() => {}} // Handled by useModelLoading
        />
      )}

      {/* Back Button */}
      {sceneReady && (
        <button
          onClick={onBackClick}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 1000,
            backdropFilter: "blur(5px)",
          }}
        >
          ← Back to Gallery
        </button>
      )}

      {/* Mobile Touch Controls */}
      {sceneReady && <ViewerControls onMove={handleTouchMove} />}

      {/* Instructions */}
      {sceneReady && !isMobile && !isPointerLockActive && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "18px",
            textAlign: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "20px",
            borderRadius: "10px",
            zIndex: 999,
          }}
        >
          Click to start exploring
          <div style={{ fontSize: "14px", marginTop: "10px", opacity: 0.8 }}>
            Use WASD keys or arrow keys to move
          </div>
        </div>
      )}

      {/* Leva Controls */}
      <Leva hidden={!sceneReady} />

      {/* Main 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, CAMERA_HEIGHT_ABOVE_FLOOR, 5],
          fov: 60,
        }}
        style={{
          height: "100vh",
          width: "100vw",
          display: "block",
          opacity: sceneReady ? 1 : 0,
          transition: "opacity 1s ease-in-out",
        }}
        onClick={onCanvasClick}
        dpr={[1, 2]}
      >
        {/* Progress Tracker (works inside Canvas) */}
        <ProgressTracker
          onProgressUpdate={handleProgressUpdate}
          onAssetsLoaded={handleAssetsLoaded}
          onMetaUpdate={handleMetaUpdate}
        />

        {/* Environment and Optimizations */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Preload all />

        {/* Scene Setup */}
        <color attach="background" args={["#000015"]} />
        <fog attach="fog" args={["#000015", 10, 100]} />

        {/* 🏛️ SISTEMA DE ILUMINACIÓN COMPLETO RESTAURADO */}
        <GalleryLights />

        {/* 🏗️ ESTRUCTURA DE GALERÍA COMPLETA RESTAURADA */}
        <GalleryWalls />
        <Floor floorSize={20} />
        <Ceiling ceilingSize={20} />

        {/* 🪑 MOBILIARIO RESTAURADO */}
        <GalleryBenches floorY={floorY} />
        <GalleryPlants floorY={floorY} />
        <CeilingFixtures />

        {/* 🎮 SISTEMA DE CONTROLES COMPLETO */}
        <PlayerControllerWithTouch
          floorY={floorY}
          freeCameraMode={false}
          cameraSpeed={PLAYER_SPEED}
          onTouchControlsRef={setTouchControlsRef}
        />

        {/* 🎯 MODELO PRINCIPAL */}
        <React.Suspense fallback={<EmptyFallback onLoaded={() => {}} />}>
          <group position={anceuModelGroupPosition}>
            <Model3DComponent url={modelUrl} />
          </group>
          <SafeEnvironment preset="sunset" fallback="studio" />
        </React.Suspense>
      </Canvas>
    </>
  );
};

export default Model3DViewerScene;
