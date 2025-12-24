# 🌲 ManOnForest Model - Implementación en FogScene con Controles Leva

## 📋 Resumen de la Implementación

El modelo **ManOnForest.glb** ha sido integrado al **FogScene** siguiendo exactamente el mismo patrón arquitectónico utilizado en **Model3DViewerScene**. La implementación incluye **controles Leva interactivos** para ajuste en tiempo real de posición, rotación y escala, manteniendo la consistencia del sistema de modelos unificado.

## 🏗️ Arquitectura Implementada

### **1. Configuración Centralizada** (`src/core/config/index.ts`)

```typescript
// MODEL_PATHS actualizado
MAIN: {
  ANCEU: "/models/Anceu-Coliving-30-5-2025-textured_model.glb",
  MAN_ON_FOREST: "/models/ManOnForest.glb", // ✅ Nuevo
}

// Configuración específica para FogScene con posiciones optimizadas
export const MAN_ON_FOREST_CONFIG = {
  position: { x: 9, y: 40, z: 141 }, // Posición optimizada ajustada
  rotation: { x: -1.5, y: 0, z: 3.141592653589793 }, // Rotación optimizada con π en Z
  scale: { x: 8, y: 8, z: 8 }, // Escala grande para ser visible en la niebla
  envMapIntensity: 1.2,
  levaControls: {
    position: { x: 9, y: 40, z: 141 },
    rotation: { x: -1.5, y: 0, z: 3.141592653589793 },
    scale: { x: 8, y: 8, z: 8 },
    showAxes: true,
    axesSize: 5.0,
  },
};
```

### **2. Tipo de Configuración** (`src/core/models/types.ts`)

```typescript
// ManOnForest - Configuración para FogScene con controles Leva
export interface ManOnForestModelConfig extends BaseModelConfig {
  type: "MAN_ON_FOREST";
  levaControls: {
    position: Vector3Object;
    rotation: Vector3Object;
    scale: Vector3Object;
    showAxes: boolean;
    axesSize: number;
  };
  materialEnhancement: {
    envMapIntensity: number;
  };
  behaviors: ["levaControls", "materialEnhancement"];
}
```

### **3. Behavior Especializado** (`src/core/models/behaviors/ManOnForestBehaviors.ts`)

**Basado en el patrón de WindowViewBehaviors:**

- ✅ **Controles Leva interactivos** para posición, rotación y escala en tiempo real
- ✅ **Axes Helper configurable** con tamaño ajustable
- ✅ Clonado del scene para evitar modificaciones del original
- ✅ Centrado automático del modelo con pivot de rotación correcto
- ✅ Enhancement de materiales con `envMapIntensity`
- ✅ Habilitación de sombras (`castShadow` y `receiveShadow`)
- ✅ Traverse de todos los meshes para aplicar mejoras

```typescript
export const ManOnForestBehaviors = {
  useManOnForestBehavior: (config, gltf, groupRef) => {
    // Clonado y centrado del modelo
    // Enhancement de materiales
    // Configuración de sombras
    return { modifiedScene };
  },
};
```

### **4. Registry del Modelo** (`src/core/models/ModelRegistry.ts`)

```typescript
// MAN_ON_FOREST - Configuration for FogScene
const MAN_ON_FOREST_MODEL_CONFIG: ManOnForestModelConfig = {
  type: "MAN_ON_FOREST",
  path: MODEL_PATHS.MAIN.MAN_ON_FOREST,
  position: MAN_ON_FOREST_CONFIG.position,
  rotation: MAN_ON_FOREST_CONFIG.rotation,
  scale: MAN_ON_FOREST_CONFIG.scale,
  materialEnhancement: {
    envMapIntensity: MAN_ON_FOREST_CONFIG.envMapIntensity,
  },
  castShadow: true,
  receiveShadow: true,
  behaviors: ["materialEnhancement"],
};
```

### **5. Integración en BaseModel3D** (`src/core/models/BaseModel3D.tsx`)

```typescript
// Import del behavior
import ManOnForestBehaviors from "./behaviors/ManOnForestBehaviors";

// Uso del behavior
const manOnForestBehaviors =
  config.type === "MAN_ON_FOREST"
    ? ManOnForestBehaviors.useManOnForestBehavior(config, gltf, groupRef)
    : null;

// Renderizado específico
if (config.type === "MAN_ON_FOREST" && manOnForestBehaviors) {
  return (
    <group ref={groupRef} {...groupProps}>
      <primitive object={manOnForestBehaviors.modifiedScene} />
    </group>
  );
}
```

### **6. Integración en FogScene** (`src/features/fog-scene/components/FogContent.tsx`)

