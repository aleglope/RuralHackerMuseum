import React, { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  Environment,
  PerspectiveCamera,
  useTexture,
  Preload,
  useProgress,
} from "@react-three/drei";
import { useControls } from "leva";
import Model3DComponent from "./Model3DComponent";

import { MetalBench } from "../museum/Bench";
import {
  CeilingLamp,
  CeilingLamp2,
  Plant1,
  Plant2,
  Plant3,
  Plant4,
  Window,
  WindowView,
} from "../museum/models";
import { ModelPreloader } from "../shared/ModelPreloader";
import {
  MUSEUM_SCENE_CONFIG,
  PEDESTAL_CONFIG,
  TEXTURE_PATHS,
} from "../../config/scene";
import * as THREE from "three";
import { BlackHoleLoader } from "./BlackHoleLoader";

// Configuration and constants

const {
  floorY,
  cameraHeight: CAMERA_HEIGHT_ABOVE_FLOOR,
  playerSpeed: PLAYER_SPEED,
  playerRadius: PLAYER_RADIUS,
  roomBounds: ROOM_BOUNDS,
} = MUSEUM_SCENE_CONFIG;

// Simple fallback for Suspense (Three.js compatible)
const EmptyFallback = ({ onLoaded }: { onLoaded: () => void }) => {
  React.useEffect(() => {
    return () => {
      onLoaded();
    };
  }, [onLoaded]);

  return null;
};

