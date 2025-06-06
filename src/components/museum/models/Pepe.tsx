/*
Pepe Component
Component for loading and displaying the GLB pepe model with Leva controls
Positioned near the window view area with independent positioning controls
*/

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

// Pepe component with positioning controls and animations
export function Pepe(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.PEPE);
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(gltf.animations, groupRef);
  const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const clockRef = useRef(0);

  // Get available animation names
  const animationNames = gltf.animations?.map((anim: any) => anim.name) || [];

  // Leva controls for positioning the Pepe model and animations
  // Positioned near the window view area but with its own independent controls
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
    proceduralWalk,
    walkSpeed,
    tailWag,
    breathe,
  } = useControls("Pepe Model", {
    positionX: { value: -15.0, min: -30, max: 10, step: 0.1 },
    positionY: { value: -2.2, min: -5, max: 20, step: 0.1 },
    positionZ: { value: -9.0, min: -15, max: 15, step: 0.1 },
    rotationX: { value: 0.3, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationY: { value: 2.5, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationZ: { value: -0.1, min: -Math.PI, max: Math.PI, step: 0.1 },
    scaleX: { value: 1.3, min: 0.1, max: 10.0, step: 0.1 },
    scaleY: { value: 1.3, min: 0.1, max: 10.0, step: 0.1 },
    scaleZ: { value: 1.3, min: 0.1, max: 10.0, step: 0.1 },
    showAxes: { value: true, label: "Mostrar Ejes" },
    axesSize: {
      value: 3.0,
      min: 0.5,
      max: 10.0,
      step: 0.1,
      label: "Tamaño Ejes",
    },
    // Animation controls
    enableAnimations: { value: false, label: "Activar Animaciones" },
    selectedAnimation: {
      value: animationNames[0] || "none",
      options: animationNames.length > 0 ? animationNames : ["none"],
      label: "Animación",
    },
    animationSpeed: {
      value: 1.0,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      label: "Velocidad",
    },
    proceduralWalk: { value: false, label: "Caminar Procedural" },
    walkSpeed: {
      value: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      label: "Vel. Caminar",
    },
    tailWag: { value: false, label: "Mover Cola" },
    breathe: { value: false, label: "Respirar" },
  });

  // Effect to modify model materials and setup
  useEffect(() => {
    if (gltf.scene) {
      const clonedScene = gltf.scene.clone();

      // Calculate model center for proper rotation pivot
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      modelCenterRef.current.copy(center);

      // Center the model by offsetting all children
      clonedScene.position.sub(center);

      // Traverse all meshes in the model
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Clone materials to avoid modifying the original
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => {
              const clonedMat = mat.clone();
              // Enhance the material for better visual quality
              if (clonedMat instanceof THREE.MeshStandardMaterial) {
                clonedMat.envMapIntensity = 1.2;
              }
              return clonedMat;
            });
          } else {
            child.material = child.material.clone();
            // Enhance the material for better visual quality
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 1.2;
            }
          }

          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Update scene reference
      gltf.scene = clonedScene;
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

  // Animation effects
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

  // Procedural animations using useFrame
  useFrame((state) => {
    if (!groupRef.current) return;

    clockRef.current += state.clock.getDelta();

    // Procedural walking animation (simple bobbing)
    if (proceduralWalk) {
      const bobAmount = 0.2;
      const walkCycle = Math.sin(clockRef.current * walkSpeed * 4) * bobAmount;
      groupRef.current.position.y =
        (groupRef.current.position.y || 0) + walkCycle * 0.1;
    }

    // Tail wagging (if we can find tail bones, otherwise simulate with rotation)
    if (tailWag) {
      const wagAmount = 0.3;
      const wagCycle = Math.sin(clockRef.current * 8) * wagAmount;
      // This would work better with bone manipulation, but we'll use overall rotation for now
      groupRef.current.rotation.y += wagCycle * 0.01;
    }

    // Breathing effect (slight scale animation)
    if (breathe) {
      const breathAmount = 0.02;
      const breathCycle = Math.sin(clockRef.current * 2) * breathAmount;
      const scale = 1 + breathCycle;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group
      ref={groupRef}
      {...props}
      position={[positionX, positionY, positionZ]}
      rotation={[rotationX, rotationY, rotationZ]}
      scale={[scaleX, scaleY, scaleZ]}
      dispose={null}
    >
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.PEPE);
