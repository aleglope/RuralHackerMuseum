type InitMessage = {
  type: "init";
  width: number;
  height: number;
  particleCount: number;
  eventHorizonRadius: number;
};

type ResizeMessage = {
  type: "resize";
  width: number;
  height: number;
};

type TickMessage = {
  type: "tick";
  dt: number;
  speedMultiplier: number;
};

type InMessage = InitMessage | ResizeMessage | TickMessage;

type FrameMessage = {
  type: "frame";
  frame: ArrayBuffer;
  width: number;
  height: number;
};

type WorkerCtx = {
  postMessage: (message: FrameMessage, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<InMessage>) => void) | null;
};

let width = 600;
let height = 600;
let centerX = 300;
let centerY = 300;
let eventHorizonRadius = 60;

let particleCount = 0;
let x: Float32Array;
let y: Float32Array;
let angle: Float32Array;
let radius: Float32Array;
let baseSpeed: Float32Array;
let spiralRate: Float32Array;
let size: Float32Array;
let opacity: Float32Array;

const rand = () => Math.random();

const recalcCenter = () => {
  centerX = width * 0.5;
  centerY = height * 0.5;
};

const initArrays = (count: number) => {
  particleCount = count;
  x = new Float32Array(count);
  y = new Float32Array(count);
  angle = new Float32Array(count);
  radius = new Float32Array(count);
  baseSpeed = new Float32Array(count);
  spiralRate = new Float32Array(count);
  size = new Float32Array(count);
  opacity = new Float32Array(count);
};

const resetParticle = (i: number) => {
  const edge = (rand() * 4) | 0;
  if (edge === 0) {
    x[i] = rand() * width;
    y[i] = 0;
  } else if (edge === 1) {
    x[i] = width;
    y[i] = rand() * height;
  } else if (edge === 2) {
    x[i] = rand() * width;
    y[i] = height;
  } else {
    x[i] = 0;
    y[i] = rand() * height;
  }

  const dx = x[i] - centerX;
  const dy = y[i] - centerY;
  radius[i] = Math.hypot(dx, dy);
  angle[i] = rand() * Math.PI * 2;
  baseSpeed[i] = 0.05 + rand() * 0.08;
  spiralRate[i] = 0.96 + rand() * 0.02;
  size[i] = 4 + rand() * 3;
  opacity[i] = 1;
};

const resetAll = () => {
  for (let i = 0; i < particleCount; i++) resetParticle(i);
};

const tick = (dt: number, speedMultiplier: number) => {
  const dtScale = Math.min(2, Math.max(0.5, dt / 16.6667));
  for (let i = 0; i < particleCount; i++) {
    const dx = x[i] - centerX;
    const dy = y[i] - centerY;
    const dist = Math.hypot(dx, dy);

    const pullZone = Math.max(1, eventHorizonRadius * 6);
    const pull = 1 + (Math.max(0, pullZone - dist) / pullZone) * 2;
    const speed = baseSpeed[i] * speedMultiplier * pull;
    angle[i] += speed * dtScale;
    radius[i] *= spiralRate[i];

    x[i] = centerX + radius[i] * Math.cos(angle[i]);
    y[i] = centerY + radius[i] * Math.sin(angle[i]);

    opacity[i] = Math.min(1, dist / 200);

    if (radius[i] < eventHorizonRadius) resetParticle(i);
  }
};

const makeFrameBuffer = () => {
  const frame = new Float32Array(particleCount * 4);
  for (let i = 0; i < particleCount; i++) {
    const o = i * 4;
    frame[o] = x[i];
    frame[o + 1] = y[i];
    frame[o + 2] = size[i];
    frame[o + 3] = opacity[i];
  }
  return frame;
};

const ctx = self as unknown as WorkerCtx;

ctx.onmessage = (event: MessageEvent<InMessage>) => {
  const data = event.data;
  if (data.type === "init") {
    width = data.width;
    height = data.height;
    eventHorizonRadius = data.eventHorizonRadius;
    recalcCenter();
    initArrays(data.particleCount);
    resetAll();
    return;
  }

  if (data.type === "resize") {
    width = data.width;
    height = data.height;
    recalcCenter();
    return;
  }

  if (data.type === "tick") {
    if (!particleCount) return;
    tick(data.dt, data.speedMultiplier);
    const frame = makeFrameBuffer();
    const message: FrameMessage = {
      type: "frame",
      frame: frame.buffer,
      width,
      height,
    };
    ctx.postMessage(message, [frame.buffer]);
  }
};

export {};
