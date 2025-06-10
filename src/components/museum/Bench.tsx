/*
Metal Bench - MIGRATED TO NEW ARCHITECTURE
Author: JanStano (https://sketchfab.com/JanStano)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/metal-bench-142d3f423d4a451f8eb6f4cce3d20ae4
Title: Metal Bench
*/

import { BaseModel3D } from "../../core/models";

// Bench for the main museum
export function MetalBench(props: JSX.IntrinsicElements["group"]) {
  return <BaseModel3D modelId="METAL_BENCH" {...props} />;
}

// Bench for the 3D viewer gallery
export function GalleryBench(props: JSX.IntrinsicElements["group"]) {
  return <BaseModel3D modelId="GALLERY_BENCH" {...props} />;
}

// Preload is now handled by BaseModel3D and ModelRegistry
