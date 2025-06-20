import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { FOG_SCENE_CONFIG } from "../config";

export interface FogPlayerProps {
  isMobile?: boolean;
  onTouchControlsRef?: (
    ref: (direction: string, active: boolean) => void
  ) => void;
}

/**
 * Componente del jugador con controles de primera persona y colisiones
 * Soporta tanto controles de teclado (PC) como táctiles (móvil)
 */
export const FogPlayer: React.FC<FogPlayerProps> = ({
  isMobile = false,
  onTouchControlsRef,
}) => {
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const touchControls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Function to handle touch controls
  const handleTouchMove = (direction: string, active: boolean) => {
    switch (direction) {
      case "forward":
        touchControls.current.forward = active;
        break;
      case "backward":
        touchControls.current.backward = active;
        break;
      case "left":
        touchControls.current.left = active;
        break;
      case "right":
        touchControls.current.right = active;
        break;
    }
  };

  // Pass function reference to parent component
  React.useEffect(() => {
    if (onTouchControlsRef) {
      onTouchControlsRef(handleTouchMove);
    }
  }, [onTouchControlsRef]);

  useFrame((state, delta) => {
    const keys = getKeys();
    const { forward, backward, left, right } = keys;
    const { speed, height, friction } = FOG_SCENE_CONFIG.player;

    const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const sideVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(
      camera.quaternion
    );

    // Keyboard controls (PC)
    if (!isMobile) {
      if (forward)
        velocity.current.add(frontVector.multiplyScalar(speed * delta));
      if (backward)
        velocity.current.add(frontVector.multiplyScalar(-speed * delta));
      if (left) velocity.current.add(sideVector.multiplyScalar(speed * delta));
      if (right)
        velocity.current.add(sideVector.multiplyScalar(-speed * delta));
    }

    // Touch controls (mobile)
    if (isMobile) {
      if (touchControls.current.forward)
        velocity.current.add(frontVector.multiplyScalar(speed * delta));
      if (touchControls.current.backward)
        velocity.current.add(frontVector.multiplyScalar(-speed * delta));
      if (touchControls.current.left)
        velocity.current.add(sideVector.multiplyScalar(speed * delta));
      if (touchControls.current.right)
        velocity.current.add(sideVector.multiplyScalar(-speed * delta));
    }

    // Aplicar fricción
    velocity.current.multiplyScalar(friction);

    // Sistema de colisiones: Límites invisibles con rebote suave
    const { wallDistance, maxHeight, minHeight } = FOG_SCENE_CONFIG.boundaries;
    const softBoundary = wallDistance - 5;
    const newPosition = camera.position.clone().add(velocity.current);

    // Verificar límites X (Este-Oeste)
    if (Math.abs(newPosition.x) > softBoundary) {
      velocity.current.x *= -0.3; // Rebote suave
      newPosition.x = Math.sign(newPosition.x) * softBoundary;
    }

    // Verificar límites Z (Norte-Sur)
    if (Math.abs(newPosition.z) > softBoundary) {
      velocity.current.z *= -0.3; // Rebote suave
      newPosition.z = Math.sign(newPosition.z) * softBoundary;
    }

    // Verificar límite superior (altura máxima)
    if (newPosition.y > maxHeight) {
      velocity.current.y = 0;
      newPosition.y = maxHeight;
    }

    // Verificar límite inferior (altura mínima)
    if (newPosition.y < minHeight) {
      velocity.current.y = 0;
      newPosition.y = minHeight;
    }

    // Aplicar la nueva posición
    camera.position.copy(newPosition);
    camera.position.y = height; // Mantener altura fija
  });

  return null;
};

export default FogPlayer;
