import { useState, useEffect, useRef } from 'preact/hooks';
import type { Position } from '../../engine/core/types';
import { aStarGenerator } from '../../engine/pathfinding/aStar';
import { dijkstraGenerator } from '../../engine/pathfinding/dijkstra';
import { bfsGenerator } from '../../engine/pathfinding/bfs';
import { dfsGenerator } from '../../engine/pathfinding/dfs';
import { greedyBfsGenerator } from '../../engine/pathfinding/greedyBfs';
import { bidirectionalBfsGenerator } from '../../engine/pathfinding/bidirectionalBfs';
import { generatePrimsMaze } from '../../engine/maze/prims';
import { generateRecursiveBacktrackerMaze } from '../../engine/maze/recursiveBacktracker';
import type { GraphNode, GraphEdge, GraphStepResult } from '../../engine/graph/types';
import {
  graphBfsGenerator,
  graphDfsGenerator,
  kruskalGenerator,
  primGenerator,
  topologicalSortGenerator,
  connectedComponentsGenerator
} from '../../engine/graph/graphAlgorithms';
import { playgroundTranslations, type PlaygroundLang } from './translations';

type Mode = 'grid' | 'network';
type GridAlgo = 'astar' | 'dijkstra' | 'bfs' | 'dfs' | 'greedy' | 'bidirectional';
type GraphAlgo = 'bfs' | 'dfs' | 'kruskal' | 'prim' | 'toposort' | 'components';
type Tool = 'wall' | 'weight' | 'start' | 'end' | 'erase';

interface GridCell {
  row: number;
  col: number;
  type: 'EMPTY' | 'WALL' | 'START' | 'END';
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  weight: number;
}

// Added one more column and one more row as requested: 21 rows x 37 cols
const GRID_ROWS = 21;
const GRID_COLS = 37;

