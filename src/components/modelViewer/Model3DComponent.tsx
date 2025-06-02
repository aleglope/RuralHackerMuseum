"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { Html } from "@react-three/drei";

// Función para convertir grados a radianes
const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

// --- VALORES POR DEFECTO PERMANENTES ---
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 }; // Ajustado, el pedestal manejará la altura.
const DEFAULT_ROTATION_DEGREES = { x: 0, y: 0, z: 0 }; // Rotación inicial neutra
const DEFAULT_ROTATION_RADIANS = {
  x: degreesToRadians(DEFAULT_ROTATION_DEGREES.x),
  y: degreesToRadians(DEFAULT_ROTATION_DEGREES.y),
  z: degreesToRadians(DEFAULT_ROTATION_DEGREES.z),
};

interface Model3DProps {
  url: string;
}

export default function Model3DComponent({ url }: Model3DProps) {
  const group = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Intentando cargar modelo desde:", url);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        console.log("Modelo GLTF cargado:", url);
        const loadedModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.children.forEach((child) => {
          child.position.sub(center);
        });

        loadedModel.position.set(
          DEFAULT_POSITION.x,
          DEFAULT_POSITION.y,
          DEFAULT_POSITION.z
        );
        loadedModel.rotation.set(
          DEFAULT_ROTATION_RADIANS.x,
          DEFAULT_ROTATION_RADIANS.y,
          DEFAULT_ROTATION_RADIANS.z
        );

        const tempModelForMesurement = loadedModel.clone();
        tempModelForMesurement.scale.set(1, 1, 1);
        const boxForScaling = new THREE.Box3().setFromObject(
          tempModelForMesurement
        );
        const size = boxForScaling.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        // Escalar para que la dimensión más grande sea, por ejemplo, de 2 unidades.
        // La escena de la galería que me pasaste tiene un pedestal de 1 unidad de alto y 2x2 de base.
        // Si el modelo debe ir encima, una escala de 2 unidades podría ser mucho. Ajustemos a 1.5 para que quepa bien.
        const desiredSize = 2.5;
        const calculatedScale = maxDim > 0 ? desiredSize / maxDim : 1;
        loadedModel.scale.setScalar(calculatedScale);
        console.log(
          "Modelo procesado:",
          { url },
          {
            pos: loadedModel.position,
            rot: loadedModel.rotation,
            finalScale: calculatedScale,
            centeredOffset: center,
          }
        );

        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) child.material.needsUpdate = true;
          }
        });
        setModel(loadedModel);
        setLoading(false);
        setError(null);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const p = (xhr.loaded / xhr.total) * 100;
          setProgress(p);
        }
      },
      (err: any) => {
        console.error("Error GLTF:", { url }, err);
        setError(`Error al cargar ${url}: ${err.message || "Desconocido"}`);
        setLoading(false);
      }
    );
    return () => {
      dracoLoader.dispose();
    };
  }, [url]);

  useFrame(() => {
    // Podrías añadir rotación automática aquí si lo deseas
    // if (group.current && model) {
    //   group.current.rotation.y += 0.005;
    // }
  });

  if (error) {
    return (
      <Html center>
        <div
          style={{
            color: "red",
            background: "rgba(0,0,0,0.7)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <p>Error al cargar el modelo:</p>
          <p>{error}</p>
        </div>
      </Html>
    );
  }

  if (loading) {
    return (
      <Html center>
        <div
          style={{
            color: "white",
            background: "rgba(0,0,0,0.7)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <p>Cargando modelo 3D...</p>
          <p>{Math.round(progress)}%</p>
          <div
            style={{
              width: "100px",
              height: "10px",
              border: "1px solid white",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "white",
              }}
            ></div>
          </div>
        </div>
      </Html>
    );
  }

  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {" "}
      {/* Posición base del modelo, pedestal estará en y=-1 */}
      {model && <primitive object={model} />}
    </group>
  );
}