```typescript
import { BaseModel3D } from "../../../core/models";

// En el render
<FogLights />
<FogGround />
<FogInvisibleWalls />

{/* Modelo ManOnForest en el centro de la escena */}
<BaseModel3D modelId="MAN_ON_FOREST" />

<FogParticles />
```

### **7. Controles Leva** (`src/features/fog-scene/FogScene.tsx`)

```typescript
import { Leva } from "leva";

// En el render del FogScene
{
  /* Leva Controls for ManOnForest */
}
<Leva hidden={!sceneReady} />;
```

**Panel de Controles "ManOnForest (FogScene)":**

- **Posición**: X/Y/Z con rango -500 a 500 (step: 1.0)
- **Rotación**: X/Y/Z con rango -π a π (step: 0.1)
- **Escala**: X/Y/Z con rango 0.1 a 20.0 (step: 0.1)
- **Mostrar Ejes**: Toggle para axes helper
- **Tamaño Ejes**: Rango 1.0 a 20.0 (step: 0.5)

## 🎯 Características del Modelo en FogScene

### **Posicionamiento (Valores Optimizados)**

- **Posición Fija**: `{ x: 9, y: 40, z: 141 }` - Posición optimizada para mejor visibilidad
- **Rotación Fija**: `{ x: -1.5, y: 0, z: π }` - Orientación optimizada (-85.9° en X, 180° en Z)
- **Escala**: `{ x: 8, y: 8, z: 8 }` - Escala grande para visibilidad en niebla
- **Controles Leva**: Disponibles para ajustes adicionales si necesario

### **Materiales**

- **envMapIntensity**: `1.2` - Mejora la reflexión ambiental
- **castShadow**: `true` - Proyecta sombras
- **receiveShadow**: `true` - Recibe sombras
- **Material Enhancement**: Aplicado a todos los meshes

### **Comportamiento**

- **Centrado automático**: El modelo se centra en su origen local
- **Clonado seguro**: No modifica el modelo original
- **Optimización de materiales**: Enhancement específico para fog scene

### **Controles Interactivos**

- **Panel Leva**: "ManOnForest (FogScene)" visible cuando la escena está lista
- **Posición en tiempo real**: Ajuste X/Y/Z con precisión de 1 unidad
- **Rotación precisa**: Control X/Y/Z con pasos de 0.1 radianes
- **Escala dinámica**: Desde 0.1x hasta 20x el tamaño original
- **Axes Helper**: Visualización opcional de ejes con tamaño configurable

## 🔧 Integración con el Sistema

### **Flujo de Renderizado**

1. **Registry** → Configuración centralizada
2. **BaseModel3D** → Detecta tipo "MAN_ON_FOREST"
3. **ManOnForestBehaviors** → Aplica transformaciones y mejoras
4. **FogContent** → Renderiza en la escena de niebla

### **Consistencia Arquitectónica**

- ✅ **Mismo patrón** que Model3DViewerScene
- ✅ **Behaviors modulares** reutilizables
- ✅ **Configuración centralizada** modificable
- ✅ **Tipos TypeScript** estrictos
- ✅ **Registry unificado** con validación

## 🚀 Beneficios de la Implementación

### **Mantenibilidad**

- Configuración fácil de modificar en `MAN_ON_FOREST_CONFIG`
- Behavior reutilizable para otros modelos similares
- Integración automática con sistema de sombras y materiales

### **Escalabilidad**

- Patrón replicable para futuros modelos en FogScene
- Base sólida para más características (animaciones, interacciones)
- Arquitectura consistente con el resto del proyecto

### **Performance**

- Clonado eficiente del modelo
- Enhancement de materiales optimizado
- Sistema de sombras configurado correctamente

## 🎮 Experiencia de Usuario

El modelo **ManOnForest** aparece como una presencia misteriosa en el centro del área explorable del FogScene con **controles interactivos**:

- **Visibilidad configurable**: Escala ajustable desde 0.1x hasta 20x para adaptarse a diferentes perspectivas
- **Posicionamiento libre**: Movimiento en tiempo real por todo el espacio de 1000x1000 unidades
- **Orientación personalizable**: Rotación precisa para encontrar la mejor vista
- **Ubicación estratégica**: Posición inicial central (z: 150) que actúa como punto de referencia
- **Integración visual**: Enhancement de materiales que se adapta a la atmósfera neblinosa
- **Calidad visual**: Sombras y reflexiones que aumentan el realismo
- **Ayudas visuales**: Axes helper opcional para referencia espacial

---

**Implementación completada siguiendo exactamente el patrón arquitectónico establecido para máxima consistencia y mantenibilidad.**
