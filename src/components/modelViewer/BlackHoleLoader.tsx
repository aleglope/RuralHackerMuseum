import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

interface BlackHoleLoaderProps {
  progress: number;
  onComplete?: () => void;
}

// Animaciones
const pulsate = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
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
    transform: scale(1.2) rotate(180deg);
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

const EventHorizon = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  background: radial-gradient(
    circle at center,
    #000 0%,
    #000 30%,
    #1a0033 50%,
    #2d0066 70%,
    transparent 100%
  );
  border-radius: 50%;
  box-shadow: 0 0 60px 20px #6600ff, 0 0 100px 40px #4400aa,
    0 0 150px 60px #2200ff, inset 0 0 60px #000;
  z-index: 100;
  animation: ${pulsate} 2s ease-in-out infinite;
`;

const AccretionDisk = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 15%,
    rgba(138, 43, 226, 0.1) 25%,
    rgba(75, 0, 130, 0.2) 40%,
    rgba(138, 43, 226, 0.1) 60%,
    transparent 80%
  );
  animation: ${rotateDisk} 20s linear infinite;

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
    rgba(138, 43, 226, 0.05) 50%,
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
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 0 30px currentColor;
  z-index: 200;
  transition: color 0.3s ease;
`;

const LoadingText = styled.div`
  position: absolute;
  bottom: 100px;
  color: #9400d3;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 20px #9400d3;
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

const Particle = styled.div.attrs<{
  $x: number;
  $y: number;
  $size: number;
  $opacity: number;
  $hue: number;
}>((props) => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
    width: `${props.$size}px`,
    height: `${props.$size}px`,
    opacity: props.$opacity,
    background: `hsl(${props.$hue}, 100%, 70%)`,
    boxShadow: `
      0 0 ${6 + props.$size}px hsl(${props.$hue}, 100%, 70%),
      0 0 ${12 + props.$size * 2}px hsl(${props.$hue}, 100%, 50%)
    `,
  },
}))`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: none;
`;

// Clase de partícula
class ParticleData {
  x: number = 0;
  y: number = 0;
  angle: number = 0;
  radius: number = 0;
  baseSpeed: number = 0;
  spiralRate: number = 0;
  opacity: number = 0;
  size: number = 0;
  id: string;

  constructor(containerSize: number) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.reset(containerSize);
    this.angle = Math.random() * Math.PI * 2;
  }

  reset(containerSize: number) {
    const edge = Math.floor(Math.random() * 4);
    const center = containerSize / 2;

    switch (edge) {
      case 0: // Arriba
        this.x = Math.random() * containerSize;
        this.y = 0;
        break;
      case 1: // Derecha
        this.x = containerSize;
        this.y = Math.random() * containerSize;
        break;
      case 2: // Abajo
        this.x = Math.random() * containerSize;
        this.y = containerSize;
        break;
      case 3: // Izquierda
        this.x = 0;
        this.y = Math.random() * containerSize;
        break;
    }

    this.radius = Math.sqrt(
      Math.pow(this.x - center, 2) + Math.pow(this.y - center, 2)
    );
    this.baseSpeed = 0.02 + Math.random() * 0.03;
    this.spiralRate = 0.98 + Math.random() * 0.01;
    this.opacity = 1;
    this.size = 4 + Math.random() * 2;
  }

  update(speedMultiplier: number, containerSize: number) {
    const center = containerSize / 2;
    const distanceToCenter = Math.sqrt(
      Math.pow(this.x - center, 2) + Math.pow(this.y - center, 2)
    );
    const speed =
      this.baseSpeed *
      speedMultiplier *
      (1 + (center - distanceToCenter) / 100);

    this.angle += speed;
    this.radius *= this.spiralRate;

    this.x = center + this.radius * Math.cos(this.angle);
    this.y = center + this.radius * Math.sin(this.angle);

    this.opacity = Math.min(1, distanceToCenter / 200);

    if (this.radius < 40) {
      this.reset(containerSize);
    }
  }
}

export const BlackHoleLoader: React.FC<BlackHoleLoaderProps> = ({
  progress,
  onComplete,
}) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const speedMultiplierRef = useRef(1);

  useEffect(() => {
    const containerSize = 600;
    const maxParticles = 150;
    const initialParticles: ParticleData[] = [];

    // Crear partículas iniciales
    for (let i = 0; i < maxParticles; i++) {
      setTimeout(() => {
        initialParticles.push(new ParticleData(containerSize));
        setParticles([...initialParticles]);
      }, i * 20);
    }

    // Animación principal
    const animate = () => {
      speedMultiplierRef.current = 1 + (progress / 100) * 2;

      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          particle.update(speedMultiplierRef.current, containerSize);
          return particle;
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [progress, onComplete]);

  const hue = 270 - (progress / 100) * 60;

  return (
    <LoaderContainer>
      <BlackHoleContainer ref={containerRef}>
        <GravitationalLensing />
        <AccretionDisk />
        <EventHorizon />
        <LoadingPercentage $progress={progress}>
          {Math.floor(progress)}%
        </LoadingPercentage>
        <LoadingText>Loading</LoadingText>

        {particles.map((particle) => (
          <Particle
            key={particle.id}
            $x={particle.x}
            $y={particle.y}
            $size={particle.size}
            $opacity={particle.opacity}
            $hue={hue}
          />
        ))}
      </BlackHoleContainer>
    </LoaderContainer>
  );
};
