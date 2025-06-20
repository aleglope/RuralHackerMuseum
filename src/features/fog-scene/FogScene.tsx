import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PointerLockControls,
  KeyboardControls,
  useKeyboardControls,
  AdaptiveDpr,
  AdaptiveEvents,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";
import SafeEnvironment from "../../components/ui/SafeEnvironment";

// Configuración de la escena de niebla - EXPANDIDA PARA INFINITUD
const FOG_SCENE_CONFIG = {
  camera: {
    position: [0, 12, 5] as [number, number, number],
    fov: 75,
    near: 0.1,
    far: 2000, // ✅ Aumentado para ver más lejos
  },
  fog: {
    color: 0x87ceeb,
    near: 15,
    far: 150, // ✅ Niebla más extensa
  },
  player: {
    speed: 12, // ✅ Velocidad aumentada para el área más grande
    height: 12,
    friction: 0.9,
  },
  boundaries: {
    wallDistance: 490, // ✅ Límites invisibles cerca del borde de niebla (1000/2 - 10)
    wallHeight: 25,
    maxHeight: 18,
    minHeight: 2,
  },
  particles: {
    count: 8000, // ✅ 4x más partículas para mayor densidad
    area: {
      width: 1000, // ✅ 5x más ancho - área MASIVA
      height: 1000, // ✅ 5x más alto - área MASIVA
    },
    height: {
      min: -2.0, // ✅ Niebla más baja
      max: 8.0, // ✅ Niebla más alta
    },
    size: {
      min: 15, // ✅ Partículas más pequeñas para más densidad
      max: 60, // ✅ Algunas partículas más grandes
    },
    opacity: {
      min: 0.1, // ✅ Más transparentes para mejor blending
      max: 0.6, // ✅ Menos opacas para efecto más sutil
    },
    speed: {
      base: 0.015, // ✅ Movimiento más lento para área grande
      variation: 0.008, // ✅ Más variación en velocidades
    },
  },
} as const;

// Keyboard controls mapping
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
];

// Shaders para las partículas de niebla - EXACTOS DEL CÓDIGO ORIGINAL
const fogVertexShader = `
  attribute float size;
  attribute float opacity;
  varying float vOpacity;
  
  void main() {
    vOpacity = opacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fogFragmentShader = `
  varying float vOpacity;
  
  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    
    // ✅ MEJORADO: Gradiente más suave para partículas más naturales
    float alpha = 1.0 - smoothstep(0.0, 0.6, distanceToCenter);
    alpha = pow(alpha, 2.0); // ✅ Curva exponencial para mejor blending
    alpha *= vOpacity;
    
    // ✅ OPTIMIZADO: Menos intensidad para manejar más partículas
    gl_FragColor = vec4(0.9, 0.95, 1.0, alpha * 0.15);
  }
