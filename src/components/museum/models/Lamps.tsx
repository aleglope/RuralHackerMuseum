/*
Unified Lamp Components - MIGRATED TO NEW ARCHITECTURE
Uses BaseModel3D with centralized registry
*/

import { BaseModel3D } from "../../../core/models";
import { GroupProps } from "@react-three/fiber";

// Componentes individuales de lámparas - NUEVA ARQUITECTURA
export function CeilingLamp(props: GroupProps) {
  return <BaseModel3D modelId="CEILING_MOON" {...props} />;
}

export function CeilingLamp2(props: GroupProps) {
  return <BaseModel3D modelId="CEILING_2" {...props} />;
}

// Generic component that accepts lamp type - NUEVA ARQUITECTURA
interface LampProps extends GroupProps {
  lampType: "CEILING_MOON" | "CEILING_2";
}

export function Lamp({ lampType, ...props }: LampProps) {
  return <BaseModel3D modelId={lampType} {...props} />;
}
