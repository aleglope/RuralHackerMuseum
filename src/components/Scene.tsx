import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import SafeEnvironment from "./ui/SafeEnvironment";
import { Perf } from "r3f-perf";
import Museum from "./Museum";
import { ImageMetadata } from "../core/types";
import { useAnimation } from "../contexts/AnimationContext";

interface SceneProps {
  images: ImageMetadata[];
  onShowModelViewer: (modelUrl: string) => void;
}

const EmptyFallback = ({ onLoaded }: { onLoaded: () => void }) => {
  React.useEffect(() => {
    return () => {
      onLoaded();
    };
  }, [onLoaded]);

  return null;
};

const Scene: React.FC<SceneProps> = ({ images, onShowModelViewer }) => {
  const { sceneOpacity, sceneBlur, handleAssetsLoaded } = useAnimation();

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        transition: "opacity 1.5s ease-in-out, filter 1s ease-out",
      }}
    >
      <Canvas
        shadows
        camera={{
          position: [0, 2, 14],
          fov: 60,
        }}
        dpr={[1.5, 2.5]}
      >
        <Preload all />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        {/* <Perf minimal={true} /> */}
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={<EmptyFallback onLoaded={handleAssetsLoaded} />}>
          <Museum images={images} onShowModelViewer={onShowModelViewer} />
          <SafeEnvironment preset="city" fallback="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
