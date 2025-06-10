/**
 * Base 3D Model Component
 * Universal component for rendering all 3D models with type-specific behaviors
 */

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GroupProps, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Behaviors
import PepeBehaviors from "./behaviors/PepeBehaviors";
import WindowBehaviors from "./behaviors/WindowBehaviors";
import WindowViewBehaviors from "./behaviors/WindowViewBehaviors";
import AnceuBehaviors from "./behaviors/AnceuBehaviors";

// Utils and types
import { getModelPosition, getModelRotation, getModelScale } from "./utils";
import { getModelConfig } from "./ModelRegistry";
import { BaseModel3DProps } from "./types";

export const BaseModel3D: React.FC<BaseModel3DProps> = ({
  modelId,
  config: propConfig,
  overridePosition,
  overrideRotation,
  overrideScale,
  ...groupProps
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Get configuration
  const config = propConfig || getModelConfig(modelId);

  if (!config) {
    console.warn(`Model configuration not found for: ${modelId}`);
    return null;
  }

  const gltf = useGLTF(config.path);
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const { camera } = useThree();

  // Type-specific behaviors
  const pepeBehaviors =
    config.type === "PEPE"
      ? PepeBehaviors.usePepeBehavior(config, gltf, actions, groupRef)
      : null;

  const windowBehaviors =
    config.type === "WINDOW"
      ? WindowBehaviors.useWindowBehavior(config, gltf)
      : null;

  const windowViewBehaviors =
    config.type === "WINDOW_VIEW"
      ? WindowViewBehaviors.useWindowViewBehavior(config, gltf, groupRef)
      : null;

  const anceuBehaviors =
    config.type === "ANCEU"
      ? AnceuBehaviors.useAnceuBehavior(config, gltf, groupRef)
      : null;

  useEffect(() => {
    if (!gltf?.scene) return;

    gltf.scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = config.castShadow ?? true;
        child.receiveShadow = config.receiveShadow ?? true;
      }
    });
  }, [gltf.scene, config]);

  // PEPE - Direct rendering, transforms applied by behavior to groupRef
  if (config.type === "PEPE" && pepeBehaviors) {
    return (
      <group ref={groupRef} {...groupProps} dispose={null}>
        <primitive object={gltf.scene} />
      </group>
    );
  }

  // WINDOW - Rendering with modified materials
  if (config.type === "WINDOW" && windowBehaviors) {
    return (
      <group
        ref={groupRef}
        {...groupProps}
        position={overridePosition || getModelPosition(config)}
        rotation={overrideRotation || getModelRotation(config)}
        scale={overrideScale || getModelScale(config)}
        dispose={null}
      >
        <primitive object={windowBehaviors.modifiedScene} />
      </group>
    );
  }

  // WINDOW_VIEW - Rendering with Leva controls
  if (config.type === "WINDOW_VIEW" && windowViewBehaviors) {
    return (
      <group
        ref={groupRef}
        {...groupProps}
        position={[
          windowViewBehaviors.position.x,
          windowViewBehaviors.position.y,
          windowViewBehaviors.position.z,
        ]}
        rotation={[
          windowViewBehaviors.rotation.x,
          windowViewBehaviors.rotation.y,
          windowViewBehaviors.rotation.z,
        ]}
        scale={[
          windowViewBehaviors.scale.x,
          windowViewBehaviors.scale.y,
          windowViewBehaviors.scale.z,
        ]}
        dispose={null}
      >
        <primitive object={windowViewBehaviors.modifiedScene} />
        {windowViewBehaviors.showAxes && (
          <axesHelper args={[windowViewBehaviors.axesSize]} />
        )}
      </group>
    );
  }

  // ANCEU - Rendering with complex transformations applied
  if (config.type === "ANCEU" && anceuBehaviors) {
    return (
      <group ref={groupRef} {...groupProps} dispose={null}>
        <primitive object={anceuBehaviors.transformedScene} />
      </group>
    );
  }

  // BENCH - Specific rendering with preserved geometry
  if (config.type === "BENCH") {
    const { nodes, materials } = gltf as any;

    const {
      position: groupPosition,
      rotation: groupRotation,
      ...restGroupProps
    } = groupProps;

    if (!nodes || !materials) {
      console.warn(`❌ BENCH ${modelId}: Missing nodes or materials`);
      return null;
    }

    const geometry = nodes[config.geometry.nodeKey]?.geometry;
    const material = materials[config.geometry.materialKey];

    if (!geometry || !material) {
      console.warn(`❌ BENCH ${modelId}: Missing geometry/material`);
      return null;
    }

    return (
      <group
        ref={groupRef}
        {...restGroupProps}
        position={overridePosition || groupPosition}
        rotation={overrideRotation || groupRotation}
        scale={overrideScale || getModelScale(config)}
        dispose={null}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={geometry}
          material={material}
        />
      </group>
    );
  }

  // GENERIC - Simple rendering
  return (
    <group
      ref={groupRef}
      {...groupProps}
      position={overridePosition || getModelPosition(config)}
      rotation={overrideRotation || getModelRotation(config)}
      scale={overrideScale || getModelScale(config)}
      dispose={null}
    >
      <primitive
        object={gltf.scene}
        castShadow={config.castShadow}
        receiveShadow={config.receiveShadow}
      />
    </group>
  );
};

export const preloadModel = (modelId: string) => {
  const config = getModelConfig(modelId);
  if (config) {
    useGLTF.preload(config.path);
  }
};

export const useModel = (modelId: string) => {
  const config = getModelConfig(modelId);
  const gltf = config ? useGLTF(config.path) : null;

  return {
    config,
    gltf,
    isLoaded: !!gltf,
  };
};

export default BaseModel3D;
