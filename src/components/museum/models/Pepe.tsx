/*
Pepe Component
Component for loading and displaying the GLB pepe model with proximity-based animation
Positioned near the window view area with automatic movement sequence
*/

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Constants for Pepe positioning and behavior
const INITIAL_POSITION = { x: -19.1, y: -2.5, z: -7.4 };
const INITIAL_ROTATION = { x: 0.0, y: 0.0, z: 0.0 };
const SCALE = { x: 100.0, y: 100.0, z: 100.0 };
const WINDOW_POSITION = { x: -10.0, y: 0.0, z: -8.0 };
const PROXIMITY_DISTANCE = 5.0;
const ANIMATION_SPEED = 1.0;

// Pepe component with proximity-based animation sequence
export function Pepe(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.PEPE);
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const { camera } = useThree();

  // Proximity detection state
  const proximityRef = useRef({
    hasTriggered: false,
    isNearWindow: false,
    activeGLBAction: null as any,
    sequenceTriggeredByProximity: false,
  });

  // Animation sequence state
  const animationStateRef = useRef({
    isActive: false,
    phase: "idle", // 'walking1', 'rotating', 'walking2', 'completed', 'idle'
    startTime: 0,
    currentPosition: { ...INITIAL_POSITION },
    currentRotationY: 0.0,
    autoTriggered: false,
    finalPosition: { x: 0, y: 0, z: 0 },
    finalRotationY: 0,
    isVisible: true,
  });

  // Get available animation names
  const animationNames = gltf.animations?.map((anim: any) => anim.name) || [];

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

  // Function to reset Pepe to initial position
  const resetToInitialPosition = () => {
    animationStateRef.current.isActive = false;
    animationStateRef.current.phase = "idle";
    animationStateRef.current.startTime = 0;
    animationStateRef.current.currentPosition = { ...INITIAL_POSITION };
    animationStateRef.current.currentRotationY = 0.0;
    animationStateRef.current.autoTriggered = false;
    animationStateRef.current.isVisible = true;
    proximityRef.current.sequenceTriggeredByProximity = false;
    proximityRef.current.hasTriggered = false;

    // Stop GLB animation
    if (proximityRef.current.activeGLBAction) {
      proximityRef.current.activeGLBAction.fadeOut(0.5);
      proximityRef.current.activeGLBAction = null;
    }
  };

  // Function to start the complete sequence (movement + animation)
  const startCompleteSequence = () => {
    // Start movement sequence
    animationStateRef.current.isActive = true;
    animationStateRef.current.phase = "walking1";
    animationStateRef.current.startTime = 0;
    animationStateRef.current.currentPosition = { ...INITIAL_POSITION };
    animationStateRef.current.currentRotationY = 0.0;
    animationStateRef.current.autoTriggered = true;
    animationStateRef.current.isVisible = true;
    proximityRef.current.sequenceTriggeredByProximity = true;

    // Start GLB animation
    if (animationNames.length > 0) {
      const firstAnimation = animationNames[0];
      if (actions[firstAnimation]) {
        const action = actions[firstAnimation];
        action.reset().fadeIn(0.5).play();
        action.setEffectiveTimeScale(ANIMATION_SPEED);
        proximityRef.current.activeGLBAction = action;
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
    // Proximity detection
    if (camera) {
      const cameraPosition = camera.position;
      const windowPosition = new THREE.Vector3(
        WINDOW_POSITION.x,
        WINDOW_POSITION.y,
        WINDOW_POSITION.z
      );
      const distance = cameraPosition.distanceTo(windowPosition);

      proximityRef.current.isNearWindow = distance <= PROXIMITY_DISTANCE;

      // Trigger complete sequence when getting close to window (only if in idle state)
      if (
        proximityRef.current.isNearWindow &&
        !proximityRef.current.hasTriggered &&
        animationStateRef.current.phase === "idle"
      ) {
        startCompleteSequence();
        proximityRef.current.hasTriggered = true;
      }

      // Reset to initial position when moving away from window (only if sequence completed)
      if (
        distance > PROXIMITY_DISTANCE + 2.0 &&
        animationStateRef.current.phase === "completed"
      ) {
        resetToInitialPosition();
      }
    }

    // Movement sequence animation (smooth and fluid)
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
          const startPos = new THREE.Vector3(
            INITIAL_POSITION.x,
            INITIAL_POSITION.y,
            INITIAL_POSITION.z
          );
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
            // Store final position and rotation
            state.finalPosition.x = state.currentPosition.x;
            state.finalPosition.y = state.currentPosition.y;
            state.finalPosition.z = state.currentPosition.z;
            state.finalRotationY = state.currentRotationY;

            state.phase = "completed";
            state.isActive = false;
            state.isVisible = false; // Make Pepe disappear when sequence is completed
          }
          break;
        }
      }
    }

    // Apply transforms based on current state
    if (groupRef.current) {
      // Control visibility
      groupRef.current.visible = animationStateRef.current.isVisible;

      if (animationStateRef.current.isActive) {
        // During animation: use current animated position
        groupRef.current.position.set(
          animationStateRef.current.currentPosition.x,
          animationStateRef.current.currentPosition.y,
          animationStateRef.current.currentPosition.z
        );
        groupRef.current.rotation.set(
          INITIAL_ROTATION.x,
          animationStateRef.current.currentRotationY,
          INITIAL_ROTATION.z
        );
      } else if (animationStateRef.current.phase === "completed") {
        // After completion: stay at final position (but invisible)
        groupRef.current.position.set(
          animationStateRef.current.finalPosition.x,
          animationStateRef.current.finalPosition.y,
          animationStateRef.current.finalPosition.z
        );
        groupRef.current.rotation.set(
          INITIAL_ROTATION.x,
          animationStateRef.current.finalRotationY,
          INITIAL_ROTATION.z
        );
      } else {
        // Idle state: use initial position
        groupRef.current.position.set(
          INITIAL_POSITION.x,
          INITIAL_POSITION.y,
          INITIAL_POSITION.z
        );
        groupRef.current.rotation.set(
          INITIAL_ROTATION.x,
          INITIAL_ROTATION.y,
          INITIAL_ROTATION.z
        );
      }

      // Always apply scale
      groupRef.current.scale.set(SCALE.x, SCALE.y, SCALE.z);
    }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.PEPE);
