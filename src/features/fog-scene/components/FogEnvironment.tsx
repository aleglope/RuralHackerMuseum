import React from "react";
import * as THREE from "three";
import { FOG_SCENE_CONFIG } from "../config";

/**
 * Componente del suelo para la escena de niebla
 */
export const FogGround: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[1500, 1500]} />
      <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
    </mesh>
  );
};

/**
 * Componente de paredes invisibles para contener al jugador
 */
export const FogInvisibleWalls: React.FC = () => {
  const { wallDistance, wallHeight } = FOG_SCENE_CONFIG.boundaries;
  const wallThickness = 2;

  return (
    <group>
      {/* Pared Norte */}
      <mesh position={[0, wallHeight / 2, wallDistance]} name="wall-north">
        <boxGeometry args={[wallDistance * 2, wallHeight, wallThickness]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pared Sur */}
      <mesh position={[0, wallHeight / 2, -wallDistance]} name="wall-south">
        <boxGeometry args={[wallDistance * 2, wallHeight, wallThickness]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pared Este */}
      <mesh position={[wallDistance, wallHeight / 2, 0]} name="wall-east">
        <boxGeometry args={[wallThickness, wallHeight, wallDistance * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pared Oeste */}
      <mesh position={[-wallDistance, wallHeight / 2, 0]} name="wall-west">
        <boxGeometry args={[wallThickness, wallHeight, wallDistance * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Pared superior (techo invisible) */}
      <mesh position={[0, 20, 0]} name="wall-ceiling">
        <boxGeometry
          args={[wallDistance * 2, wallThickness, wallDistance * 2]}
        />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Indicadores visuales sutiles: Niebla más densa en los bordes */}
      <group>
        {/* Niebla de borde Norte */}
        <mesh position={[0, 5, wallDistance - 30]}>
          <planeGeometry args={[wallDistance * 2, 20]} />
          <meshBasicMaterial
            transparent
            opacity={0.08}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Niebla de borde Sur */}
        <mesh position={[0, 5, -wallDistance + 30]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[wallDistance * 2, 20]} />
          <meshBasicMaterial
            transparent
            opacity={0.08}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Niebla de borde Este */}
        <mesh
          position={[wallDistance - 30, 5, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[wallDistance * 2, 20]} />
          <meshBasicMaterial
            transparent
            opacity={0.08}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Niebla de borde Oeste */}
        <mesh
          position={[-wallDistance + 30, 5, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[wallDistance * 2, 20]} />
          <meshBasicMaterial
            transparent
            opacity={0.08}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Capas adicionales de niebla densa en perímetro */}
        {/* Esquina NE */}
        <mesh position={[wallDistance - 50, 3, wallDistance - 50]}>
          <planeGeometry args={[80, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0.12}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Esquina NW */}
        <mesh
          position={[-wallDistance + 50, 3, wallDistance - 50]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[80, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0.12}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Esquina SE */}
        <mesh
          position={[wallDistance - 50, 3, -wallDistance + 50]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[80, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0.12}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Esquina SW */}
        <mesh
          position={[-wallDistance + 50, 3, -wallDistance + 50]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[80, 12]} />
          <meshBasicMaterial
            transparent
            opacity={0.12}
            color="#87ceeb"
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Componente del entorno de iluminación
 */
export const FogLights: React.FC = () => {
  return (
    <>
      {/* Luz ambiental tenue */}
      <ambientLight intensity={0.3} color="#ffffff" />

      {/* Luz direccional suave */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Luz puntual para crear atmósfera */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.3}
        color="#87ceeb"
        distance={50}
      />
    </>
  );
};

export default {
  FogGround,
  FogInvisibleWalls,
  FogLights,
};
