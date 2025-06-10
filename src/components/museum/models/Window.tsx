/*
Window Component - MIGRATED TO NEW ARCHITECTURE
Component for loading and displaying the GLB window model with translucent glass
*/

import { BaseModel3D } from "../../../core/models";
import { GroupProps } from "@react-three/fiber";

// Window component with translucent glass - NUEVA ARQUITECTURA
export function Window(props: GroupProps) {
  return <BaseModel3D modelId="WINDOW" {...props} />;
}

// Preload is now handled by BaseModel3D and ModelRegistry
