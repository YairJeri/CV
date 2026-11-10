import { useState, useEffect, useRef } from 'preact/hooks';
import { getNextSparseState } from '../../engine/automata/sparseGameOfLife';
import { playgroundTranslations, type PlaygroundLang } from './translations';

const PATTERNS: Record<string, string[]> = {
  glider: ['0,1', '1,2', '2,0', '2,1', '2,2'],
  blinker: ['0,0', '0,1', '0,2'],
  toad: ['0,1', '0,2', '0,3', '1,0', '1,1', '1,2'],
  beacon: ['0,0', '0,1', '1,0', '2,3', '3,2', '3,3'],
  pulsar: [
    '2,4', '2,5', '2,6', '2,10', '2,11', '2,12',
    '4,2', '4,7', '4,9', '4,14',
    '5,2', '5,7', '5,9', '5,14',
    '6,2', '6,7', '6,9', '6,14',
    '7,4', '7,5', '7,6', '7,10', '7,11', '7,12',
    '9,4', '9,5', '9,6', '9,10', '9,11', '9,12',
    '10,2', '10,7', '10,9', '10,14',
    '11,2', '11,7', '11,9', '11,14',
    '12,2', '12,7', '12,9', '12,14',
    '14,4', '14,5', '14,6', '14,10', '14,11', '14,12'
  ],
  spaceship: ['0,1', '0,4', '1,0', '2,0', '2,4', '3,0', '3,1', '3,2', '3,3'],
  gosperGun: [
    '5,1', '5,2', '6,1', '6,2',
    '5,11', '6,11', '7,11', '4,12', '8,12', '3,13', '9,13', '3,14', '9,14', '6,15',
    '4,16', '8,16', '5,17', '6,17', '7,17', '6,18',
    '3,21', '4,21', '5,21', '3,22', '4,22', '5,22', '2,23', '6,23', '1,25', '2,25', '6,25', '7,25',
    '3,35', '4,35', '3,36', '4,36'
  ]
};

