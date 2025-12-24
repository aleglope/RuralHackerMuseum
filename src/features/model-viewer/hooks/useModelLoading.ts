import { useState, useEffect, useCallback } from "react";

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  assetsReady: boolean;
  sceneReady: boolean;
  loaded: number;
  total: number;
  item: string;
}

/**
 * Hook para gestionar el estado de carga de modelos
 * Extraído de Model3DViewerScene.tsx preservando funcionalidad exacta
 */
export const useModelLoading = () => {
  // State management like in Scene.tsx pattern
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [item, setItem] = useState("");

  // Handle real progress from Canvas (like Scene.tsx)
  const handleProgressUpdate = useCallback((realProgress: number) => {
    setProgress(realProgress);
  }, []);

  // Handle assets loaded (like Scene.tsx)
  const handleAssetsLoaded = useCallback(() => {
    setAssetsReady(true);
  }, []);

  const handleMetaUpdate = useCallback(
    (meta: { loaded: number; total: number; item: string }) => {
      setLoaded(meta.loaded);
      setTotal(meta.total);
      setItem(meta.item);
    },
    []
  );

  // Complete loading when assets are ready and progress is 100 (like LoadingScreen.tsx)
  useEffect(() => {
    if (assetsReady && progress === 100) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setSceneReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [assetsReady, progress]);

  return {
    state: {
      isLoading,
      progress,
      assetsReady,
      sceneReady,
      loaded,
      total,
      item,
    },
    handlers: {
      handleProgressUpdate,
      handleAssetsLoaded,
      handleMetaUpdate,
    },
  };
};

export default useModelLoading;