export default function GraphLab({ lang = 'en' }: { lang?: PlaygroundLang }) {
  const t = playgroundTranslations[lang].graph;
  const [mode, setMode] = useState<Mode>('grid');

  // --- GRID STATE ---
  const [gridA, setGridA] = useState<GridCell[][]>([]);
  const [gridB, setGridB] = useState<GridCell[][]>([]);
  const [startPos, setStartPos] = useState<Position>({ row: 10, col: 4 });
  const [endPos, setEndPos] = useState<Position>({ row: 10, col: 32 });
  const [activeTool, setActiveTool] = useState<Tool>('wall');
  const [gridAlgoA, setGridAlgoA] = useState<GridAlgo>('astar');
  const [gridAlgoB, setGridAlgoB] = useState<GridAlgo>('dijkstra');
  const [isDualGrid, setIsDualGrid] = useState<boolean>(false);
  const [speed, setSpeed] = useState(20); // ms delay
  const [isGridRunning, setIsGridRunning] = useState(false);
  const [statsA, setStatsA] = useState({ explored: 0, pathLength: 0, cost: 0, status: 'READY' });
  const [statsB, setStatsB] = useState({ explored: 0, pathLength: 0, cost: 0, status: 'READY' });

  const isMouseDownRef = useRef(false);
  const isGridRunningRef = useRef(isGridRunning);
  isGridRunningRef.current = isGridRunning;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const isDualGridRef = useRef(isDualGrid);
  isDualGridRef.current = isDualGrid;

  // Initialize Grid
  const createEmptyGrid = (sPos: Position, ePos: Position): GridCell[][] => {
    const newGrid: GridCell[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const isStart = r === sPos.row && c === sPos.col;
        const isEnd = r === ePos.row && c === ePos.col;
        row.push({
          row: r,
          col: c,
          type: isStart ? 'START' : isEnd ? 'END' : 'EMPTY',
          isWall: false,
          isVisited: false,
          isPath: false,
          weight: 1
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  const initGrid = () => {
    const initial = createEmptyGrid(startPos, endPos);
    setGridA(initial);
    setGridB(initial.map(row => row.map(cell => ({ ...cell }))));
    setStatsA({ explored: 0, pathLength: 0, cost: 0, status: 'READY' });
    setStatsB({ explored: 0, pathLength: 0, cost: 0, status: 'READY' });
  };

  useEffect(() => {
    initGrid();
  }, []);

  const clearPath = () => {
    const resetCells = (prev: GridCell[][]) =>
      prev.map(row =>
        row.map(cell => ({
          ...cell,
          isVisited: false,
          isPath: false
        }))
      );
    setGridA(resetCells);
    setGridB(resetCells);
    setStatsA(s => ({ ...s, explored: 0, pathLength: 0, cost: 0, status: 'CLEARED' }));
    setStatsB(s => ({ ...s, explored: 0, pathLength: 0, cost: 0, status: 'CLEARED' }));
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGridRunning) return;

    const updateCells = (prev: GridCell[][]) => {
      const copy = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = copy[r][c];

      if (activeTool === 'start') {
        copy[startPos.row][startPos.col].type = 'EMPTY';
        cell.type = 'START';
        cell.isWall = false;
      } else if (activeTool === 'end') {
        copy[endPos.row][endPos.col].type = 'EMPTY';
        cell.type = 'END';
        cell.isWall = false;
      } else if (activeTool === 'wall') {
        if (cell.type !== 'START' && cell.type !== 'END') {
          cell.isWall = !cell.isWall;
          cell.type = cell.isWall ? 'WALL' : 'EMPTY';
        }
      } else if (activeTool === 'weight') {
        if (cell.type !== 'START' && cell.type !== 'END') {
          cell.weight = cell.weight === 1 ? 5 : 1;
        }
      } else if (activeTool === 'erase') {
        if (cell.type !== 'START' && cell.type !== 'END') {
          cell.isWall = false;
          cell.type = 'EMPTY';
          cell.weight = 1;
        }
      }
      return copy;
    };

    if (activeTool === 'start') setStartPos({ row: r, col: c });
    if (activeTool === 'end') setEndPos({ row: r, col: c });

    setGridA(updateCells);
    setGridB(updateCells);
  };

  const handleMaze = (type: 'prims' | 'backtracker') => {
    clearPath();
    const maze = type === 'prims' 
      ? generatePrimsMaze(GRID_ROWS, GRID_COLS) 
      : generateRecursiveBacktrackerMaze(GRID_ROWS, GRID_COLS);

    const applyMaze = (prev: GridCell[][]) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          const isS = r === startPos.row && c === startPos.col;
          const isE = r === endPos.row && c === endPos.col;
          const isW = maze[r][c].isWall && !isS && !isE;
          return {
            ...cell,
            isWall: isW,
            type: isS ? 'START' : isE ? 'END' : isW ? 'WALL' : 'EMPTY',
            isVisited: false,
            isPath: false
          };
        })
      );

    setGridA(applyMaze);
    setGridB(applyMaze);
  };

  const getGenerator = (algo: GridAlgo, currentGrid: GridCell[][]) => {
    switch (algo) {
      case 'astar': return aStarGenerator(currentGrid as any, startPos, endPos);
      case 'dijkstra': return dijkstraGenerator(currentGrid as any, startPos, endPos);
      case 'bfs': return bfsGenerator(currentGrid as any, startPos, endPos);
      case 'dfs': return dfsGenerator(currentGrid as any, startPos, endPos);
      case 'greedy': return greedyBfsGenerator(currentGrid as any, startPos, endPos);
      case 'bidirectional': return bidirectionalBfsGenerator(currentGrid as any, startPos, endPos);
    }
  };

  // Run Grid Pathfinding with rAF delta-time for instant speed response
  const activeGeneratorsRef = useRef<{
    genA: Generator<any, any, void> | null;
    genB: Generator<any, any, void> | null;
    doneA: boolean;
    doneB: boolean;
    exploredA: number;
    exploredB: number;
  }>({
    genA: null,
    genB: null,
    doneA: true,
    doneB: true,
    exploredA: 0,
    exploredB: 0
  });

  const runPathfinding = () => {
    clearPath();
    setIsGridRunning(true);
    setStatsA(s => ({ ...s, status: 'RUNNING' }));
    if (isDualGrid) setStatsB(s => ({ ...s, status: 'RUNNING' }));

    activeGeneratorsRef.current = {
      genA: getGenerator(gridAlgoA, gridA),
      genB: isDualGrid ? getGenerator(gridAlgoB, gridB) : null,
      doneA: false,
      doneB: !isDualGrid,
      exploredA: 0,
      exploredB: 0
    };
  };

  useEffect(() => {
    let animId: number;
    let lastStepTime = performance.now();

    const loop = (currentTime: number) => {
      if (isGridRunningRef.current) {
        const elapsed = currentTime - lastStepTime;
        if (elapsed >= speedRef.current) {
          lastStepTime = currentTime;

          const state = activeGeneratorsRef.current;

          // Step A
          if (state.genA && !state.doneA) {
            const stepA = state.genA.next();
            if (stepA.done || !stepA.value) {
              state.doneA = true;
              setStatsA(s => ({ ...s, status: s.status === 'RUNNING' ? 'DONE' : s.status }));
            } else {
              const res = stepA.value;
              if (res.type === 'VISIT' || res.type === 'EXPLORE_NODE') {
                const node: Position = (res as any).node || (res as any).position;
                if (node) {
                  state.exploredA++;
                  setGridA(prev => {
                    const copy = prev.map(row => [...row]);
                    const c = copy[node.row][node.col];
                    if (c.type !== 'START' && c.type !== 'END') {
                      c.isVisited = true;
                    }
                    return copy;
                  });
                  setStatsA(s => ({ ...s, explored: state.exploredA }));
                }
              } else if (res.type === 'DONE' || res.type === 'PATH_FOUND') {
                state.doneA = true;
                const path: Position[] = (res as any).path || [];
                let totalCost = 0;
                setGridA(prev => {
                  const copy = prev.map(row => [...row]);
                  path.forEach(p => {
                    const c = copy[p.row][p.col];
                    if (c.type !== 'START' && c.type !== 'END') {
                      c.isPath = true;
                    }
                    totalCost += c.weight || 1;
                  });
                  return copy;
                });
                setStatsA({
                  explored: state.exploredA,
                  pathLength: path.length,
                  cost: totalCost,
                  status: path.length > 0 ? 'FOUND' : 'NO PATH'
                });
              } else if (res.type === 'NO_PATH' || res.type === 'PATH_NOT_FOUND') {
                state.doneA = true;
                setStatsA(s => ({ ...s, status: 'NO PATH' }));
              }
            }
          }

          // Step B
          if (state.genB && !state.doneB) {
            const stepB = state.genB.next();
            if (stepB.done || !stepB.value) {
              state.doneB = true;
              setStatsB(s => ({ ...s, status: s.status === 'RUNNING' ? 'DONE' : s.status }));
            } else {
              const res = stepB.value;
              if (res.type === 'VISIT' || res.type === 'EXPLORE_NODE') {
                const node: Position = (res as any).node || (res as any).position;
                if (node) {
                  state.exploredB++;
                  setGridB(prev => {
                    const copy = prev.map(row => [...row]);
                    const c = copy[node.row][node.col];
                    if (c.type !== 'START' && c.type !== 'END') {
                      c.isVisited = true;
                    }
                    return copy;
                  });
                  setStatsB(s => ({ ...s, explored: state.exploredB }));
                }
              } else if (res.type === 'DONE' || res.type === 'PATH_FOUND') {
                state.doneB = true;
                const path: Position[] = (res as any).path || [];
                let totalCost = 0;
                setGridB(prev => {
                  const copy = prev.map(row => [...row]);
                  path.forEach(p => {
                    const c = copy[p.row][p.col];
                    if (c.type !== 'START' && c.type !== 'END') {
                      c.isPath = true;
                    }
                    totalCost += c.weight || 1;
                  });
                  return copy;
                });
                setStatsB({
                  explored: state.exploredB,
                  pathLength: path.length,
                  cost: totalCost,
                  status: path.length > 0 ? 'FOUND' : 'NO PATH'
                });
              } else if (res.type === 'NO_PATH' || res.type === 'PATH_NOT_FOUND') {
                state.doneB = true;
                setStatsB(s => ({ ...s, status: 'NO PATH' }));
              }
            }
          }

          if (state.doneA && state.doneB) {
            setIsGridRunning(false);
          }
        }
      } else {
        lastStepTime = currentTime;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, []);

  // --- NETWORK GRAPH STATE ---
  const [graphAlgo, setGraphAlgo] = useState<GraphAlgo>('kruskal');
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([
    { id: 'A', label: 'A', x: 80, y: 140 },
    { id: 'B', label: 'B', x: 240, y: 70 },
    { id: 'C', label: 'C', x: 400, y: 110 },
    { id: 'D', label: 'D', x: 140, y: 270 },
    { id: 'E', label: 'E', x: 320, y: 250 },
    { id: 'F', label: 'F', x: 480, y: 230 }
  ]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([
    { id: 'e1', source: 'A', target: 'B', weight: 4 },
    { id: 'e2', source: 'A', target: 'D', weight: 3 },
    { id: 'e3', source: 'B', target: 'C', weight: 2 },
    { id: 'e4', source: 'B', target: 'E', weight: 5 },
    { id: 'e5', source: 'D', target: 'E', weight: 7 },
    { id: 'e6', source: 'C', target: 'E', weight: 1 },
    { id: 'e7', source: 'C', target: 'F', weight: 6 },
    { id: 'e8', source: 'E', target: 'F', weight: 2 }
  ]);
  const [graphStep, setGraphStep] = useState<GraphStepResult | null>(null);
  const [isGraphRunning, setIsGraphRunning] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const runGraphAlgorithm = () => {
    setIsGraphRunning(true);
    let gen: Generator<GraphStepResult, GraphStepResult, void>;

    switch (graphAlgo) {
      case 'bfs': gen = graphBfsGenerator(graphNodes, graphEdges, 'A'); break;
      case 'dfs': gen = graphDfsGenerator(graphNodes, graphEdges, 'A'); break;
      case 'kruskal': gen = kruskalGenerator(graphNodes, graphEdges); break;
      case 'prim': gen = primGenerator(graphNodes, graphEdges, 'A'); break;
      case 'toposort': gen = topologicalSortGenerator(graphNodes, graphEdges); break;
      case 'components': gen = connectedComponentsGenerator(graphNodes, graphEdges); break;
    }

    const interval = window.setInterval(() => {
      const step = gen.next();
      if (step.done || !step.value) {
        clearInterval(interval);
        setIsGraphRunning(false);
        if (step.value) setGraphStep(step.value);
        return;
      }
      setGraphStep(step.value);
    }, 550);
  };

  const handleNodeDrag = (e: MouseEvent, id: string) => {
    if (draggedNode !== id) return;
    const svg = (e.currentTarget as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 640 / (rect.width || 1);
    const scaleY = 380 / (rect.height || 1);
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setGraphNodes(nodes =>
      nodes.map(n => n.id === id ? { ...n, x: Math.max(30, Math.min(x, 610)), y: Math.max(30, Math.min(y, 350)) } : n)
    );
  };

  const renderGridMatrix = (currentGrid: GridCell[][]) => (
    <div
      class="w-full select-none p-2 bg-black/60 rounded-xl border border-white/5"
      onMouseDown={() => (isMouseDownRef.current = true)}
      onMouseUp={() => (isMouseDownRef.current = false)}
      onMouseLeave={() => (isMouseDownRef.current = false)}
    >
      <div
        class="grid gap-[2px] w-full bg-zinc-950 p-1.5 rounded"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`
        }}
      >
        {currentGrid.map((row, r) =>
          row.map((cell, c) => {
            let cellColor = 'bg-zinc-900 border-zinc-800/80';

            if (cell.type === 'START') {
              cellColor = 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400';
            } else if (cell.type === 'END') {
              cellColor = 'bg-rose-500 border-rose-400 shadow-sm shadow-rose-500';
            } else if (cell.isPath) {
              cellColor = 'bg-amber-400 border-amber-300 animate-pulse';
            } else if (cell.isVisited) {
              cellColor = 'bg-cyan-600/70 border-cyan-500/50';
            } else if (cell.isWall) {
              cellColor = 'bg-zinc-300 border-zinc-200';
            } else if (cell.weight > 1) {
              cellColor = 'bg-amber-950/70 border-amber-700';
            }

            return (
              <div
                key={`${r}-${c}`}
                onMouseDown={() => handleCellClick(r, c)}
                onMouseEnter={() => {
                  if (isMouseDownRef.current && (activeTool === 'wall' || activeTool === 'erase' || activeTool === 'weight')) {
                    handleCellClick(r, c);
                  }
                }}
                class={`w-full aspect-square rounded-xs transition-colors cursor-pointer border ${cellColor}`}
                title={`[${r},${c}] ${cell.weight > 1 ? `Weight: ${cell.weight}` : ''}`}
              />
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
      {/* Sidebar Controls */}
      <div class="lg:col-span-1 flex flex-col gap-5 p-5 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
        <div>
          <span class="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">{t.labBadge}</span>
          <h2 class="text-xl font-bold text-white mt-1">{t.labTitle}</h2>
        </div>

        {/* Mode Switcher */}
        <div class="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/10 font-mono text-xs">
          <button
            onClick={() => setMode('grid')}
            class={`py-2 rounded-lg font-bold transition ${mode === 'grid' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
          >
            {t.modeGrid}
          </button>
          <button
            onClick={() => setMode('network')}
            class={`py-2 rounded-lg font-bold transition ${mode === 'network' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'}`}
          >
            {t.modeNetwork}
          </button>
        </div>

        {mode === 'grid' ? (
          <>
            {/* Algorithm A Selection */}
            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400">{t.primaryAlgo}</label>
              <select
                class="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                value={gridAlgoA}
                disabled={isGridRunning}
                onChange={(e) => setGridAlgoA((e.target as HTMLSelectElement).value as GridAlgo)}
              >
                <option value="astar">A* Search (Heuristic + Cost)</option>
                <option value="dijkstra">Dijkstra's Algorithm (Cost-Optimized)</option>
                <option value="bfs">Breadth-First Search (Unweighted)</option>
                <option value="dfs">Depth-First Search (Deep Traversal)</option>
                <option value="greedy">Greedy Best-First Search</option>
                <option value="bidirectional">Bidirectional BFS (Dual Frontier)</option>
              </select>
            </div>

            {/* Dual Algorithm Comparison Mode */}
            <div class="pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                <input
                  type="checkbox"
                  class="rounded border-zinc-700 text-cyan-500"
                  checked={isDualGrid}
                  onChange={(e) => setIsDualGrid((e.target as HTMLInputElement).checked)}
                />
                <span class="font-bold">{t.dualComparison}</span>
              </label>

              {isDualGrid && (
                <div class="mt-2 space-y-1">
                  <label class="text-[11px] font-mono text-zinc-400">{t.secondaryAlgo}</label>
                  <select
                    class="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white"
                    value={gridAlgoB}
                    disabled={isGridRunning}
                    onChange={(e) => setGridAlgoB((e.target as HTMLSelectElement).value as GridAlgo)}
                  >
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="astar">A* Search</option>
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                    <option value="greedy">Greedy Best-First Search</option>
                    <option value="bidirectional">Bidirectional BFS</option>
                  </select>
                </div>
              )}
            </div>

            {/* Interactive Drawing Tools */}
            <div class="space-y-2 pt-2 border-t border-white/10">
              <label class="text-xs font-mono text-zinc-400">{t.drawingBrush}</label>
              <div class="grid grid-cols-3 gap-2 text-xs font-mono">
                {[
                  { id: 'wall', label: t.brushWall },
                  { id: 'weight', label: t.brushWeight },
                  { id: 'start', label: t.brushStart },
                  { id: 'end', label: t.brushEnd },
                  { id: 'erase', label: t.brushErase }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTool(item.id as Tool)}
                    class={`py-1.5 px-2 rounded border uppercase font-medium transition ${
                      activeTool === item.id 
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold' 
                        : 'border-white/10 bg-black/30 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Maze Generators */}
            <div class="space-y-2 pt-2 border-t border-white/10">
              <label class="text-xs font-mono text-zinc-400">{t.mazeGeneration}</label>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => handleMaze('prims')}
                  disabled={isGridRunning}
                  class="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10"
                >
                  {t.primsMaze}
                </button>
                <button
                  onClick={() => handleMaze('backtracker')}
                  disabled={isGridRunning}
                  class="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10"
                >
                  {t.backtrackerMaze}
                </button>
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
                min="5"
                max="100"
                value={speed}
                onInput={(e) => setSpeed(parseInt((e.target as HTMLInputElement).value, 10))}
                class="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button
                onClick={runPathfinding}
                disabled={isGridRunning}
                class="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-mono font-bold text-xs rounded-lg transition shadow"
              >
                {t.runSearch}
              </button>
              <div class="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={clearPath}
                  disabled={isGridRunning}
                  class="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10"
                >
                  {t.clearPath}
                </button>
                <button
                  onClick={initGrid}
                  disabled={isGridRunning}
                  class="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-white/10"
                >
                  {t.resetGrid}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Network Graph Controls */
          <>
            <div class="space-y-2">
              <label class="text-xs font-mono text-zinc-400">{t.theoryAlgo}</label>
              <select
                class="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                value={graphAlgo}
                disabled={isGraphRunning}
                onChange={(e) => setGraphAlgo((e.target as HTMLSelectElement).value as GraphAlgo)}
              >
                <option value="kruskal">Kruskal's MST (Greedy / Disjoint Set)</option>
                <option value="prim">Prim's MST (Cut Property)</option>
                <option value="bfs">Breadth-First Traversal</option>
                <option value="dfs">Depth-First Traversal</option>
                <option value="toposort">Topological Sorting (DAG)</option>
                <option value="components">Connected Components</option>
              </select>
            </div>

            <div class="p-3 bg-black/40 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 space-y-1">
              <p class="font-bold text-cyan-400">{t.canvasHelpTitle}</p>
              <p>{t.canvasHelp1}</p>
              <p>{t.canvasHelp2}</p>
            </div>

            <button
              onClick={runGraphAlgorithm}
              disabled={isGraphRunning}
              class="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-mono font-bold text-xs rounded-lg transition shadow mt-2"
            >
              {t.runGraphAlgo}
            </button>
          </>
        )}
      </div>

      {/* Main Canvas Area */}
      <div class="lg:col-span-3 flex flex-col gap-6">
        {mode === 'grid' ? (
          <>
            {/* Primary Grid Visualization */}
            <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span class="text-xs font-mono text-cyan-400">PRIMARY SEARCH (21x37)</span>
                  <h3 class="text-lg font-bold text-white uppercase">{gridAlgoA} Engine</h3>
                </div>
                <div class="flex items-center gap-4 text-xs font-mono">
                  <div class="text-zinc-400">{t.explored}: <span class="text-white font-bold">{statsA.explored}</span></div>
                  <div class="text-zinc-400">{t.pathLength}: <span class="text-amber-400 font-bold">{statsA.pathLength}</span></div>
                  <div class="text-zinc-400">{t.cost}: <span class="text-cyan-400 font-bold">{statsA.cost}</span></div>
                  <div class="text-zinc-400">{t.status}: <span class={statsA.status === 'FOUND' ? 'text-emerald-400 font-bold' : 'text-zinc-300 font-bold'}>{statsA.status === 'FOUND' ? t.found : statsA.status === 'NO PATH' ? t.noPath : statsA.status === 'SEARCHING' ? t.running : t.ready}</span></div>
                </div>
              </div>

              {renderGridMatrix(gridA)}
            </div>

            {/* Secondary Comparison Grid (Dual Mode) */}
            {isDualGrid && (
              <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4 animate-fade-in">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span class="text-xs font-mono text-purple-400">SECONDARY SEARCH (21x37)</span>
                    <h3 class="text-lg font-bold text-white uppercase">{gridAlgoB} Engine</h3>
                  </div>
                  <div class="flex items-center gap-4 text-xs font-mono">
                    <div class="text-zinc-400">{t.explored}: <span class="text-white font-bold">{statsB.explored}</span></div>
                    <div class="text-zinc-400">{t.pathLength}: <span class="text-amber-400 font-bold">{statsB.pathLength}</span></div>
                    <div class="text-zinc-400">{t.cost}: <span class="text-cyan-400 font-bold">{statsB.cost}</span></div>
                    <div class="text-zinc-400">{t.status}: <span class={statsB.status === 'FOUND' ? 'text-emerald-400 font-bold' : 'text-zinc-300 font-bold'}>{statsB.status === 'FOUND' ? t.found : statsB.status === 'NO PATH' ? t.noPath : statsB.status === 'SEARCHING' ? t.running : t.ready}</span></div>
                  </div>
                </div>

                {renderGridMatrix(gridB)}
              </div>
            )}
          </>
        ) : (
          /* Network Topology Graph Canvas */
          <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span class="text-xs font-mono text-cyan-400">NETWORK GRAPH</span>
                <h3 class="text-lg font-bold text-white uppercase">{graphAlgo} Execution Canvas</h3>
              </div>
              {graphStep && (
                <div class="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded border border-cyan-800">
                  {graphStep.description}
                </div>
              )}
            </div>

            <div class="relative w-full aspect-[640/380] bg-black/60 rounded-xl border border-white/5 overflow-hidden">
              <svg
                viewBox="0 0 640 380"
                class="w-full h-full cursor-grab"
                onMouseMove={(e) => {
                  if (draggedNode) handleNodeDrag(e, draggedNode);
                }}
                onMouseUp={() => setDraggedNode(null)}
              >
                {/* Edges */}
                {graphEdges.map(edge => {
                  const src = graphNodes.find(n => n.id === edge.source);
                  const dst = graphNodes.find(n => n.id === edge.target);
                  if (!src || !dst) return null;

                  const isMst = graphStep?.activeEdges?.includes(edge.id);
                  const isExamined = graphStep?.edgeId === edge.id;

                  const strokeColor = isMst ? '#10b981' : isExamined ? '#f59e0b' : '#3f3f46';
                  const strokeWidth = isMst ? 4 : isExamined ? 3 : 2;

                  const midX = (src.x + dst.x) / 2;
                  const midY = (src.y + dst.y) / 2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isExamined ? '4 2' : 'none'}
                        class="transition-colors duration-300"
                      />
                      <rect
                        x={midX - 12}
                        y={midY - 10}
                        width="24"
                        height="20"
                        rx="4"
                        fill="#18181b"
                        stroke="#27272a"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        fill="#a1a1aa"
                        fontSize="11"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {graphNodes.map(node => {
                  const isVisited = graphStep?.visitedNodes?.includes(node.id);
                  const isCurrent = graphStep?.nodeId === node.id;
                  const compId = graphStep?.components?.[node.id];

                  let fillColor = '#18181b';
                  let strokeColor = '#52525b';

                  if (isCurrent) {
                    fillColor = '#f59e0b';
                    strokeColor = '#fbbf24';
                  } else if (isVisited) {
                    fillColor = '#06b6d4';
                    strokeColor = '#22d3ee';
                  } else if (compId !== undefined) {
                    const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981'];
                    fillColor = colors[compId % colors.length];
                    strokeColor = '#ffffff';
                  }

                  return (
                    <g
                      key={node.id}
                      onMouseDown={() => setDraggedNode(node.id)}
                      class="cursor-pointer"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={20}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={2.5}
                        class="transition-all"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Educational Inspector */}
        <div class="p-5 bg-black/40 rounded-2xl border border-white/10 text-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h4 class="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Algorithmic Inspector: {mode === 'grid' ? gridAlgoA.toUpperCase() : graphAlgo.toUpperCase()}
            </h4>
          </div>
          <p class="text-zinc-300 text-sm leading-relaxed">
            {mode === 'grid' 
              ? 'Calculates exact shortest trajectories across weighted tiles. In dual mode, run two algorithms concurrently on identical obstacles to compare exploration footprint and execution efficiency.' 
              : 'Network topology visualizes fundamental graph structures including cut edges, spanning trees (Kruskal/Prim), and directed acyclic orderings (Kahn topological sort).'}
          </p>
        </div>
      </div>
    </div>
  );
}
