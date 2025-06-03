/*
Window Component
Componente para cargar y mostrar el modelo de ventana GLB con vidrio translúcido
*/

import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { MODEL_PATHS } from "../../../config/models";
import { GroupProps } from "@react-three/fiber";
import * as THREE from "three";

// Componente de ventana con vidrio translúcido
export function Window(props: GroupProps) {
  const gltf = useGLTF(MODEL_PATHS.ARCHITECTURE.WINDOW);

  // Controles para la transparencia del vidrio
  const { glassOpacity, glassColor, glassReflectivity, glassRoughness } =
    useControls("🔍 Vidrio de Ventana", {
      glassOpacity: { value: 0.25, min: 0, max: 1, step: 0.05 },
      glassColor: "#87CEEB",
      glassReflectivity: { value: 0.8, min: 0, max: 1, step: 0.1 },
      glassRoughness: { value: 0.1, min: 0, max: 1, step: 0.1 },
    });

  // Efecto para modificar los materiales del modelo
  useEffect(() => {
    if (gltf.scene) {
      const clonedScene = gltf.scene.clone();

      // Recorrer todos los meshes del modelo
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Identificar el vidrio por nombre del material o mesh
          const meshName = child.name.toLowerCase();
          const materialName = child.material.name?.toLowerCase() || "";

          // Buscar elementos que contengan palabras relacionadas con vidrio/cristal
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
            // Crear material translúcido para el vidrio
            if (Array.isArray(child.material)) {
              // Si es un array de materiales
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
                  transmission: Math.max(0, 1 - glassOpacity), // Transmisión inversa a la opacidad
                  thickness: 0.1,
                });
                return glassMaterial;
              });
            } else {
              // Material único
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
            // Para elementos que no son vidrio, mantener las propiedades originales pero mejorar sombras
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat) => {
                const clonedMat = mat.clone();
                return clonedMat;
              });
            } else {
              child.material = child.material.clone();
            }
          }

          // Habilitar sombras
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Actualizar la referencia del scene
      gltf.scene = clonedScene;
    }
  }, [gltf.scene, glassOpacity, glassColor, glassReflectivity, glassRoughness]);

  return (
    <group {...props} dispose={null}>
      <primitive object={gltf.scene} castShadow={true} receiveShadow={true} />
    </group>
  );
}
