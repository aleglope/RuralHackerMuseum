/**
 * 🏛️ ANCEU BEHAVIORS - LÓGICA EXACTA PRESERVADA
 * Preserva todo el sistema de transformaciones complejas
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { AnceuModelConfig } from "../types";

export const AnceuBehaviors = {
  useAnceuBehavior: (
    config: AnceuModelConfig,
    gltf: any,
    groupRef: React.RefObject<THREE.Group>
  ) => {
    const transformedSceneRef = useRef<THREE.Group | null>(null);

    // Effect to apply the complete transformation sequence (EXACTO DEL ORIGINAL)
    useEffect(() => {
      if (!gltf?.scene) return;

      const loadedModel = gltf.scene.clone(); // Clone to avoid issues

      // 1. Center the model's geometry at its local origin (EXACTO DEL ORIGINAL)
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      loadedModel.children.forEach((child: THREE.Object3D) => {
        child.position.sub(center);
      });

      // 2. Apply base position and rotation (EXACTO DEL ORIGINAL)
      loadedModel.position.set(
        config.transformSequence.basePosition.x,
        config.transformSequence.basePosition.y,
        config.transformSequence.basePosition.z
      );
      loadedModel.rotation.set(
        config.transformSequence.baseRotation.x,
        config.transformSequence.baseRotation.y,
        config.transformSequence.baseRotation.z
      );

      // 3. Apply specific transformations for the Anceu model (EXACTO DEL ORIGINAL)
      loadedModel.rotation.x += config.transformSequence.specificRotations.x; // Math.PI / 2 (90 degrees in X)
      loadedModel.rotation.y += config.transformSequence.specificRotations.y; // Math.PI (180 degrees in Y)
      loadedModel.rotation.z += config.transformSequence.specificRotations.z; // Math.PI / 0.65 (Approx 276.9 degrees in Z)
      loadedModel.position.y += config.transformSequence.positionOffset.y; // Fine-tuned Y offset (+1.5)

      // 4. Calculate and apply desired scale (EXACTO DEL ORIGINAL)
      const tempModelForMeasurement = loadedModel.clone();
      tempModelForMeasurement.scale.set(1, 1, 1);
      const boxForScaling = new THREE.Box3().setFromObject(
        tempModelForMeasurement
      );
      const size = boxForScaling.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      const desiredBaseDisplaySize =
        config.transformSequence.scaleCalculation.desiredBaseDisplaySize;
      let calculatedScale = maxDim > 0 ? desiredBaseDisplaySize / maxDim : 1;
      calculatedScale *=
        config.transformSequence.scaleCalculation.scaleMultiplier; // Further scale up

      loadedModel.scale.setScalar(calculatedScale);

      // Ensure all meshes cast and receive shadows (EXACTO DEL ORIGINAL)
      loadedModel.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Update scene reference
      transformedSceneRef.current = loadedModel;
    }, [gltf.scene, config]);

    return {
      transformedScene: transformedSceneRef.current || gltf.scene,
    };
  },
};

export default AnceuBehaviors;
