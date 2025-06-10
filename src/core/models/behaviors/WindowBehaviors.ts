/**
 * 🪟 WINDOW BEHAVIORS - LÓGICA EXACTA PRESERVADA
 * Preserva todo el sistema de materiales glass con keywords exactas
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WindowModelConfig } from "../types";

export const WindowBehaviors = {
  useWindowBehavior: (config: WindowModelConfig, gltf: any) => {
    const modifiedSceneRef = useRef<THREE.Group | null>(null);

    // Effect to modify model materials (EXACTO DEL ORIGINAL)
    useEffect(() => {
      if (gltf.scene) {
        const clonedScene = gltf.scene.clone();

        // Traverse all meshes in the model (EXACTO DEL ORIGINAL)
        clonedScene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Identify glass by material or mesh name (EXACTO DEL ORIGINAL)
            const meshName = child.name.toLowerCase();
            const materialName = child.material.name?.toLowerCase() || "";

            // Search for elements containing glass/crystal related words (EXACTO DEL ORIGINAL)
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
              // Create translucent material for glass (EXACTO DEL ORIGINAL)
              if (Array.isArray(child.material)) {
                // If it's an array of materials
                child.material = child.material.map((mat) => {
                  const glassMaterial = new THREE.MeshPhysicalMaterial({
                    color: config.glassConfig.color,
                    transparent: true,
                    opacity: config.glassConfig.opacity,
                    metalness: config.glassConfig.reflectivity,
                    roughness: config.glassConfig.roughness,
                    envMapIntensity:
                      config.glassConfig.materialProps.envMapIntensity,
                    clearcoat: config.glassConfig.materialProps.clearcoat,
                    clearcoatRoughness:
                      config.glassConfig.materialProps.clearcoatRoughness,
                    transmission: config.glassConfig.materialProps.transmission(
                      config.glassConfig.opacity
                    ), // Transmission inverse to opacity
                    thickness: config.glassConfig.materialProps.thickness,
                  });
                  return glassMaterial;
                });
              } else {
                // Single material (EXACTO DEL ORIGINAL)
                child.material = new THREE.MeshPhysicalMaterial({
                  color: config.glassConfig.color,
                  transparent: true,
                  opacity: config.glassConfig.opacity,
                  metalness: config.glassConfig.reflectivity,
                  roughness: config.glassConfig.roughness,
                  envMapIntensity:
                    config.glassConfig.materialProps.envMapIntensity,
                  clearcoat: config.glassConfig.materialProps.clearcoat,
                  clearcoatRoughness:
                    config.glassConfig.materialProps.clearcoatRoughness,
                  transmission: config.glassConfig.materialProps.transmission(
                    config.glassConfig.opacity
                  ),
                  thickness: config.glassConfig.materialProps.thickness,
                });
              }
            } else {
              // For non-glass elements, maintain original properties but improve shadows (EXACTO DEL ORIGINAL)
              if (Array.isArray(child.material)) {
                child.material = child.material.map((mat) => {
                  const clonedMat = mat.clone();
                  return clonedMat;
                });
              } else {
                child.material = child.material.clone();
              }
            }

            // Enable shadows (EXACTO DEL ORIGINAL)
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Update scene reference (EXACTO DEL ORIGINAL)
        modifiedSceneRef.current = clonedScene;
      }
    }, [
      gltf.scene,
      config.glassConfig.opacity,
      config.glassConfig.color,
      config.glassConfig.reflectivity,
      config.glassConfig.roughness,
    ]);

    return {
      modifiedScene: modifiedSceneRef.current || gltf.scene,
    };
  },
};

export default WindowBehaviors;
