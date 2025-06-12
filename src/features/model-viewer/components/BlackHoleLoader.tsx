import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

interface BlackHoleLoaderProps {
  progress: number;
  onComplete?: () => void;
}

// Animaciones CSS mejoradas con mayor escala y brillo
const pulsate = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`;

const rotateDisk = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const lensing = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.4) rotate(180deg);
  }
`;

const pulseText = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

// Logo animation con mayor brillo y escala
const logoGlow = keyframes`
  0%, 100% {
    transform: scale(1.5) rotate(0deg);
    filter: drop-shadow(0 0 20px #6600ff) drop-shadow(0 0 40px #4400aa);
  }
  25% {
    transform: scale(2.0) rotate(90deg);
    filter: drop-shadow(0 0 30px #8800ff) drop-shadow(0 0 60px #6600cc);
  }
  50% {
    transform: scale(2.5) rotate(180deg);
    filter: drop-shadow(0 0 50px #aa00ff) drop-shadow(0 0 100px #8800dd);
  }
  75% {
    transform: scale(2.0) rotate(270deg);
    filter: drop-shadow(0 0 30px #8800ff) drop-shadow(0 0 60px #6600cc);
  }
`;

const logoFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
`;

// Styled Components
const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const BlackHoleContainer = styled.div`
  position: relative;
  width: 600px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 90vw;
    height: 90vw;
    max-width: 400px;
    max-height: 400px;
  }
`;

// Event Horizon más grande y brillante
const EventHorizon = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle at center,
    #000 0%,
    #000 30%,
    #1a0033 50%,
    #2d0066 70%,
    transparent 100%
  );
  border-radius: 50%;
  box-shadow: 0 0 80px 30px #6600ff, 0 0 150px 60px #4400aa,
    0 0 250px 100px #2200ff, inset 0 0 80px #000;
  z-index: 100;
  animation: ${pulsate} 2s ease-in-out infinite;
`;

const LogoContainer = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 150;
  animation: ${logoFloat} 3s ease-in-out infinite;
`;

const LogoSvg = styled.img`
  width: 50px;
  height: 50px;
  filter: brightness(0) invert(1);
  animation: ${logoGlow} 4s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(3) !important;
    filter: brightness(0) invert(1) drop-shadow(0 0 50px #ff00ff)
      drop-shadow(0 0 100px #aa00ff) !important;
    animation-play-state: paused;
  }
`;

// Disco de acreción más grande y brillante
const AccretionDisk = styled.div`
  position: absolute;
  width: 550px;
  height: 550px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 15%,
    rgba(138, 43, 226, 0.2) 25%,
    rgba(75, 0, 130, 0.4) 40%,
    rgba(138, 43, 226, 0.2) 60%,
    transparent 80%
  );
  animation: ${rotateDisk} 15s linear infinite;

  @media (max-width: 768px) {
    width: 90%;
    height: 90%;
  }
`;

const GravitationalLensing = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    transparent 40%,
    rgba(138, 43, 226, 0.1) 50%,
    transparent 60%
  );
  animation: ${lensing} 3s ease-in-out infinite;
`;

const LoadingPercentage = styled.div<{ $progress: number }>`
  position: absolute;
  top: 50px;
  color: ${(props) => {
    const hue = 270 - (props.$progress / 100) * 60;
    return `hsl(${hue}, 100%, 70%)`;
  }};
  font-size: 56px;
  font-weight: bold;
  text-shadow: 0 0 50px currentColor, 0 0 100px currentColor;
  z-index: 200;
  transition: color 0.3s ease;
`;

const LoadingText = styled.div`
  position: absolute;
  bottom: 100px;
  color: #9400d3;
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 6px;
  text-transform: uppercase;
  text-shadow: 0 0 30px #9400d3, 0 0 60px #9400d3;
  animation: ${pulseText} 2s ease-in-out infinite;

  &::after {
    content: "...";
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0% {
      content: "";
    }
    25% {
      content: ".";
    }
    50% {
      content: "..";
    }
    75% {
      content: "...";
    }
  }
`;

// Clase Particle basada exactamente en el código HTML original
class Particle {
  x: number;
  y: number;
  radius: number;
  angle: number;
  baseSpeed: number;
  spiralRate: number;
  opacity: number;
  size: number;
  element: HTMLDivElement;
  trails: HTMLDivElement[];
  maxTrails: number;
  containerSize: number;

  constructor(container: HTMLDivElement, containerSize: number = 600) {
    this.containerSize = containerSize;
    this.trails = [];
    this.maxTrails = 15;
    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.borderRadius = "50%";
    this.element.style.pointerEvents = "none";
    this.element.style.zIndex = "50";
    container.appendChild(this.element);

    this.reset();
    this.angle = Math.random() * Math.PI * 2;
  }

  reset() {
    // Posición inicial exactamente como el original - desde los 4 bordes
    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
      case 0: // Arriba
        this.x = Math.random() * this.containerSize;
        this.y = 0;
        break;
      case 1: // Derecha
        this.x = this.containerSize;
        this.y = Math.random() * this.containerSize;
        break;
      case 2: // Abajo
        this.x = Math.random() * this.containerSize;
        this.y = this.containerSize;
        break;
      case 3: // Izquierda
        this.x = 0;
        this.y = Math.random() * this.containerSize;
        break;
    }

    this.radius = Math.sqrt(
      Math.pow(this.x - this.containerSize / 2, 2) +
        Math.pow(this.y - this.containerSize / 2, 2)
    );

