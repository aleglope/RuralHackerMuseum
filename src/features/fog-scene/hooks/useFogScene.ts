import { useState, useEffect, useCallback, useRef } from "react";

export interface FogSceneState {
  sceneReady: boolean;
  isPointerLockActive: boolean;
  isMobile: boolean;
}

/**
 * Hook principal para gestionar el estado de la escena de niebla
 * Siguiendo el patrón de useViewerState del model-viewer
 */
export const useFogScene = () => {
  const [sceneReady, setSceneReady] = useState(false);
  const [isPointerLockActive, setIsPointerLockActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchControlsRef =
    useRef<(direction: string, active: boolean) => void>();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Pointer lock management for desktop
  useEffect(() => {
    if (!isMobile) {
      const handlePointerLockChange = () => {
        setIsPointerLockActive(document.pointerLockElement !== null);
      };
      document.addEventListener("pointerlockchange", handlePointerLockChange);
      return () => {
        document.removeEventListener(
          "pointerlockchange",
          handlePointerLockChange
        );
      };
    }
  }, [isMobile]);

  // Initialize scene ready after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Canvas click handler for pointer lock
  const handleCanvasClick = useCallback(() => {
    if (!isMobile && sceneReady) {
      const canvas = document.querySelector("canvas");
      if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    }
  }, [isMobile, sceneReady]);

  // Touch controls handler
  const handleTouchMove = useCallback((direction: string, active: boolean) => {
    if (touchControlsRef.current) {
      touchControlsRef.current(direction, active);
    }
  }, []);

  // Handle back action
  const handleBack = useCallback(
    (onBack: () => void) => {
      try {
        if (!isMobile && document.pointerLockElement) {
          document.exitPointerLock();
        }
      } catch {
        // Exit pointer lock failed - silently ignore
      }
      onBack();
    },
    [isMobile]
  );

  return {
    state: {
      sceneReady,
      isPointerLockActive,
      isMobile,
    },
    handlers: {
      handleCanvasClick,
      handleBack,
      handleTouchMove,
    },
    refs: {
      touchControlsRef,
    },
  };
};

export default useFogScene;