`;

// Componente de partículas de niebla
function FogParticles() {
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
        Math.random() * (height.max - height.min) + height.min; // Altura más baja para niebla a ras del suelo
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

    // ✅ OPTIMIZACIÓN: Solo actualizar cada 2 frames para mejor rendimiento
    const shouldUpdate = Math.floor(time * 60) % 2 === 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (shouldUpdate) {
        // Movimiento sutil de las partículas - OPTIMIZADO para área grande
        const waveIntensity = 0.002; // ✅ Más intenso para área grande
        positions[i3] +=
          velocities[i3] + Math.sin(time * 0.4 + i * 0.008) * waveIntensity;
        positions[i3 + 1] +=
          velocities[i3 + 1] +
          Math.sin(time * 0.25 + i * 0.015) * (waveIntensity * 0.5);
        positions[i3 + 2] +=
          velocities[i3 + 2] +
          Math.cos(time * 0.35 + i * 0.012) * waveIntensity;
      }

      // ✅ CULLING INTELIGENTE: Mantener partículas en área expandida
      const maxDistance = area.width / 2;

      if (Math.abs(positions[i3]) > maxDistance) {
        // Reposicionar en el lado opuesto para efecto infinito
        positions[i3] =
          positions[i3] > 0 ? -maxDistance + 50 : maxDistance - 50;
      }
      if (Math.abs(positions[i3 + 2]) > maxDistance) {
        // Reposicionar en el lado opuesto para efecto infinito
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
        vertexShader={fogVertexShader}
        fragmentShader={fogFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Componente del jugador con controles de primera persona y colisiones
function Player() {
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys();
    const { speed, height, friction } = FOG_SCENE_CONFIG.player;

    const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const sideVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(
      camera.quaternion
    );

    if (forward)
      velocity.current.add(frontVector.multiplyScalar(speed * delta));
    if (backward)
      velocity.current.add(frontVector.multiplyScalar(-speed * delta));
    if (left) velocity.current.add(sideVector.multiplyScalar(speed * delta));
    if (right) velocity.current.add(sideVector.multiplyScalar(-speed * delta));

    // Aplicar fricción
    velocity.current.multiplyScalar(friction);

    // ✅ SISTEMA DE COLISIONES: Límites invisibles con rebote suave
    const { wallDistance, maxHeight, minHeight } = FOG_SCENE_CONFIG.boundaries;
    const softBoundary = wallDistance - 5; // Un poco antes de las paredes físicas para suavidad
    const newPosition = camera.position.clone().add(velocity.current);

    // Verificar límites X (Este-Oeste)
    if (Math.abs(newPosition.x) > softBoundary) {
      velocity.current.x *= -0.3; // Rebote suave
      newPosition.x = Math.sign(newPosition.x) * softBoundary;
    }

    // Verificar límites Z (Norte-Sur)
    if (Math.abs(newPosition.z) > softBoundary) {
      velocity.current.z *= -0.3; // Rebote suave
      newPosition.z = Math.sign(newPosition.z) * softBoundary;
    }

    // Verificar límite superior (altura máxima)
    if (newPosition.y > maxHeight) {
      velocity.current.y = 0;
      newPosition.y = maxHeight;
    }

    // Verificar límite inferior (altura mínima)
    if (newPosition.y < minHeight) {
      velocity.current.y = 0;
      newPosition.y = minHeight;
    }

    // Aplicar la nueva posición
    camera.position.copy(newPosition);
    camera.position.y = height; // Mantener altura fija por encima de la niebla
  });

  return null;
}

// Componente del suelo - EXPANDIDO PARA COINCIDIR CON ÁREA DE NIEBLA
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[1500, 1500]} /> {/* ✅ 5x más grande que antes */}
      <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
    </mesh>
  );
}

// Componente de paredes invisibles para contener al jugador
function InvisibleWalls() {
  const { wallDistance, wallHeight } = FOG_SCENE_CONFIG.boundaries;
  const wallThickness = 2; // Un poco más grueso para mejor detección

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

      {/* Pared superior (techo invisible) - para evitar volar muy alto */}
      <mesh position={[0, 20, 0]} name="wall-ceiling">
        <boxGeometry
          args={[wallDistance * 2, wallThickness, wallDistance * 2]}
        />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ✅ INDICADORES VISUALES SUTILES: Niebla más densa en los bordes EXPANDIDOS */}
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

        {/* ✅ CAPAS ADICIONALES DE NIEBLA DENSA en perímetro */}
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
}

// Componente del entorno de iluminación
function Environment() {
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
}

// Componente principal de la escena
function FogSceneContent() {
  const { scene } = useThree();
  const [isPointerLockActive, setIsPointerLockActive] = useState(false);

  useEffect(() => {
    // Configurar niebla atmosférica - EXACTA DEL ORIGINAL
    const { color, near, far } = FOG_SCENE_CONFIG.fog;
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);

    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  const handlePointerLockChange = useCallback(() => {
    setIsPointerLockActive(document.pointerLockElement !== null);
  }, []);

  useEffect(() => {
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
    };
  }, [handlePointerLockChange]);

  return (
    <>
      <PointerLockControls />
      <Player />
      <Environment />
      <Ground />
      <InvisibleWalls />
      <FogParticles />
      {/* ✅ CAPAS ADICIONALES DE NIEBLA para mayor densidad */}
      <group position={[250, 0, 250]}>
        <FogParticles />
      </group>
      <group position={[-250, 0, -250]}>
        <FogParticles />
      </group>
      <group position={[250, 0, -250]}>
        <FogParticles />
      </group>
      <group position={[-250, 0, 250]}>
        <FogParticles />
      </group>
      <SafeEnvironment preset="sunset" fallback="studio" />
    </>
  );
}

// Componente principal exportado
interface FogSceneProps {
  onBack: () => void;
}

const FogScene: React.FC<FogSceneProps> = ({ onBack }) => {
  const [sceneReady, setSceneReady] = useState(false);

  const handleCanvasClick = useCallback(() => {
    // Intentar activar pointer lock al hacer clic
    const canvas = document.querySelector("canvas");
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    // Simular tiempo de carga de la escena
    const timer = setTimeout(() => {
      setSceneReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen bg-slate-200 relative">
      {/* UI Controls */}
      <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-3 rounded backdrop-blur-sm">
        <p className="text-sm font-medium mb-1">
          Haz clic para activar controles
        </p>
        <p className="text-xs text-gray-300">WASD para moverse</p>
        <p className="text-xs text-gray-300">Ratón para mirar</p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded backdrop-blur-sm transition-colors duration-200"
      >
        ← Volver al Museo
      </button>

      {/* Loading overlay */}
      {!sceneReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Cargando escena de niebla...</p>
          </div>
        </div>
      )}

      {/* 3D Scene */}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={FOG_SCENE_CONFIG.camera}
          style={{
            height: "100vh",
            width: "100vw",
            display: "block",
            opacity: sceneReady ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
          onClick={handleCanvasClick}
          dpr={[1, 2]}
        >
          {/* Optimizaciones de rendimiento */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Preload all />

          {/* Contenido de la escena */}
          <React.Suspense fallback={null}>
            <FogSceneContent />
          </React.Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
};

export default FogScene;