    // Velocidades MÁS RÁPIDAS como el original HTML
    this.baseSpeed = 0.05 + Math.random() * 0.08; // Mucho más rápido
    this.spiralRate = 0.96 + Math.random() * 0.02; // Espiral más agresiva
    this.opacity = 1;
    this.size = 5 + Math.random() * 3; // Tamaño base como el original
  }

  createTrail() {
    const trail = document.createElement("div");
    trail.style.position = "absolute";
    trail.style.width = "3px";
    trail.style.height = "3px";
    trail.style.borderRadius = "50%";
    trail.style.background = "rgba(148, 0, 211, 0.8)";
    trail.style.pointerEvents = "none";
    trail.style.left = this.element.style.left;
    trail.style.top = this.element.style.top;
    trail.style.opacity = String(this.opacity * 0.5);
    trail.style.zIndex = "40";

    this.element.parentElement?.appendChild(trail);
    this.trails.push(trail);

    if (this.trails.length > this.maxTrails) {
      const oldTrail = this.trails.shift();
      oldTrail?.remove();
    }

    // Fade out trails
    this.trails.forEach((trail, index) => {
      trail.style.opacity = String(
        (index / this.trails.length) * this.opacity * 0.3
      );
    });
  }

  update(speedMultiplier: number) {
    // Calcular velocidad basada en la distancia al centro - exacto del original
    const centerX = this.containerSize / 2;
    const centerY = this.containerSize / 2;
    const distanceToCenter = Math.sqrt(
      Math.pow(this.x - centerX, 2) + Math.pow(this.y - centerY, 2)
    );

    const speed =
      this.baseSpeed *
      speedMultiplier *
      (1 + (centerX - distanceToCenter) / 100);

    // Movimiento en espiral - exacto del original
    this.angle += speed;
    this.radius *= this.spiralRate;

    // Convertir coordenadas polares a cartesianas
    this.x = centerX + this.radius * Math.cos(this.angle);
    this.y = centerY + this.radius * Math.sin(this.angle);

    // Actualizar opacidad basada en la distancia
    this.opacity = Math.min(1, distanceToCenter / 200);

    // Crear estela cada pocos frames - exacto del original
    if (Math.random() > 0.7) {
      this.createTrail();
    }

    // Si la partícula está muy cerca del centro, resetear
    if (this.radius < 60) {
      // Ajustado para el nuevo Event Horizon más grande
      this.reset();
      // Limpiar trails
      this.trails.forEach((trail) => trail.remove());
      this.trails = [];
    }

    this.render(speedMultiplier);
  }

  render(speedMultiplier: number) {
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.element.style.opacity = String(this.opacity);
    this.element.style.width = this.size + "px";
    this.element.style.height = this.size + "px";

    // Color basado en la velocidad - MUCHO MÁS BRILLANTE
    const hue = 270 - (speedMultiplier - 1) * 60;
    this.element.style.background = `hsl(${hue}, 100%, 80%)`;
    this.element.style.boxShadow = `
      0 0 ${12 + speedMultiplier * 6}px hsl(${hue}, 100%, 80%),
      0 0 ${24 + speedMultiplier * 12}px hsl(${hue}, 100%, 60%),
      0 0 ${36 + speedMultiplier * 18}px hsl(${hue}, 100%, 40%),
      0 0 ${48 + speedMultiplier * 24}px hsl(${hue}, 100%, 20%)
    `;
  }

  destroy() {
    this.trails.forEach((trail) => trail.remove());
    this.element.remove();
  }
}

export const BlackHoleLoader: React.FC<BlackHoleLoaderProps> = ({
  progress: realProgress,
  onComplete,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const speedMultiplierRef = useRef(1);

  // Progreso visual suave
  useEffect(() => {
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 4000;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setDisplayProgress(Math.floor(progress));

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, []);

  // Sistema de partículas dinámico - exacto del código HTML original
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const maxParticles = 180; // Más partículas para mayor efecto

    // Crear partículas iniciales
    const initParticles = () => {
      for (let i = 0; i < maxParticles; i++) {
        setTimeout(() => {
          if (containerRef.current) {
            particlesRef.current.push(new Particle(containerRef.current, 600));
          }
        }, i * 15); // Spawn gradual
      }
    };

    // Loop de animación - exacto del original
    const animate = () => {
      // Actualizar velocidad basada en progreso
      speedMultiplierRef.current = 1 + (displayProgress / 100) * 3; // Velocidad aumenta con progreso

      // Agregar más partículas a medida que avanza
      if (
        displayProgress % 20 === 0 &&
        particlesRef.current.length < maxParticles * 1.5
      ) {
        for (let i = 0; i < 15; i++) {
          if (containerRef.current) {
            particlesRef.current.push(new Particle(containerRef.current, 600));
          }
        }
      }

      // Actualizar todas las partículas
      particlesRef.current.forEach((particle) => {
        particle.update(speedMultiplierRef.current);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current.forEach((particle) => particle.destroy());
      particlesRef.current = [];
    };
  }, [displayProgress]);

  // Completar cuando ambos progresos estén listos
  useEffect(() => {
    if (
      realProgress >= 100 &&
      displayProgress >= 100 &&
      onComplete &&
      !completedRef.current
    ) {
      completedRef.current = true;
      setTimeout(onComplete, 500);
    }
  }, [realProgress, displayProgress, onComplete]);

  return (
    <LoaderContainer>
      <BlackHoleContainer ref={containerRef}>
        <GravitationalLensing />
        <AccretionDisk />
        <EventHorizon />

        <LogoContainer>
          <LogoSvg src="/LogoRHackers.svg" alt="RuralHackers Logo" />
        </LogoContainer>

        <LoadingPercentage $progress={displayProgress}>
          {displayProgress}%
        </LoadingPercentage>

        <LoadingText>Cargando</LoadingText>
      </BlackHoleContainer>
    </LoaderContainer>
  );
};
