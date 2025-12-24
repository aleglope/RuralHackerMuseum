/**
 * 🌲 MAN_ON_FOREST BEHAVIORS - LÓGICA PARA FOGSCENE CON CONTROLES LEVA
 * Preserva el sistema de materiales y agrega controles Leva interactivos
 */

import { useEffect, useRef } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import { ManOnForestModelConfig } from "../types";

export const ManOnForestBehaviors = {
  useManOnForestBehavior: (
    config: ManOnForestModelConfig,
    gltf: { scene?: THREE.Group } | null,
    groupRef: React.RefObject<THREE.Group>
  ) => {
    const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());
    const modifiedSceneRef = useRef<THREE.Group | null>(null);

    // Leva controls para posicionar el modelo ManOnForest en FogScene
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
    } = useControls("ManOnForest (FogScene)", {
      positionX: {
        value: config.levaControls.position.x,
        min: -500,
        max: 500,
        step: 1.0,
      },
      positionY: {
        value: config.levaControls.position.y,
        min: -100,
        max: 100,
        step: 1.0,
      },
      positionZ: {
        value: config.levaControls.position.z,
        min: -500,
        max: 500,
        step: 1.0,
      },
      rotationX: {
        value: config.levaControls.rotation.x,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
      },
      rotationY: {
        value: config.levaControls.rotation.y,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
      },
      rotationZ: {
        value: config.levaControls.rotation.z,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
      },
      scaleX: {
        value: config.levaControls.scale.x,
        min: 0.1,
        max: 20.0,
        step: 0.1,
      },
      scaleY: {
        value: config.levaControls.scale.y,
        min: 0.1,
        max: 20.0,
        step: 0.1,
      },
      scaleZ: {
        value: config.levaControls.scale.z,
        min: 0.1,
        max: 20.0,
        step: 0.1,
      },
      showAxes: { value: config.levaControls.showAxes, label: "Mostrar Ejes" },
      axesSize: {
        value: config.levaControls.axesSize,
        min: 1.0,
        max: 20.0,
        step: 0.5,
        label: "Tamaño Ejes",
      },
    });

    // Effect to modify model materials and setup (siguiendo patrón de WindowView)
    useEffect(() => {
      if (gltf.scene) {
        const clonedScene = gltf.scene.clone();

        // Calculate model center for proper rotation pivot (EXACTO DE WINDOWVIEW)
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        modelCenterRef.current.copy(center);

        // Center the model by offsetting all children (EXACTO DE WINDOWVIEW)
        clonedScene.position.sub(center);

        // Traverse all meshes in the model (patrón estándar)
        clonedScene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Clone materials to avoid modifying the original
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat) => {
                const clonedMat = mat.clone();
                // Enhance the material for fog scene
                if (clonedMat instanceof THREE.MeshStandardMaterial) {
                  clonedMat.envMapIntensity =
                    config.materialEnhancement.envMapIntensity;
                }
                return clonedMat;
              });
            } else {
              child.material = child.material.clone();
              // Enhance the material for fog scene
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity =
                  config.materialEnhancement.envMapIntensity;
              }
            }

            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Update scene reference
        modifiedSceneRef.current = clonedScene;
      }
    }, [gltf.scene, config.materialEnhancement.envMapIntensity]);

    // Effect to add/remove axes helper (EXACTO DE WINDOWVIEW)
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
    }, [showAxes, axesSize, groupRef]);

    return {
      position: { x: positionX, y: positionY, z: positionZ },
      rotation: { x: rotationX, y: rotationY, z: rotationZ },
      scale: { x: scaleX, y: scaleY, z: scaleZ },
      showAxes,
      axesSize,
      modifiedScene: modifiedSceneRef.current || gltf.scene,
    };
  },
};

export default ManOnForestBehaviors;
