import { useEffect, useRef } from 'react';
import './AsciiTopology.css';

const CHARSET = ['.', ':', '-', '=', '+', '*', '#', '%', '@'];
const CELL_SIZE = 18;
const MAX_COLS = 120;
const MAX_ROWS = 100;
const TRAIL_LIFETIME = 340;
const ANIMATION_SPEED = 0.20;
const COLOR_FIELD_ZOOM = 1.6;
const FIELD_SEED = 23.71;
const TONES = ['#050607', '#06167a', '#0825d8', '#4c23d1', '#008b61', '#050607'];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawCells(ctx, grid, time, trail) {
  const { cssWidth, cssHeight, cols, rows } = grid;
  // Use the constant CELL_SIZE to ensure cells are ALWAYS perfect squares
  const cellWidth = CELL_SIZE;
  const cellHeight = CELL_SIZE;
  const aspect = cols / Math.max(rows, 1);
  const now = performance.now();
  const seededTime = time * ANIMATION_SPEED;
  const seedA = FIELD_SEED * 0.137;
  const seedB = FIELD_SEED * 0.271;
  const seedC = FIELD_SEED * 0.413;

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = '#070708';
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 12px "Courier New", Courier, monospace';

  for (let row = 0; row < rows; row += 1) {
    const y = row / Math.max(rows - 1, 1);

    for (let col = 0; col < cols; col += 1) {
      const x = col / Math.max(cols - 1, 1);
      const fieldX = (x - 0.5) / COLOR_FIELD_ZOOM + 0.5;
      const fieldY = (y - 0.5) / COLOR_FIELD_ZOOM + 0.5;

      const waveA = Math.sin(fieldX * 8.6 + seededTime * 0.001 + Math.cos(fieldY * 5.2 + seedA));
      const waveB = Math.cos(fieldY * 9.4 - seededTime * 0.00082 + Math.sin(fieldX * 6.1 + seedB));
      const diagonal = Math.sin((fieldX + fieldY) * 11.5 + seededTime * 0.00054 + seedC);
      const cellular = Math.cos((fieldX * 18.0 - fieldY * 13.0) + seededTime * 0.00034 + seedA + seedB);

      let trailPower = 0;
      for (let index = 0; index < trail.length; index += 1) {
        const point = trail[index];
        const age = now - point.time;
        const life = clamp(1 - age / TRAIL_LIFETIME, 0, 1);
        if (life <= 0) {
          continue;
        }

        const dx = (x - point.x) * aspect;
        const dy = y - point.y;
        const along = dx * Math.cos(point.angle) + dy * Math.sin(point.angle);
        const across = -dx * Math.sin(point.angle) + dy * Math.cos(point.angle);
        trailPower += Math.exp(-(along * along * 430 + across * across * 6200)) * life;
      }

      const field = waveA * 0.42 + waveB * 0.34 + diagonal * 0.28 + cellular * 0.18 + trailPower * 1.8;
      const normalized = clamp((field + 1.35) / 2.9, 0, 0.999);
      const charIndex = Math.floor(normalized * CHARSET.length);
      const tone = clamp(Math.floor(normalized * 6) + Math.floor(trailPower * 2), 0, 5);

      // Calculate position using the fixed CELL_SIZE
      const left = col * CELL_SIZE;
      const top = row * CELL_SIZE;
      const isTrail = trailPower > 0.08;

      ctx.fillStyle = TONES[tone];
      ctx.fillRect(left + 0.5, top + 0.5, cellWidth - 1, cellHeight - 1);
      ctx.strokeStyle = isTrail ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.08)';
      ctx.strokeRect(left + 0.5, top + 0.5, cellWidth - 1, cellHeight - 1);
      ctx.fillStyle = isTrail ? '#ffffff' : 'rgba(255,255,255,0.94)';
      ctx.fillText(CHARSET[charIndex], left + cellWidth / 2, top + cellHeight / 2 + 0.5);
    }
  }
}

export function AsciiTopology({ className = '', isLoading = false }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef({ cssWidth: 1, cssHeight: 1, cols: 48, rows: 42 });
  const pointerRef = useRef({
    active: false,
    current: { x: 0.72, y: 0.32 },
    target: { x: 0.72, y: 0.32 },
    previous: { x: 0.72, y: 0.32 },
  });
  const trailRef = useRef([]);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastTrailRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return undefined;
    }

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const cols = clamp(Math.ceil(cssWidth / CELL_SIZE), 28, MAX_COLS);
      const rows = clamp(Math.ceil(cssHeight / CELL_SIZE), 24, MAX_ROWS);

      gridRef.current = { cssWidth, cssHeight, cols, rows };
      canvas.width = Math.floor(cssWidth * ratio);
      canvas.height = Math.floor(cssHeight * ratio);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    const draw = (time) => {
      const now = performance.now();
      const pointer = pointerRef.current;

      pointer.current.x += (pointer.target.x - pointer.current.x) * 0.16;
      pointer.current.y += (pointer.target.y - pointer.current.y) * 0.16;

      if (pointer.active && now - lastTrailRef.current > 72) {
        const dx = pointer.current.x - pointer.previous.x;
        const dy = pointer.current.y - pointer.previous.y;
        const moved = Math.hypot(dx, dy);

        if (moved > 0.004) {
          trailRef.current = [
            ...trailRef.current.slice(-3),
            {
              x: pointer.current.x,
              y: pointer.current.y,
              angle: Math.atan2(dy, dx),
              time: now,
            },
          ];
          pointer.previous = { ...pointer.current };
          lastTrailRef.current = now;
        }
      }

      trailRef.current = trailRef.current.filter((point) => now - point.time < TRAIL_LIFETIME);

      if (time - lastFrameRef.current > 48) {
        drawCells(ctx, gridRef.current, time, trailRef.current);
        lastFrameRef.current = time;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const updateCursor = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current.target = {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
    pointerRef.current.active = true;
  };

  const releaseCursor = () => {
    pointerRef.current.active = false;
  };

  return (
    <section
      ref={rootRef}
      className={`topology-panel ${className} ${isLoading ? 'is-loading' : ''}`}
      aria-label="Animated ASCII flow field"
      onPointerMove={updateCursor}
      onPointerLeave={releaseCursor}
    >
      <canvas ref={canvasRef} className="topology-canvas" aria-hidden="true" />
    </section>
  );
}
