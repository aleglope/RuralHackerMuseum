import React, { useRef, useEffect } from "react";

export interface FogTouchControlsProps {
  onMove: (direction: string, active: boolean) => void;
  isMobile: boolean;
}

interface ElementWithHandlers extends HTMLDivElement {
  _touchStartHandler?: (event: TouchEvent) => void;
  _touchEndHandler?: (event: TouchEvent) => void;
}

/**
 * Controles táctiles para FogScene en dispositivos móviles
 * Basado en ViewerControls pero adaptado al estilo del fog scene
 */
export const FogTouchControls: React.FC<FogTouchControlsProps> = ({
  onMove,
  isMobile,
}) => {
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
      onMove(direction, true);
    };

    const handleTouchEnd = (direction: string) => (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
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
        (element as ElementWithHandlers)._touchStartHandler = touchStartHandler;
        (element as ElementWithHandlers)._touchEndHandler = touchEndHandler;
      }
    });

    // Cleanup function
    return () => {
      const currentRefs = buttonRefs.current;
      Object.values(currentRefs).forEach((element) => {
        if (element) {
          const touchStartHandler = (element as ElementWithHandlers)
            ._touchStartHandler;
          const touchEndHandler = (element as ElementWithHandlers)
            ._touchEndHandler;

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

  // Estilo de botones adaptado al tema del fog scene (más oscuro y atmosférico)
  const buttonStyle = {
    position: "absolute" as const,
    width: "70px",
    height: "70px",
    backgroundColor: "rgba(20, 20, 30, 0.8)", // Más oscuro para el fog scene
    border: "2px solid rgba(100, 100, 150, 0.7)", // Azul grisáceo
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none" as const,
    touchAction: "manipulation" as const,
    zIndex: 1001,
    cursor: "pointer",
    boxShadow:
      "0 4px 16px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(100, 100, 150, 0.3)", // Glow interno
    transition: "all 0.2s ease",
  };

  // Estilo para efecto de presión (se podría usar para hover states en el futuro)
  // const activeStyle = {
  //   transform: "scale(0.95)",
  //   backgroundColor: "rgba(50, 50, 80, 0.9)",
  //   boxShadow:
  //     "0 2px 8px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(150, 150, 200, 0.4)",
  // };

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
        onTouchStart={() => onMove("forward", true)}
        onTouchEnd={() => onMove("forward", false)}
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
        onTouchStart={() => onMove("backward", true)}
        onTouchEnd={() => onMove("backward", false)}
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
        onTouchStart={() => onMove("left", true)}
        onTouchEnd={() => onMove("left", false)}
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
        onTouchStart={() => onMove("right", true)}
        onTouchEnd={() => onMove("right", false)}
      >
        →
      </div>
    </>
  );
};

export default FogTouchControls;
