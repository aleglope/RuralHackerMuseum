import React, { useRef, useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";

interface SuperRunner2DProps {
  onGameComplete: () => void;
  gameDuration?: number; // En milisegundos, default 60 segundos
}

// Styled Components para el CSS
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const comboPopup = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

const achievementShow = keyframes`
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
`;

const GameContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: "Arial", sans-serif;
  overflow: hidden;
`;

const GameBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
`;

const GameInfo = styled.div`
  display: flex;
  gap: 30px;
  font-size: 18px;
  font-weight: bold;

  @media (max-width: 768px) {
    gap: 15px;
    font-size: 14px;
  }
`;

const Score = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Lives = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PowerUps = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PowerUpIndicator = styled.div<{ active: boolean }>`
  padding: 5px 10px;
  background: #2ecc71;
  border-radius: 5px;
  font-size: 14px;
  display: ${(props) => (props.active ? "block" : "none")};
  animation: ${(props) => (props.active ? pulse : "none")} 0.5s infinite;
`;

const GameCanvas = styled.canvas`
  border: 3px solid #333;
  border-radius: 10px;
  display: block;
  background: #87ceeb;
  cursor: crosshair;
  max-width: 100%;
  max-height: 60vh;
`;

const ParticleCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const ComboCounter = styled.div<{ show: boolean }>`
  position: absolute;
  top: 100px;
  right: 50px;
  font-size: 24px;
  font-weight: bold;
  color: #f39c12;
  display: ${(props) => (props.show ? "block" : "none")};
  animation: ${(props) => (props.show ? comboPopup : "none")} 0.5s ease-out;
`;

const Achievement = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: gold;
  padding: 20px;
  border-radius: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: ${(props) => (props.show ? "block" : "none")};
  z-index: 20;
  animation: ${(props) => (props.show ? achievementShow : "none")} 3s
    ease-in-out;
`;

const ControlsInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  opacity: 0.7;
`;

const TimeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
`;

const ExitButton = styled.button`
  position: absolute;
  top: 10px;
  right: 20px;
  background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: linear-gradient(90deg, #c0392b 0%, #a93226 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Interfaces para las clases del juego
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  jumping: boolean;
  jumpVelocity: number;
  grounded: boolean;
  crouching: boolean;
  running: boolean;
  movingLeft: boolean;
  movingRight: boolean;
  doubleJumpAvailable: boolean;
  hasDoubleJump: boolean;
  hasShield: boolean;
  hasSpeedBoost: boolean;
  shieldTime: number;
  speedBoostTime: number;
  doubleJumpTime: number;
  invulnerable: boolean;
  invulnerableTime: number;
  color: string;
  runAnimation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
  update(): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

interface BackgroundElement {
  x: number;
  type: string;
  speed: number;
}

// Constantes del juego (movidas fuera del componente)
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 400;
const gravity = 0.6;
const jumpPower = -18;
const groundY = CANVAS_HEIGHT - 70;

// Configuración de dificultad
const difficultySettings = {
  normal: { speedMultiplier: 1, spawnRate: 0.015, startLives: 5 },
};

const SuperRunner2D: React.FC<SuperRunner2DProps> = ({
  onGameComplete,
  gameDuration = 60000, // 60 segundos por defecto
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Estados del juego
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("highScore") || "0");
  });
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(gameDuration / 1000);
  const [combo, setCombo] = useState(0);
  const [achievement, setAchievement] = useState("");
  const [showAchievement, setShowAchievement] = useState(false);

  // Estados de power-ups
  const [powerUps, setPowerUps] = useState({
    shield: false,
    speed: false,
    doubleJump: false,
  });

  // Variables del juego usando useRef para persistir
  const gameState = useRef({
    gameRunning: false,
    gameSpeed: 3,
    startTime: 0,
    combo: 0,
    totalInsectsKilled: 0,
    lastInsectKillTime: 0,
    achievementsUnlocked: [] as string[],
    maxCombo: 0,
  });

  // Objetos del juego
  const gameObjects = useRef({
    player: {
      x: 100,
      y: groundY - 50,
      width: 50,
      height: 50,
      jumping: false,
      jumpVelocity: 0,
      grounded: true,
      crouching: false,
      running: false,
      movingLeft: false,
      movingRight: false,
      doubleJumpAvailable: false,
      hasDoubleJump: false,
      hasShield: false,
      hasSpeedBoost: false,
      shieldTime: 0,
      speedBoostTime: 0,
      doubleJumpTime: 0,
      invulnerable: false,
      invulnerableTime: 0,
      color: "#3498db",
      runAnimation: 0,
    },
    obstacles: [] as any[],
    insects: [] as any[],
    bullets: [] as any[],
    powerUpItems: [] as any[],
    particles: [] as any[],
    clouds: [] as any[],
    backgroundElements: [] as any[],
  });

  const keys = useRef<{ [key: string]: boolean }>({});

  // Clases del juego
  class Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    type: string;

    constructor() {
      this.x = CANVAS_WIDTH;
      this.y = groundY - 30;
      this.width = 25;
      this.height = 30;
      this.color = "#8B4513";
      this.type = Math.random() > 0.8 ? "tall" : "normal";
      if (this.type === "tall") {
        this.height = 45;
        this.y = groundY - 45;
      }
    }

    update() {
      this.x -=
        gameState.current.gameSpeed * difficultySettings.normal.speedMultiplier;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      if (this.type === "tall") {
        ctx.fillRect(this.x - 8, this.y + 15, 8, 12);
        ctx.fillRect(this.x + this.width, this.y + 8, 8, 12);
      }
      ctx.fillRect(this.x + 8, this.y - 12, 8, 12);
    }
  }

  class FlyingInsect {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    wingAnimation: number;
    verticalMovement: number;
    health: number;

    constructor() {
      this.x = CANVAS_WIDTH;
      this.y = groundY - 80 - Math.random() * 120;
      this.width = 35;
      this.height = 25;
      this.color = "#FF6347";
      this.wingAnimation = 0;
      this.verticalMovement = 0;
      this.health = 2;
    }

    update() {
      this.x -=
        (gameState.current.gameSpeed + 1.5) *
        difficultySettings.normal.speedMultiplier;
      this.wingAnimation += 0.3;
      this.verticalMovement += 0.1;
      this.y += Math.sin(this.verticalMovement) * 2;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.health > 1 ? this.color : "#FF9999";
      ctx.fillRect(this.x, this.y, this.width, this.height);

      const wingOffset = Math.sin(this.wingAnimation) * 8;
      ctx.fillStyle = "#FFB6C1";
      ctx.fillRect(this.x - 8, this.y - wingOffset, 15, 12);
      ctx.fillRect(this.x + this.width - 7, this.y - wingOffset, 15, 12);

      ctx.fillStyle = "#000";
      ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
      ctx.fillRect(this.x + 18, this.y + 8, 4, 4);

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 15, this.y);
      ctx.lineTo(this.x + 12, this.y - 8);
      ctx.moveTo(this.x + 20, this.y);
      ctx.lineTo(this.x + 23, this.y - 8);
      ctx.stroke();
    }

    takeDamage(): boolean {
      this.health--;
      createParticles(
        this.x + this.width / 2,
        this.y + this.height / 2,
        "#FF6347"
      );
      return this.health <= 0;
    }
  }

  class Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    trail: Array<{ x: number; y: number }>;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.width = 15;
      this.height = 8;
      this.speed = 12;
      this.color = "#FFD700";
      this.trail = [];
    }

    update() {
      this.x += this.speed;
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 5) {
        this.trail.shift();
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      this.trail.forEach((pos, index) => {
        ctx.globalAlpha = (index / this.trail.length) * 0.5;
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(pos.x - 5, pos.y + 2, 10, 4);
      });

      ctx.globalAlpha = 1;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(
        this.x,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#FFFF00";
      ctx.beginPath();
      ctx.ellipse(this.x + 3, this.y + 2, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class PowerUpItem {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    bounceAnimation: number;

    constructor() {
      this.x = CANVAS_WIDTH;
      this.y = groundY - 100 - Math.random() * 100;
      this.width = 40;
      this.height = 40;
      this.type = this.getRandomType();
      this.bounceAnimation = 0;
    }

    getRandomType(): string {
      const types = ["shield", "speed", "doubleJump", "life", "life", "life"];
      return types[Math.floor(Math.random() * types.length)];
    }

    update() {
      this.x -= gameState.current.gameSpeed;
      this.bounceAnimation += 0.1;
      this.y += Math.sin(this.bounceAnimation) * 2;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.bounceAnimation) * 0.2;
      ctx.fillStyle = this.getColor();
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const emoji =
        {
          shield: "🛡️",
          speed: "⚡",
          doubleJump: "🦘",
          life: "❤️",
        }[this.type] || "❤️";

      ctx.fillText(emoji, this.x + this.width / 2, this.y + this.height / 2);
      ctx.restore();
    }

    getColor(): string {
      switch (this.type) {
        case "shield":
          return "#3498db";
        case "speed":
          return "#f39c12";
        case "doubleJump":
          return "#9b59b6";
        case "life":
          return "#e74c3c";
        default:
          return "#95a5a6";
      }
    }
  }

  class GameParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    size: number;

    constructor(x: number, y: number, color: string) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8;
      this.color = color;
      this.life = 1;
      this.size = Math.random() * 5 + 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;
      this.life -= 0.02;
      this.size *= 0.98;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.globalAlpha = 1;
    }
  }

  // Funciones del juego
  const createParticles = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      gameObjects.current.particles.push(new GameParticle(x, y, color));
    }
  };

  const jump = () => {
    const player = gameObjects.current.player;
    if (player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.jumpVelocity = jumpPower;
      player.doubleJumpAvailable = player.hasDoubleJump;
      createParticles(
        player.x + player.width / 2,
        player.y + player.height,
        "#87CEEB",
        5
      );
    } else if (player.doubleJumpAvailable) {
      player.jumpVelocity = jumpPower * 0.8;
      player.doubleJumpAvailable = false;
      createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        "#9b59b6",
        8
      );
    }
  };

  const shoot = () => {
    const player = gameObjects.current.player;
    const bulletY = player.crouching
      ? player.y + player.height - 15
      : player.y + player.height / 2;
    gameObjects.current.bullets.push(
      new Bullet(player.x + player.width, bulletY)
    );
    createParticles(player.x + player.width, bulletY, "#FFD700", 3);
  };

  const checkCollision = (rect1: any, rect2: any): boolean => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const showAchievementMsg = (text: string) => {
    setAchievement(text);
    setShowAchievement(true);
    setTimeout(() => {
      setShowAchievement(false);
    }, 3000);
  };

  const collectPowerUp = (powerUp: PowerUpItem) => {
    const player = gameObjects.current.player;
    createParticles(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2,
      powerUp.getColor(),
      30
    );

    switch (powerUp.type) {
      case "shield":
        player.hasShield = true;
        player.shieldTime = 600;
        setPowerUps((prev) => ({ ...prev, shield: true }));
        break;
      case "speed":
        player.hasSpeedBoost = true;
        player.speedBoostTime = 400;
        setPowerUps((prev) => ({ ...prev, speed: true }));
        break;
      case "doubleJump":
        player.hasDoubleJump = true;
        player.doubleJumpTime = 800;
        setPowerUps((prev) => ({ ...prev, doubleJump: true }));
        break;
      case "life":
        setLives((prev) => prev + 2);
        showAchievementMsg("❤️ +2 Vidas!");
        break;
    }
  };

  // Función para salir anticipadamente
  const exitToFogScene = () => {
    // Guardar high score antes de salir
    if (score > highScore) {
      const newHighScore = score;
      setHighScore(newHighScore);
      localStorage.setItem("highScore", newHighScore.toString());
    }

    gameState.current.gameRunning = false;
    showAchievementMsg("🌟 ¡Saliendo al FogScene!");

    // Pequeño delay para mostrar el mensaje
    setTimeout(() => {
      onGameComplete();
    }, 1000);
  };

  // Inicialización del juego
  const initGame = () => {
    gameState.current.startTime = Date.now();
    gameState.current.gameRunning = true;
    gameState.current.gameSpeed = 3;
    gameState.current.combo = 0;
    gameState.current.totalInsectsKilled = 0;

    setLives(5);
    setScore(0);
    setCombo(0);
    setTimeLeft(gameDuration / 1000);

    // Resetear jugador
    const player = gameObjects.current.player;
    player.x = 100; // Posición inicial centrada
    player.y = groundY - player.height;
    player.jumping = false;
    player.grounded = true;
    player.jumpVelocity = 0;
    player.crouching = false;
    player.running = false;
    player.movingLeft = false;
    player.movingRight = false;
    player.hasShield = false;
    player.hasSpeedBoost = false;
    player.hasDoubleJump = false;
    player.invulnerable = false;
    player.height = 50;

    // Limpiar arrays
    gameObjects.current.obstacles = [];
    gameObjects.current.insects = [];
    gameObjects.current.bullets = [];
    gameObjects.current.powerUpItems = [];
    gameObjects.current.particles = [];
    gameObjects.current.clouds = [];
    gameObjects.current.backgroundElements = [];

    // Inicializar fondo
    for (let i = 0; i < 5; i++) {
      gameObjects.current.clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * 150,
        width: 60 + Math.random() * 40,
        speed: 0.2 + Math.random() * 0.3,
      });
    }

    for (let i = 0; i < 3; i++) {
      gameObjects.current.backgroundElements.push({
        x: i * 300 + Math.random() * 100,
        type: Math.random() > 0.5 ? "mountain" : "tree",
        speed: 0.5,
      });
    }

    setPowerUps({ shield: false, speed: false, doubleJump: false });
  };

  // Update del juego
  const updateGame = () => {
    if (!gameState.current.gameRunning) return;

    const player = gameObjects.current.player;

    // Controles continuos
    if (keys.current["ArrowDown"] && player.grounded) {
      player.crouching = true;
      player.height = 25;
    } else if (!keys.current["ArrowDown"] && player.crouching) {
      player.crouching = false;
      player.height = 50;
    }

    if (keys.current["ShiftLeft"] || keys.current["ShiftRight"]) {
      player.running = true;
      gameState.current.gameSpeed =
        5 * difficultySettings.normal.speedMultiplier;
    } else {
      player.running = false;
      gameState.current.gameSpeed =
        3 * difficultySettings.normal.speedMultiplier;
    }

    // Movimiento lateral del jugador
    const moveSpeed = 4;
    player.movingLeft = keys.current["KeyA"];
    player.movingRight = keys.current["KeyD"];

    if (player.movingLeft && player.x > 0) {
      player.x -= moveSpeed;
      createParticles(
        player.x + player.width / 2,
        player.y + player.height,
        "#87CEEB",
        2
      );
    }
    if (player.movingRight && player.x < CANVAS_WIDTH - player.width) {
      player.x += moveSpeed;
      createParticles(
        player.x + player.width / 2,
        player.y + player.height,
        "#87CEEB",
        2
      );
    }

    // Física del jugador
    if (player.jumping) {
      player.jumpVelocity += gravity;
      player.y += player.jumpVelocity;

      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.jumping = false;
        player.grounded = true;
        player.jumpVelocity = 0;
        player.doubleJumpAvailable = false;
      }
    }

    // Actualizar power-ups del jugador
    if (player.hasShield) {
      player.shieldTime--;
      if (player.shieldTime <= 0) {
        player.hasShield = false;
        setPowerUps((prev) => ({ ...prev, shield: false }));
      }
    }

    if (player.hasSpeedBoost) {
      player.speedBoostTime--;
      gameState.current.gameSpeed =
        6 * difficultySettings.normal.speedMultiplier;
      if (player.speedBoostTime <= 0) {
        player.hasSpeedBoost = false;
        setPowerUps((prev) => ({ ...prev, speed: false }));
      }
    }

    if (player.hasDoubleJump) {
      player.doubleJumpTime--;
      if (player.doubleJumpTime <= 0) {
        player.hasDoubleJump = false;
        player.doubleJumpAvailable = false;
        setPowerUps((prev) => ({ ...prev, doubleJump: false }));
      }
    }

    if (player.invulnerable) {
      player.invulnerableTime--;
      if (player.invulnerableTime <= 0) {
        player.invulnerable = false;
      }
    }

    // Actualizar tiempo
    const elapsed = (Date.now() - gameState.current.startTime) / 1000;
    const remaining = Math.max(0, gameDuration / 1000 - elapsed);
    setTimeLeft(Math.ceil(remaining));

    // Verificar si el tiempo se agotó
    if (remaining <= 0) {
      if (score > highScore) {
        const newHighScore = score;
        setHighScore(newHighScore);
        localStorage.setItem("highScore", newHighScore.toString());
      }
      gameState.current.gameRunning = false;
      onGameComplete();
      return;
    }

    // Actualizar nubes y fondo
    gameObjects.current.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x < -cloud.width) {
        cloud.x = CANVAS_WIDTH + Math.random() * 100;
      }
    });

    gameObjects.current.backgroundElements.forEach((element) => {
      element.x -= element.speed;
      if (element.x < -100) {
        element.x = CANVAS_WIDTH + Math.random() * 200;
      }
    });

    // Spawning de objetos
    if (
      Math.random() < difficultySettings.normal.spawnRate &&
      gameObjects.current.obstacles.length < 4
    ) {
      gameObjects.current.obstacles.push(new Obstacle());
    }

    if (
      Math.random() < difficultySettings.normal.spawnRate * 0.7 &&
      gameObjects.current.insects.length < 3
    ) {
      gameObjects.current.insects.push(new FlyingInsect());
    }

    if (Math.random() < 0.008 && gameObjects.current.powerUpItems.length < 1) {
      gameObjects.current.powerUpItems.push(new PowerUpItem());
    }

    // Actualizar obstáculos
    gameObjects.current.obstacles = gameObjects.current.obstacles.filter(
      (obstacle) => {
        obstacle.update();

        if (checkCollision(player, obstacle) && !player.invulnerable) {
          if (player.hasShield) {
            player.hasShield = false;
            player.shieldTime = 0;
            setPowerUps((prev) => ({ ...prev, shield: false }));
            createParticles(
              player.x + player.width / 2,
              player.y + player.height / 2,
              "#3498db",
              15
            );
          } else {
            setLives((prev) => prev - 1);
            player.invulnerable = true;
            player.invulnerableTime = 180;
            createParticles(
              player.x + player.width / 2,
              player.y + player.height / 2,
              "#e74c3c",
              20
            );
          }
          return false;
        }

        return obstacle.x > -obstacle.width;
      }
    );

    // Actualizar insectos
    gameObjects.current.insects = gameObjects.current.insects.filter(
      (insect) => {
        insect.update();

        if (checkCollision(player, insect) && !player.invulnerable) {
          if (player.hasShield) {
            player.hasShield = false;
            player.shieldTime = 0;
            setPowerUps((prev) => ({ ...prev, shield: false }));
            createParticles(
              insect.x + insect.width / 2,
              insect.y + insect.height / 2,
              "#3498db",
              15
            );
          } else {
            setLives((prev) => prev - 1);
            player.invulnerable = true;
            player.invulnerableTime = 180;
            createParticles(
              player.x + player.width / 2,
              player.y + player.height / 2,
              "#e74c3c",
              20
            );
          }
          setCombo(0);
          gameState.current.combo = 0;
          return false;
        }

        // Verificar colisión con balas
        for (let i = gameObjects.current.bullets.length - 1; i >= 0; i--) {
          if (checkCollision(gameObjects.current.bullets[i], insect)) {
            gameObjects.current.bullets.splice(i, 1);

            if (insect.takeDamage()) {
              const newScore = score + 100 * (gameState.current.combo + 1);
              setScore(newScore);
              gameState.current.totalInsectsKilled++;

              const currentTime = Date.now();
              if (currentTime - gameState.current.lastInsectKillTime < 2000) {
                gameState.current.combo++;
                if (gameState.current.combo > gameState.current.maxCombo) {
                  gameState.current.maxCombo = gameState.current.combo;
                }
              } else {
                gameState.current.combo = 1;
              }
              gameState.current.lastInsectKillTime = currentTime;

              setCombo(gameState.current.combo);
              createParticles(
                insect.x + insect.width / 2,
                insect.y + insect.height / 2,
                "#FFD700",
                20
              );
              return false;
            }
          }
        }

        return insect.x > -insect.width;
      }
    );

    // Actualizar power-ups
    gameObjects.current.powerUpItems = gameObjects.current.powerUpItems.filter(
      (powerUpItem) => {
        powerUpItem.update();

        if (checkCollision(player, powerUpItem)) {
          collectPowerUp(powerUpItem);
          return false;
        }

        return powerUpItem.x > -powerUpItem.width;
      }
    );

    // Actualizar balas
    gameObjects.current.bullets = gameObjects.current.bullets.filter(
      (bullet) => {
        bullet.update();
        return bullet.x < CANVAS_WIDTH;
      }
    );

    // Actualizar partículas
    gameObjects.current.particles = gameObjects.current.particles.filter(
      (particle) => {
        particle.update();
        return particle.life > 0;
      }
    );

    // Aumentar puntuación
    const scoreIncrement = player.running ? 2 : 1;
    setScore((prev) => prev + scoreIncrement);

    // Aumentar dificultad gradualmente
    if (score % 800 === 0 && score > 0) {
      gameState.current.gameSpeed += 0.1;
    }

    // Animación del jugador
    if (player.grounded) {
      player.runAnimation += 0.3;
    }
  };

  // Render del juego
  const drawGame = () => {
    const canvas = canvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!canvas || !particleCanvas) return;

    const ctx = canvas.getContext("2d");
    const particleCtx = particleCanvas.getContext("2d");
    if (!ctx || !particleCtx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    particleCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const player = gameObjects.current.player;

    // Dibujar cielo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98D8E8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, groundY);

    // Dibujar nubes
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    gameObjects.current.clouds.forEach((cloud) => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.width / 2, 0, Math.PI * 2);
      ctx.arc(
        cloud.x + cloud.width / 3,
        cloud.y,
        cloud.width / 3,
        0,
        Math.PI * 2
      );
      ctx.arc(
        cloud.x - cloud.width / 3,
        cloud.y,
        cloud.width / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Dibujar elementos de fondo
    gameObjects.current.backgroundElements.forEach((element) => {
      if (element.type === "mountain") {
        ctx.fillStyle = "#8B7355";
        ctx.beginPath();
        ctx.moveTo(element.x, groundY);
        ctx.lineTo(element.x + 50, groundY - 120);
        ctx.lineTo(element.x + 100, groundY);
        ctx.fill();
      } else {
        ctx.fillStyle = "#228B22";
        ctx.fillRect(element.x, groundY - 60, 20, 60);
        ctx.fillStyle = "#32CD32";
        ctx.beginPath();
        ctx.arc(element.x + 10, groundY - 70, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Dibujar suelo
    ctx.fillStyle = "#90EE90";
    ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);

    // Dibujar línea del suelo
    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(CANVAS_WIDTH, groundY);
    ctx.stroke();

    // Dibujar jugador
    ctx.save();

    // Efecto de invulnerabilidad
    if (
      player.invulnerable &&
      Math.floor(player.invulnerableTime / 10) % 2 === 0
    ) {
      ctx.globalAlpha = 0.5;
    }

    // Escudo visual
    if (player.hasShield) {
      ctx.fillStyle = "rgba(52, 152, 219, 0.3)";
      ctx.beginPath();
      ctx.arc(
        player.x + player.width / 2,
        player.y + player.height / 2,
        player.width,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Indicadores de movimiento lateral
    if (player.movingLeft) {
      ctx.fillStyle = "rgba(135, 206, 235, 0.6)";
      ctx.fillRect(player.x - 5, player.y, 5, player.height);
    }
    if (player.movingRight) {
      ctx.fillStyle = "rgba(135, 206, 235, 0.6)";
      ctx.fillRect(player.x + player.width, player.y, 5, player.height);
    }

    // Cuerpo del jugador
    ctx.fillStyle = player.color;
    const playerHeight = player.crouching ? 25 : player.height;
    ctx.fillRect(
      player.x,
      player.y + (player.height - playerHeight),
      player.width,
      playerHeight
    );

    // Piernas animadas
    if (player.grounded && !player.crouching) {
      ctx.fillStyle = "#2980b9";
      const legOffset = Math.sin(player.runAnimation) * 5;
      ctx.fillRect(
        player.x + 10,
        player.y + player.height - 10,
        10,
        10 + legOffset
      );
      ctx.fillRect(
        player.x + 30,
        player.y + player.height - 10,
        10,
        10 - legOffset
      );
    }

    // Ojos del jugador
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x + 30, player.y + 10, 12, 12);
    ctx.fillStyle = "#000";
    ctx.fillRect(player.x + 35, player.y + 13, 6, 6);

    ctx.restore();

    // Dibujar todos los objetos
    gameObjects.current.obstacles.forEach((obstacle) => obstacle.draw(ctx));
    gameObjects.current.insects.forEach((insect) => insect.draw(ctx));
    gameObjects.current.powerUpItems.forEach((powerUp) => powerUp.draw(ctx));
    gameObjects.current.bullets.forEach((bullet) => bullet.draw(ctx));
    gameObjects.current.particles.forEach((particle) =>
      particle.draw(particleCtx)
    );
  };

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (currentTime - lastTimeRef.current >= 16) {
      // ~60 FPS
      updateGame();
      drawGame();
      lastTimeRef.current = currentTime;
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      if (!gameState.current.gameRunning) return;

      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }

      if (e.code === "KeyE") {
        e.preventDefault();
        shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Inicializar y empezar el juego
  useEffect(() => {
    initGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <GameContainer>
      <GameBox>
        <ExitButton onClick={exitToFogScene}>🌫️ Ir al FogScene</ExitButton>

        <GameHeader>
          <GameInfo>
            <Score>
              <span>🏆</span>
              <span>{score}</span>
            </Score>
            <Lives>
              <span>Vidas:</span>
              <span>{"❤️ ".repeat(Math.max(0, lives))}</span>
            </Lives>
            <div>
              <span>🌟 Récord:</span>
              <span>{highScore}</span>
            </div>
            <TimeLeft>
              <span>⏰</span>
              <span>{timeLeft}s</span>
            </TimeLeft>
          </GameInfo>
          <PowerUps>
            <PowerUpIndicator active={powerUps.speed}>
              ⚡ Velocidad
            </PowerUpIndicator>
            <PowerUpIndicator active={powerUps.shield}>
              🛡️ Escudo
            </PowerUpIndicator>
            <PowerUpIndicator active={powerUps.doubleJump}>
              🦘 Doble Salto
            </PowerUpIndicator>
          </PowerUps>
        </GameHeader>

        <div style={{ position: "relative" }}>
          <GameCanvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
          <ParticleCanvas
            ref={particleCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
        </div>

        <ComboCounter show={combo > 1}>
          Combo x<span>{combo}</span>
        </ComboCounter>

        <Achievement show={showAchievement}>{achievement}</Achievement>

        <ControlsInfo>
          <strong>Controles:</strong> Espacio = Saltar | E = Disparar | ↓ =
          Agacharse | Shift = Correr | A/D = Mover
        </ControlsInfo>
      </GameBox>
    </GameContainer>
  );
};

export default SuperRunner2D;
