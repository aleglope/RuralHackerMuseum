import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FOG_SCENE_CONFIG, FOG_SHADERS } from "../config";

/**
 * Componente de partículas de niebla
 * Extraído y modularizado del FogScene principal
 */
export const FogParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { count: particleCount } = FOG_SCENE_CONFIG.particles;

  const { positions, sizes, opacities, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const { area, height, size, opacity, speed } = FOG_SCENE_CONFIG.particles;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Posiciones distribuidas en un área amplia
      positions[i3] = (Math.random() - 0.5) * area.width;
      positions[i3 + 1] =
        Math.random() * (height.max - height.min) + height.min;
      positions[i3 + 2] = (Math.random() - 0.5) * area.height;

      // Tamaños variables
      sizes[i] = Math.random() * (size.max - size.min) + size.min;

      // Opacidades variables
      opacities[i] = Math.random() * (opacity.max - opacity.min) + opacity.min;

      // Velocidades lentas para movimiento sutil
      velocities[i3] = (Math.random() - 0.5) * speed.base;
      velocities[i3 + 1] = Math.random() * speed.variation;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed.base;
    }

    return { positions, sizes, opacities, velocities };
  }, [particleCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.getElapsedTime();
    const { area, height } = FOG_SCENE_CONFIG.particles;

    // Optimización: Solo actualizar cada 2 frames para mejor rendimiento
    const shouldUpdate = Math.floor(time * 60) % 2 === 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (shouldUpdate) {
        // Movimiento sutil de las partículas
        const waveIntensity = 0.002;
        positions[i3] +=
          velocities[i3] + Math.sin(time * 0.4 + i * 0.008) * waveIntensity;
        positions[i3 + 1] +=
          velocities[i3 + 1] +
          Math.sin(time * 0.25 + i * 0.015) * (waveIntensity * 0.5);
        positions[i3 + 2] +=
          velocities[i3 + 2] +
          Math.cos(time * 0.35 + i * 0.012) * waveIntensity;
      }

      // Culling inteligente: Mantener partículas en área expandida
      const maxDistance = area.width / 2;

      if (Math.abs(positions[i3]) > maxDistance) {
        positions[i3] =
          positions[i3] > 0 ? -maxDistance + 50 : maxDistance - 50;
      }
      if (Math.abs(positions[i3 + 2]) > maxDistance) {
        positions[i3 + 2] =
          positions[i3 + 2] > 0 ? -maxDistance + 50 : maxDistance - 50;
      }
      if (positions[i3 + 1] > height.max) {
        positions[i3 + 1] = height.min;
      }
      if (positions[i3 + 1] < height.min - 1) {
        positions[i3 + 1] = height.max;
      }
    }

    if (shouldUpdate) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particleCount}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={FOG_SHADERS.vertex}
        fragmentShader={FOG_SHADERS.fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default FogParticles;
