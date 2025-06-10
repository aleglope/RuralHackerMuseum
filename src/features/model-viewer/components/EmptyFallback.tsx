import React from "react";

interface EmptyFallbackProps {
  onLoaded: () => void;
}

/**
 * Simple fallback component that signals completion like in Scene.tsx
 * Extraído de Model3DViewerScene.tsx preservando funcionalidad exacta
 */
export const EmptyFallback: React.FC<EmptyFallbackProps> = ({ onLoaded }) => {
  React.useEffect(() => {
    return () => {
      onLoaded();
    };
  }, [onLoaded]);

  return null;
};

export default EmptyFallback;
