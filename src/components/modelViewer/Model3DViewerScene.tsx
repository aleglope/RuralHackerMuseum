"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  Environment,
  PerspectiveCamera,
  useTexture,
  Html,
} from "@react-three/drei";
import Model3DComponent from "./Model3DComponent";
import { PedestalModel } from "./PedestalModel"; // Main artwork pedestal
import * as THREE from "three";

// Camera and player movement settings
const CAMERA_HEIGHT_ABOVE_FLOOR = 1.7; // Camera Y position, simulating eye level
const PLAYER_SPEED = 5.0; // Player movement speed
const PLAYER_RADIUS = 0.5; // Player's approximate radius for basic collision

// Room boundaries for collision detection
// Based on wall positions: X from -10 to 10, Z from -10 to 10.
const ROOM_BOUNDS = {
  minX: -10 + PLAYER_RADIUS,
  maxX: 10 - PLAYER_RADIUS,
  minZ: -10 + PLAYER_RADIUS,
  maxZ: 10 - PLAYER_RADIUS,
};

// Gallery floor component with textures
const Floor = () => {
  const [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap] =
    useTexture([
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_albedo.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_normal-dx.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_roughness.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_metallic.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_ao.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_height.png",
    ]);

  React.useEffect(() => {
    [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap].forEach(
      (map) => {
        if (map) {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(12, 12);
          map.needsUpdate = true;
        }
      }
    );
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        metalnessMap={metallicMap}
        aoMap={aoMap}
        displacementMap={heightMap}
        displacementScale={0.02}
        normalScale={new THREE.Vector2(0.5, 0.5)}
      />
    </mesh>
  );
};

// Gallery walls component with textures
const GalleryWalls = () => {
  const [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap] =
    useTexture([
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_albedo.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_normal-dx.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_roughness.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_metallic.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_ao.png",
      "/textures/rock-wall-mortar-ue/rock-wall-mortar_height.png",
    ]);

  React.useEffect(() => {
    [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap].forEach(
      (map) => {
        if (map) {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(4, 2);
          map.needsUpdate = true;
        }
      }
    );
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap]);

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
    />
  );

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-10, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Right wall */}
      <mesh
        position={[10, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Front wall */}
      <mesh
        position={[0, 2.5, 10]}
        rotation={[0, Math.PI, 0]} // Rotate to face inward (normal pointing to -Z)
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>
    </group>
  );
};

// Gallery ceiling component with bamboo textures
const Ceiling = () => {
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, roughnessMap, metallicMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,
    `${texturePathBase}bamboo-wood-semigloss-roughness.png`,
    `${texturePathBase}bamboo-wood-semigloss-metal.png`,
    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  React.useEffect(() => {
    [albedoMap, normalMap, roughnessMap, metallicMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 8); // Texture repeat for ceiling
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap]);

  return (
    <mesh
      rotation={[Math.PI / 2, 0, 0]} // Rotate to face downwards
      position={[0, 7.5, 0]} // Position at wall top height
      receiveShadow // Ceiling can receive shadows
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        metalness={0.05} // Low metalness for wood
        aoMap={aoMap}
        normalScale={new THREE.Vector2(0.8, 0.8)} // Adjust normal map intensity if needed
        side={THREE.DoubleSide} // Render both sides just in case
      />
    </mesh>
  );
};

const GalleryLights = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[7, 5, 7]} intensity={0.7} />
      <pointLight position={[-7, 5, -7]} intensity={0.7} color="#f0e6ff" />
      <directionalLight
        position={[5, 10, 7.5]}
        intensity={0.8}
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

