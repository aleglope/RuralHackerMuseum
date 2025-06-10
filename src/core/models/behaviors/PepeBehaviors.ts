/**
 * Pepe Behaviors - Animation and proximity detection system
 */

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PepeModelConfig } from "../types";

export const PepeBehaviors = {
  usePepeBehavior: (
    config: PepeModelConfig,
    gltf: any,
    actions: any,
    groupRef: React.RefObject<THREE.Group>
  ) => {
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
      currentPosition: {
        x: config.initialPosition.x,
        y: config.initialPosition.y,
        z: config.initialPosition.z,
      },
      currentRotationY: config.initialRotation.y,
      autoTriggered: false,
      finalPosition: { x: 0, y: 0, z: 0 },
      finalRotationY: 0,
      isVisible: true,
    });

    // Get available animation names
    const animationNames = gltf.animations?.map((anim: any) => anim.name) || [];

    // Setup model materials
    useEffect(() => {
      if (gltf.scene) {
        gltf.scene.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Enhance materials
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
      animationStateRef.current.currentPosition = {
        x: config.initialPosition.x,
        y: config.initialPosition.y,
        z: config.initialPosition.z,
      };
      animationStateRef.current.currentRotationY = config.initialRotation.y;
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

    // Function to start the complete sequence
    const startCompleteSequence = () => {
      // Start movement sequence
      animationStateRef.current.isActive = true;
      animationStateRef.current.phase = "walking1";
      animationStateRef.current.startTime = 0;
      animationStateRef.current.currentPosition = {
        x: config.initialPosition.x,
        y: config.initialPosition.y,
        z: config.initialPosition.z,
      };
      animationStateRef.current.currentRotationY = config.initialRotation.y;
      animationStateRef.current.autoTriggered = true;
      animationStateRef.current.isVisible = true;
      proximityRef.current.sequenceTriggeredByProximity = true;

      // Start GLB animation
      if (animationNames.length > 0) {
        const firstAnimation = animationNames[0];
        if (actions[firstAnimation]) {
          const action = actions[firstAnimation];
          action.reset().fadeIn(0.5).play();
          action.setEffectiveTimeScale(config.animationSpeed);
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

    // Main animation loop
    useFrame((frameState) => {
      // Proximity detection
      if (camera) {
        const cameraPosition = camera.position;
        const windowPosition = new THREE.Vector3(
          config.windowPosition.x,
          config.windowPosition.y,
          config.windowPosition.z
        );
        const distance = cameraPosition.distanceTo(windowPosition);

        proximityRef.current.isNearWindow =
          distance <= config.proximityDistance;

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
          distance > config.proximityDistance + 2.0 &&
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
              config.initialPosition.x,
              config.initialPosition.y,
              config.initialPosition.z
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
            const startY = config.initialRotation.y;
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
            const currentDirection = getForwardDirection(
              state.currentRotationY
            );
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

      // Apply transforms based on current state - CRITICAL for smooth movement
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
            config.initialRotation.x,
            animationStateRef.current.currentRotationY,
            config.initialRotation.z
          );
        } else if (animationStateRef.current.phase === "completed") {
          // After completion: stay at final position (but invisible)
          groupRef.current.position.set(
            animationStateRef.current.finalPosition.x,
            animationStateRef.current.finalPosition.y,
            animationStateRef.current.finalPosition.z
          );
          groupRef.current.rotation.set(
            config.initialRotation.x,
            animationStateRef.current.finalRotationY,
            config.initialRotation.z
          );
        } else {
          // Idle state: use initial position
          groupRef.current.position.set(
            config.initialPosition.x,
            config.initialPosition.y,
            config.initialPosition.z
          );
          groupRef.current.rotation.set(
            config.initialRotation.x,
            config.initialRotation.y,
            config.initialRotation.z
          );
        }

        // Always apply scale
        groupRef.current.scale.set(
          config.scale.x,
          config.scale.y,
          config.scale.z
        );
      }
    });

    // Return minimal state for external monitoring
    return {
      isActive: animationStateRef.current.isActive,
      phase: animationStateRef.current.phase,
    };
  },
};

export default PepeBehaviors;
