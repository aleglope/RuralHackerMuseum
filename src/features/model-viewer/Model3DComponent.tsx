import React from "react";
import { BaseModel3D } from "../../core/models";
import { GroupProps } from "@react-three/fiber";

interface Model3DProps extends GroupProps {
  url: string; // URL of the GLB/GLTF model to load - mantenido para compatibilidad
}

/**
 * Model3DComponent - MIGRADO A NUEVA ARQUITECTURA
 * Ahora usa BaseModel3D con modelId "ANCEU"
 * Preserva TODAS las transformaciones complejas exactas
 */
export default function Model3DComponent({ url, ...props }: Model3DProps) {
  // El url se ignora ahora porque usamos el registry centralizado
  // pero lo mantenemos para compatibilidad de la interfaz
  return <BaseModel3D modelId="ANCEU" {...props} />;
}
