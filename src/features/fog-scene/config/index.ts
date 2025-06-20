/**
 * 🌫️ FOG SCENE CONFIGURATION
 * Configuración centralizada para la escena de niebla
 */

// Configuración principal de la escena de niebla
export const FOG_SCENE_CONFIG = {
  camera: {
    position: [0, 12, 5] as [number, number, number],
    fov: 75,
    near: 0.1,
    far: 2000,
  },
  fog: {
    color: 0x87ceeb,
    near: 15,
    far: 150,
  },
  player: {
    speed: 12,
    height: 12,
    friction: 0.9,
  },
  boundaries: {
    wallDistance: 490,
    wallHeight: 25,
    maxHeight: 18,
    minHeight: 2,
  },
  particles: {
    count: 8000,
    area: {
      width: 1000,
      height: 1000,
    },
    height: {
      min: -2.0,
      max: 8.0,
    },
    size: {
      min: 15,
      max: 60,
    },
    opacity: {
      min: 0.1,
      max: 0.6,
    },
    speed: {
      base: 0.015,
      variation: 0.008,
    },
  },
} as const;

// Mapeado de controles de teclado
export const FOG_KEYBOARD_MAP = [
  { name: "forward", keys: ["ArrowUp", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "d", "D"] },
];

// Shaders para las partículas de niebla
export const FOG_SHADERS = {
  vertex: `
    attribute float size;
    attribute float opacity;
    varying float vOpacity;
    
    void main() {
      vOpacity = opacity;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragment: `
    varying float vOpacity;
    
    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      
      float alpha = 1.0 - smoothstep(0.0, 0.6, distanceToCenter);
      alpha = pow(alpha, 2.0);
      alpha *= vOpacity;
      
      gl_FragColor = vec4(0.9, 0.95, 1.0, alpha * 0.15);
    }
  `,
} as const;
