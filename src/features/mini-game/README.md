# 🎮 Super Runner 2D - Mini-Juego Integrado

## 📖 Descripción

Mini-juego tipo **endless runner 2D** integrado como transición entre el museo principal y el FogScene. Convierte la navegación en una experiencia interactiva donde el usuario debe sobrevivir 60 segundos antes de acceder a la escena de niebla.

## 🚀 Integración en el Flujo

```
Museo Principal → Click en Cuadro "FOG_SCENE" → Mini-Juego → FogScene
```

### Estados de Vista

- `"gallery"` - Museo principal
- `"miniGame"` - Super Runner 2D _(NUEVO)_
- `"fogScene"` - Escena de niebla
- `"modelViewer"` - Visor 3D

## 🎯 Características del Juego

### Mecánicas Principales

- **Runner infinito** con scroll horizontal
- **Sistema de vidas** (5 iniciales)
- **Tiempo límite** de 60 segundos
- **Sistema de puntuación** con multiplicadores de combo
- **Power-ups** temporales
- **Logros y achievements**

### Controles

- **Espacio** - Saltar
- **E** - Disparar
- **↓** - Agacharse
- **Shift** - Correr (velocidad extra)

### Power-ups

- **⚡ Velocidad** - Aumenta velocidad de movimiento
- **🛡️ Escudo** - Protección temporal contra daño
- **🦘 Doble Salto** - Capacidad de salto adicional
- **❤️ Vida Extra** - Restaura +2 vidas

## 🏗️ Arquitectura Técnica

### Estructura de Archivos

```
src/features/mini-game/
├── SuperRunner2D.tsx     # Componente principal del juego
├── index.ts             # Exports centralizados
└── README.md           # Esta documentación
```

### Tecnologías Utilizadas

- **React 18** con hooks funcionales
- **TypeScript** para type safety
- **HTML5 Canvas** para rendering 2D
- **styled-components** para estilos
- **RequestAnimationFrame** para game loop

## 🔄 Flujo de Integración

### 1. Trigger desde Museo

```typescript
// En App.tsx - Click en cuadro especial
const handleShowModelViewer = (modelUrl: string) => {
  if (modelUrl === "FOG_SCENE") {
    setCurrentView("miniGame"); // Intercepta el flujo
  }
};
```

### 2. Renderizado del Mini-Juego

```typescript
// En App.tsx
if (currentView === "miniGame") {
  return (
    <SuperRunner2D
      onGameComplete={handleMiniGameComplete}
      gameDuration={60000}
    />
  );
}
```

### 3. Completado del Juego

```typescript
const handleMiniGameComplete = () => {
  setCurrentView("fogScene"); // Transición automática
};
```

## 🎯 Condiciones de Victoria

### Completado Exitoso

1. **Supervivencia** durante 60 segundos completos
2. **Automático** - No requiere puntuación mínima
3. **Transición inmediata** al FogScene

## ✅ Testing y Calidad

### Build Status

- ✅ **Compilación limpia** sin errores
- ✅ **TypeScript strict** mode compatible
- ⚠️ **3 warnings** de dependencias en hooks (no críticos)
- ✅ **Bundle size** aceptable (~1.6MB total)

---

## 🎮 ¡Experiencia de Juego Completada!

El mini-juego añade una **dimensión lúdica** a la navegación del museo, convirtiendo la transición hacia el FogScene en una **experiencia memorable e interactiva**. Los usuarios no solo navegan el contenido, sino que participan activamente en él, creando un **engagement más profundo** con la aplicación.

**🎯 Objetivo conseguido:** Integración seamless entre museo y fog scene mediante gamificación.
