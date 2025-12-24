import React from "react";
import { useProgress } from "@react-three/drei";

interface ProgressTrackerProps {
  onProgressUpdate: (progress: number) => void;
  onAssetsLoaded: () => void;
  onMetaUpdate?: (meta: { loaded: number; total: number; item: string }) => void;
}

/**
 * Progress tracker component that works INSIDE Canvas (like Scene.tsx)
 * Extraído de Model3DViewerScene.tsx preservando funcionalidad exacta
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  onProgressUpdate,
  onAssetsLoaded,
  onMetaUpdate,
}) => {
  const { progress, loaded, total, item } = useProgress();

  React.useEffect(() => {
    // Real progress update - this actually works because it's inside Canvas
    onProgressUpdate(Math.floor(progress));
  }, [progress, onProgressUpdate]);

  React.useEffect(() => {
    onMetaUpdate?.({ loaded, total, item: item ?? "" });
  }, [loaded, total, item, onMetaUpdate]);

  React.useEffect(() => {
    // Signal when assets are loaded (like in Scene.tsx)
    if (progress === 100 && loaded === total && total > 0) {
      onAssetsLoaded();
    }
  }, [progress, loaded, total, onAssetsLoaded]);

  return null;
};

export default ProgressTracker;
