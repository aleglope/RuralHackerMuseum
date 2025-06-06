/*
Pepe Component
Component for loading and displaying the GLB pepe model with Leva controls
Positioned near the window view area with independent positioning controls
*/

import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

// Pepe component with positioning controls
export function Pepe(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.PEPE);
  const groupRef = useRef<THREE.Group>(null);
  const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Leva controls for positioning the Pepe model
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
  } = useControls("Pepe Model", {
    positionX: { value: -15.0, min: -30, max: 10, step: 0.1 },
    positionY: { value: 5.0, min: -5, max: 20, step: 0.1 },
    positionZ: { value: -5.0, min: -15, max: 15, step: 0.1 },
    rotationX: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationY: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    rotationZ: { value: 0.0, min: -Math.PI, max: Math.PI, step: 0.1 },
    scaleX: { value: 1.0, min: 0.1, max: 10.0, step: 0.1 },
    scaleY: { value: 1.0, min: 0.1, max: 10.0, step: 0.1 },
    scaleZ: { value: 1.0, min: 0.1, max: 10.0, step: 0.1 },
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
useGLTF.preload(MODEL_PATHS.ARCHITECTURE.PEPE);
