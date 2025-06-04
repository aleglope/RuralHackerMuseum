/*
WindowView Component
Component for loading and displaying the GLB window-view model with Leva controls
Positioned outside the window to create a view through the gallery window
*/

import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

// WindowView component with positioning controls
export function WindowView(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.WINDOW_VIEW);
  const groupRef = useRef<THREE.Group>(null);
  const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Leva controls for positioning the window view
  // Positioned outside the window (windowX = -9.8, windowZ = -8.5)
  // So the view should be positioned further outside on X axis
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
  } = useControls("Window View", {
    positionX: { value: -25.0, min: -200, max: 200, step: 0.1 },
    positionY: { value: 19.9, min: -50, max: 50, step: 0.1 },
    positionZ: { value: 6.0, min: -2000, max: 1000, step: 1.0 },
    rotationX: { value: 1.5, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationY: {
      value: -3.141592653589793,
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
    },
    rotationZ: { value: -1.5, min: -Math.PI, max: Math.PI, step: 0.1 },
    scaleX: { value: 2.5, min: 0.1, max: 10.0, step: 0.1 },
    scaleY: { value: 2.5, min: 0.1, max: 10.0, step: 0.1 },
    scaleZ: { value: 2.5, min: 0.1, max: 10.0, step: 0.1 },
    showAxes: { value: true, label: "Mostrar Ejes" },
    axesSize: {
      value: 3.0,
      min: 0.5,
      max: 10.0,
      step: 0.1,
      label: "Tamaño Ejes",
    },
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
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.WINDOW_VIEW);
