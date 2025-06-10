/*
WindowView Component - MIGRATED TO NEW ARCHITECTURE
Component for loading and displaying the GLB window-view model with Leva controls
Positioned outside the window to create a view through the gallery window
*/

import { BaseModel3D } from "../../../core/models";
import { GroupProps } from "@react-three/fiber";

// WindowView component with positioning controls - NUEVA ARQUITECTURA
export function WindowView(props: GroupProps) {
  return <BaseModel3D modelId="WINDOW_VIEW" {...props} />;
}

// Preload is now handled by BaseModel3D and ModelRegistry
