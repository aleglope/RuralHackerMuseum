import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  Environment,
  PerspectiveCamera,
  useTexture,
  Html,
  useHelper,
} from "@react-three/drei";
import Model3DComponent from "./Model3DComponent";
import { PedestalModel } from "./PedestalModel";
import { MetalBench } from "../museum/Bench";
import {
  CeilingLamp,
  CeilingLamp2,
  Plant1,
  Plant2,
  Plant3,
  Plant4,
  Window,
} from "../museum/models";
import { ModelPreloader } from "../shared/ModelPreloader";
import {
  MUSEUM_SCENE_CONFIG,
  PEDESTAL_CONFIG,
  TEXTURE_PATHS,
} from "../../config/scene";
import * as THREE from "three";

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

const {
  floorY,
  cameraHeight: CAMERA_HEIGHT_ABOVE_FLOOR,
  playerSpeed: PLAYER_SPEED,
  playerRadius: PLAYER_RADIUS,
  roomBounds: ROOM_BOUNDS,
} = MUSEUM_SCENE_CONFIG;

// ============================================================================
// COMPONENTES DE LA GALERÍA - ESTRUCTURA
// ============================================================================

// Componente del suelo de la galería con texturas de bambú
const Floor = () => {
  // Usando la textura de bambú con brillo que estaba en el techo
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,
    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  // Textura de piedra original del suelo (comentada)
  /*
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
  */

  React.useEffect(() => {
    [albedoMap, normalMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(12, 12); // Aumentado para mejor detalle en el suelo
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.magFilter = THREE.LinearFilter;
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, aoMap]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, floorY, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        aoMap={aoMap}
        roughness={0.3} // Menos rugoso para más brillo
        metalness={0.0}
        displacementScale={0.01}
        normalScale={new THREE.Vector2(0.3, 0.3)}
      />
    </mesh>
  );
};

// Componente de las paredes de la galería
const GalleryWalls = ({ floorY }: { floorY: number }) => {
  // Usando la textura de piedra completa que estaba en el techo
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

  // Valores fijos para la ventana
  const windowX = -9.8;
  const windowY = -0.3;
  const windowZ = -8.5;
  const windowScale = 0.9;
  const windowRotationY = Math.PI / 2;
  const windowWidth = 2.5;
  const windowHeight = 2.0;

  // Valores fijos para las secciones de pared
  const upperSectionOffsetY = -0.9;
  const upperSectionWidth = 3.1;
  const upperSectionHeight = 1;
  const rightSectionOffsetX = -10;
  const rightSectionOffsetZ = 0.3;
  const rightSectionVisible = true;
  const upperSectionVisible = true;

  // Valores fijos definitivos para la pared central (posición y dimensiones exactas)
  const centralWallX = 0.1;
  const centralWallY = 2.9;
  const centralWallZ = -0.4; // Valor exacto para evitar interferencia con el modelo
  const centralWallWidth = 10;
  const centralWallHeight = 9.2;
  const centralWallDepth = 0.3; // Grosor de la pared para darle volumen

  // Material estándar para paredes (con textura completa de piedra)
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

  // Valores fijos para la estructura de la pared (no cambiarán)
  const wallHeight = 10;
  const wallLength = 20;
  const wallCenterY = 2.5;
  const wallZ = 0;
  const wallBottom = wallCenterY - wallHeight / 2; // -2.5
  const wallTop = wallCenterY + wallHeight / 2; // 7.5

  // Posición fija de la ventana (basada en valores que funcionan)
  const windowCenterZ = windowZ;
  const windowBottom = windowY;
  const windowTop = windowY + windowHeight;
  const windowLeft = windowCenterZ - windowWidth / 2;
  const windowRight = windowCenterZ + windowWidth / 2;

  // Coordenadas fijas de la pared
  const wallStartZ = -10;
  const wallEndZ = 10;

  // Cálculos fijos de las secciones
  const leftSectionLength = Math.max(0, windowLeft - wallStartZ);
  const rightSectionLength = Math.max(0, wallEndZ - windowRight);
  const bottomSectionHeight = Math.max(0, windowBottom - wallBottom);
  const topSectionHeight = Math.max(0, wallTop - windowTop);

  // Material específico para la sección superior (evita estiramiento)
  const upperSectionMaterial = React.useMemo(() => {
    // Crear texturas clonadas para la sección superior
    const upperAlbedo = albedoMap?.clone();
    const upperNormal = normalMap?.clone();
    const upperRoughness = roughnessMap?.clone();
    const upperMetallic = metallicMap?.clone();
    const upperAo = aoMap?.clone();
    const upperHeight = heightMap?.clone();

    // Calcular repeat proporcional pero ajustado para consistencia
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
        // Calcular repeat proporcional al tamaño real para evitar estiramiento
        const sectionWidth = upperSectionWidth;
        const sectionHeight = topSectionHeight + upperSectionHeight;

        // Usar el mismo factor de escala que las paredes estándar
        const baseRepeatX = 4; // Repeat base de las paredes
        const baseRepeatY = 2; // Repeat base de las paredes
        const standardWidth = 20; // Ancho estándar de pared
        const standardHeight = 10; // Alto estándar de pared

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
      {/* Pared trasera */}
      <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Pared izquierda con hueco para ventana */}
      <group>
        {/* Sección superior de la pared izquierda (encima de la ventana) */}
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

        {/* Sección derecha de la pared (después de la ventana) */}
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

      {/* Ventana en pared izquierda (posición fija) */}
      <Window
        position={[windowX, windowY, windowZ]}
        rotation={[0, windowRotationY, 0]}
        scale={[windowScale, windowScale, windowScale]}
      />

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

      {/* Pared central detrás del modelo principal - CON GROSOR Y TEXTURA EN AMBAS CARAS */}
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
          side={THREE.DoubleSide} // Renderizar ambas caras
        />
      </mesh>
    </group>
  );
};

// Componente del techo con textura de bambú sin brillo
const Ceiling = () => {
  // Usando la misma textura de bambú que el suelo pero sin brillo
  const texturePathBase =
    "/textures/rock-wall-mortar-ue/bamboo-wood-semigloss-bl/";
  const [albedoMap, normalMap, aoMap] = useTexture([
    `${texturePathBase}bamboo-wood-semigloss-albedo.png`,
    `${texturePathBase}bamboo-wood-semigloss-normal.png`,
    `${texturePathBase}bamboo-wood-semigloss-ao.png`,
  ]);

  // Textura de piedra anterior (comentada)
  /*
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
  */

  React.useEffect(() => {
    [albedoMap, normalMap, aoMap].forEach((map) => {
      if (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(8, 8); // Ajustado para el techo
        map.needsUpdate = true;
      }
    });
  }, [albedoMap, normalMap, aoMap]);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        map={albedoMap}
        normalMap={normalMap}
        aoMap={aoMap}
        roughness={0.9} // Muy rugoso para eliminar el brillo
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Sistema de iluminación de la galería
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

// Componente para las plantas decorativas
const GalleryPlants = ({ floorY }: { floorY: number }) => {
  // Valores fijos exactos para las plantas del modelo principal
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
      {/* Planta 1 - Al lado IZQUIERDO del modelo principal */}
      <Plant1
        position={[plant1X, plant1Y, plant1Z]}
        rotation={[0, plant1RotationY, 0]}
        scale={[plant1Scale, plant1Scale, plant1Scale]}
      />

      {/* Planta 2 - Al lado del Banco 1 (izquierda, atrás) - GRANDE */}
      <Plant2
        position={[-2.8, floorY, 3.8]}
        rotation={[0, -Math.PI / 6, 0]}
        scale={[2.2, 2.2, 2.2]}
      />

      {/* Planta 3 - Al lado DERECHO del modelo principal */}
      <Plant3
        position={[plant3X, plant3Y, plant3Z]}
        rotation={[0, plant3RotationY, 0]}
        scale={[plant3Scale, plant3Scale, plant3Scale]}
      />

      {/* Planta 4 - Al lado del Banco 2 (derecha, atrás) */}
      <Plant4
        position={[2.5, floorY, 4.5]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1.1, 1.1, 1.1]}
      />
    </>
  );
};