// Hook for WASD keyboard input
const usePlayerControls = () => {
  const keys = useRef({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
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

// Handles camera and player movement logic
const PlayerController = ({ floorY }: { floorY: number }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(); // Ref for PointerLockControls instance
  const playerVelocity = useRef(new THREE.Vector3());
  // const playerOnFloor = useRef(true); // Not currently used, but could be for jumping later
  const keys = usePlayerControls();

  // Set initial camera position and orientation
  useEffect(() => {
    camera.position.set(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 5); // Start at Z=5, looking towards origin
    camera.lookAt(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 0); // Look forward
    if (controlsRef.current) {
      // This is a trick to apply the initial lookAt to PointerLockControls
      controlsRef.current.lock();
      setTimeout(() => controlsRef.current.unlock(), 0);
    }
  }, [camera, floorY]);

  useFrame((state, delta) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) {
      playerVelocity.current.set(0, 0, 0); // Stop movement if pointer isn't locked
      return;
    }

    const speedDelta = delta * PLAYER_SPEED;
    const moveDirection = new THREE.Vector3();

    if (keys.current.KeyW) {
      moveDirection.z = -1;
    }
    if (keys.current.KeyS) {
      moveDirection.z = 1;
    }
    if (keys.current.KeyA) {
      moveDirection.x = -1;
    }
    if (keys.current.KeyD) {
      moveDirection.x = 1;
    }

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize(); // Ensure consistent speed in all directions

      // Apply camera's quaternion to the movement vector to move relative to view
      moveDirection.applyQuaternion(camera.quaternion);

      const newPosition = camera.position.clone();
      newPosition.addScaledVector(moveDirection, speedDelta);

      // Keep camera at fixed height and apply XZ boundary collisions
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
  });

  return (
    <PointerLockControls ref={controlsRef} args={[camera, gl.domElement]} />
  );
};

interface Model3DViewerSceneProps {
  modelUrl: string;
  onBack: () => void;
}

export default function Model3DViewerScene({
  modelUrl,
  onBack,
}: Model3DViewerSceneProps) {
  const floorY = -1.5; // Y position of the floor plane

  // --- Pedestal Configuration ---
  const pedestalScale = 0.6; // Scale factor for the pedestal model
  // Assuming pedestal GLTF origin is at its base after its internal scaling.
  // Position the pedestal base slightly above the floor to prevent z-fighting.
  const pedestalBaseDesiredY = floorY + 0.05; // Elevate slightly from the floor
  const pedestalPosition: [number, number, number] = [
    0,
    pedestalBaseDesiredY,
    0,
  ];

  // Estimated height of the scaled pedestal. Used to position the Anceu model on top.
  // (Original_max_y - Original_min_y) * pedestalScale = (0.7637 - (-0.5535)) * 0.6 = 1.3172 * 0.6 = ~0.79
  const estimatedPedestalHeight = 1.3172 * pedestalScale;

  // --- Anceu Model (Model3DComponent) Configuration ---
  // The Anceu model has its own internal transformations.
  // This positions its wrapping group so the model sits on top of the pedestal.
  const anceuModelBaseY = pedestalPosition[1] + estimatedPedestalHeight;
  const anceuModelGroupPosition: [number, number, number] = [
    0,
    anceuModelBaseY,
    0,
  ];

  const [isPointerLockActive, setIsPointerLockActive] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleCanvasClick = () => {
    // Pointer lock is managed by PlayerController/PointerLockControls.
    // This click listener is a fallback to ensure canvas focus or initiate lock if needed.
    const canvasEl = document.querySelector("canvas"); // Assuming only one canvas
    if (canvasEl && document.pointerLockElement === null) {
      (canvasEl as any).requestPointerLock?.();
    }
  };

  const handleBack = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    onBack();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        position: "relative",
        cursor: isPointerLockActive ? "none" : "auto", // Hide cursor when pointer is locked
      }}
      onClick={handleCanvasClick} // Attempt to lock pointer on container click
    >
      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault fov={60} position={[0, 0, 0]} />{" "}
        {/* Camera position is managed by PlayerController */}
        <PlayerController floorY={floorY} />
        <GalleryLights />
        <GalleryWalls />
        <Floor /> {/* Floor Y position: -1.5 */}
        <Ceiling /> {/* Add ceiling */}
        <PedestalModel position={pedestalPosition} modelScale={pedestalScale} />
        <React.Suspense fallback={null}>
          <group position={anceuModelGroupPosition}>
            <Model3DComponent url={modelUrl} />
          </group>
          <Environment preset="sunset" />
        </React.Suspense>
        {!isPointerLockActive && (
          <Html center>
            <div
              style={{
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              Haz clic en la escena para activar los controles. Presiona ESC
              para liberar.
            </div>
          </Html>
        )}
      </Canvas>
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
        Volver a la Galería
      </button>
    </div>
  );
}
