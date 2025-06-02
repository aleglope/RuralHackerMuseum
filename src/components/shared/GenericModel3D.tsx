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
  const gltf = useGLTF(modelPath);

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

// Función helper para precargar múltiples modelos
export const preloadModels = (modelPaths: string[]) => {
  modelPaths.forEach((path) => useGLTF.preload(path));
};
