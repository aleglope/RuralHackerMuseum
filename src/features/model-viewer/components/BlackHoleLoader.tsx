import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { keyframes } from "styled-components";
import * as THREE from "three";
import { BLACKHOLE_CONFIG } from "../../../core/config";

interface BlackHoleLoaderProps {
  progress: number;
  assetsReady?: boolean;
  meta?: {
    loaded: number;
    total: number;
    item: string;
  };
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

const ParticlesCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 45;
`;

const LoadingMeta = styled.div`
  position: absolute;
  bottom: 35px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  letter-spacing: 1px;
  max-width: 90%;
  text-align: center;
  z-index: 220;
  user-select: none;
`;

const ErrorText = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(231, 76, 60, 0.95);
  font-size: 12px;
  max-width: 90%;
  text-align: center;
  z-index: 230;
  user-select: none;
`;

const FpsText = styled.div`
  position: absolute;
  top: 10px;
  right: 15px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  letter-spacing: 1px;
  z-index: 240;
  user-select: none;
`;

type WorkerFrameMessage = {
  type: "frame";
  frame: ArrayBuffer;
  width: number;
  height: number;
};

type AssetKind = "model" | "texture" | "other";

export const BlackHoleLoader: React.FC<BlackHoleLoaderProps> = ({
  progress: realProgress,
  assetsReady = true,
  meta,
  onComplete,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const completedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const displayProgressFloatRef = useRef(0);
  const realProgressRef = useRef(realProgress);
  const assetsReadyRef = useRef(assetsReady);
  const onCompleteRef = useRef(onComplete);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const lastWorkerTickTimeRef = useRef<number>(performance.now());
  const lastReportedIntRef = useRef(-1);
  const inflightWorkerFrameRef = useRef(false);
  const loopRef = useRef<(now: number) => void>(() => {});
  const [loadingMeta, setLoadingMeta] = useState({
    loaded: 0,
    total: 0,
    item: "",
    estimatedTotalBytes: 0,
    loadedBytes: 0,
    modelsLoaded: 0,
    modelsTotal: 0,
    texturesLoaded: 0,
    texturesTotal: 0,
    etaSeconds: null as number | null,
  });
  const [errorState, setErrorState] = useState<{
    url: string;
    message: string;
  } | null>(null);
  const errorRef = useRef<{ url: string; message: string } | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const isMobile = useMemo(() => {
    return (
      window.innerWidth <= 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  const prefersReducedMotion = useMemo(() => {
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    );
  }, []);

  const particleCount = useMemo(() => {
    const base = Math.max(20, BLACKHOLE_CONFIG?.particles?.count ?? 80);
    if (prefersReducedMotion) return Math.min(base, 40);
    if (isMobile) return Math.min(base, 70);
    return Math.min(160, base * 2);
  }, [isMobile, prefersReducedMotion]);

  const tickIntervalMs = useMemo(() => {
    if (prefersReducedMotion) return 40;
    return isMobile ? 33 : 16;
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    realProgressRef.current = realProgress;
  }, [realProgress]);

  useEffect(() => {
    assetsReadyRef.current = assetsReady;
  }, [assetsReady]);

  useEffect(() => {
    if (!meta) return;
    managerCountsRef.current = {
      loaded: meta.loaded,
      total: meta.total,
      item: meta.item,
    };
  }, [meta]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    errorRef.current = errorState;
  }, [errorState]);

  const sizesAbortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(
    new Map<
      string,
      {
        weight: number;
        loaded: boolean;
        failed: boolean;
        sizeKnown: boolean;
        kind: AssetKind;
      }
    >()
  );
  const managerCountsRef = useRef({ loaded: 0, total: 0, item: "" });
  const startedAtRef = useRef<number>(performance.now());

  const getKindFromUrl = useCallback((url: string): AssetKind => {
    const normalized = (url || "").split("?")[0].split("#")[0].toLowerCase();
    const ext = normalized.includes(".") ? normalized.split(".").pop() : "";
    if (!ext) return "other";
    if (ext === "glb" || ext === "gltf") return "model";
    if (
      ext === "jpg" ||
      ext === "jpeg" ||
      ext === "png" ||
      ext === "webp" ||
      ext === "gif" ||
      ext === "bmp" ||
      ext === "tga" ||
      ext === "hdr" ||
      ext === "exr" ||
      ext === "ktx2"
    )
      return "texture";
    return "other";
  }, []);

  const scheduleHead = useCallback((url: string) => {
    const normalizedUrl = url || "";
    if (
      !normalizedUrl ||
      normalizedUrl.startsWith("data:") ||
      normalizedUrl.startsWith("blob:")
    )
      return;

    let resolved: URL | null = null;
    try {
      resolved = new URL(normalizedUrl, window.location.href);
    } catch {
      return;
    }
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return;
    if (resolved.origin !== window.location.origin) return;

    const entry = itemsRef.current.get(normalizedUrl);
    if (!entry || entry.sizeKnown) return;
    const controller = sizesAbortRef.current;
    const signal = controller?.signal;

    fetch(normalizedUrl, { method: "HEAD", signal })
      .then((res) => {
        const value = res.headers.get("content-length");
        const size = value ? Number.parseInt(value, 10) : NaN;
        if (!Number.isFinite(size) || size <= 0) return;
        const current = itemsRef.current.get(normalizedUrl);
        if (!current) return;
        current.sizeKnown = true;
        current.weight = size;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    sizesAbortRef.current?.abort();
    sizesAbortRef.current = new AbortController();
    itemsRef.current.clear();
    managerCountsRef.current = { loaded: 0, total: 0, item: "" };
    startedAtRef.current = performance.now();
    setErrorState(null);

    const manager = THREE.DefaultLoadingManager;
    const prev = {
      onStart: manager.onStart,
      onProgress: manager.onProgress,
      onLoad: manager.onLoad,
      onError: manager.onError,
    };

    const ensureItem = (url: string) => {
      const normalizedUrl = url || "";
      if (!itemsRef.current.has(normalizedUrl)) {
        itemsRef.current.set(normalizedUrl, {
          weight: 1,
          loaded: false,
          failed: false,
          sizeKnown: false,
          kind: getKindFromUrl(normalizedUrl),
        });
        scheduleHead(normalizedUrl);
      }
    };

    const markLoaded = (url: string) => {
      const normalizedUrl = url || "";
      const item = itemsRef.current.get(normalizedUrl);
      if (item) item.loaded = true;
    };

    manager.onStart = (
      url: string,
      itemsLoaded: number,
      itemsTotal: number
    ) => {
      ensureItem(url);
      managerCountsRef.current = {
        loaded: itemsLoaded,
        total: itemsTotal,
        item: url,
      };
      if (typeof prev.onStart === "function")
        prev.onStart(url, itemsLoaded, itemsTotal);
    };

    manager.onProgress = (
      url: string,
      itemsLoaded: number,
      itemsTotal: number
    ) => {
      ensureItem(url);
      markLoaded(url);
      managerCountsRef.current = {
        loaded: itemsLoaded,
        total: itemsTotal,
        item: url,
      };
      if (typeof prev.onProgress === "function")
        prev.onProgress(url, itemsLoaded, itemsTotal);
    };

    manager.onError = (url: string) => {
      const normalizedUrl = url || "";
      ensureItem(normalizedUrl);
      const item = itemsRef.current.get(normalizedUrl);
      if (item) item.failed = true;
      setErrorState({ url: normalizedUrl, message: "Error cargando recurso" });
      if (typeof prev.onError === "function") prev.onError(url);
    };

    manager.onLoad = () => {
      if (typeof prev.onLoad === "function") prev.onLoad();
    };

    return () => {
      sizesAbortRef.current?.abort();
      sizesAbortRef.current = null;
      manager.onStart = prev.onStart;
      manager.onProgress = prev.onProgress;
      manager.onLoad = prev.onLoad;
      manager.onError = prev.onError;
    };
  }, [getKindFromUrl, scheduleHead]);

  const computeWeightedProgress = useCallback((now: number) => {
    const counts = managerCountsRef.current;
    const entries = itemsRef.current;
    let totalWeight = 0;
    let loadedWeight = 0;
    let modelsLoaded = 0;
    let modelsTotal = 0;
    let texturesLoaded = 0;
    let texturesTotal = 0;

    for (const [, v] of entries) {
      totalWeight += v.weight;
      if (v.loaded) loadedWeight += v.weight;
      if (v.kind === "model") {
        modelsTotal += 1;
        if (v.loaded) modelsLoaded += 1;
      } else if (v.kind === "texture") {
        texturesTotal += 1;
        if (v.loaded) texturesLoaded += 1;
      }
    }

    const pct =
      totalWeight > 0 ? Math.min(100, (loadedWeight / totalWeight) * 100) : 0;

    const elapsedMs = Math.max(0, now - startedAtRef.current);
    const etaSeconds =
      pct > 0 && pct < 100
        ? Math.max(0, Math.ceil((elapsedMs * (100 / pct) - elapsedMs) / 1000))
        : null;

    return {
      pct,
      totalWeight: Math.round(totalWeight),
      loadedWeight: Math.round(loadedWeight),
      loaded: counts.loaded,
      total: counts.total,
      item: counts.item,
      modelsLoaded,
      modelsTotal,
      texturesLoaded,
      texturesTotal,
      etaSeconds,
    };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
    const nextHeight = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      workerRef.current?.postMessage({
        type: "resize",
        width: nextWidth,
        height: nextHeight,
      });
    }
  }, []);

  useEffect(() => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL("./blackHoleParticles.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Error inicializando worker";
      setErrorState((prev) => prev ?? { url: "worker", message });
      workerRef.current = null;
      inflightWorkerFrameRef.current = false;
      return () => {};
    }

    const handleMessage = (event: MessageEvent<WorkerFrameMessage>) => {
      const data = event.data;
      if (data?.type !== "frame") return;
      inflightWorkerFrameRef.current = false;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      const frame = new Float32Array(data.frame);
      const speed = 1 + (progressRef.current / 100) * 3;
      const hue = 270 - (speed - 1) * 60;
      ctx.fillStyle = `hsla(${hue}, 100%, 75%, 0.9)`;

      for (let i = 0; i < frame.length; i += 4) {
        const px = frame[i];
        const py = frame[i + 1];
        const ps = frame[i + 2];
        const po = frame[i + 3];
        ctx.globalAlpha = po;
        ctx.fillRect(px, py, ps, ps);
      }
      ctx.globalAlpha = 1;
    };

    worker.addEventListener("message", handleMessage);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
      inflightWorkerFrameRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    resizeCanvas();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }
    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const initWorker = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eventHorizonRadius = Math.max(
      30,
      Math.floor(Math.min(canvas.width, canvas.height) * 0.1)
    );
    workerRef.current?.postMessage({
      type: "init",
      width: canvas.width,
      height: canvas.height,
      particleCount,
      eventHorizonRadius,
    });
  }, [particleCount]);

  useEffect(() => {
    initWorker();
  }, [initWorker]);

  const loop = useCallback(
    (now: number) => {
      const dt = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const weighted = computeWeightedProgress(now);
      const combinedProgress = Math.max(realProgressRef.current, weighted.pct);
      const counts = managerCountsRef.current;
      const managerReady = counts.total === 0 || counts.loaded >= counts.total;
      const progressReady = combinedProgress >= 100;
      const readyToComplete =
        managerReady &&
        progressReady &&
        assetsReadyRef.current &&
        !errorRef.current;
      const target = readyToComplete ? 100 : Math.min(99, combinedProgress);

      progressRef.current = Math.max(progressRef.current, target);
      const next = progressRef.current;
      const easing = isMobile ? 0.08 : 0.12;
      const smoothed =
        displayProgressFloatRef.current +
        (next - displayProgressFloatRef.current) * easing;
      const clamped = smoothed > next ? next : smoothed;
      displayProgressFloatRef.current = clamped;
      const intProgress = Math.floor(clamped);

      if (intProgress !== lastReportedIntRef.current) {
        lastReportedIntRef.current = intProgress;
        setDisplayProgress(intProgress);
        setLoadingMeta({
          loaded: weighted.loaded,
          total: weighted.total,
          item: weighted.item,
          estimatedTotalBytes: weighted.totalWeight,
          loadedBytes: weighted.loadedWeight,
          modelsLoaded: weighted.modelsLoaded,
          modelsTotal: weighted.modelsTotal,
          texturesLoaded: weighted.texturesLoaded,
          texturesTotal: weighted.texturesTotal,
          etaSeconds: weighted.etaSeconds,
        });
      }

      if (import.meta.env.DEV) {
        const fpsNow = dt > 0 ? Math.round(1000 / dt) : null;
        if (fpsNow && fpsNow > 0)
          setFps((prev) => (prev === fpsNow ? prev : fpsNow));
      }

      if (
        readyToComplete &&
        intProgress >= 100 &&
        onCompleteRef.current &&
        !completedRef.current
      ) {
        completedRef.current = true;
        const cb = onCompleteRef.current;
        setTimeout(() => cb?.(), 250);
      }

      if (
        !inflightWorkerFrameRef.current &&
        now - lastWorkerTickTimeRef.current >= tickIntervalMs
      ) {
        const worker = workerRef.current;
        if (worker) {
          inflightWorkerFrameRef.current = true;
          lastWorkerTickTimeRef.current = now;
          const speedMultiplier = 1 + (progressRef.current / 100) * 3;
          worker.postMessage({ type: "tick", dt, speedMultiplier });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    },
    [computeWeightedProgress, isMobile, tickIntervalMs]
  );

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        const now = performance.now();
        lastFrameTimeRef.current = now;
        lastWorkerTickTimeRef.current = now;
        rafRef.current = requestAnimationFrame((t) => loopRef.current(t));
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [loop]);

  return (
    <LoaderContainer>
      <BlackHoleContainer ref={containerRef}>
        <ParticlesCanvas ref={canvasRef} />
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
        <LoadingMeta>
          {loadingMeta.total > 0
            ? `${loadingMeta.loaded}/${loadingMeta.total} · ${
                loadingMeta.item ? loadingMeta.item.split("/").pop() : ""
              }${
                loadingMeta.estimatedTotalBytes > 0
                  ? ` · ${Math.round(
                      loadingMeta.loadedBytes / 1024
                    )}KB/${Math.round(
                      loadingMeta.estimatedTotalBytes / 1024
                    )}KB`
                  : ""
              }${
                loadingMeta.modelsTotal + loadingMeta.texturesTotal > 0
                  ? ` · Modelos ${loadingMeta.modelsLoaded}/${loadingMeta.modelsTotal} · Texturas ${loadingMeta.texturesLoaded}/${loadingMeta.texturesTotal}`
                  : ""
              }${
                loadingMeta.etaSeconds !== null
                  ? ` · ~${loadingMeta.etaSeconds}s`
                  : ""
              }`
            : "Inicializando..."}
        </LoadingMeta>
        {errorState && (
          <ErrorText>
            {errorState.message}: {errorState.url.split("/").pop()}
          </ErrorText>
        )}
        {import.meta.env.DEV && fps !== null && <FpsText>{fps} FPS</FpsText>}
      </BlackHoleContainer>
    </LoaderContainer>
  );
};