export default function AutomataLab({ lang = 'en' }: { lang?: PlaygroundLang }) {
  const t = playgroundTranslations[lang].automata;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [aliveCells, setAliveCells] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // delay ms
  const [generation, setGeneration] = useState(0);
  const [activeBrush, setActiveBrush] = useState<'draw' | 'erase' | 'stamp'>('draw');
  const [selectedPattern, setSelectedPattern] = useState<string>('glider');
  const [brushRadius, setBrushRadius] = useState<number>(1);

  // Hover & Touch preview tracking
  const [hoverGridPos, setHoverGridPos] = useState<{ x: number; y: number } | null>(null);
  const hoverGridPosRef = useRef<{ x: number; y: number } | null>(null);
  hoverGridPosRef.current = hoverGridPos;

  // Touch tracking for mobile preview-on-hold & place-on-release
  const touchStartPosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const touchCurrentPosRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const isTouchRef = useRef(false);

  // Camera Pan and Zoom
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 14 });
  const isMouseDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPaintedCellRef = useRef<string | null>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const aliveCellsRef = useRef(aliveCells);
  aliveCellsRef.current = aliveCells;
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const activeBrushRef = useRef(activeBrush);
  activeBrushRef.current = activeBrush;
  const brushRadiusRef = useRef(brushRadius);
  brushRadiusRef.current = brushRadius;
  const selectedPatternRef = useRef(selectedPattern);
  selectedPatternRef.current = selectedPattern;

  // Single step
  const handleStep = () => {
    setAliveCells(prev => getNextSparseState(prev));
    setGeneration(g => g + 1);
  };

  // Continuous animation loop using delta time to allow live speed changes
  useEffect(() => {
    let animId: number;
    let lastStepTime = performance.now();

    const loop = (currentTime: number) => {
      if (isPlayingRef.current) {
        const elapsed = currentTime - lastStepTime;
        if (elapsed >= speedRef.current) {
          setAliveCells(prev => getNextSparseState(prev));
          setGeneration(g => g + 1);
          lastStepTime = currentTime;
        }
      } else {
        lastStepTime = currentTime;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const { x: camX, y: camY, zoom } = cameraRef.current;
      const cells = aliveCellsRef.current;

      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      if (zoom >= 7) {
        ctx.strokeStyle = '#151821';
        ctx.lineWidth = 1;

        const startX = (w / 2 + camX) % zoom;
        const startY = (h / 2 + camY) % zoom;

        for (let x = startX; x < w; x += zoom) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = startY; y < h; y += zoom) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Draw Living Cells
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = zoom > 10 ? 3 : 0;

      for (const cellKey of cells) {
        const [xStr, yStr] = cellKey.split(',');
        const cx = parseInt(xStr, 10);
        const cy = parseInt(yStr, 10);

        const screenX = w / 2 + camX + cx * zoom;
        const screenY = h / 2 + camY + cy * zoom;

        if (screenX + zoom >= 0 && screenX <= w && screenY + zoom >= 0 && screenY <= h) {
          ctx.fillRect(screenX + 0.5, screenY + 0.5, zoom - 1, zoom - 1);
        }
      }
      ctx.shadowBlur = 0;

      // Draw Ghost Preview for Draw / Stamp Tools
      const hover = hoverGridPosRef.current;
      const brush = activeBrushRef.current;

      if (hover && (brush === 'draw' || brush === 'stamp')) {
        if (brush === 'draw') {
          const radius = brushRadiusRef.current;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;

          for (let dx = -radius + 1; dx < radius; dx++) {
            for (let dy = -radius + 1; dy < radius; dy++) {
              if (dx * dx + dy * dy <= radius * radius) {
                const gx = hover.x + dx;
                const gy = hover.y + dy;
                const sx = w / 2 + camX + gx * zoom;
                const sy = h / 2 + camY + gy * zoom;
                if (sx + zoom >= 0 && sx <= w && sy + zoom >= 0 && sy <= h) {
                  ctx.fillRect(sx + 0.5, sy + 0.5, zoom - 1, zoom - 1);
                  ctx.strokeRect(sx + 0.5, sy + 0.5, zoom - 1, zoom - 1);
                }
              }
            }
          }
        } else if (brush === 'stamp') {
          const pattern = PATTERNS[selectedPatternRef.current];
          if (pattern) {
            ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 1.5;

            for (const p of pattern) {
              const [px, py] = p.split(',').map(Number);
              const gx = hover.x + px;
              const gy = hover.y + py;
              const sx = w / 2 + camX + gx * zoom;
              const sy = h / 2 + camY + gy * zoom;
              if (sx + zoom >= 0 && sx <= w && sy + zoom >= 0 && sy <= h) {
                ctx.fillRect(sx + 0.5, sy + 0.5, zoom - 1, zoom - 1);
                ctx.strokeRect(sx + 0.5, sy + 0.5, zoom - 1, zoom - 1);
              }
            }
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Screen Coordinates to Grid Coordinates
  const screenToGrid = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;
    const { x: camX, y: camY, zoom } = cameraRef.current;
    const w = canvas.width;
    const h = canvas.height;

    const gridX = Math.floor((px - (w / 2 + camX)) / zoom);
    const gridY = Math.floor((py - (h / 2 + camY)) / zoom);
    return { x: gridX, y: gridY };
  };

  // Continuous Brush Painting
  const applyBrushAt = (clientX: number, clientY: number) => {
    const { x, y } = screenToGrid(clientX, clientY);
    const cellKey = `${x},${y}`;

    if (activeBrushRef.current === 'stamp') {
      const pattern = PATTERNS[selectedPatternRef.current];
      if (pattern) {
        setAliveCells(prev => {
          const next = new Set(prev);
          pattern.forEach(p => {
            const [px, py] = p.split(',').map(Number);
            next.add(`${x + px},${y + py}`);
          });
          return next;
        });
      }
      return;
    }

    if (cellKey === lastPaintedCellRef.current) return;
    lastPaintedCellRef.current = cellKey;

    const radius = brushRadiusRef.current;
    setAliveCells(prev => {
      const next = new Set(prev);
      for (let dx = -radius + 1; dx < radius; dx++) {
        for (let dy = -radius + 1; dy < radius; dy++) {
          if (dx * dx + dy * dy <= radius * radius) {
            const targetKey = `${x + dx},${y + dy}`;
            if (activeBrushRef.current === 'draw') {
              next.add(targetKey);
            } else if (activeBrushRef.current === 'erase') {
              next.delete(targetKey);
            }
          }
        }
      }
      return next;
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
      return;
    }

    isMouseDownRef.current = true;
    lastPaintedCellRef.current = null;
    applyBrushAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Update hover grid position for ghost preview
    const gridPos = screenToGrid(e.clientX, e.clientY);
    setHoverGridPos(gridPos);

    if (isPanningRef.current) {
      setCamera(prev => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      }));
      return;
    }

    if (isMouseDownRef.current && activeBrushRef.current !== 'stamp') {
      applyBrushAt(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
    lastPaintedCellRef.current = null;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    isPanningRef.current = false;
    lastPaintedCellRef.current = null;
    setHoverGridPos(null);
  };

  // Mobile Touch Support: Hold to preview, release to place/paint
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isTouchRef.current = true;
      touchStartPosRef.current = { clientX: touch.clientX, clientY: touch.clientY };
      touchCurrentPosRef.current = { clientX: touch.clientX, clientY: touch.clientY };
      const gridPos = screenToGrid(touch.clientX, touch.clientY);
      setHoverGridPos(gridPos);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isTouchRef.current) {
      const touch = e.touches[0];
      touchCurrentPosRef.current = { clientX: touch.clientX, clientY: touch.clientY };
      const gridPos = screenToGrid(touch.clientX, touch.clientY);
      setHoverGridPos(gridPos);
    }
  };

  const handleTouchEnd = () => {
    if (isTouchRef.current && touchCurrentPosRef.current) {
      applyBrushAt(touchCurrentPosRef.current.clientX, touchCurrentPosRef.current.clientY);
    }
    isTouchRef.current = false;
    touchStartPosRef.current = null;
    touchCurrentPosRef.current = null;
    setHoverGridPos(null);
    lastPaintedCellRef.current = null;
  };

  const handleTouchCancel = () => {
    isTouchRef.current = false;
    touchStartPosRef.current = null;
    touchCurrentPosRef.current = null;
    setHoverGridPos(null);
    lastPaintedCellRef.current = null;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({
      ...prev,
      zoom: Math.min(50, Math.max(4, prev.zoom * delta))
    }));
  };

  const insertPreset = (patternName: string) => {
    const pattern = PATTERNS[patternName];
    if (pattern) {
      setAliveCells(prev => {
        const next = new Set(prev);
        // Stamp at current camera center without wiping existing canvas
        pattern.forEach(p => {
          const [px, py] = p.split(',').map(Number);
          next.add(`${px},${py}`);
        });
        return next;
      });
    }
  };

  const randomizeGrid = () => {
    const next = new Set<string>();
    for (let r = -25; r <= 25; r++) {
      for (let c = -35; c <= 35; c++) {
        if (Math.random() < 0.22) {
          next.add(`${c},${r}`);
        }
      }
    }
    setAliveCells(next);
    setGeneration(0);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
      {/* Controls Sidebar */}
      <div class="lg:col-span-1 flex flex-col gap-5 p-5 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
        <div>
          <span class="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">{t.labBadge}</span>
          <h2 class="text-xl font-bold text-white mt-1">{t.labTitle}</h2>
        </div>

        {/* Playback Controls */}
        <div class="flex flex-col gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            class={`w-full py-2.5 rounded-lg font-mono text-xs font-bold transition shadow ${
              isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-black'
            }`}
          >
            {isPlaying ? t.pauseSim : t.runSim}
          </button>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={handleStep}
              disabled={isPlaying}
              class="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10 disabled:opacity-50"
            >
              {t.step}
            </button>
            <button
              onClick={() => { setAliveCells(new Set()); setGeneration(0); }}
              class="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10"
            >
              {t.clearGrid}
            </button>
          </div>
        </div>

        {/* Interactive Brush Mode */}
        <div class="space-y-3 pt-2 border-t border-white/10">
          <label class="text-xs font-mono text-zinc-400">{t.interactiveBrush}</label>
          <div class="grid grid-cols-3 gap-2 text-xs font-mono">
            {[
              { id: 'draw', label: t.tools.draw },
              { id: 'erase', label: t.tools.erase },
              { id: 'stamp', label: t.tools.stamp }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBrush(b.id as any)}
                class={`py-1.5 rounded border uppercase transition ${
                  activeBrush === b.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-white/10 bg-black/30 text-zinc-400 hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {activeBrush !== 'stamp' && (
            <div class="pt-1">
              <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                <span>{t.brushRadius}</span>
                <span class="text-cyan-400 font-bold">{brushRadius} px</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={brushRadius}
                onInput={(e) => setBrushRadius(parseInt((e.target as HTMLInputElement).value, 10))}
                class="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Pattern Selector (Active Stamp Template) */}
        <div class="space-y-2 pt-2 border-t border-white/10">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{t.stampTemplate}</span>
            {activeBrush === 'stamp' && (
              <span class="text-cyan-400 font-bold uppercase text-[10px] animate-pulse">{t.active}</span>
            )}
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            {Object.keys(PATTERNS).map(key => (
              <button
                key={key}
                onClick={() => {
                  setSelectedPattern(key);
                  setActiveBrush('stamp');
                }}
                class={`py-1.5 px-2 rounded border text-left capitalize truncate transition ${
                  selectedPattern === key && activeBrush === 'stamp'
                    ? 'border-pink-500 bg-pink-500/20 text-pink-300 font-bold'
                    : 'border-white/10 bg-black/40 hover:bg-white/10 text-zinc-300'
                }`}
                title={`Equip ${key} for stamping`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Live Speed Slider */}
        <div class="pt-2 border-t border-white/10">
          <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
            <span>{t.speed}</span>
            <span class="text-cyan-400 font-bold">{speed} ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="250"
            value={speed}
            onInput={(e) => setSpeed(parseInt((e.target as HTMLInputElement).value, 10))}
            class="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Actions */}
        <div class="pt-2 border-t border-white/10 space-y-2">
          <button
            onClick={randomizeGrid}
            class="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs rounded border border-white/10 transition"
          >
            {t.randomSeed}
          </button>
          <button
            onClick={() => setCamera({ x: 0, y: 0, zoom: 14 })}
            class="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded border border-white/10"
          >
            {t.resetCamera}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div class="lg:col-span-3 flex flex-col gap-6">
        <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span class="text-xs font-mono text-cyan-400">{t.sparseMatrix}</span>
              <h3 class="text-lg font-bold text-white">Conway's Game of Life Engine</h3>
            </div>
            <div class="flex items-center gap-4 text-xs font-mono">
              <div class="text-zinc-400">{t.generation}: <span class="text-white font-bold">{generation}</span></div>
              <div class="text-zinc-400">{t.livingCells}: <span class="text-cyan-400 font-bold">{aliveCells.size}</span></div>
              <div class="text-zinc-400">{t.zoom}: <span class="text-zinc-200 font-bold">{Math.round(camera.zoom)}px</span></div>
            </div>
          </div>

          <div class="w-full bg-black/60 rounded-xl border border-white/5 overflow-hidden flex justify-center touch-none">
            <canvas
              ref={canvasRef}
              width={960}
              height={580}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onWheel={handleWheel}
              class="w-full h-auto aspect-[960/580] cursor-crosshair block select-none"
            />
          </div>

          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>{t.helpClick}</span>
            <span>{t.helpPan}</span>
            <span>{t.helpZoom}</span>
          </div>
        </div>

        {/* Educational Inspector */}
        <div class="p-5 bg-black/40 rounded-2xl border border-white/10 text-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h4 class="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              {t.inspectorTitle}
            </h4>
          </div>
          <p class="text-zinc-300 text-sm leading-relaxed">
            {t.inspectorDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
