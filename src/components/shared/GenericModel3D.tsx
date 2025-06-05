/*
Generic 3D Model Component
Eliminates code duplication for loading GLB/GLTF models
*/

import { useGLTF } from "@react-three/drei";
import { Model3DProps } from "../../types/three";

export function GenericModel3D({
  modelPath,
  castShadow = true,
  receiveShadow = true,
  ...groupProps
}: Model3DProps) {
  if (!modelPath) {
    console.warn("GenericModel3D: modelPath is required");
    return null;
  }

  const gltf = useGLTF(modelPath);

  if (!gltf || !gltf.scene) {
    console.warn("GenericModel3D: Failed to load model:", modelPath);
    return null;
  }

  return (
    <group {...groupProps} dispose={null}>
      <primitive
        object={gltf.scene.clone()}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    </group>
  );
}

// Helper function to preload multiple models
export const preloadModels = (modelPaths: string[]) => {
  modelPaths.forEach((path) => useGLTF.preload(path));
};
