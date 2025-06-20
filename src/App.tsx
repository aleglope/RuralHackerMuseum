import React, { useState, useEffect } from "react";
import { ImageMetadata } from "./core/types";
import { GALLERY_IMAGES as drawingImages } from "./core/config";
import SwipeableContainer from "./components/ui/SwipeableContainer";
import { TourProvider } from "./contexts/TourContext";
import { AnimationProvider, useAnimation } from "./contexts/AnimationContext";
import Scene from "./components/Scene";
import UIElements from "./components/ui/UIElements";
import Model3DViewerScene from "./features/model-viewer/Model3DViewerScene";
import FogScene from "./features/fog-scene/FogScene";
import { SuperRunner2D } from "./features/mini-game";

type ViewState = "gallery" | "modelViewer" | "fogScene" | "miniGame";

const AppContent = () => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("gallery");
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | null>(null);
  const { setCurrentScreen, setAssetsReady } = useAnimation();

  useEffect(() => {
    setImages(drawingImages);
    setAssetsReady(false);
    setCurrentScreen("loading");
  }, []);

  const handleShowModelViewer = (modelUrl: string) => {
    if (modelUrl === "FOG_SCENE") {
      // Interceptar y mostrar mini-juego antes del fog scene
      setCurrentView("miniGame");
    } else {
      setSelectedModelUrl(modelUrl);
      setCurrentView("modelViewer");
    }
  };

  const handleMiniGameComplete = () => {
    // Cuando se complete el mini-juego, ir al fog scene
    setCurrentView("fogScene");
  };

  const handleBackToGallery = () => {
    setCurrentView("gallery");
    setSelectedModelUrl(null);
    setAssetsReady(false);
    setCurrentScreen("loading");
  };

  if (currentView === "miniGame") {
    return (
      <SuperRunner2D
        onGameComplete={handleMiniGameComplete}
        gameDuration={60000} // 60 segundos
      />
    );
  }

  if (currentView === "fogScene") {
    return <FogScene onBack={handleBackToGallery} />;
  }

  if (currentView === "modelViewer" && selectedModelUrl) {
    return (
      <Model3DViewerScene
        modelUrl={selectedModelUrl}
        onBack={handleBackToGallery}
      />
    );
  }

  return (
    <div className="relative w-full h-screen">
      <TourProvider totalFrames={images.length}>
        <SwipeableContainer>
          <Scene images={images} onShowModelViewer={handleShowModelViewer} />
          <UIElements />
        </SwipeableContainer>
      </TourProvider>
    </div>
  );
};

function App() {
  return (
    <AnimationProvider>
      <AppContent />
    </AnimationProvider>
  );
}

export default App;