// Custom hook for smooth artificial progress
const useSmoothProgress = (startLoading: boolean, onComplete: () => void) => {
  const [artificialProgress, setArtificialProgress] = useState(0);
  const [realProgress, setRealProgress] = useState(0);
  const [phase, setPhase] = useState<"artificial" | "real">("artificial");
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const hasCalledComplete = useRef(false);

  // Smooth artificial animation using requestAnimationFrame
  useEffect(() => {
    if (!startLoading) return;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;

      // Small initial delay to allow CSS/DOM to stabilize
      if (elapsed < 100) {
        setArtificialProgress(0);
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Adjust time for initial delay
      const adjustedElapsed = elapsed - 100;
      const duration = 3400; // 3.4 seconds for better perception
      const progress = Math.min(95, (adjustedElapsed / duration) * 95);

      // Use smoother easing curve at start
      const normalizedProgress = progress / 95;
      const easedProgress = easeInOutCubic(normalizedProgress) * 95;

      setArtificialProgress(easedProgress);

      if (easedProgress < 95) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Switch to real phase when reaching 95%
        setPhase("real");
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startLoading, onComplete]);

  // Improved easing function for smoothness
  const easeInOutCubic = (t: number) => {
    if (t < 0.5) {
      return 4 * t * t * t;
    }
    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  return {
    progress:
      phase === "artificial" ? artificialProgress : Math.max(95, realProgress),
    phase,
    setRealProgress,
  };
};

// Separate component to handle real loading progress
const LoadingProgressTracker = ({
  onRealProgressUpdate,
  enabled,
}: {
  onRealProgressUpdate: (
    progress: number,
    loaded: number,
    total: number
  ) => void;
  enabled: boolean;
}) => {
  const { progress, loaded, total, errors } = useProgress();

  React.useEffect(() => {
    if (enabled) {
      // Map real progress to 95-100% range
      const mappedProgress = 95 + progress * 0.05;
      onRealProgressUpdate(mappedProgress, loaded, total);
    }
  }, [progress, loaded, total, onRealProgressUpdate, enabled]);

  React.useEffect(() => {
    // Asset loading error handling
  }, [errors]);

  return null;
};

// Gallery components - structure

// Gallery floor component with bamboo textures
const Floor = ({ floorSize }: { floorSize: number }) => {
  // Using bamboo texture with gloss
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,
    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  React.useEffect(() => {
    [albedoMap, normalMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(floorSize * 0.24, floorSize * 0.24);
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.magFilter = THREE.LinearFilter;
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, aoMap, floorSize]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, floorY, 0]}
      receiveShadow
    >
      <planeGeometry args={[floorSize, floorSize]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        aoMap={aoMap}
        roughness={0.3}
        metalness={0.0}
        displacementScale={0.01}
        normalScale={new THREE.Vector2(0.3, 0.3)}
      />
    </mesh>
  );
};

// Gallery walls component
const GalleryWalls = ({ floorY }: { floorY: number }) => {
  const { base, albedo, normal, roughness, metallic, ao, height } =
    TEXTURE_PATHS.ROCK_WALL;

  const [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap] =
    useTexture([
      `${base}${albedo}`,
      `${base}${normal}`,
      `${base}${roughness}`,
      `${base}${metallic}`,
      `${base}${ao}`,
      `${base}${height}`,
    ]);

  // Window configuration
  const windowX = -9.8;
  const windowY = -0.3;
  const windowZ = -8.5;
  const windowScale = 0.9;
  const windowRotationY = Math.PI / 2;
  const windowWidth = 2.5;
  const windowHeight = 2.0;

  // Wall sections configuration
  const upperSectionOffsetY = -0.9;
  const upperSectionWidth = 3.1;
  const upperSectionHeight = 1;
  const rightSectionOffsetX = -10;
  const rightSectionOffsetZ = 0.3;
  const rightSectionVisible = true;
  const upperSectionVisible = true;

  // Central wall configuration
  const centralWallX = 0.1;
  const centralWallY = 2.9;
  const centralWallZ = -0.4;
  const centralWallWidth = 10;
  const centralWallHeight = 9.2;
  const centralWallDepth = 0.3;
  const wallMaterial = (
    <meshStandardMaterial
      map={albedoMap}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      metalnessMap={metallicMap}
      aoMap={aoMap}
      displacementMap={heightMap}
      displacementScale={0.02}
      normalScale={new THREE.Vector2(0.5, 0.5)}
      transparent={false}
      alphaTest={0.1}
    />
  );

  const wallHeight = 10;
  const wallLength = 20;
  const wallCenterY = 2.5;
  const wallZ = 0;
  const wallBottom = wallCenterY - wallHeight / 2;
  const wallTop = wallCenterY + wallHeight / 2;

  const windowCenterZ = windowZ;
  const windowBottom = windowY;
  const windowTop = windowY + windowHeight;
  const windowLeft = windowCenterZ - windowWidth / 2;
  const windowRight = windowCenterZ + windowWidth / 2;

  const wallStartZ = -10;
  const wallEndZ = 10;

  const leftSectionLength = Math.max(0, windowLeft - wallStartZ);
  const rightSectionLength = Math.max(0, wallEndZ - windowRight);
  const bottomSectionHeight = Math.max(0, windowBottom - wallBottom);
  const topSectionHeight = Math.max(0, wallTop - windowTop);

  const upperSectionMaterial = React.useMemo(() => {
    const upperAlbedo = albedoMap?.clone();
    const upperNormal = normalMap?.clone();
    const upperRoughness = roughnessMap?.clone();
    const upperMetallic = metallicMap?.clone();
    const upperAo = aoMap?.clone();
    const upperHeight = heightMap?.clone();

    [
      upperAlbedo,
      upperNormal,
      upperRoughness,
      upperMetallic,
      upperAo,
      upperHeight,
    ].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        const sectionWidth = upperSectionWidth;
        const sectionHeight = topSectionHeight + upperSectionHeight;

        const baseRepeatX = 4;
        const baseRepeatY = 2;
        const standardWidth = 20;
        const standardHeight = 10;

        const repeatX = Math.max(
          0.5,
          (sectionWidth / standardWidth) * baseRepeatX
        );
        const repeatY = Math.max(
          0.5,
          (sectionHeight / standardHeight) * baseRepeatY
        );

        map.repeat.set(repeatX, repeatY);
        map.needsUpdate = true;
      }
    });

    return (
      <meshStandardMaterial
        map={upperAlbedo}
        normalMap={upperNormal}
        roughnessMap={upperRoughness}
        metalnessMap={upperMetallic}
        aoMap={upperAo}
        displacementMap={upperHeight}
        displacementScale={0.02}
        normalScale={new THREE.Vector2(0.5, 0.5)}
        transparent={false}
        alphaTest={0.1}
      />
    );
  }, [
    albedoMap,
    normalMap,
    roughnessMap,
    metallicMap,
    aoMap,
    heightMap,
    upperSectionWidth,
    topSectionHeight,
    upperSectionHeight,
  ]);

  React.useEffect(() => {
    [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap].forEach(
      (map) => {
        if (map) {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(4, 2); // Ajustado para las paredes
          map.minFilter = THREE.LinearMipmapLinearFilter;
          map.magFilter = THREE.LinearFilter;
          map.needsUpdate = true;
        }
      }
    );
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap]);

  return (
    <group>
      <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      <group>
        {upperSectionVisible && topSectionHeight > 0.05 && (
          <mesh
            position={[
              -10,
              windowTop +
                (topSectionHeight + upperSectionHeight) / 2 +
                upperSectionOffsetY,
              windowCenterZ,
            ]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
            castShadow
          >
            <planeGeometry
              args={[upperSectionWidth, topSectionHeight + upperSectionHeight]}
            />
            {upperSectionMaterial}
          </mesh>
        )}

        {rightSectionVisible && rightSectionLength > 0.05 && (
          <mesh
            position={[
              rightSectionOffsetX,
              wallCenterY,
              windowRight + rightSectionLength / 2 + rightSectionOffsetZ,
            ]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
            castShadow
          >
            <planeGeometry args={[rightSectionLength, wallHeight]} />
            {wallMaterial}
          </mesh>
        )}
      </group>

      <Window
        position={[windowX, windowY, windowZ]}
        rotation={[0, windowRotationY, 0]}
        scale={[windowScale, windowScale, windowScale]}
      />

      <WindowView />

      <mesh
        position={[10, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      <mesh
        position={[0, 2.5, 10]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      <mesh
        position={[centralWallX, centralWallY, centralWallZ]}
        rotation={[0, 0, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[centralWallWidth, centralWallHeight, centralWallDepth]}
        />
        <meshStandardMaterial
          map={albedoMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          metalnessMap={metallicMap}
          aoMap={aoMap}
          displacementMap={heightMap}
          displacementScale={0.02}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          transparent={false}
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Ceiling component with bamboo texture
const Ceiling = ({ ceilingSize }: { ceilingSize: number }) => {
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,
    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  React.useEffect(() => {
    [albedoMap, normalMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(ceilingSize * 0.16, ceilingSize * 0.16);
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, aoMap, ceilingSize]);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7.5, 0]} receiveShadow>
      <planeGeometry args={[ceilingSize, ceilingSize]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        aoMap={aoMap}
        roughness={0.9}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Gallery lighting system
const GalleryLights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[7, 5, 7]} intensity={0.4} />
      <pointLight position={[-7, 5, -7]} intensity={0.4} color="#f0e6ff" />
      <directionalLight
        position={[5, 10, 7.5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
};

// Gallery furniture components

// Benches component
const GalleryBenches = ({ floorY }: { floorY: number }) => {
  return (
    <>
      <MetalBench position={[-3, floorY, 3]} rotation={[0, Math.PI / 4, 0]} />
      <MetalBench position={[3, floorY, 3]} rotation={[0, -Math.PI / 4, 0]} />
    </>
  );
};

// Componente para las plantas decorativas
const GalleryPlants = ({ floorY }: { floorY: number }) => {
  const plant1X = -2.0;
  const plant1Y = -1.5;
  const plant1Z = 0.1;
  const plant1Scale = 3.6;
  const plant1RotationY = 1.0;

  const plant3X = 2.8;
  const plant3Y = -1.5;
  const plant3Z = 0.9;
  const plant3Scale = 1.8;
  const plant3RotationY = 4.8;

  return (
    <>
      <Plant1
        position={[plant1X, plant1Y, plant1Z]}
        rotation={[0, plant1RotationY, 0]}
        scale={[plant1Scale, plant1Scale, plant1Scale]}
      />

      <Plant2
        position={[-2.8, floorY, 3.8]}
        rotation={[0, -Math.PI / 6, 0]}
        scale={[2.2, 2.2, 2.2]}
      />

      <Plant3
        position={[plant3X, plant3Y, plant3Z]}
        rotation={[0, plant3RotationY, 0]}
        scale={[plant3Scale, plant3Scale, plant3Scale]}
      />

      <Plant4
        position={[2.5, floorY, 4.5]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1.1, 1.1, 1.1]}
      />
    </>
  );
};

const CeilingFixtures = () => {
  // Central lamp (Lamp 2)
  const centralLampX = -6.6;
  const centralLampY = 4.4;
  const centralLampZ = -6.6;
  const centralLightY = 5.1;
  const centralIntensity = 8.3;
  const centralAngle = 1.5;
  const centralScale = 2.1;

  // Main lamp
  const mainLampX = 0;
  const mainLampY = 6.5;
  const mainLampZ = 6.3;
  const mainLightY = 5.8;
  const mainIntensity = 3.5;
  const mainAngle = 0.6;

  // Side lamps
  const leftLampX = -4;
  const leftLampY = 6.5;
  const leftLampZ = -4;
  const leftLightY = 5.9;
  const leftIntensity = 2.5;
  const leftAngle = 0.5;

  const rightLampX = 4;
  const rightLampY = 6.5;
  const rightLampZ = -4;
  const rightLightY = 5.9;
  const rightIntensity = 2.5;
  const rightAngle = 0.5;

  const lightColor = "#fff8e1";

  return (
    <>
      <CeilingLamp2
        position={[centralLampX, centralLampY, centralLampZ]}
        rotation={[0, 0, 0]}
        scale={[centralScale, centralScale, centralScale]}
      />
      <spotLight
        position={[centralLampX, centralLightY, centralLampZ]}
        target-position={[centralLampX, -1.5, centralLampZ]}
        angle={centralAngle}
        penumbra={0.2}
        intensity={centralIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={15}
      />
      <pointLight
        position={[centralLampX, centralLampY - 0.5, centralLampZ]}
        intensity={centralIntensity * 0.4}
        color={lightColor}
        distance={12}
        decay={2}
      />

      <CeilingLamp
        position={[mainLampX, mainLampY, mainLampZ]}
        rotation={[0, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
      />
      <spotLight
        position={[mainLampX, mainLightY, mainLampZ]}
        target-position={[mainLampX, -1.5, mainLampZ]}
        angle={mainAngle}
        penumbra={0.3}
        intensity={mainIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={15}
      />

      <CeilingLamp
        position={[leftLampX, leftLampY, leftLampZ]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.9, 0.9, 0.9]}
      />
      <spotLight
        position={[leftLampX, leftLightY, leftLampZ]}
        target-position={[leftLampX, -1.5, leftLampZ]}
        angle={leftAngle}
        penumbra={0.4}
        intensity={leftIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <CeilingLamp
        position={[rightLampX, rightLampY, rightLampZ]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.9, 0.9, 0.9]}
      />
      <spotLight
        position={[rightLampX, rightLightY, rightLampZ]}
        target-position={[rightLampX, -1.5, rightLampZ]}
        angle={rightAngle}
        penumbra={0.4}
        intensity={rightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        position={[mainLampX, mainLampY - 0.5, mainLampZ]}
        intensity={mainIntensity * 0.3}
        color={lightColor}
        distance={8}
        decay={2}
      />
      <pointLight
        position={[leftLampX, leftLampY - 0.5, leftLampZ]}
        intensity={leftIntensity * 0.3}
        color={lightColor}
        distance={6}
        decay={2}
      />
      <pointLight
        position={[rightLampX, rightLampY - 0.5, rightLampZ]}
        intensity={rightIntensity * 0.3}
        color={lightColor}
        distance={6}
        decay={2}
      />
    </>
  );
};

// Player controller

// Hook for WASD keyboard and touch controls for mobile
const usePlayerControls = () => {
  const keys = useRef({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false, // Down in free camera
    KeyE: false, // Up in free camera
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code in keys.current) {
        keys.current[event.code as keyof typeof keys.current] = true;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code in keys.current) {
        keys.current[event.code as keyof typeof keys.current] = false;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return keys;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

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

const TouchControls = ({
  onMove,
}: {
  onMove: (direction: string, active: boolean) => void;
}) => {
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

// Touch camera controls for mobile
const TouchCameraControls = ({ camera }: { camera: THREE.Camera }) => {
  const isMobile = useIsMobile();
  const touchStateRef = useRef({
    isMoving: false,
    lastTouchX: 0,
    lastTouchY: 0,
    rotationX: 0,
    rotationY: 0,
  });

  useEffect(() => {
    if (!isMobile) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0];
        touchStateRef.current.isMoving = true;
        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && touchStateRef.current.isMoving) {
        event.preventDefault();
        const touch = event.touches[0];

        const deltaX = touch.clientX - touchStateRef.current.lastTouchX;
        const deltaY = touch.clientY - touchStateRef.current.lastTouchY;

        // Camera sensitivity
        const sensitivity = 0.003;

        // Update rotation
        touchStateRef.current.rotationY -= deltaX * sensitivity;
        touchStateRef.current.rotationX -= deltaY * sensitivity;

        // Limit vertical rotation
        touchStateRef.current.rotationX = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, touchStateRef.current.rotationX)
        );

        // Apply rotation to camera
        camera.rotation.order = "YXZ";
        camera.rotation.y = touchStateRef.current.rotationY;
        camera.rotation.x = touchStateRef.current.rotationX;

        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        touchStateRef.current.isMoving = false;
      }
    };

    // Add non-passive event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [camera, isMobile]);

  return null;
};

// Main component

interface Model3DViewerSceneProps {
  modelUrl: string;
  onBack: () => void;
}

export default function Model3DViewerScene({
  modelUrl,
  onBack,
}: Model3DViewerSceneProps) {
  // States for blur/opacity system
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [sceneBlur, setSceneBlur] = useState(8);
  const [assetsReady, setAssetsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Loading states
  const [showBlackHoleLoader, setShowBlackHoleLoader] = useState(true);
  const [realLoadingStarted, setRealLoadingStarted] = useState(false);
  const [loaderInitialized, setLoaderInitialized] = useState(false);

  // Pedestal configuration using centralized config
  const pedestalBaseDesiredY = floorY + PEDESTAL_CONFIG.baseOffset;
  const pedestalPosition: [number, number, number] = [
    0,
    pedestalBaseDesiredY,
    0,
  ];

  // Main model configuration
  const estimatedPedestalHeight =
    PEDESTAL_CONFIG.estimatedHeight * PEDESTAL_CONFIG.scale;
  const anceuModelBaseY = pedestalPosition[1] + estimatedPedestalHeight;
  const anceuModelGroupPosition: [number, number, number] = [
    0,
    anceuModelBaseY,
    0,
  ];

  // Leva controls for free camera
  const { freeCameraMode, cameraSpeed } = useControls("Camera Controls", {
    freeCameraMode: { value: false, label: "Cámara Libre" },
    cameraSpeed: {
      value: 5,
      min: 1,
      max: 20,
      step: 0.5,
      label: "Velocidad Cámara",
    },
  });

  // Leva controls for floor and ceiling size
  const { floorSize, ceilingSize } = useControls("Scene Size", {
    floorSize: { value: 20, min: 20, max: 200, step: 5, label: "Tamaño Suelo" },
    ceilingSize: {
      value: 20,
      min: 20,
      max: 200,
      step: 5,
      label: "Tamaño Techo",
    },
  });

  const [isPointerLockActive, setIsPointerLockActive] = useState(false);
  const touchControlsRef = useRef<any>();
  const isMobile = useIsMobile();

  // Pre-initialize loader after first render
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const initTimer = requestAnimationFrame(() => {
      setLoaderInitialized(true);
    });
    return () => cancelAnimationFrame(initTimer);
  }, []);

  // Hook for smooth progress (only start when loader is initialized)
  const {
    progress: smoothProgress,
    phase,
    setRealProgress,
  } = useSmoothProgress(loaderInitialized && showBlackHoleLoader, () => {
    // Cuando la animación artificial llegue al 95%, empezar carga real
    setRealLoadingStarted(true);
  });

  // Function to handle real loading progress
  const handleRealProgressUpdate = useCallback(
    (progress: number, loaded: number, total: number) => {
      setRealProgress(progress);

      // Complete when reaching 100% real
      if (progress >= 100 || (loaded === total && total > 0)) {
        setTimeout(() => {
          handleAssetsLoaded();
          setTimeout(() => {
            setShowBlackHoleLoader(false);
          }, 500);
        }, 500);
      }
    },
    [setRealProgress]
  );

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      handleAssetsLoaded();
      setTimeout(() => {
        setShowBlackHoleLoader(false);
      }, 500);
    }, 15000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  const handleAssetsLoaded = () => {
    setAssetsReady(true);
    setSceneOpacity(1);
    setSceneBlur(0);
    setTimeout(() => {
      setSceneReady(true);
    }, 1500);
  };

  useEffect(() => {
    if (!isMobile) {
      const handlePointerLockChange = () => {
        setIsPointerLockActive(document.pointerLockElement !== null);
      };
      document.addEventListener("pointerlockchange", handlePointerLockChange);
      return () => {
        document.removeEventListener(
          "pointerlockchange",
          handlePointerLockChange
        );
      };
    }
  }, [isMobile]);

  const handleCanvasClick = () => {
    if (!isMobile && sceneReady && assetsReady) {
      const canvasEl = document.querySelector("canvas");
      if (canvasEl && document.pointerLockElement === null) {
        try {
          (canvasEl as any).requestPointerLock?.();
        } catch (error) {
          // Pointer lock failed
        }
      }
    }
  };

  const handleBack = () => {
    try {
      if (!isMobile && document.pointerLockElement) {
        document.exitPointerLock();
      }
    } catch (error) {
      // Exit pointer lock failed
    }
    onBack();
  };

  const handleTouchMove = useCallback((direction: string, active: boolean) => {
    if (touchControlsRef.current) {
      touchControlsRef.current(direction, active);
    }
  }, []);

  // Optimizar callback de onComplete para evitar recreaciones
  const handleBlackHoleComplete = useCallback(() => {
    setShowBlackHoleLoader(false);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        position: "relative",
        cursor: !isMobile && isPointerLockActive ? "none" : "auto",
      }}
      onClick={handleCanvasClick}
    >
      {/* Precargar todos los modelos */}
      <ModelPreloader />

      {/* BlackHole Loader como overlay - optimizado para performance */}
      {showBlackHoleLoader && loaderInitialized && (
        <BlackHoleLoader
          progress={smoothProgress}
          onComplete={handleBlackHoleComplete}
        />
      )}

      {/* Escena principal con blur/opacidad */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: sceneOpacity,
          filter: `blur(${sceneBlur}px)`,
          transition: "opacity 1.5s ease-in-out, filter 1s ease-out",
        }}
      >
        <Canvas shadows dpr={[1, 1.5]}>
          <Preload all />
          <PerspectiveCamera makeDefault fov={60} position={[0, 0, 0]} />

          {/* Tracker de progreso de carga */}
          <LoadingProgressTracker
            onRealProgressUpdate={handleRealProgressUpdate}
            enabled={realLoadingStarted}
          />

          <PlayerControllerWithTouch
            floorY={floorY}
            freeCameraMode={freeCameraMode}
            cameraSpeed={cameraSpeed}
            sceneReady={sceneReady}
            onTouchControlsRef={(ref: any) => {
              touchControlsRef.current = ref;
            }}
          />

          {/* Iluminación */}
          <GalleryLights />

          {/* Estructura de la galería */}
          <GalleryWalls floorY={floorY} />
          <Floor floorSize={floorSize} />
          <Ceiling ceilingSize={ceilingSize} />
          {/* Mobiliario */}
          <GalleryBenches floorY={floorY} />
          <GalleryPlants floorY={floorY} />
          <CeilingFixtures />

          {/* Suspense con fallback compatible con Three.js */}
          <React.Suspense
            fallback={<EmptyFallback onLoaded={handleAssetsLoaded} />}
          >
            <group position={anceuModelGroupPosition}>
              <Model3DComponent url={modelUrl} />
            </group>
            <Environment preset="sunset" />
          </React.Suspense>
        </Canvas>
      </div>

      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Back to Gallery
      </button>

      {/* Information panel - navigation controls only */}
      {(!isPointerLockActive || isMobile) && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "20px",
            color: "white",
            background: "rgba(0,0,0,0.7)",
            padding: "15px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "auto",
            fontSize: "14px",
            lineHeight: "1.4",
            zIndex: 1000,
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <strong>🎮 Navigation Controls:</strong>
          </div>
          {!isMobile ? (
            <>
              <div style={{ marginBottom: "12px" }}>
                <strong>PC:</strong>{" "}
                {sceneReady && assetsReady
                  ? "Click on the scene to activate controls."
                  : "Waiting for scene to load..."}
                Use WASD to move and mouse to look around. Press ESC to release.
              </div>
              {freeCameraMode && (
                <div style={{ marginBottom: "12px", color: "#90EE90" }}>
                  <strong>🚁 Cámara Libre:</strong> Q/E para bajar/subir. Sin
                  límites de movimiento.
                </div>
              )}
            </>
          ) : (
            <div>
              <strong>Mobile:</strong> Use the touch buttons in the bottom right
              corner to move. Touch and drag on the screen to look around.
            </div>
          )}
        </div>
      )}

      {/* Touch controls for mobile */}
      <TouchControls onMove={handleTouchMove} />
    </div>
  );
}

// Componente PlayerController actualizado para distinguir entre PC y móvil
const PlayerControllerWithTouch = ({
  floorY,
  freeCameraMode,
  cameraSpeed,
  sceneReady,
  onTouchControlsRef,
}: {
  floorY: number;
  freeCameraMode: boolean;
  cameraSpeed: number;
  sceneReady: boolean;
  onTouchControlsRef: (ref: any) => void;
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const playerVelocity = useRef(new THREE.Vector3());
  const keys = usePlayerControls();
  const isMobile = useIsMobile();
  const touchControls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Function to handle touch controls
  const handleTouchMove = (direction: string, active: boolean) => {
    switch (direction) {
      case "forward":
        touchControls.current.forward = active;
        break;
      case "backward":
        touchControls.current.backward = active;
        break;
      case "left":
        touchControls.current.left = active;
        break;
      case "right":
        touchControls.current.right = active;
        break;
    }
  };

  // Pass function reference to parent component
  useEffect(() => {
    onTouchControlsRef(handleTouchMove);
  }, [onTouchControlsRef]);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 5);
    camera.lookAt(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 0);

    if (!isMobile && controlsRef.current) {
      try {
        // Don't auto-lock, wait for user click
      } catch (error) {
        // Pointer lock initialization failed
      }
    }
  }, [camera, floorY, isMobile]);

  useFrame((state, delta) => {
    // For mobile, don't use PointerLockControls
    if (isMobile || !controlsRef.current) {
      // Allow movement without lock on mobile
      if (!isMobile) {
        playerVelocity.current.set(0, 0, 0);
        return;
      }
    } else if (!isMobile && !controlsRef.current.isLocked) {
      // On PC, only allow movement if locked
      playerVelocity.current.set(0, 0, 0);
      return;
    }

    // Use custom speed if in free camera mode
    const speedDelta = delta * (freeCameraMode ? cameraSpeed : PLAYER_SPEED);
    const moveDirection = new THREE.Vector3();

    // Keyboard controls (PC)
    if (!isMobile) {
      if (keys.current.KeyW) moveDirection.z = -1;
      if (keys.current.KeyS) moveDirection.z = 1;
      if (keys.current.KeyA) moveDirection.x = -1;
      if (keys.current.KeyD) moveDirection.x = 1;

      // Height controls for free camera
      if (freeCameraMode) {
        if (keys.current.KeyQ) moveDirection.y = -1; // Down
        if (keys.current.KeyE) moveDirection.y = 1; // Up
      }
    }

    // Touch controls (mobile)
    if (isMobile) {
      if (touchControls.current.forward) moveDirection.z = -1;
      if (touchControls.current.backward) moveDirection.z = 1;
      if (touchControls.current.left) moveDirection.x = -1;
      if (touchControls.current.right) moveDirection.x = 1;
    }

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      moveDirection.applyQuaternion(camera.quaternion);

      const newPosition = camera.position.clone();
      newPosition.addScaledVector(moveDirection, speedDelta);

      if (freeCameraMode) {
        // Free camera mode: no height restrictions or room limits
        camera.position.copy(newPosition);
      } else {
        // Normal mode: maintain fixed height and apply collision limits
        newPosition.y = floorY + CAMERA_HEIGHT_ABOVE_FLOOR;
        newPosition.x = Math.max(
          ROOM_BOUNDS.minX,
          Math.min(ROOM_BOUNDS.maxX, newPosition.x)
        );
        newPosition.z = Math.max(
          ROOM_BOUNDS.minZ,
          Math.min(ROOM_BOUNDS.maxZ, newPosition.z)
        );
        camera.position.copy(newPosition);
      }
    }
  });

  return (
    <>
      {!isMobile && (
        <PointerLockControls ref={controlsRef} args={[camera, gl.domElement]} />
      )}

      {isMobile && <TouchCameraControls camera={camera} />}
    </>
  );
};
