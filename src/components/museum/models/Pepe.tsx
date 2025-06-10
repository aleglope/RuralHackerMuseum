/*
Pepe Component - MIGRATED TO NEW ARCHITECTURE
Component for loading and displaying the GLB pepe model with proximity-based animation
Positioned near the window view area with automatic movement sequence
*/

import { BaseModel3D } from "../../../core/models";
import { GroupProps } from "@react-three/fiber";

// Pepe component with proximity-based animation sequence - NUEVA ARQUITECTURA
export function Pepe(props: GroupProps) {
  return <BaseModel3D modelId="PEPE" {...props} />;
}

// Preload is now handled by BaseModel3D and ModelRegistry
