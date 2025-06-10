/*
Unified Plant Components - MIGRATED TO NEW ARCHITECTURE
Uses BaseModel3D with centralized registry
*/

import { BaseModel3D } from "../../../core/models";
import { GroupProps } from "@react-three/fiber";

// Componentes individuales de plantas - NUEVA ARQUITECTURA
export function Plant1(props: GroupProps) {
  return <BaseModel3D modelId="PLANT_1" {...props} />;
}

export function Plant2(props: GroupProps) {
  return <BaseModel3D modelId="PLANT_2" {...props} />;
}

export function Plant3(props: GroupProps) {
  return <BaseModel3D modelId="PLANT_3" {...props} />;
}

export function Plant4(props: GroupProps) {
  return <BaseModel3D modelId="PLANT_4" {...props} />;
}

export function PlantExterior(props: GroupProps) {
  return <BaseModel3D modelId="PLANT_EXTERIOR" {...props} />;
}

// Generic component that accepts plant type - NUEVA ARQUITECTURA
interface PlantProps extends GroupProps {
  plantType: "PLANT_1" | "PLANT_2" | "PLANT_3" | "PLANT_4" | "PLANT_EXTERIOR";
}

export function Plant({ plantType, ...props }: PlantProps) {
  return <BaseModel3D modelId={plantType} {...props} />;
}
