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
import { PedestalModel } from "./PedestalModel";
import { MetalBench } from "../museum/Bench";
import { CeilingLamp } from "../museum/CeilingLamp";
import * as THREE from "three";

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

// Configuración de cámara y movimiento del jugador
const CAMERA_HEIGHT_ABOVE_FLOOR = 1.7; // Altura de la cámara, simulando altura de ojos
const PLAYER_SPEED = 5.0; // Velocidad de movimiento del jugador
const PLAYER_RADIUS = 0.5; // Radio aproximado del jugador para colisiones básicas

// Límites de la sala para detección de colisiones
// Basado en posiciones de paredes: X de -10 a 10, Z de -10 a 10
const ROOM_BOUNDS = {
  minX: -10 + PLAYER_RADIUS,
  maxX: 10 - PLAYER_RADIUS,
  minZ: -10 + PLAYER_RADIUS,
  maxZ: 10 - PLAYER_RADIUS,
};

// ============================================================================
// COMPONENTES DE LA GALERÍA - ESTRUCTURA
// ============================================================================

// Componente del suelo de la galería con texturas
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

// Componente de las paredes de la galería
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
      {/* Pared trasera */}
      <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Pared izquierda */}
      <mesh
        position={[-10, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Pared derecha */}
      <mesh
        position={[10, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Pared frontal */}
      <mesh
        position={[0, 2.5, 10]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>
    </group>
  );
};

// Componente del techo con texturas de bambú
const Ceiling = () => {
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, roughnessMap, metallicMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,

    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  React.useEffect(() => {
    [albedoMap, normalMap, roughnessMap, metallicMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 8);
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap]);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={albedoMap}
        roughness={0.9}
        metalness={0.0}
        aoMap={aoMap}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Sistema de iluminación de la galería
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

// ============================================================================
// COMPONENTES DE MOBILIARIO
// ============================================================================

// Componente para los bancos
const GalleryBenches = ({ floorY }: { floorY: number }) => {
  return (
    <>
      {/* Banco 1 - A la izquierda del modelo central */}
      <MetalBench position={[-3, floorY, 3]} rotation={[0, Math.PI / 4, 0]} />

      {/* Banco 2 - A la derecha del modelo central */}
      <MetalBench position={[3, floorY, 3]} rotation={[0, -Math.PI / 4, 0]} />
    </>
  );
};

// Componente para las lámparas del techo
const CeilingFixtures = () => {
  return (
    <>
      {/* Lámpara principal sobre el modelo central */}
      <CeilingLamp
        position={[0, 6.5, 0]}
        rotation={[0, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
      />

      {/* Lámparas adicionales para iluminación general */}
      <CeilingLamp
        position={[-4, 6.5, -4]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.9, 0.9, 0.9]}
      />

      <CeilingLamp
        position={[4, 6.5, -4]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.9, 0.9, 0.9]}
      />
    </>
  );
};

// ============================================================================
// CONTROLADOR DEL JUGADOR
// ============================================================================

// Hook para el control del teclado WASD
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

// Controlador de movimiento del jugador
const PlayerController = ({ floorY }: { floorY: number }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const playerVelocity = useRef(new THREE.Vector3());
  const keys = usePlayerControls();

  // Establecer posición inicial de la cámara
  useEffect(() => {
    camera.position.set(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 5);
    camera.lookAt(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 0);
    if (controlsRef.current) {
      controlsRef.current.lock();
      setTimeout(() => controlsRef.current.unlock(), 0);
    }
  }, [camera, floorY]);

  useFrame((state, delta) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) {
      playerVelocity.current.set(0, 0, 0);
      return;
    }

    const speedDelta = delta * PLAYER_SPEED;
    const moveDirection = new THREE.Vector3();

    if (keys.current.KeyW) moveDirection.z = -1;
    if (keys.current.KeyS) moveDirection.z = 1;
    if (keys.current.KeyA) moveDirection.x = -1;
    if (keys.current.KeyD) moveDirection.x = 1;

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      moveDirection.applyQuaternion(camera.quaternion);

      const newPosition = camera.position.clone();
      newPosition.addScaledVector(moveDirection, speedDelta);

      // Mantener altura fija y aplicar límites de colisión
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface Model3DViewerSceneProps {
  modelUrl: string;
  onBack: () => void;
}

export default function Model3DViewerScene({
  modelUrl,
  onBack,
}: Model3DViewerSceneProps) {
  const floorY = -1.5;

  // Configuración del pedestal
  const pedestalScale = 0.6;
  const pedestalBaseDesiredY = floorY + 0.05;
  const pedestalPosition: [number, number, number] = [
    0,
    pedestalBaseDesiredY,
    0,
  ];

  // Configuración del modelo principal
  const estimatedPedestalHeight = 1.3172 * pedestalScale;
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
    const canvasEl = document.querySelector("canvas");
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
        cursor: isPointerLockActive ? "none" : "auto",
      }}
      onClick={handleCanvasClick}
    >
      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault fov={60} position={[0, 0, 0]} />
        <PlayerController floorY={floorY} />

        {/* Iluminación */}
        <GalleryLights />

        {/* Estructura de la galería */}
        <GalleryWalls />
        <Floor />
        <Ceiling />

        {/* Modelo principal con pedestal */}
        <PedestalModel position={pedestalPosition} modelScale={pedestalScale} />

        {/* Mobiliario */}
        <GalleryBenches floorY={floorY} />
        <CeilingFixtures />

        <React.Suspense fallback={null}>
          <group position={anceuModelGroupPosition}>
            <Model3DComponent url={modelUrl} />
          </group>
          <Environment preset="sunset" />
        </React.Suspense>

        {/* Mensaje de instrucciones */}
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

      {/* Botón de retorno */}
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
