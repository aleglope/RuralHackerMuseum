/*
Ceiling Lamp Component - Moon Metal Black
Model: lampara_de_techo_moon_metal_negro.glb
*/

import { useGLTF } from "@react-three/drei";

export function CeilingLamp(props: JSX.IntrinsicElements["group"]) {
  const gltf = useGLTF("/models/lampara_de_techo_moon_metal_negro.glb");

  return (
    <group {...props} dispose={null}>
      <primitive object={gltf.scene.clone()} castShadow receiveShadow />
    </group>
  );
}

useGLTF.preload("/models/lampara_de_techo_moon_metal_negro.glb");
