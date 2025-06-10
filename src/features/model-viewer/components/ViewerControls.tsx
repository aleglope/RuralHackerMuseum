import React, { useRef, useEffect } from "react";

export interface ViewerControlsProps {
  onMove: (direction: string, active: boolean) => void;
}

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

/**
 * Touch Controls for mobile devices
 * Extraído de Model3DViewerScene.tsx preservando funcionalidad exacta
 */
export const ViewerControls: React.FC<ViewerControlsProps> = ({ onMove }) => {
  const isMobile = useIsMobile();
  const buttonRefs = useRef<{ [key: string]: HTMLDivElement | null }>({
    forward: null,
    backward: null,
    left: null,
    right: null,
  });

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (direction: string) => (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      console.log(`🎮 Touch START: ${direction}`);
      onMove(direction, true);
    };

    const handleTouchEnd = (direction: string) => (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      console.log(`🎮 Touch END: ${direction}`);
      onMove(direction, false);
    };

    // Add non-passive event listeners for each button
    Object.entries(buttonRefs.current).forEach(([direction, element]) => {
      if (element) {
        const touchStartHandler = handleTouchStart(direction);
        const touchEndHandler = handleTouchEnd(direction);

        // Add non-passive event listeners
        element.addEventListener("touchstart", touchStartHandler, {
          passive: false,
        });
        element.addEventListener("touchend", touchEndHandler, {
          passive: false,
        });
        element.addEventListener("touchcancel", touchEndHandler, {
          passive: false,
        });

        // Also add mouse events for compatibility
        element.addEventListener("mousedown", (e) => {
          e.preventDefault();
          onMove(direction, true);
        });
        element.addEventListener("mouseup", (e) => {
          e.preventDefault();
          onMove(direction, false);
        });
        element.addEventListener("mouseleave", (e) => {
          e.preventDefault();
          onMove(direction, false);
        });

        // Store handlers for cleanup
        (element as any)._touchStartHandler = touchStartHandler;
        (element as any)._touchEndHandler = touchEndHandler;
      }
    });

    // Cleanup function
    return () => {
      Object.values(buttonRefs.current).forEach((element) => {
        if (element) {
          const touchStartHandler = (element as any)._touchStartHandler;
          const touchEndHandler = (element as any)._touchEndHandler;

          if (touchStartHandler && touchEndHandler) {
            element.removeEventListener("touchstart", touchStartHandler);
            element.removeEventListener("touchend", touchEndHandler);
            element.removeEventListener("touchcancel", touchEndHandler);
          }
        }
      });
    };
  }, [isMobile, onMove]);

  if (!isMobile) return null;

  const buttonStyle = {
    position: "absolute" as const,
    width: "70px",
    height: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    border: "3px solid rgba(255, 255, 255, 0.6)",
    borderRadius: "50%",
    color: "white",
    fontSize: "24px",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none" as const,
    touchAction: "manipulation" as const,
    zIndex: 1001,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  };

  return (
    <>
      <div
        ref={(el) => {
          buttonRefs.current.forward = el;
        }}
        style={{
          ...buttonStyle,
          bottom: "160px",
          right: "90px",
        }}
      >
        ↑
      </div>

      <div
        ref={(el) => {
          buttonRefs.current.backward = el;
        }}
        style={{
          ...buttonStyle,
          bottom: "80px",
          right: "90px",
        }}
      >
        ↓
      </div>

      <div
        ref={(el) => {
          buttonRefs.current.left = el;
        }}
        style={{
          ...buttonStyle,
          bottom: "120px",
          right: "170px",
        }}
      >
        ←
      </div>

      <div
        ref={(el) => {
          buttonRefs.current.right = el;
        }}
        style={{
          ...buttonStyle,
          bottom: "120px",
          right: "10px",
        }}
      >
        →
      </div>
    </>
  );
};

export default ViewerControls;
