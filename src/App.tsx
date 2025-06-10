import React, { useState, useEffect, useContext } from "react";
import { ImageMetadata } from "./core/types";
import { GALLERY_IMAGES as drawingImages } from "./core/config";
import SwipeableContainer from "./components/ui/SwipeableContainer";
import { TourProvider } from "./contexts/TourContext";
import { AnimationProvider, useAnimation } from "./contexts/AnimationContext";
import Scene from "./components/Scene";
import UIElements from "./components/ui/UIElements";
import Model3DViewerScene from "./features/model-viewer/Model3DViewerScene";

type ViewState = "gallery" | "modelViewer";

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
    setSelectedModelUrl(modelUrl);
    setCurrentView("modelViewer");
  };

  const handleBackToGallery = () => {
    setCurrentView("gallery");
    setSelectedModelUrl(null);
    setAssetsReady(false);
    setCurrentScreen("loading");
  };

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
