import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export interface FogTouchCameraControlsProps {
  camera: THREE.Camera;
  isMobile: boolean;
}

/**
 * Controles de cámara táctiles para FogScene
 * Basado en TouchCameraControls del model-viewer
 */
export const FogTouchCameraControls: React.FC<FogTouchCameraControlsProps> = ({
  camera,
  isMobile,
}) => {
  const touchStateRef = useRef({
    isMoving: false,
    lastTouchX: 0,
    lastTouchY: 0,
    rotationX: 0,
    rotationY: 0,
  });

  useEffect(() => {
    if (!isMobile) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0];
        touchStateRef.current.isMoving = true;
        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && touchStateRef.current.isMoving) {
        event.preventDefault();
        const touch = event.touches[0];

        const deltaX = touch.clientX - touchStateRef.current.lastTouchX;
        const deltaY = touch.clientY - touchStateRef.current.lastTouchY;

        // Camera sensitivity (slightly higher for fog scene exploration)
        const sensitivity = 0.004;

        // Update rotation
        touchStateRef.current.rotationY -= deltaX * sensitivity;
        touchStateRef.current.rotationX -= deltaY * sensitivity;

        // Limit vertical rotation (prevent camera flip)
        touchStateRef.current.rotationX = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, touchStateRef.current.rotationX)
        );

        // Apply rotation to camera
        camera.rotation.order = "YXZ";
        camera.rotation.y = touchStateRef.current.rotationY;
        camera.rotation.x = touchStateRef.current.rotationX;

        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        touchStateRef.current.isMoving = false;
      }
    };

    // Add non-passive event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [camera, isMobile]);

  return null;
};

export default FogTouchCameraControls;
