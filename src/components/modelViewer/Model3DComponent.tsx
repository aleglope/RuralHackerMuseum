import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { Html } from "@react-three/drei";

// Helper to convert degrees to radians for rotations
const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

// --- Default Transformation Values ---
// These are base values. The model is expected to be placed on a pedestal,
// so its Y position is relative to that pedestal or its group in the parent scene.
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_ROTATION_DEGREES = { x: 0, y: 0, z: 0 }; // Initial neutral rotation
const DEFAULT_ROTATION_RADIANS = {
  x: degreesToRadians(DEFAULT_ROTATION_DEGREES.x),
  y: degreesToRadians(DEFAULT_ROTATION_DEGREES.y),
  z: degreesToRadians(DEFAULT_ROTATION_DEGREES.z),
};

interface Model3DProps {
  url: string; // URL of the GLB/GLTF model to load
}

export default function Model3DComponent({ url }: Model3DProps) {
  const group = useRef<THREE.Group>(null); // Ref for the main group containing the model
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); // Loading progress (0-100)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // console.log(`Model3DComponent: Attempting to load model from: ${url}`); // Dev log

    const loader = new GLTFLoader();
    // DRACOLoader is kept in case some models use Draco compression.
    // It doesn't harm if not used by a specific model.
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/" // Official Draco decoder path
    );
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        // console.log(`Model3DComponent: GLTF model loaded: ${url}`); // Dev log
        const loadedModel = gltf.scene;

        // 1. Center the model's geometry at its local origin.
        // This makes rotations and scaling more predictable.
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.children.forEach((child) => {
          child.position.sub(center); // Offset children to center the parent
        });

        // 2. Apply base position and rotation.
        // These are defaults; specific adjustments for the Anceu model are applied next.
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

        // 3. Apply specific transformations for the Anceu model (these were fine-tuned).
        loadedModel.rotation.x += Math.PI / 2; // 90 degrees in X
        loadedModel.rotation.y += Math.PI; // 180 degrees in Y
        loadedModel.rotation.z += Math.PI / 0.65; // Approx 276.9 degrees in Z
        loadedModel.position.y += 1.5; // Fine-tuned Y offset

        // 4. Calculate and apply desired scale.
        // Measure bounding box *after* rotations to get correct dimensions in final orientation.
        const tempModelForMeasurement = loadedModel.clone();
        tempModelForMeasurement.scale.set(1, 1, 1); // Measure with intrinsic scale
        const boxForScaling = new THREE.Box3().setFromObject(
          tempModelForMeasurement
        );
        const size = boxForScaling.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const desiredBaseDisplaySize = 1.5; // Target size for the largest dimension
        let calculatedScale = maxDim > 0 ? desiredBaseDisplaySize / maxDim : 1;
        calculatedScale *= 4; // Further scale up as requested

        loadedModel.scale.setScalar(calculatedScale);

        // Ensure all meshes in the model cast and receive shadows.
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // if (child.material) child.material.needsUpdate = true; // May not be necessary, but can help if materials look off
          }
        });

        setModel(loadedModel);
        setLoading(false);
        setError(null);
      },
      (xhr) => {
        // Progress callback
        if (xhr.total > 0) {
          const p = (xhr.loaded / xhr.total) * 100;
          setProgress(p);
        }
      },
      (err: any) => {
        // Error callback
        console.error(`Model3DComponent: GLTF loading error for ${url}:`, err);
        setError(`Failed to load ${url}: ${err.message || "Unknown error"}`);
        setLoading(false);
      }
    );

    return () => {
      // Clean up DRACOLoader instance when component unmounts or URL changes
      dracoLoader.dispose();
    };
  }, [url]); // Effect runs when the model URL changes

  // useFrame(() => {
  //   // Example: Auto-rotate the model. Uncomment to enable.
  //   // if (group.current && model) {
  //   //   group.current.rotation.y += 0.005;
  //   // }
  // });

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
          <p>Error loading 3D model:</p>
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
          <p>Loading 3D Model...</p>
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

  // The <group> acts as a container. The model's own position/rotation/scale
  // have already been set. If this Model3DComponent instance is positioned
  // in its parent scene, that transform will apply to this outer group.
  return <group ref={group}>{model && <primitive object={model} />}</group>;
}
