/*
Pepe Component
Component for loading and displaying the GLB pepe model with Leva controls
Positioned near the window view area with independent positioning controls
*/

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

// Pepe component with positioning controls and animations
export function Pepe(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.PEPE);
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const { camera } = useThree();

  // Proximity detection state
  const proximityRef = useRef({
    hasTriggered: false,
    isNearWindow: false,
    lastDistance: Infinity,
  });

  // Animation sequence state
  const animationStateRef = useRef({
    isActive: false,
    phase: "idle", // 'walking1', 'rotating', 'walking2', 'idle'
    startTime: 0,
    currentPosition: { x: -19.1, y: -2.5, z: -7.4 },
    currentRotationY: 0.0,
    autoTriggered: false, // Track if triggered by proximity
  });

  // Get available animation names
  const animationNames = gltf.animations?.map((anim: any) => anim.name) || [];

  // Leva controls for positioning the Pepe model and animations
  const {
    positionX,
    positionY,
    positionZ,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
    showAxes,
    axesSize,
    // Animation controls
    enableAnimations,
    selectedAnimation,
    animationSpeed,
    startMovementSequence,
    // Proximity controls
    enableProximityTrigger,
    proximityDistance,
    windowPositionX,
    windowPositionY,
    windowPositionZ,
  } = useControls("Pepe Model", {
    positionX: { value: -19.1, min: -30, max: 30, step: 0.1 },
    positionY: { value: -2.5, min: -10, max: 20, step: 0.1 },
    positionZ: { value: -7.4, min: -30, max: 30, step: 0.1 },
    rotationX: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationY: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationZ: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    scaleX: { value: 100.0, min: 0.1, max: 200.0, step: 1.0 },
    scaleY: { value: 100.0, min: 0.1, max: 200.0, step: 1.0 },
    scaleZ: { value: 100.0, min: 0.1, max: 200.0, step: 1.0 },
    showAxes: { value: true, label: "Mostrar Ejes" },
    axesSize: {
      value: 3.0,
      min: 0.5,
      max: 10.0,
      step: 0.1,
      label: "Tamaño Ejes",
    },
    // Animation controls
    enableAnimations: { value: false, label: "Activar Animaciones GLB" },
    selectedAnimation: {
      value: animationNames[0] || "none",
      options: animationNames.length > 0 ? animationNames : ["none"],
      label: "Animación GLB",
    },
    animationSpeed: {
      value: 1.0,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      label: "Velocidad GLB",
    },
    startMovementSequence: {
      value: false,
      label: "Iniciar Secuencia Movimiento",
    },
    // Proximity controls
    enableProximityTrigger: {
      value: true,
      label: "Activar por Proximidad",
    },
    proximityDistance: {
      value: 5.0,
      min: 1.0,
      max: 15.0,
      step: 0.5,
      label: "Distancia de Activación",
    },
    windowPositionX: {
      value: -10.0,
      min: -30,
      max: 30,
      step: 0.1,
      label: "Ventana X",
    },
    windowPositionY: {
      value: 0.0,
      min: -10,
      max: 20,
      step: 0.1,
      label: "Ventana Y",
    },
    windowPositionZ: {
      value: -8.0,
      min: -30,
      max: 30,
      step: 0.1,
      label: "Ventana Z",
    },
  });

  // Effect to setup model materials
  useEffect(() => {
    if (gltf.scene) {
      // Traverse all meshes in the model to enhance materials
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Enhance materials without cloning to preserve references
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.envMapIntensity = 1.2;
                mat.needsUpdate = true;
              }
            });
          } else {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 1.2;
              child.material.needsUpdate = true;
            }
          }

          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [gltf.scene]);

  // Effect to add/remove axes helper
  useEffect(() => {
    if (groupRef.current) {
      // Remove existing axes helper
      const existingAxes = groupRef.current.children.find(
        (child) => child instanceof THREE.AxesHelper
      );
      if (existingAxes) {
        groupRef.current.remove(existingAxes);
      }

      // Add new axes helper if enabled
      if (showAxes) {
        const axesHelper = new THREE.AxesHelper(axesSize);
        groupRef.current.add(axesHelper);
      }
    }
  }, [showAxes, axesSize]);

  // Animation effects for GLB animations
  useEffect(() => {
    if (
      enableAnimations &&
      selectedAnimation &&
      selectedAnimation !== "none" &&
      actions[selectedAnimation]
    ) {
      const action = actions[selectedAnimation];
      action.reset().fadeIn(0.5).play();
      action.setEffectiveTimeScale(animationSpeed);
      return () => {
        action.fadeOut(0.5);
      };
    }
  }, [enableAnimations, selectedAnimation, animationSpeed, actions]);

  // Effect to start movement sequence
  useEffect(() => {
    if (startMovementSequence && !animationStateRef.current.isActive) {
      animationStateRef.current.isActive = true;
      animationStateRef.current.phase = "walking1";
      animationStateRef.current.startTime = 0; // Will be set in useFrame
      animationStateRef.current.currentPosition = {
        x: -19.1,
        y: -2.5,
        z: -7.4,
      };
      animationStateRef.current.currentRotationY = 0.0;
      console.log("Starting movement sequence");
    }
  }, [startMovementSequence]);

  // Proximity detection and auto-trigger system
  useFrame((frameState) => {
    // Proximity detection
    if (enableProximityTrigger && camera) {
      const cameraPosition = camera.position;
      const windowPosition = new THREE.Vector3(
        windowPositionX,
        windowPositionY,
        windowPositionZ
      );
      const distance = cameraPosition.distanceTo(windowPosition);

      proximityRef.current.lastDistance = distance;
      proximityRef.current.isNearWindow = distance <= proximityDistance;

      // Trigger animation when getting close to window
      if (
        proximityRef.current.isNearWindow &&
        !proximityRef.current.hasTriggered
      ) {
        console.log(
          `Player near window! Distance: ${distance.toFixed(
            2
          )} - Triggering animation`
        );

        // Auto-start the movement sequence
        if (!animationStateRef.current.isActive) {
          animationStateRef.current.isActive = true;
          animationStateRef.current.phase = "walking1";
          animationStateRef.current.startTime = 0;
          animationStateRef.current.currentPosition = {
            x: -19.1,
            y: -2.5,
            z: -7.4,
          };
          animationStateRef.current.currentRotationY = 0.0;
          animationStateRef.current.autoTriggered = true;
        }

        // Auto-start GLB animation
        if (animationNames.length > 0 && !enableAnimations) {
          const firstAnimation = animationNames[0];
          if (actions[firstAnimation]) {
            const action = actions[firstAnimation];
            action.reset().fadeIn(0.5).play();
            action.setEffectiveTimeScale(animationSpeed);
          }
        }

        proximityRef.current.hasTriggered = true;
      }

      // Reset trigger when moving away from window
      if (distance > proximityDistance + 2.0) {
        // Add hysteresis
        proximityRef.current.hasTriggered = false;
      }
    }

    // Movement sequence animation
    if (!animationStateRef.current.isActive) return;

    const state = animationStateRef.current;

    // Initialize start time on first frame
    if (state.startTime === 0) {
      state.startTime = frameState.clock.elapsedTime * 1000;
    }

    const elapsed = frameState.clock.elapsedTime - state.startTime / 1000;

    switch (state.phase) {
      case "walking1": {
        // Phase 1: Move from Z -7.4 to -5 (duration: 3 seconds)
        const duration = 3.0;
        const progress = Math.min(elapsed / duration, 1);
        const startZ = -7.4;
        const endZ = -5.0;

        // Linear interpolation
        state.currentPosition.z = startZ + (endZ - startZ) * progress;

        if (progress >= 1) {
          state.phase = "rotating";
          state.startTime = frameState.clock.elapsedTime * 1000; // Convert back to milliseconds
          console.log("Phase 1 complete, moving to rotation");
        }
        break;
      }

      case "rotating": {
        // Phase 2: Rotate Y to -0.9 (duration: 2 seconds)
        const duration = 2.0;
        const progress = Math.min(elapsed / duration, 1);
        const startY = 0.0;
        const endY = -0.9;

        state.currentRotationY = startY + (endY - startY) * progress;

        if (progress >= 1) {
          state.phase = "walking2";
          state.startTime = frameState.clock.elapsedTime * 1000;
          console.log("Phase 2 complete, moving to walking2");
        }
        break;
      }

      case "walking2": {
        // Phase 3: Move from Z -5 to -3 (duration: 2 seconds)
        const duration = 2.0;
        const progress = Math.min(elapsed / duration, 1);
        const startZ = -5.0;
        const endZ = -3.0;

        state.currentPosition.z = startZ + (endZ - startZ) * progress;

        if (progress >= 1) {
          state.phase = "idle";
          state.isActive = false;
          console.log("Sequence complete");
        }
        break;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      {...props}
      position={
        animationStateRef.current.isActive
          ? [
              animationStateRef.current.currentPosition.x,
              animationStateRef.current.currentPosition.y,
              animationStateRef.current.currentPosition.z,
            ]
          : [positionX, positionY, positionZ]
      }
      rotation={
        animationStateRef.current.isActive
          ? [rotationX, animationStateRef.current.currentRotationY, rotationZ]
          : [rotationX, rotationY, rotationZ]
      }
      scale={[scaleX, scaleY, scaleZ]}
      dispose={null}
    >
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.PEPE);
