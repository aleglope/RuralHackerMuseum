import React from "react";
import { Instagram } from "lucide-react";
import Controls from "./Controls";
import TourControls from "./TourControls";
import { useAnimation } from "../../contexts/AnimationContext";
import LoadingScreen from "./LoadingScreen";
import TitleScreen from "./TitleOverlay";

interface LoadingScreenWrapperProps {
  assetsReady: boolean;
  onComplete: () => void;
}

const LoadingScreenWrapper: React.FC<LoadingScreenWrapperProps> = ({
  assetsReady,
  onComplete,
}) => {
  const setIsLoading = (isLoading: boolean) => {
    if (!isLoading) {
      onComplete();
    }
  };

  return (
    <LoadingScreen setIsLoading={setIsLoading} assetsReady={assetsReady} />
  );
};

const UIElements: React.FC = () => {
  const {
    currentScreen,
    assetsReady,
    handleLoadingComplete,
    handleTitleFading,
    handleTitleComplete,
  } = useAnimation();

  return (
    <>
      {/* Black screen when loading */}
      {currentScreen === "loading" && (
        <div className="fixed inset-0 bg-black z-20" />
      )}

      {/* Loading screen */}
      {currentScreen === "loading" && (
        <LoadingScreenWrapper
          assetsReady={assetsReady}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Title screen - with blurred scene in background */}
      {currentScreen === "title" && (
        <TitleScreen
          onFading={handleTitleFading}
          onComplete={handleTitleComplete}
        />
      )}

      {/* UI controls (visible only in scene mode) */}
      {currentScreen === "scene" && (
        <>
          <a
            className="absolute top-0 left-0 p-4 text-white flex items-center hover:scale-105 transition-all duration-300 z-40"
            href="https://www.instagram.com/ruralhackers"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          >
            <Instagram className="mr-2" />
            <h1 className="text-xl font-bold">Rural Hackers</h1>
          </a>

          <Controls
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          />

          <TourControls
            style={{
              animation: "fadeIn 1s ease-out forwards",
            }}
          />
        </>
      )}
    </>
  );
};

export default UIElements;
