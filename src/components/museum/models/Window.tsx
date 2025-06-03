/*
Window Component
Component for loading and displaying the GLB window model with translucent glass
*/

import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";
import * as THREE from "three";

// Window component with translucent glass
export function Window(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.WINDOW);

  // Fixed values for glass transparency
  const glassOpacity = 0.25;
  const glassColor = "#87CEEB";
  const glassReflectivity = 0.8;
  const glassRoughness = 0.1;

  // Effect to modify model materials
  useEffect(() => {
    if (gltf.scene) {
      const clonedScene = gltf.scene.clone();

      // Traverse all meshes in the model
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Identify glass by material or mesh name
          const meshName = child.name.toLowerCase();
          const materialName = child.material.name?.toLowerCase() || "";

          // Search for elements containing glass/crystal related words
          const isGlass =
            meshName.includes("glass") ||
            meshName.includes("vidrio") ||
            meshName.includes("crystal") ||
            meshName.includes("window") ||
            materialName.includes("glass") ||
            materialName.includes("vidrio") ||
            materialName.includes("crystal") ||
            materialName.includes("transparent");

          if (isGlass) {
            // Create translucent material for glass
            if (Array.isArray(child.material)) {
              // If it's an array of materials
              child.material = child.material.map((mat) => {
                const glassMaterial = new THREE.MeshPhysicalMaterial({
                  color: glassColor,
                  transparent: true,
                  opacity: glassOpacity,
                  metalness: glassReflectivity,
                  roughness: glassRoughness,
                  envMapIntensity: 1.5,
                  clearcoat: 0.8,
                  clearcoatRoughness: 0.1,
                  transmission: Math.max(0, 1 - glassOpacity), // Transmission inverse to opacity
                  thickness: 0.1,
                });
                return glassMaterial;
              });
            } else {
              // Single material
              child.material = new THREE.MeshPhysicalMaterial({
                color: glassColor,
                transparent: true,
                opacity: glassOpacity,
                metalness: glassReflectivity,
                roughness: glassRoughness,
                envMapIntensity: 1.5,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1,
                transmission: Math.max(0, 1 - glassOpacity),
                thickness: 0.1,
              });
            }
          } else {
            // For non-glass elements, maintain original properties but improve shadows
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat) => {
                const clonedMat = mat.clone();
                return clonedMat;
              });
            } else {
              child.material = child.material.clone();
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
  }, [gltf.scene, glassOpacity, glassColor, glassReflectivity, glassRoughness]);

  return (
    <group {...props} dispose={null}>
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}
