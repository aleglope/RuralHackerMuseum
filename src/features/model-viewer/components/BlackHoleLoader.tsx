import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

interface BlackHoleLoaderProps {
  progress: number;
  onComplete?: () => void;
}

// Animaciones CSS (estas SIEMPRE funcionan)
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

// Animación para el logo central
const logoGlow = keyframes`
  0%, 100% {
    transform: scale(1.2) rotate(0deg);
    filter: drop-shadow(0 0 10px #6600ff) drop-shadow(0 0 20px #4400aa);
  }
  25% {
    transform: scale(1.5) rotate(90deg);
    filter: drop-shadow(0 0 15px #8800ff) drop-shadow(0 0 30px #6600cc);
  }
  50% {
    transform: scale(1.8) rotate(180deg);
    filter: drop-shadow(0 0 25px #aa00ff) drop-shadow(0 0 50px #8800dd);
  }
  75% {
    transform: scale(1.5) rotate(270deg);
    filter: drop-shadow(0 0 15px #8800ff) drop-shadow(0 0 30px #6600cc);
  }
`;

const logoFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
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

// Logo container en el centro del Event Horizon
const LogoContainer = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 150;
  animation: ${logoFloat} 3s ease-in-out infinite;
`;

const LogoSvg = styled.img`
  width: 35px;
  height: 35px;
  filter: brightness(0) invert(1);
  animation: ${logoGlow} 4s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(2.2) !important;
    filter: brightness(0) invert(1) drop-shadow(0 0 30px #ff00ff)
      drop-shadow(0 0 60px #aa00ff) !important;
    animation-play-state: paused;
  }
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

// Partícula que reproduce el comportamiento ORIGINAL
const Particle = styled.div<{
  $startX: number;
  $startY: number;
  $size: number;
  $hue: number;
  $delay: number;
  $duration: number;
}>`
  position: absolute;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: 50%;
  background: hsl(${(props) => props.$hue}, 100%, 70%);
  box-shadow: 0 0 ${(props) => 6 + props.$size}px
      hsl(${(props) => props.$hue}, 100%, 70%),
    0 0 ${(props) => 12 + props.$size * 2}px
      hsl(${(props) => props.$hue}, 100%, 50%);

  /* Posición inicial en el borde */
  left: ${(props) => props.$startX}px;
  top: ${(props) => props.$startY}px;

  /* CSS Animation - Espiral hacia el centro como el original */
  animation: spiralToCenter ${(props) => props.$duration}s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;

  @keyframes spiralToCenter {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(1);
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      transform: translate(
          ${(props) => 300 - props.$startX}px,
          ${(props) => 300 - props.$startY}px
        )
        rotate(720deg) scale(0.1);
      opacity: 0;
    }
  }
`;

export const BlackHoleLoader: React.FC<BlackHoleLoaderProps> = ({
  progress: realProgress,
  onComplete,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef(false);

  // Progreso visual suave que SIEMPRE funciona
  useEffect(() => {
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 4000; // 4 segundos
      const progress = Math.min((elapsed / duration) * 100, 100);

      setDisplayProgress(Math.floor(progress));

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, []);

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

  // Generar partículas como en el ORIGINAL - desde los 4 bordes
  const particles = React.useMemo(() => {
    const particleCount = 60;
    const items = [];
    const containerSize = 600;

    for (let i = 0; i < particleCount; i++) {
      // Mismo sistema original - desde los 4 bordes
      const edge = Math.floor(Math.random() * 4);
      let startX, startY;

      switch (edge) {
        case 0: // Top
          startX = Math.random() * containerSize;
          startY = 0;
          break;
        case 1: // Right
          startX = containerSize;
          startY = Math.random() * containerSize;
          break;
        case 2: // Bottom
          startX = Math.random() * containerSize;
          startY = containerSize;
          break;
        case 3: // Left
          startX = 0;
          startY = Math.random() * containerSize;
          break;
        default:
          startX = 0;
          startY = 0;
      }

      const size = 4 + Math.random() * 2;
      const duration = 5 + Math.random() * 3; // Duración como original
      const delay = Math.random() * duration;
      const hue = 260 + Math.random() * 40;

      items.push({
        id: i,
        startX,
        startY,
        size,
        duration,
        delay,
        hue,
      });
    }

    return items;
  }, []);

  const progressHue = 270 - (displayProgress / 100) * 60;

  return (
    <LoaderContainer>
      <BlackHoleContainer>
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

        {/* Partículas con comportamiento ORIGINAL pero CSS puro */}
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            $startX={particle.startX}
            $startY={particle.startY}
            $size={particle.size}
            $hue={progressHue}
            $delay={particle.delay}
            $duration={particle.duration}
          />
        ))}
      </BlackHoleContainer>
    </LoaderContainer>
  );
};
