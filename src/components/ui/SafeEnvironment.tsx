import React, { useState } from "react";
import { Environment } from "@react-three/drei";

interface SafeEnvironmentProps {
  preset?: string;
  fallback?: "studio" | "basic" | "none";
  backgroundColor?: string;
}

/**
 * 🛡️ SafeEnvironment Component
 *
 * Componente Environment robusto que maneja errores de conectividad
 * y proporciona fallbacks locales cuando no se pueden cargar HDRIs externos.
 */
const SafeEnvironment: React.FC<SafeEnvironmentProps> = ({
  preset = "city",
  fallback = "studio",
  backgroundColor = "#1a1a1a",
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Manejar errores de carga del Environment
  const handleError = React.useCallback(() => {
    console.warn(
      `Failed to load Environment preset: ${preset}. Using fallback.`
    );
    setHasError(true);
    setIsLoading(false);
  }, [preset]);

  // Manejar carga exitosa
  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  // Si hay error, usar fallback básico
  if (hasError) {
    if (fallback === "basic") {
      return (
        <>
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            color="#ffffff"
          />
        </>
      );
    } else if (fallback === "none") {
      return null;
    } else {
      // Fallback "studio" - ambiente simple sin HDRIs externos
      return (
        <>
          <ambientLight intensity={0.4} color="#e6f3ff" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            color="#ffffff"
          />
          <pointLight
            position={[-10, -10, -5]}
            intensity={0.3}
            color="#ff8844"
          />
          <pointLight position={[10, -10, 5]} intensity={0.2} color="#4488ff" />
        </>
      );
    }
  }

  // Intentar cargar el preset original
  return (
    <React.Suspense fallback={<ambientLight intensity={0.5} color="#ffffff" />}>
      <ErrorBoundary onError={handleError}>
        <Environment preset={preset as any} />
      </ErrorBoundary>
    </React.Suspense>
  );
};

// Error Boundary simple para capturar errores del Environment
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default SafeEnvironment;
