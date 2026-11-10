import { useState, useEffect, useRef } from 'preact/hooks';
import { PhysicsEngine } from '../../engine/physics/engine';
import { SceneBuilder } from '../../engine/physics/SceneBuilder';
import { playgroundTranslations, type PlaygroundLang } from './translations';

type SceneName = 'cloth' | 'rope' | 'chains' | 'gravity' | 'bridge';

export default function PhysicsLab({ lang = 'en' }: { lang?: PlaygroundLang }) {
  const t = playgroundTranslations[lang].physics;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [currentScene, setCurrentScene] = useState<SceneName>('cloth');
  const currentSceneRef = useRef<SceneName>('cloth');
  currentSceneRef.current = currentScene;
  const [clothStiffness, setClothStiffness] = useState(0.35);
  const [orbitMass, setOrbitMass] = useState(80000);
  const [gravityY, setGravityY] = useState(1.5);
  const [friction, setFriction] = useState(0.99);
  const [particleCount, setParticleCount] = useState(0);
  const [constraintCount, setConstraintCount] = useState(0);
  const [mouseAction, setMouseAction] = useState<'drag' | 'spawn' | 'tear' | 'pin'>('drag');

  const mouseActionRef = useRef(mouseAction);
  mouseActionRef.current = mouseAction;
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const gravityRef = useRef(gravityY);
  gravityRef.current = gravityY;
  const frictionRef = useRef(friction);
  frictionRef.current = friction;
  const orbitMassRef = useRef(orbitMass);
  orbitMassRef.current = orbitMass;
  const clothStiffnessRef = useRef(clothStiffness);
  clothStiffnessRef.current = clothStiffness;

  // Initialize Scene
  const loadScene = (scene: SceneName) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    const engine = new PhysicsEngine(width, height);
    engine.gravityY = scene === 'gravity' ? 0 : gravityRef.current;
    engine.friction = frictionRef.current;
    engineRef.current = engine;

    if (scene === 'cloth') {
      // 21 cols x 13 rows, lowered by spacing (height * 0.30)
      SceneBuilder.spawnCloth(engine, width / 2, height * 0.30, 21, 13, 22, 4, 1.0, 0x06b6d4, clothStiffnessRef.current);
    } else if (scene === 'rope') {
      // Double pendulum / rope with weight
      const ropeLength = 12;
      const segLen = 22;
      const startX = width / 2;
      const startY = 70;
      let prevId = engine.addParticle(startX, startY, 6, 1, 0xf59e0b, true);
      const ropeGroup = 1 << 4;
      engine.collisionGroup[prevId] = ropeGroup;
      engine.collisionMask[prevId] = ~ropeGroup;

      for (let i = 1; i < ropeLength; i++) {
        const isBob = i === ropeLength - 1;
        const pId = engine.addParticle(
          startX + i * segLen * 0.5,
          startY + i * segLen * 0.8,
          isBob ? 14 : 5,
          isBob ? 8 : 1,
          isBob ? 0xef4444 : 0xf59e0b,
          false
        );
        engine.collisionGroup[pId] = ropeGroup;
        engine.collisionMask[pId] = ~ropeGroup;
        engine.addConstraint(prevId, pId, segLen, 1.0, true, segLen * 5);
        prevId = pId;
      }
    } else if (scene === 'chains') {
      // Double suspended suspension bridge / chain
      const links = 17;
      const chainGroup = 1 << 5;
      const leftPrev = engine.addParticle(width * 0.15, 120, 7, 1, 0x3b82f6, true);
      const rightPrev = engine.addParticle(width * 0.85, 120, 7, 1, 0x3b82f6, true);
      engine.collisionGroup[leftPrev] = chainGroup;
      engine.collisionMask[leftPrev] = ~chainGroup;
      engine.collisionGroup[rightPrev] = chainGroup;
      engine.collisionMask[rightPrev] = ~chainGroup;
      
      let prev = leftPrev;
      for (let i = 1; i <= links; i++) {
        const t = i / (links + 1);
        const x = width * 0.15 + t * (width * 0.70);
        const y = 120 + Math.sin(t * Math.PI) * 140;
        const pId = engine.addParticle(x, y, 6, 1.2, 0x8b5cf6, false);
        engine.collisionGroup[pId] = chainGroup;
        engine.collisionMask[pId] = ~chainGroup;
        engine.addConstraint(prev, pId, 26, 1.0, true, 26 * 5);
        prev = pId;
      }
      engine.addConstraint(prev, rightPrev, 26, 1.0, true, 26 * 5);
    } else if (scene === 'gravity') {
      // Gravity orbit with central massive attractor
      engine.addGravityPoint(width / 2, height / 2, orbitMassRef.current);
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const dist = 110 + (i % 6) * 32;
        const px = width / 2 + Math.cos(angle) * dist;
        const py = height / 2 + Math.sin(angle) * dist;
        const pId = engine.addParticle(px, py, 4, 1.0, 0x06b6d4, false);
        // Tangential orbital velocity: v = sqrt(GM / r)
        const orbitalSpeed = Math.sqrt(orbitMassRef.current / dist) * 0.32;
        engine.oldPositions[pId * 3] = px + Math.sin(angle) * orbitalSpeed;
        engine.oldPositions[pId * 3 + 1] = py - Math.cos(angle) * orbitalSpeed;
      }
    } else if (scene === 'bridge') {
      // Structural Warren Truss Bridge under tension & load
      const startX = width * 0.12;
      const endX = width * 0.88;
      const bays = 10;
      const bayWidth = (endX - startX) / bays;
      const deckY = 280;
      const trussHeight = 65;
      const topY = deckY - trussHeight;

      // Bottom deck nodes (roadway)
      const bottomNodes: number[] = [];
      for (let i = 0; i <= bays; i++) {
        const x = startX + i * bayWidth;
        // Anchor both abutment ends firmly into cliffs
        const isPinned = i === 0 || i === bays;
        const pId = engine.addParticle(x, deckY, isPinned ? 7 : 5, 1.5, isPinned ? 0xf43f5e : 0x06b6d4, isPinned);
        bottomNodes.push(pId);
      }

      // Top truss nodes
      const topNodes: number[] = [];
      for (let i = 0; i < bays; i++) {
        const x = startX + (i + 0.5) * bayWidth;
        const pId = engine.addParticle(x, topY, 5, 1.2, 0x38bdf8, false);
        topNodes.push(pId);
      }

      // Bottom deck longitudinal roadway chords (hasCollision = true, so balls roll across the deck)
      for (let i = 0; i < bays; i++) {
        engine.addConstraint(bottomNodes[i], bottomNodes[i + 1], bayWidth, 1.0, true, bayWidth * 4.5, true, 4.0);
      }

      // Top compression chords (open / non-colliding frame)
      for (let i = 0; i < bays - 1; i++) {
        engine.addConstraint(topNodes[i], topNodes[i + 1], bayWidth, 1.0, true, bayWidth * 4.5, false);
      }

      // Warren diagonals (alternating diagonal webbing)
      for (let i = 0; i < bays; i++) {
        const tNode = topNodes[i];
        const bLeft = bottomNodes[i];
        const bRight = bottomNodes[i + 1];
        const diagLen = Math.hypot(bayWidth / 2, trussHeight);
        engine.addConstraint(bLeft, tNode, diagLen, 1.0, true, diagLen * 4.5, false);
        engine.addConstraint(tNode, bRight, diagLen, 1.0, true, diagLen * 4.5, false);
      }

      // Drop heavy test weights / vehicles across the bridge deck to demonstrate live strain
      const loadCount = 4;
      for (let k = 0; k < loadCount; k++) {
        const t = (k + 1) / (loadCount + 1);
        const lx = startX + t * (endX - startX);
        const ly = topY - 30 - k * 20;
        engine.addParticle(lx, ly, 10, 8.0, 0xec4899, false);
      }

      // Canyon rock walls on sides
      engine.addWallLine(0, deckY, startX, deckY, 6, 0x475569);
      engine.addWallLine(endX, deckY, width, deckY, 6, 0x475569);
    }

    setParticleCount(engine.activeParticleCount);
    setConstraintCount(engine.activeConstraintCount);
  };

  useEffect(() => {
    loadScene(currentScene);
  }, [currentScene]);

  // Live dynamic parameter update
  useEffect(() => {
    if (engineRef.current) {
      if (currentScene === 'gravity') {
        engineRef.current.gravityY = 0;
        // Dynamically update the central orbital attractor mass in real-time
        if (engineRef.current.activeGravityCount > 0) {
          engineRef.current.g_mass[0] = orbitMass;
        }
      } else {
        engineRef.current.gravityY = gravityY;
      }
      engineRef.current.friction = friction;

      // Dynamically update constraint stiffness across all active links in real-time
      if (currentScene === 'cloth') {
        const cCount = engineRef.current.activeConstraintCount;
        for (let i = 0; i < cCount; i++) {
          const cId = engineRef.current.activeConstraints[i];
          engineRef.current.c_stiffness[cId] = clothStiffness;
        }
      }
    }
  }, [gravityY, friction, orbitMass, clothStiffness, currentScene]);

  // Simulation & Render Loop (Decoupled fixed-timestep physics accumulator)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let accumulator = 0;
    let plinkoSpawnAccumulator = 0;
    const FIXED_DT = 1 / 60; // 60Hz constant physics time step

    const loop = (time: number) => {
      const frameDelta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      accumulator += frameDelta;

      const engine = engineRef.current;
      if (engine) {
        // Continuous steady trickle emitter for Galton Board Plinko
        if (currentSceneRef.current === 'plinko') {
          plinkoSpawnAccumulator += frameDelta;
          // Spawn 1 ball every ~0.16s (~6 balls/sec) so they drop steadily and unhurried
          if (plinkoSpawnAccumulator >= 0.16 && engine.activeParticleCount < 260) {
            plinkoSpawnAccumulator = 0;
            // Purposeful micro-jitter (+-3px) so it never lands dead-center on apex peg
            const jitter = (Math.random() - 0.5) * 6;
            const spawnX = canvas.width / 2 + jitter;
            const spawnY = 40;
            const radius = 4;
            const colors = [0x06b6d4, 0x38bdf8, 0xec4899, 0xa855f7, 0x10b981, 0xf59e0b];
            const col = colors[engine.activeParticleCount % colors.length];
            const pId = engine.addParticle(spawnX, spawnY, radius, 1.0, col, false);
            if (pId !== -1) {
              // Zero initial velocity: releases from complete rest and falls gently under gravity
              engine.oldPositions[pId * 3] = spawnX;
              engine.oldPositions[pId * 3 + 1] = spawnY;
            }
          }
        }

        // Step physics at constant frequency regardless of visual refresh rates
        let steps = 0;
        while (accumulator >= FIXED_DT && steps < 4) {
          engine.update(FIXED_DT);
          accumulator -= FIXED_DT;
          steps++;
        }
        if (accumulator > FIXED_DT) {
          accumulator = 0;
        }

        setParticleCount(engine.activeParticleCount);
        setConstraintCount(engine.activeConstraintCount);

        // Render Canvas
        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Technical Grid
        ctx.strokeStyle = '#181b24';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw Constraints with dynamic strain/stretch coloring
        const cCount = engine.activeConstraintCount;
        for (let i = 0; i < cCount; i++) {
          const cId = engine.activeConstraints[i];
          const p1 = engine.c_p1[cId];
          const p2 = engine.c_p2[cId];

          const x1 = engine.positions[p1 * 3];
          const y1 = engine.positions[p1 * 3 + 1];
          const x2 = engine.positions[p2 * 3];
          const y2 = engine.positions[p2 * 3 + 1];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const currDist = Math.sqrt(dx * dx + dy * dy);
          const restLen = engine.c_targetLength[cId];
          const strain = (currDist - restLen) / (restLen || 1);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          // Color shift based on tension/compression
          if (strain > 0.15) {
            // Highly stretched: hot coral / pink
            ctx.strokeStyle = `rgba(244, 63, 94, ${Math.min(1, 0.6 + strain)})`;
            ctx.lineWidth = 2.5;
          } else if (strain < -0.1) {
            // Compressed: emerald
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
            ctx.lineWidth = 1.5;
          } else {
            // Equilibrium rest: technical cyan
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
            ctx.lineWidth = 1.5;
          }
          ctx.stroke();
        }

        // Draw Particles
        const pCount = engine.activeParticleCount;
        for (let i = 0; i < pCount; i++) {
          const pId = engine.activeParticles[i];
          const offset = pId * 3;
          const px = engine.positions[offset];
          const py = engine.positions[offset + 1];
          const radius = engine.radii[pId];
          const isPinned = engine.invMass[pId] === 0;

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);

          if (isPinned) {
            ctx.fillStyle = '#f43f5e';
          } else {
            const hex = (engine.colors[pId] || 0x06b6d4).toString(16).padStart(6, '0');
            ctx.fillStyle = `#${hex}`;
          }
          ctx.fill();

          ctx.strokeStyle = '#ffffff33';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw Walls / Funnels / Bins
        const wCount = engine.activeWallCount;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        for (let w = 0; w < wCount; w++) {
          ctx.beginPath();
          ctx.moveTo(engine.wall_x1[w], engine.wall_y1[w]);
          ctx.lineTo(engine.wall_x2[w], engine.wall_y2[w]);
          ctx.stroke();
        }

        // Draw Gravity Attractors
        for (let j = 0; j < engine.activeGravityCount; j++) {
          const gx = engine.g_positions[j * 2];
          const gy = engine.g_positions[j * 2 + 1];
          ctx.beginPath();
          ctx.arc(gx, gy, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const getCanvasMousePos = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Mouse Interactions
  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const { x, y } = getCanvasMousePos(e);
    lastMousePosRef.current = { x, y };

    if (mouseActionRef.current === 'tear') {
      SceneBuilder.tearArea(engine, x, y, 4);
      return;
    }

    if (mouseActionRef.current === 'spawn') {
      engine.addParticle(x, y, 8, 1.0, 0x10b981, false);
      return;
    }

    if (mouseActionRef.current === 'pin') {
      const closestId = engine.getNearestParticle(x, y, 25);
      if (closestId !== -1) {
        engine.invMass[closestId] = engine.invMass[closestId] === 0 ? 1.0 : 0;
      }
      return;
    }

    // Drag particle (clean 30px search in canvas space)
    const closestId = engine.getNearestParticle(x, y, 30);
    if (closestId !== -1) {
      engine.grabbedParticleId = closestId;
      engine.grabbedX = x;
      engine.grabbedY = y;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const { x, y } = getCanvasMousePos(e);

    if (e.buttons === 1) {
      if (mouseActionRef.current === 'tear') {
        const last = lastMousePosRef.current;
        if (last) {
          SceneBuilder.sliceConstraints(engine, last.x, last.y, x, y);
        } else {
          SceneBuilder.tearArea(engine, x, y, 4);
        }
      } else if (engine.grabbedParticleId !== -1) {
        engine.grabbedX = x;
        engine.grabbedY = y;
      }
    }
    lastMousePosRef.current = { x, y };
  };

  const handleMouseUp = () => {
    lastMousePosRef.current = null;
    const engine = engineRef.current;
    if (engine) {
      engine.grabbedParticleId = -1;
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
      {/* Controls Sidebar */}
      <div class="lg:col-span-1 flex flex-col gap-5 p-5 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
        <div>
          <span class="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">{t.labBadge}</span>
          <h2 class="text-xl font-bold text-white mt-1">{t.labTitle}</h2>
        </div>

        {/* Scene Presets */}
        <div class="space-y-2">
          <label class="text-xs font-mono text-zinc-400">{t.presetLabel}</label>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              { id: 'cloth', name: t.presets.cloth },
              { id: 'rope', name: t.presets.rope },
              { id: 'chains', name: t.presets.chains },
              { id: 'gravity', name: t.presets.gravity },
              { id: 'bridge', name: t.presets.bridge }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentScene(s.id as SceneName)}
                class={`py-2 px-2.5 rounded-lg border text-left font-medium transition ${
                  currentScene === s.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-white/10 bg-black/30 text-zinc-400 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Mouse Mode with Distinct Tools */}
        <div class="space-y-2 pt-2 border-t border-white/10">
          <label class="text-xs font-mono text-zinc-400">{t.activeTool}</label>
          <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
            {[
              { id: 'drag', label: t.tools.drag },
              { id: 'spawn', label: t.tools.spawn },
              { id: 'tear', label: t.tools.tear },
              { id: 'pin', label: t.tools.pin }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMouseAction(m.id as any)}
                class={`py-2 px-2 rounded border uppercase transition ${
                  mouseAction === m.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-white/10 bg-black/30 text-zinc-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Physics Parameters */}
        <div class="space-y-4 pt-2 border-t border-white/10">
          {currentScene === 'gravity' ? (
            <div>
              <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                <span>{t.orbitalCoreMass}</span>
                <span class="text-purple-400 font-bold">{Math.round(orbitMass / 1000)}k M☉</span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="5000"
                value={orbitMass}
                onInput={(e) => setOrbitMass(parseInt((e.target as HTMLInputElement).value, 10))}
                class="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                <span>{t.planarGravity}</span>
                <span class="text-cyan-400 font-bold">{gravityY} px/s²</span>
              </div>
              <input
                type="range"
                min="-5"
                max="15"
                step="0.2"
                value={gravityY}
                onInput={(e) => setGravityY(parseFloat((e.target as HTMLInputElement).value))}
                class="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {currentScene === 'cloth' && (
            <div>
              <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                <span>{t.fabricElasticity}</span>
                <span class="text-cyan-400 font-bold">{Math.round(clothStiffness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={clothStiffness}
                onInput={(e) => setClothStiffness(parseFloat((e.target as HTMLInputElement).value))}
                class="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          <div>
            <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>{t.airFriction}</span>
              <span class="text-cyan-400 font-bold">{Math.round(friction * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.0"
              step="0.005"
              value={friction}
              onInput={(e) => setFriction(parseFloat((e.target as HTMLInputElement).value))}
              class="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div class="pt-2 border-t border-white/10">
          <button
            onClick={() => loadScene(currentScene)}
            class="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs rounded-lg border border-white/10 transition"
          >
            {t.resetWorld}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div class="lg:col-span-3 flex flex-col gap-4">
        <div class="p-3 sm:p-4 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-3">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/10 pb-2 px-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="text-white font-bold capitalize">{currentScene}</span>
            </div>
            <div class="flex items-center gap-3">
              <span>{t.particles}: <strong class="text-white">{particleCount}</strong></span>
              <span>{t.constraints}: <strong class="text-white">{constraintCount}</strong></span>
              <span class="text-emerald-400 font-bold hidden sm:inline">{t.spatialHash}</span>
            </div>
          </div>

          <div class="w-full bg-black/60 rounded-xl border border-white/5 overflow-hidden flex justify-center">
            <canvas
              ref={canvasRef}
              width={960}
              height={580}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              class="w-full h-auto aspect-[960/580] cursor-crosshair block"
            />
          </div>

          <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
            <span>{t.helpDrag}</span>
            <span>{t.helpPin}</span>
            <span>{t.helpTear}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
