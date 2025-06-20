import React, { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import SafeEnvironment from "../../../components/ui/SafeEnvironment";
import { FOG_SCENE_CONFIG } from "../config";
import { FogParticles } from "./FogParticles";
import { FogPlayer } from "./FogPlayer";
import { FogGround, FogInvisibleWalls, FogLights } from "./FogEnvironment";
import { FogTouchCameraControls } from "./FogTouchCameraControls";

interface FogContentProps {
  isPointerLockActive: boolean;
  onPointerLockChange: () => void;
  isMobile?: boolean;
  onTouchControlsRef?: (
    ref: (direction: string, active: boolean) => void
  ) => void;
}

/**
 * Componente principal de contenido de la escena
 * Organiza todos los elementos y configuraciones
 */
export const FogContent: React.FC<FogContentProps> = ({
  onPointerLockChange,
  isMobile = false,
  onTouchControlsRef,
}) => {
  const { scene, camera } = useThree();
  const [isMobileDetected, setIsMobileDetected] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsMobileDetected(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActuallyMobile = isMobile || isMobileDetected;

  useEffect(() => {
    // Configurar niebla atmosférica
    const { color, near, far } = FOG_SCENE_CONFIG.fog;
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);

    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  useEffect(() => {
    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [onPointerLockChange]);

  return (
    <>
      {!isActuallyMobile && <PointerLockControls />}
      <FogPlayer
        isMobile={isActuallyMobile}
        onTouchControlsRef={onTouchControlsRef}
      />
      {isActuallyMobile && (
        <FogTouchCameraControls camera={camera} isMobile={isActuallyMobile} />
      )}
      <FogLights />
      <FogGround />
      <FogInvisibleWalls />
      <FogParticles />

      {/* Capas adicionales de niebla para mayor densidad */}
      <group position={[250, 0, 250]}>
        <FogParticles />
      </group>
      <group position={[-250, 0, -250]}>
        <FogParticles />
      </group>
      <group position={[250, 0, -250]}>
        <FogParticles />
      </group>
      <group position={[-250, 0, 250]}>
        <FogParticles />
      </group>

      <SafeEnvironment preset="sunset" fallback="studio" />
    </>
  );
};

export default FogContent;
