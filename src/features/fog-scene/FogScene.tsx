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

// Configuración de la escena de niebla
const FOG_SCENE_CONFIG = {
  camera: {
    position: [0, 12, 5] as [number, number, number],
    fov: 75,
    near: 0.1,
    far: 1000,
  },
  fog: {
    color: 0x87ceeb,
    near: 10,
    far: 80,
  },
  player: {
    speed: 8,
    height: 12,
    friction: 0.9,
  },
  particles: {
    count: 2000,
    area: {
      width: 200,
      height: 200,
    },
    height: {
      min: -0.5,
      max: 2.5,
    },
    size: {
      min: 20,
      max: 40,
    },
    opacity: {
      min: 0.2,
      max: 0.8,
    },
    speed: {
      base: 0.02,
      variation: 0.005,
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
    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
    alpha *= vOpacity;
    
    gl_FragColor = vec4(0.9, 0.95, 1.0, alpha * 0.3);
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

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Movimiento sutil de las partículas - EXACTO DEL ORIGINAL
      positions[i3] += velocities[i3] + Math.sin(time * 0.5 + i * 0.01) * 0.001;
      positions[i3 + 1] +=
        velocities[i3 + 1] + Math.sin(time * 0.3 + i * 0.02) * 0.0005;
      positions[i3 + 2] +=
        velocities[i3 + 2] + Math.cos(time * 0.4 + i * 0.015) * 0.001;

      // Mantener las partículas dentro de los límites
      if (Math.abs(positions[i3]) > area.width / 2) {
        positions[i3] = (Math.random() - 0.5) * area.width;
      }
      if (Math.abs(positions[i3 + 2]) > area.height / 2) {
        positions[i3 + 2] = (Math.random() - 0.5) * area.height;
      }
      if (positions[i3 + 1] > height.max) {
        positions[i3 + 1] = height.min;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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

// Componente del jugador con controles de primera persona
function Player() {
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys();
    const { speed, height, friction } = FOG_SCENE_CONFIG.player;

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const sideVector = new THREE.Vector3(-1, 0, 0).applyQuaternion(
      camera.quaternion
    );

    direction.subVectors(frontVector, sideVector);

    if (forward)
      velocity.current.add(frontVector.multiplyScalar(speed * delta));
    if (backward)
      velocity.current.add(frontVector.multiplyScalar(-speed * delta));
    if (left) velocity.current.add(sideVector.multiplyScalar(speed * delta));
    if (right) velocity.current.add(sideVector.multiplyScalar(-speed * delta));

    // Aplicar fricción
    velocity.current.multiplyScalar(friction);

    // Mantener la cámara a una altura fija (primera persona)
    camera.position.add(velocity.current);
    camera.position.y = height; // Altura por encima de la niebla
  });

  return null;
}

// Componente del suelo
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
    </mesh>
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
      <FogParticles />
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
