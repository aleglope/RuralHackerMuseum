import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook para gestionar el estado del viewer (mobile, controles, etc.)
 * Extraído de Model3DViewerScene.tsx preservando funcionalidad exacta
 */
export const useViewerState = () => {
  const [isPointerLockActive, setIsPointerLockActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchControlsRef = useRef<any>();

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

  // Canvas click handler
  const handleCanvasClick = useCallback(
    (sceneReady: boolean) => {
      if (!isMobile && sceneReady) {
        const canvasEl = document.querySelector("canvas");
        if (canvasEl && document.pointerLockElement === null) {
          try {
            (canvasEl as any).requestPointerLock?.();
          } catch (error) {
            // Pointer lock failed
          }
        }
      }
    },
    [isMobile]
  );

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
      } catch (error) {
        // Exit pointer lock failed
      }
      onBack();
    },
    [isMobile]
  );

  return {
    state: {
      isPointerLockActive,
      isMobile,
    },
    refs: {
      touchControlsRef,
    },
    handlers: {
      handleCanvasClick,
      handleTouchMove,
      handleBack,
    },
    setters: {
      setTouchControlsRef: (ref: any) => {
        touchControlsRef.current = ref;
      },
    },
  };
};

export default useViewerState;
