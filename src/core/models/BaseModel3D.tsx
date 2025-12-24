/**
 * Base 3D Model Component
 * Universal component for rendering all 3D models with type-specific behaviors
 */

import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Behaviors
import PepeBehaviors from "./behaviors/PepeBehaviors";
import WindowBehaviors from "./behaviors/WindowBehaviors";
import WindowViewBehaviors from "./behaviors/WindowViewBehaviors";
import AnceuBehaviors from "./behaviors/AnceuBehaviors";
import ManOnForestBehaviors from "./behaviors/ManOnForestBehaviors";

// Utils and types
import { getModelPosition, getModelRotation, getModelScale } from "./utils";
import { getModelConfig } from "./ModelRegistry";
import {
  AnceuModelConfig,
  BaseModel3DProps,
  BenchModelConfig,
  ManOnForestModelConfig,
  ModelConfig,
  PepeModelConfig,
  WindowModelConfig,
  WindowViewModelConfig,
} from "./types";

type GLTFResult = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  nodes?: Record<string, { geometry?: THREE.BufferGeometry }>;
  materials?: Record<string, THREE.Material>;
};

type ActionsMap = Record<string, THREE.AnimationAction | null>;

const PepeModel: React.FC<{
  config: PepeModelConfig;
  gltf: GLTFResult;
  actions: ActionsMap;
} & Omit<BaseModel3DProps, "config">> = ({ config, gltf, actions, ...groupProps }) => {
  const groupRef = useRef<THREE.Group>(null);
  PepeBehaviors.usePepeBehavior(config, gltf, actions, groupRef);
  return (
    <group ref={groupRef} {...groupProps} dispose={null}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const WindowModel: React.FC<{
  config: WindowModelConfig;
  gltf: GLTFResult;
  overridePosition?: BaseModel3DProps["overridePosition"];
  overrideRotation?: BaseModel3DProps["overrideRotation"];
  overrideScale?: BaseModel3DProps["overrideScale"];
} & Omit<BaseModel3DProps, "config">> = ({
  config,
  gltf,
  overridePosition,
  overrideRotation,
  overrideScale,
  ...groupProps
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const windowBehaviors = WindowBehaviors.useWindowBehavior(config, gltf);
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
};

const WindowViewModel: React.FC<{
  config: WindowViewModelConfig;
  gltf: GLTFResult;
} & Omit<BaseModel3DProps, "config">> = ({ config, gltf, ...groupProps }) => {
  const groupRef = useRef<THREE.Group>(null);
  const windowViewBehaviors = WindowViewBehaviors.useWindowViewBehavior(
    config,
    gltf,
    groupRef
  );
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
};

const AnceuModel: React.FC<{
  config: AnceuModelConfig;
  gltf: GLTFResult;
} & Omit<BaseModel3DProps, "config">> = ({ config, gltf, ...groupProps }) => {
  const groupRef = useRef<THREE.Group>(null);
  const anceuBehaviors = AnceuBehaviors.useAnceuBehavior(config, gltf, groupRef);
  return (
    <group ref={groupRef} {...groupProps} dispose={null}>
      <primitive object={anceuBehaviors.transformedScene} />
    </group>
  );
};

const ManOnForestModel: React.FC<{
  config: ManOnForestModelConfig;
  gltf: GLTFResult;
} & Omit<BaseModel3DProps, "config">> = ({ config, gltf, ...groupProps }) => {
  const groupRef = useRef<THREE.Group>(null);
  const manOnForestBehaviors = ManOnForestBehaviors.useManOnForestBehavior(
    config,
    gltf,
    groupRef
  );
  return (
    <group
      ref={groupRef}
      {...groupProps}
      position={[
        manOnForestBehaviors.position.x,
        manOnForestBehaviors.position.y,
        manOnForestBehaviors.position.z,
      ]}
      rotation={[
        manOnForestBehaviors.rotation.x,
        manOnForestBehaviors.rotation.y,
        manOnForestBehaviors.rotation.z,
      ]}
      scale={[
        manOnForestBehaviors.scale.x,
        manOnForestBehaviors.scale.y,
        manOnForestBehaviors.scale.z,
      ]}
      dispose={null}
    >
      <primitive object={manOnForestBehaviors.modifiedScene} />
      {manOnForestBehaviors.showAxes && (
        <axesHelper args={[manOnForestBehaviors.axesSize]} />
      )}
    </group>
  );
};

const BenchModel: React.FC<{
  config: BenchModelConfig;
  gltf: GLTFResult;
  overridePosition?: BaseModel3DProps["overridePosition"];
  overrideRotation?: BaseModel3DProps["overrideRotation"];
  overrideScale?: BaseModel3DProps["overrideScale"];
} & Omit<BaseModel3DProps, "config">> = ({
  config,
  gltf,
  overridePosition,
  overrideRotation,
  overrideScale,
  ...groupProps
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = gltf;

  const { position: groupPosition, rotation: groupRotation, ...restGroupProps } =
    groupProps;

  const geometry = nodes?.[config.geometry.nodeKey]?.geometry;
  const material = materials?.[config.geometry.materialKey];

  if (!geometry || !material) return null;

  return (
    <group
      ref={groupRef}
      {...restGroupProps}
      position={overridePosition || groupPosition}
      rotation={overrideRotation || groupRotation}
      scale={overrideScale || getModelScale(config)}
      dispose={null}
    >
      <mesh castShadow receiveShadow geometry={geometry} material={material} />
    </group>
  );
};

const GenericModel: React.FC<{
  config: ModelConfig;
  gltf: GLTFResult;
  overridePosition?: BaseModel3DProps["overridePosition"];
  overrideRotation?: BaseModel3DProps["overrideRotation"];
  overrideScale?: BaseModel3DProps["overrideScale"];
} & Omit<BaseModel3DProps, "config">> = ({
  config,
  gltf,
  overridePosition,
  overrideRotation,
  overrideScale,
  ...groupProps
}) => {
  const groupRef = useRef<THREE.Group>(null);
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

export const BaseModel3D: React.FC<BaseModel3DProps> = ({
  modelId,
  config: propConfig,
  overridePosition,
  overrideRotation,
  overrideScale,
  ...groupProps
}) => {
  const config = propConfig || getModelConfig(modelId);
  const modelPath = config?.path ?? "/models/pepe.glb";
  const gltf = useGLTF(modelPath) as unknown as GLTFResult;
  const { actions } = useAnimations(gltf.animations, gltf.scene);
  const actionsMap = (actions ?? {}) as unknown as ActionsMap;

  useEffect(() => {
    if (!config || !gltf?.scene) return;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = config.castShadow ?? true;
        mesh.receiveShadow = config.receiveShadow ?? true;
      }
    });
  }, [config, gltf]);

  if (!config) return null;

  if (config.type === "PEPE") {
    return (
      <PepeModel
        config={config}
        gltf={gltf}
        actions={actionsMap}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  if (config.type === "WINDOW") {
    return (
      <WindowModel
        config={config}
        gltf={gltf}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  if (config.type === "WINDOW_VIEW") {
    return (
      <WindowViewModel
        config={config}
        gltf={gltf}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  if (config.type === "ANCEU") {
    return (
      <AnceuModel
        config={config}
        gltf={gltf}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  if (config.type === "MAN_ON_FOREST") {
    return (
      <ManOnForestModel
        config={config}
        gltf={gltf}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  if (config.type === "BENCH") {
    return (
      <BenchModel
        config={config}
        gltf={gltf}
        modelId={modelId}
        overridePosition={overridePosition}
        overrideRotation={overrideRotation}
        overrideScale={overrideScale}
        {...groupProps}
      />
    );
  }

  return (
    <GenericModel
      config={config}
      gltf={gltf}
      modelId={modelId}
      overridePosition={overridePosition}
      overrideRotation={overrideRotation}
      overrideScale={overrideScale}
      {...groupProps}
    />
  );
};

export default BaseModel3D;
