"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import Model3DComponent from "./Model3DComponent"; // Cambiado para importar el componente local
import * as THREE from "three";

// Componente para el suelo de la galería con texturas
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

// Componente para las paredes de la galería con texturas
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
    </group>
  );
};

const GalleryLights = () => {
  return (
    <>
      <ambientLight intensity={0.5} /> {/* Aumentada un poco la luz ambiente */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.4} // Un poco más abierto el ángulo
        penumbra={0.5} // Más suave el borde
        intensity={1.5} // Un poco más de intensidad
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[7, 5, 7]} intensity={0.7} />
      <pointLight position={[-7, 5, -7]} intensity={0.7} color="#f0e6ff" />
      {/* Luz direccional para simular el sol o una fuente de luz principal */}
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

const Pedestal = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1, 1.5]} /> {/* Ajustado tamaño del pedestal */}
      <meshStandardMaterial color="#a0a0a0" />
    </mesh>
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
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Canvas shadows dpr={[1, 1.5]} /* Ajustado DPR */>
        <PerspectiveCamera makeDefault position={[0, 2.5, 10]} fov={50} />
        <OrbitControls
          minDistance={1}
          maxDistance={30} // Reducida la distancia máxima de zoom out
          minPolarAngle={Math.PI / 4} // Evitar ver demasiado desde arriba
          maxPolarAngle={Math.PI / 1.8} // Evitar ver desde abajo del suelo
          target={[0, 1, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE, // Cambiado a rotar con click izquierdo
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
        <GalleryLights />
        <GalleryWalls />
        <Floor />
        <Pedestal position={[0, -1, 0]} />{" "}
        {/* Pedestal en -1 para que el modelo en y=0.5 quede encima */}
        <React.Suspense fallback={null}>
          <Model3DComponent url={modelUrl} />
          <Environment preset="sunset" /> {/* Cambiado el preset del entorno */}
        </React.Suspense>
      </Canvas>
      <button
        onClick={onBack}
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
          zIndex: 1000, // Asegurar que esté por encima del canvas
        }}
      >
        Volver a la Galería
      </button>
    </div>
  );
}
