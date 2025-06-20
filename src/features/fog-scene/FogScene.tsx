import React, { useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload,
} from "@react-three/drei";

// Configuración y componentes modularizados
import { FOG_SCENE_CONFIG, FOG_KEYBOARD_MAP } from "./config";
import { useFogScene } from "./hooks";
import { FogContent, FogTouchControls } from "./components";

interface FogSceneProps {
  onBack: () => void;
}

/**
 * 🌫️ FOG SCENE - ARQUITECTURA MODULARIZADA
 *
 * ✅ Configuración centralizada en ./config
 * ✅ Estado gestionado por hooks en ./hooks
 * ✅ Componentes modulares en ./components
 * ✅ Funcionalidad completa preservada
 *
 * Área explorable: 980x980 unidades
 * Partículas: 40,000 (8000 x 5 capas)
 * Controles: WASD + ratón (PC) | Touch (móvil)
 * Colisiones: Paredes invisibles con rebote suave
 */
const FogScene: React.FC<FogSceneProps> = ({ onBack }) => {
  const { state, handlers, refs } = useFogScene();
  const { sceneReady, isPointerLockActive, isMobile } = state;
  const { handleCanvasClick, handleBack, handleTouchMove } = handlers;
  const { touchControlsRef } = refs;

  // Canvas click handler
  const onCanvasClick = useCallback(() => {
    handleCanvasClick();
  }, [handleCanvasClick]);

  // Back handler
  const onBackClick = useCallback(() => {
    handleBack(onBack);
  }, [handleBack, onBack]);

  // Pointer lock change handler
  const handlePointerLockChange = useCallback(() => {
    // Estado manejado internamente por el hook
  }, []);

  return (
    <div className="w-full h-screen bg-slate-200 relative">
      {/* UI Controls - Desktop only */}
      {!isMobile && !isPointerLockActive && (
        <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-3 rounded backdrop-blur-sm">
          <p className="text-sm font-medium mb-1">
            Haz clic para activar controles
          </p>
          <p className="text-xs text-gray-300">WASD para moverse</p>
          <p className="text-xs text-gray-300">Ratón para mirar</p>
        </div>
      )}

      {/* Mobile Instructions */}
      {isMobile && (
        <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-3 rounded backdrop-blur-sm">
          <p className="text-sm font-medium mb-1">Explora la niebla</p>
          <p className="text-xs text-gray-300">Toca y arrastra para mirar</p>
          <p className="text-xs text-gray-300">Usa los botones para moverte</p>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded backdrop-blur-sm transition-colors duration-200"
      >
        ← Volver al Museo
      </button>

      {/* Loading overlay */}
      {!sceneReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Cargando escena de niebla...</p>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls */}
      {sceneReady && (
        <FogTouchControls onMove={handleTouchMove} isMobile={isMobile} />
      )}

      {/* 3D Scene */}
      <KeyboardControls map={FOG_KEYBOARD_MAP}>
        <Canvas
          shadows
          camera={FOG_SCENE_CONFIG.camera}
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
          {/* Optimizaciones de rendimiento */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Preload all />

          {/* Contenido principal de la escena */}
          <React.Suspense fallback={null}>
            <FogContent
              isPointerLockActive={isPointerLockActive}
              onPointerLockChange={handlePointerLockChange}
              isMobile={isMobile}
              onTouchControlsRef={(ref) => {
                touchControlsRef.current = ref;
              }}
            />
          </React.Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
};

export default FogScene;
