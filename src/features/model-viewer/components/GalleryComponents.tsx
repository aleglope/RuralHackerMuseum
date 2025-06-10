import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { BaseModel3D } from "../../../core/models";
import { MUSEUM_SCENE_CONFIG, TEXTURE_PATHS } from "../../../core/config";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";

const { floorY } = MUSEUM_SCENE_CONFIG;

// Gallery floor component with bamboo textures
export const Floor = ({ floorSize }: { floorSize: number }) => {
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

// Ceiling component with bamboo texture
export const Ceiling = ({ ceilingSize }: { ceilingSize: number }) => {
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

// Gallery walls component
export const GalleryWalls = ({ floorY }: { floorY: number }) => {
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
          map.repeat.set(4, 2);
          map.minFilter = THREE.LinearMipmapLinearFilter;
          map.magFilter = THREE.LinearFilter;
          map.needsUpdate = true;
        }
      }
    );
  }, [albedoMap, normalMap, roughnessMap, metallicMap, aoMap, heightMap]);

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
        <planeGeometry args={[20, 10]} />
        {wallMaterial}
      </mesh>

      {/* Wall sections with window */}
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

      {/* COMPONENTES ARQUITECTÓNICOS - NUEVA ARQUITECTURA */}
      <BaseModel3D modelId="WINDOW" />
      <BaseModel3D modelId="WINDOW_VIEW" />
      <BaseModel3D modelId="PEPE" />

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

      {/* Pared central - CONFIGURACIÓN EXACTA */}
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

// Gallery lighting system
export const GalleryLights = () => {
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

// Gallery furniture components - NUEVA ARQUITECTURA
export const GalleryBenches = ({ floorY }: { floorY: number }) => {
  return (
    <>
      <BaseModel3D
        modelId="GALLERY_BENCH"
        overridePosition={[-3, floorY, 3]}
        overrideRotation={[0, Math.PI / 4, 0]}
      />
      <BaseModel3D
        modelId="GALLERY_BENCH"
        overridePosition={[3, floorY, 3]}
        overrideRotation={[0, -Math.PI / 4, 0]}
      />
    </>
  );
};

export const GalleryPlants = ({ floorY }: { floorY: number }) => {
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
      <BaseModel3D
        modelId="PLANT_1"
        overridePosition={[plant1X, plant1Y, plant1Z]}
        overrideRotation={[0, plant1RotationY, 0]}
        overrideScale={[plant1Scale, plant1Scale, plant1Scale]}
      />
      <BaseModel3D
        modelId="PLANT_2"
        overridePosition={[-2.8, floorY, 3.8]}
        overrideRotation={[0, -Math.PI / 6, 0]}
        overrideScale={[2.2, 2.2, 2.2]}
      />
      <BaseModel3D
        modelId="PLANT_3"
        overridePosition={[plant3X, plant3Y, plant3Z]}
        overrideRotation={[0, plant3RotationY, 0]}
        overrideScale={[plant3Scale, plant3Scale, plant3Scale]}
      />
      <BaseModel3D
        modelId="PLANT_4"
        overridePosition={[2.5, floorY, 4.5]}
        overrideRotation={[0, Math.PI / 4, 0]}
        overrideScale={[1.1, 1.1, 1.1]}
      />
    </>
  );
};

export const CeilingFixtures = () => {
  const centralLampX = -6.6;
  const centralLampY = 4.4;
  const centralLampZ = -6.6;
  const centralLightY = 5.1;
  const centralIntensity = 8.3;
  const centralAngle = 1.5;
  const centralScale = 2.1;

  const mainLampX = 0;
  const mainLampY = 6.5;
  const mainLampZ = 6.3;
  const mainLightY = 5.8;
  const mainIntensity = 3.5;
  const mainAngle = 0.6;

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
      {/* Central Lamp (Lamp 2) */}
      <BaseModel3D
        modelId="LAMP_2"
        overridePosition={[centralLampX, centralLampY, centralLampZ]}
        overrideRotation={[0, 0, 0]}
        overrideScale={[centralScale, centralScale, centralScale]}
      />
      <spotLight
        position={[centralLampX, centralLightY, centralLampZ]}
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

      {/* Main Lamp */}
      <BaseModel3D
        modelId="LAMP_1"
        overridePosition={[mainLampX, mainLampY, mainLampZ]}
        overrideRotation={[0, 0, 0]}
        overrideScale={[1.2, 1.2, 1.2]}
      />
      <spotLight
        position={[mainLampX, mainLightY, mainLampZ]}
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

      {/* Side Lamps */}
      <BaseModel3D
        modelId="LAMP_1"
        overridePosition={[leftLampX, leftLampY, leftLampZ]}
        overrideRotation={[0, Math.PI / 4, 0]}
        overrideScale={[0.9, 0.9, 0.9]}
      />
      <spotLight
        position={[leftLampX, leftLightY, leftLampZ]}
        angle={leftAngle}
        penumbra={0.4}
        intensity={leftIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <BaseModel3D
        modelId="LAMP_1"
        overridePosition={[rightLampX, rightLampY, rightLampZ]}
        overrideRotation={[0, -Math.PI / 4, 0]}
        overrideScale={[0.9, 0.9, 0.9]}
      />
      <spotLight
        position={[rightLampX, rightLightY, rightLampZ]}
        angle={rightAngle}
        penumbra={0.4}
        intensity={rightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Additional point lights */}
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

// ===== SISTEMA COMPLETO DE CONTROLES DE JUGADOR =====

// Hook for WASD keyboard and touch controls
const usePlayerControls = () => {
  const keys = React.useRef({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false, // Down in free camera
    KeyE: false, // Up in free camera
  });

  React.useEffect(() => {
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

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
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

// Touch camera controls for mobile
export const TouchCameraControls = ({ camera }: { camera: THREE.Camera }) => {
  const isMobile = useIsMobile();
  const touchStateRef = React.useRef({
    isMoving: false,
    lastTouchX: 0,
    lastTouchY: 0,
    rotationX: 0,
    rotationY: 0,
  });

  React.useEffect(() => {
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

// Complete player controller for both PC and mobile
export const PlayerControllerWithTouch = ({
  floorY,
  freeCameraMode = false,
  cameraSpeed = 5,
  sceneReady,
  onTouchControlsRef,
}: {
  floorY: number;
  freeCameraMode?: boolean;
  cameraSpeed?: number;
  sceneReady: boolean;
  onTouchControlsRef?: (ref: any) => void;
}) => {
  const { camera, gl } = useThree();
  const controlsRef = React.useRef<any>();
  const playerVelocity = React.useRef(new THREE.Vector3());
  const keys = usePlayerControls();
  const isMobile = useIsMobile();
  const touchControls = React.useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Constants from MUSEUM_SCENE_CONFIG
  const CAMERA_HEIGHT_ABOVE_FLOOR = 1.7;
  const PLAYER_SPEED = 5.0;
  const ROOM_BOUNDS = {
    minX: -10 + 0.5,
    maxX: 10 - 0.5,
    minZ: -10 + 0.5,
    maxZ: 10 - 0.5,
  };

  // Function to handle touch controls
  const handleTouchMove = (direction: string, active: boolean) => {
    console.log(`🎮 PlayerController received: ${direction} = ${active}`);
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
  React.useEffect(() => {
    if (onTouchControlsRef) {
      onTouchControlsRef(handleTouchMove);
    }
  }, [onTouchControlsRef]);

  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 5);
    camera.lookAt(0, floorY + CAMERA_HEIGHT_ABOVE_FLOOR, 0);
  }, [camera, floorY]);

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