// Componente para las lámparas del techo
const CeilingFixtures = () => {
  // Valores fijos para las lámparas (sin controles Leva)
  // Lámpara Central (Lámpara 2)
  const centralLampX = -6.6;
  const centralLampY = 4.4;
  const centralLampZ = -6.6;
  const centralLightY = 5.1;
  const centralIntensity = 8.3;
  const centralAngle = 1.5;
  const centralScale = 2.1;

  // Lámpara Principal
  const mainLampX = 0;
  const mainLampY = 6.5;
  const mainLampZ = 6.3;
  const mainLightY = 5.8;
  const mainIntensity = 3.5;
  const mainAngle = 0.6;

  // Lámparas Laterales
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

  // Color general
  const lightColor = "#fff8e1";

  return (
    <>
      {/* Lámpara central principal - Lámpara 2 (controlable) */}
      <CeilingLamp2
        position={[centralLampX, centralLampY, centralLampZ]}
        rotation={[0, 0, 0]}
        scale={[centralScale, centralScale, centralScale]}
      />
      {/* Luz de la lámpara central */}
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
      {/* Luz ambiente adicional de la lámpara central */}
      <pointLight
        position={[centralLampX, centralLampY - 0.5, centralLampZ]}
        intensity={centralIntensity * 0.4}
        color={lightColor}
        distance={12}
        decay={2}
      />

      {/* Lámpara principal sobre el modelo central */}
      <CeilingLamp
        position={[mainLampX, mainLampY, mainLampZ]}
        rotation={[0, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
      />
      {/* Luz de la lámpara principal */}
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

      {/* Lámparas adicionales para iluminación general */}
      <CeilingLamp
        position={[leftLampX, leftLampY, leftLampZ]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.9, 0.9, 0.9]}
      />
      {/* Luz de la lámpara izquierda trasera */}
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
      {/* Luz de la lámpara derecha trasera */}
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

      {/* Luces adicionales para efecto de brillo suave alrededor de las lámparas */}
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
  // Configuración del pedestal usando configuración centralizada
  const pedestalBaseDesiredY = floorY + PEDESTAL_CONFIG.baseOffset;
  const pedestalPosition: [number, number, number] = [
    0,
    pedestalBaseDesiredY,
    0,
  ];

  // Configuración del modelo principal
  const estimatedPedestalHeight =
    PEDESTAL_CONFIG.estimatedHeight * PEDESTAL_CONFIG.scale;
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
      {/* Precargar todos los modelos */}
      <ModelPreloader />

      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault fov={60} position={[0, 0, 0]} />
        <PlayerController floorY={floorY} />

        {/* Iluminación */}
        <GalleryLights />

        {/* Estructura de la galería */}
        <GalleryWalls floorY={floorY} />
        <Floor />
        <Ceiling />

        {/* Modelo principal con pedestal */}
        <PedestalModel
          position={pedestalPosition}
          modelScale={PEDESTAL_CONFIG.scale}
        />

        {/* Mobiliario */}
        <GalleryBenches floorY={floorY} />
        <GalleryPlants floorY={floorY} />
        <CeilingFixtures />

        <React.Suspense fallback={null}>
          <group position={anceuModelGroupPosition}>
            <Model3DComponent url={modelUrl} />
          </group>
          <Environment preset="sunset" />
        </React.Suspense>
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

      {/* Panel de información - posicionado debajo del botón */}
      {!isPointerLockActive && (
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
            <strong>🎮 Controles de Navegación:</strong>
          </div>
          <div style={{ marginBottom: "12px" }}>
            Haz clic en la escena para activar los controles. Usa WASD para
            moverte y el mouse para mirar. Presiona ESC para liberar.
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>💡 Panel de Luces:</strong>
          </div>
          <div>
            Usa el panel de la derecha para ajustar posición, intensidad y
            ángulo de las lámparas en tiempo real.
          </div>
        </div>
      )}
    </div>
  );
}
