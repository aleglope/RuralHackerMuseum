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
    activeGLBAction: null as any,
    sequenceTriggeredByProximity: false,
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
    // Proximity controls
    enableProximityTrigger,
    proximityDistance,
    windowPositionX,
    windowPositionY,
    windowPositionZ,
    debugProximity,
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
    // Animation controls (manual override)
    enableAnimations: {
      value: false,
      label: "Activar Animaciones GLB (Manual)",
    },
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
    // Proximity controls
    enableProximityTrigger: {
      value: true,
      label: "🎯 Activar por Proximidad",
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
    debugProximity: {
      value: false,
      label: "🐛 Debug Proximidad",
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

  // Manual GLB animation control (only when not auto-triggered)
  useEffect(() => {
    if (
      enableAnimations &&
      selectedAnimation &&
      selectedAnimation !== "none" &&
      actions[selectedAnimation] &&
      !animationStateRef.current.autoTriggered
    ) {
      const action = actions[selectedAnimation];
      action.reset().fadeIn(0.5).play();
      action.setEffectiveTimeScale(animationSpeed);
      return () => {
        action.fadeOut(0.5);
      };
    }
  }, [enableAnimations, selectedAnimation, animationSpeed, actions]);

  // Function to start the complete sequence (movement + animation)
  const startCompleteSequence = () => {
    console.log("🎬 Starting complete sequence: Movement + Animation");

    // Start movement sequence
    animationStateRef.current.isActive = true;
    animationStateRef.current.phase = "walking1";
    animationStateRef.current.startTime = 0;
    animationStateRef.current.currentPosition = { x: -19.1, y: -2.5, z: -7.4 };
    animationStateRef.current.currentRotationY = 0.0;
    animationStateRef.current.autoTriggered = true;
    proximityRef.current.sequenceTriggeredByProximity = true;

    // Start GLB animation
    if (animationNames.length > 0) {
      const firstAnimation = animationNames[0];
      if (actions[firstAnimation]) {
        const action = actions[firstAnimation];
        action.reset().fadeIn(0.5).play();
        action.setEffectiveTimeScale(animationSpeed);
        proximityRef.current.activeGLBAction = action;
        console.log(`🎭 GLB Animation started: ${firstAnimation}`);
      }
    }
  };

  // Helper function to calculate forward direction based on rotation
  const getForwardDirection = (rotationY: number) => {
    return new THREE.Vector3(
      Math.sin(rotationY),
      0,
      Math.cos(rotationY)
    ).normalize();
  };

  // Unified proximity detection and animation system
  useFrame((frameState) => {
    // Check if we're in pointer lock mode or free mode
    const isPointerLocked = document.pointerLockElement !== null;

    // Proximity detection (works regardless of pointer lock state)
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

      // Debug info
      if (debugProximity) {
        console.log(
          `📍 Camera: ${cameraPosition.x.toFixed(
            1
          )}, ${cameraPosition.y.toFixed(1)}, ${cameraPosition.z.toFixed(
            1
          )} | Window: ${windowPositionX}, ${windowPositionY}, ${windowPositionZ} | Distance: ${distance.toFixed(
            2
          )} | Locked: ${isPointerLocked}`
        );
      }

      // Trigger complete sequence when getting close to window
      if (
        proximityRef.current.isNearWindow &&
        !proximityRef.current.hasTriggered &&
        !animationStateRef.current.isActive
      ) {
        console.log(
          `🎯 Player near window! Distance: ${distance.toFixed(
            2
          )} | Camera locked: ${isPointerLocked}`
        );
        startCompleteSequence();
        proximityRef.current.hasTriggered = true;
      }

      // Reset trigger when moving away from window (after sequence completes)
      if (
        distance > proximityDistance + 2.0 &&
        !animationStateRef.current.isActive
      ) {
        proximityRef.current.hasTriggered = false;
        if (proximityRef.current.activeGLBAction) {
          proximityRef.current.activeGLBAction.fadeOut(0.5);
          proximityRef.current.activeGLBAction = null;
        }
        animationStateRef.current.autoTriggered = false;
        proximityRef.current.sequenceTriggeredByProximity = false;
        console.log("🔄 Reset trigger - ready for next activation");
      }
    }

    // Movement sequence animation (smooth and fluid - ALWAYS applies transforms)
    if (animationStateRef.current.isActive) {
      const state = animationStateRef.current;

      // Initialize start time on first frame
      if (state.startTime === 0) {
        state.startTime = frameState.clock.elapsedTime * 1000;
      }

      const elapsed = frameState.clock.elapsedTime - state.startTime / 1000;

      switch (state.phase) {
        case "walking1": {
          // Phase 1: Walk forward in initial direction (duration: 5 seconds)
          const duration = 5.0;
          const progress = Math.min(elapsed / duration, 1);

          // Initial position and direction
          const startPos = new THREE.Vector3(-19.1, -2.5, -7.4);
          const initialDirection = getForwardDirection(0); // Initial rotation is 0
          const walkDistance = 10.4; // Distance from -7.4 to 3.0 = 10.4 units

          // Smooth eased interpolation for fluid movement
          const easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          // Calculate new position by moving forward in the initial direction
          const forwardMovement = initialDirection
            .clone()
            .multiplyScalar(walkDistance * easedProgress);
          const newPosition = startPos.clone().add(forwardMovement);

          state.currentPosition.x = newPosition.x;
          state.currentPosition.z = newPosition.z;

          if (progress >= 1) {
            state.phase = "rotating";
            state.startTime = frameState.clock.elapsedTime * 1000;
            console.log("✅ Phase 1 complete, moving to rotation");
          }
          break;
        }

        case "rotating": {
          // Phase 2: Rotate Y to -0.9 (duration: 2 seconds)
          const duration = 2.0;
          const progress = Math.min(elapsed / duration, 1);
          const startY = 0.0;
          const endY = -0.9;

          // Smooth rotation with easing
          const easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          state.currentRotationY = startY + (endY - startY) * easedProgress;

          if (progress >= 1) {
            state.phase = "walking2";
            state.startTime = frameState.clock.elapsedTime * 1000;
            console.log("✅ Phase 2 complete, moving to walking2");
          }
          break;
        }

        case "walking2": {
          // Phase 3: Walk forward in NEW direction after rotation (duration: 2 seconds)
          const duration = 2.0;
          const progress = Math.min(elapsed / duration, 1);

          // Start from current position after rotation
          const startPos = new THREE.Vector3(
            state.currentPosition.x,
            state.currentPosition.y,
            state.currentPosition.z
          );

          // Get forward direction based on current rotation (-0.9)
          const currentDirection = getForwardDirection(state.currentRotationY);
          const walkDistance = 2.0; // Distance to walk in the new direction

          // Smooth final movement
          const easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          // Calculate new position by moving forward in the rotated direction
          const forwardMovement = currentDirection
            .clone()
            .multiplyScalar(walkDistance * easedProgress);
          const newPosition = startPos.clone().add(forwardMovement);

          state.currentPosition.x = newPosition.x;
          state.currentPosition.z = newPosition.z;

          if (progress >= 1) {
            state.phase = "idle";
            state.isActive = false;
            console.log("🎉 Sequence complete - Pepe has finished his walk!");
          }
          break;
        }
      }

      // ALWAYS apply transforms when sequence is active - regardless of pointer lock
      if (groupRef.current) {
        groupRef.current.position.set(
          state.currentPosition.x,
          state.currentPosition.y,
          state.currentPosition.z
        );
        groupRef.current.rotation.set(
          rotationX,
          state.currentRotationY,
          rotationZ
        );
      }
    } else {
      // When sequence is not active, use manual controls
      if (groupRef.current) {
        groupRef.current.position.set(positionX, positionY, positionZ);
        groupRef.current.rotation.set(rotationX, rotationY, rotationZ);
      }
    }

    // ALWAYS apply scale
    if (groupRef.current) {
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    }
  });

  return (
    <group
      ref={groupRef}
      {...props}
      // Don't use position/rotation props, handle everything in useFrame
      dispose={null}
    >
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.PEPE);
