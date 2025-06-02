import React, { useState, useEffect } from "react";
import { ImageMetadata } from "./types/museum";
import { drawingImages } from "./config/imagesConfig";
import SwipeableContainer from "./components/ui/SwipeableContainer";
import { TourProvider } from "./contexts/TourContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import Scene from "./components/Scene";
import UIElements from "./components/ui/UIElements";
import Model3DViewerScene from "./components/modelViewer/Model3DViewerScene";

type ViewState = "gallery" | "modelViewer";

function App() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>("gallery");
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | null>(null);

  useEffect(() => {
    setImages(drawingImages);
  }, []);

  const handleShowModelViewer = (modelUrl: string) => {
    setSelectedModelUrl(modelUrl);
    setCurrentView("modelViewer");
  };

  const handleBackToGallery = () => {
    setCurrentView("gallery");
    setSelectedModelUrl(null);
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
      <AnimationProvider>
        <TourProvider totalFrames={images.length}>
          <SwipeableContainer>
            <Scene images={images} onShowModelViewer={handleShowModelViewer} />
            <UIElements />
          </SwipeableContainer>
        </TourProvider>
      </AnimationProvider>
    </div>
  );
}

export default App;
