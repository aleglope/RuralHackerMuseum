/**
 * 🌅 WINDOW_VIEW BEHAVIORS - LÓGICA EXACTA PRESERVADA
 * Preserva todo el sistema de Leva controls y centrado del modelo
 */

import { useEffect, useRef } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import { WindowViewModelConfig } from "../types";

export const WindowViewBehaviors = {
  useWindowViewBehavior: (
    config: WindowViewModelConfig,
    gltf: any,
    groupRef: React.RefObject<THREE.Group>
  ) => {
    const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());
    const modifiedSceneRef = useRef<THREE.Group | null>(null);

    // Leva controls for positioning the window view (EXACTOS DEL ORIGINAL)
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
      positionX: {
        value: config.levaControls.position.x,
        min: -200,
        max: 200,
        step: 0.1,
      },
      positionY: {
        value: config.levaControls.position.y,
        min: -50,
        max: 50,
        step: 0.1,
      },
      positionZ: {
        value: config.levaControls.position.z,
        min: -2000,
        max: 1000,
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
        max: 10.0,
        step: 0.1,
      },
      scaleY: {
        value: config.levaControls.scale.y,
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
      scaleZ: {
        value: config.levaControls.scale.z,
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
      showAxes: { value: config.levaControls.showAxes, label: "Mostrar Ejes" },
      axesSize: {
        value: config.levaControls.axesSize,
        min: 0.5,
        max: 10.0,
        step: 0.1,
        label: "Tamaño Ejes",
      },
    });

    // Effect to modify model materials and setup (EXACTO DEL ORIGINAL)
    useEffect(() => {
      if (gltf.scene) {
        const clonedScene = gltf.scene.clone();

        // Calculate model center for proper rotation pivot (EXACTO DEL ORIGINAL)
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        modelCenterRef.current.copy(center);

        // Center the model by offsetting all children (EXACTO DEL ORIGINAL)
        clonedScene.position.sub(center);

        // Traverse all meshes in the model (EXACTO DEL ORIGINAL)
        clonedScene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Clone materials to avoid modifying the original (EXACTO DEL ORIGINAL)
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat) => {
                const clonedMat = mat.clone();
                // Enhance the material for better visual quality (EXACTO DEL ORIGINAL)
                if (clonedMat instanceof THREE.MeshStandardMaterial) {
                  clonedMat.envMapIntensity =
                    config.materialEnhancement.envMapIntensity;
                }
                return clonedMat;
              });
            } else {
              child.material = child.material.clone();
              // Enhance the material for better visual quality (EXACTO DEL ORIGINAL)
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity =
                  config.materialEnhancement.envMapIntensity;
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
    }, [gltf.scene, config.materialEnhancement.envMapIntensity]);

    // Effect to add/remove axes helper (EXACTO DEL ORIGINAL)
    useEffect(() => {
      if (groupRef.current) {
        // Remove existing axes helper (EXACTO DEL ORIGINAL)
        const existingAxes = groupRef.current.children.find(
          (child) => child instanceof THREE.AxesHelper
        );
        if (existingAxes) {
          groupRef.current.remove(existingAxes);
        }

        // Add new axes helper if enabled (EXACTO DEL ORIGINAL)
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

export default WindowViewBehaviors;
