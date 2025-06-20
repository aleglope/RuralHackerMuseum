# 🌫️ Fog Scene - Tercera Escena del Museo 3D

## Descripción

Escena inmersiva de niebla que se activa desde el cuadro #5 del museo principal. Implementa controles de primera persona con un sistema avanzado de partículas de niebla usando shaders personalizados.

## Características Principales

### 🎮 Sistema de Controles

- **Controles FPS**: WASD para movimiento, ratón para vista
- **Pointer Lock**: Click para activar controles inmersivos
- **Altura fija**: Cámara flotando por encima de la niebla (Y=12)

### 🌫️ Sistema de Partículas

- **2000 partículas** dinámicas con shaders personalizados
- **Movimiento procedural**: Patrones sinusoidales realistas
- **Reciclaje automático**: Partículas que se regeneran al salir del área
- **Optimizado**: Usando BufferGeometry y ShaderMaterial

### 🎨 Ambiente Visual

- **Niebla atmosférica**: Color azul cielo (#87ceeb)
- **Iluminación ambiental**: Luces suaves para crear atmósfera
- **Suelo infinito**: Plano blanco de 300x300 unidades
- **Transiciones suaves**: Fade in/out al entrar/salir

## Arquitectura Técnica

### Componentes Principales

1. **FogScene** - Componente principal exportado
2. **FogSceneContent** - Lógica interna de la escena
3. **FogParticles** - Sistema de partículas con shaders
4. **Player** - Controles de primera persona
5. **Ground** - Geometría del suelo
6. **Environment** - Sistema de iluminación

### Configuración Centralizada

```typescript
const FOG_SCENE_CONFIG = {
  camera: { position: [0, 12, 5], fov: 75 },
  fog: { color: 0x87ceeb, near: 10, far: 80 },
  player: { speed: 8, height: 12, friction: 0.9 },
  particles: { count: 2000, area: 200x200 }
}
```

## Integración con el Museo

### Punto de Entrada

- **Cuadro #5**: "Mural of Village Man" por @sketchyshona
- **Configuración**: `modelViewerPath: "FOG_SCENE"` en GALLERY_IMAGES
- **Routing**: Manejado en App.tsx con viewState "fogScene"

### Navegación

- **Entrada**: Click en "View 3D Model 🖼️" del cuadro #5
- **Salida**: Botón "← Volver al Museo" (esquina superior derecha)
- **Estado**: Preserva estado del museo al regresar

## Optimizaciones de Rendimiento

### React Three Fiber

- **AdaptiveDpr**: Ajuste automático de DPR
- **AdaptiveEvents**: Eventos optimizados
- **Preload**: Precarga de assets
- **Suspense**: Carga progresiva

### Sistema de Partículas

- **Float32Array**: Arrays tipados para máximo rendimiento
- **requestAnimationFrame**: Sincronización con 60fps
- **Culling**: Partículas fuera de área se regeneran
- **Shaders**: GPU acceleration para rendering

## Patrón de Desarrollo

### Arquitectura Consistente

Sigue el mismo patrón que `Model3DViewerScene`:

- ✅ Componente principal con props de navegación
- ✅ Estado de carga con overlays
- ✅ Configuración centralizada
- ✅ Optimizaciones de rendimiento
- ✅ UI/UX consistente

### Escalabilidad

- **Modular**: Componentes independientes
- **Configurable**: Parámetros centralizados
- **Extensible**: Fácil agregar nuevas features
- **Mantenible**: Código limpio y documentado
