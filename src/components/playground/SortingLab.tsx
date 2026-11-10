import { useState, useEffect, useRef } from 'preact/hooks';
import { bubbleSortGenerator } from '../../engine/sorting/bubbleSort';
import { insertionSortGenerator } from '../../engine/sorting/insertionSort';
import { selectionSortGenerator } from '../../engine/sorting/selectionSort';
import { quickSortGenerator } from '../../engine/sorting/quickSort';
import { mergeSortGenerator } from '../../engine/sorting/mergeSort';
import { heapSortGenerator } from '../../engine/sorting/heapSort';
import type { SortingStepResult } from '../../engine/sorting/types';
import { playgroundTranslations, type PlaygroundLang } from './translations';

type AlgorithmName = 'quick' | 'merge' | 'heap' | 'insertion' | 'selection' | 'bubble';

interface SortInstance {
  name: AlgorithmName;
  label: string;
  array: number[];
  generator: Generator<SortingStepResult, SortingStepResult, void> | null;
  currentStep: SortingStepResult | null;
  history: { array: number[]; step: SortingStepResult | null }[];
  historyIndex: number;
  comparisons: number;
  swaps: number;
  writes: number;
  isDone: boolean;
  timeMs: number;
}

const ALGORITHMS: { id: AlgorithmName; name: string; complexity: string; desc: string }[] = [
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)', desc: 'Divide-and-conquer partitioning around a chosen pivot element.' },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)', desc: 'Stable divide-and-conquer splitting and merging sorted halves.' },
  { id: 'heap', name: 'Heap Sort', complexity: 'O(n log n)', desc: 'Builds a max-heap tree and iteratively extracts max elements.' },
  { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)', desc: 'Builds the sorted array one item at a time by local shifting.' },
  { id: 'selection', name: 'Selection Sort', complexity: 'O(n²)', desc: 'Repeatedly finds minimum element from unsorted sub-array.' },
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)', desc: 'Repeatedly swaps adjacent elements if they are in wrong order.' },
];

function createGenerator(algo: AlgorithmName, arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  const copy = [...arr];
  switch (algo) {
    case 'quick': return quickSortGenerator(copy);
    case 'merge': return mergeSortGenerator(copy);
    case 'heap': return heapSortGenerator(copy);
    case 'insertion': return insertionSortGenerator(copy);
    case 'selection': return selectionSortGenerator(copy);
    case 'bubble': return bubbleSortGenerator(copy);
  }
}

export default function SortingLab({ lang = 'en' }: { lang?: PlaygroundLang }) {
  const t = playgroundTranslations[lang].sorting;
  const [arraySize, setArraySize] = useState(40);
  const [speed, setSpeed] = useState(30); // delay in ms
  const [algoA, setAlgoA] = useState<AlgorithmName>('quick');
  const [algoB, setAlgoB] = useState<AlgorithmName>('merge');
  const [isDualMode, setIsDualMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [instanceA, setInstanceA] = useState<SortInstance>({
    name: 'quick',
    label: 'Quick Sort',
    array: [],
    generator: null,
    currentStep: null,
    history: [],
    historyIndex: -1,
    comparisons: 0,
    swaps: 0,
    writes: 0,
    isDone: false,
    timeMs: 0
  });

  const [instanceB, setInstanceB] = useState<SortInstance>({
    name: 'merge',
    label: 'Merge Sort',
    array: [],
    generator: null,
    currentStep: null,
    history: [],
    historyIndex: -1,
    comparisons: 0,
    swaps: 0,
    writes: 0,
    isDone: false,
    timeMs: 0
  });

  const baseArrayRef = useRef<number[]>([]);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const isDualModeRef = useRef(isDualMode);
  isDualModeRef.current = isDualMode;

  const generateRandomArray = (size: number) => {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 95) + 5);
    }
    baseArrayRef.current = arr;

    const createInst = (name: AlgorithmName): SortInstance => {
      const copy = [...arr];
      return {
        name,
        label: ALGORITHMS.find(a => a.id === name)?.name || name,
        array: copy,
        generator: createGenerator(name, copy),
        currentStep: null,
        history: [{ array: [...copy], step: null }],
        historyIndex: 0,
        comparisons: 0,
        swaps: 0,
        writes: 0,
        isDone: false,
        timeMs: 0
      };
    };

    setInstanceA(createInst(algoA));
    setInstanceB(createInst(algoB));
    setIsPlaying(false);
  };

  useEffect(() => {
    generateRandomArray(arraySize);
  }, [arraySize]);

  // Step function for an instance
  const stepInstance = (inst: SortInstance): SortInstance => {
    if (inst.isDone || !inst.generator) return inst;

    if (inst.historyIndex < inst.history.length - 1) {
      const nextIndex = inst.historyIndex + 1;
      const hist = inst.history[nextIndex];
      return {
        ...inst,
        array: [...hist.array],
        currentStep: hist.step,
        historyIndex: nextIndex
      };
    }

    const startTime = performance.now();
    const result = inst.generator.next();
    const elapsed = performance.now() - startTime;

    if (result.done || result.value.type === 'DONE') {
      return {
        ...inst,
        isDone: true,
        currentStep: { type: 'DONE', indices: [] },
        timeMs: inst.timeMs + elapsed
      };
    }

    const step = result.value;
    let comparisons = inst.comparisons;
    let swaps = inst.swaps;
    let writes = inst.writes;

    const newArr = [...inst.array];

    if (step.type === 'COMPARE') {
      comparisons++;
    } else if (step.type === 'SWAP') {
      swaps++;
      writes += 2;
      const [i, j] = step.indices;
      const temp = newArr[i];
      newArr[i] = newArr[j];
      newArr[j] = temp;
    } else if (step.type === 'SET') {
      writes++;
      const [idx, val] = step.indices;
      newArr[idx] = val;
    }

    const newHistory = [...inst.history, { array: [...newArr], step }];

    return {
      ...inst,
      array: newArr,
      currentStep: step,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      comparisons,
      swaps,
      writes,
      timeMs: inst.timeMs + elapsed
    };
  };

  const handleStepForward = () => {
    setInstanceA(prev => stepInstance(prev));
    if (isDualMode) {
      setInstanceB(prev => stepInstance(prev));
    }
  };

  const handleStepBackward = () => {
    const stepBack = (inst: SortInstance): SortInstance => {
      if (inst.historyIndex <= 0) return inst;
      const prevIdx = inst.historyIndex - 1;
      const hist = inst.history[prevIdx];
      return {
        ...inst,
        array: [...hist.array],
        currentStep: hist.step,
        historyIndex: prevIdx,
        isDone: false
      };
    };

    setInstanceA(prev => stepBack(prev));
    if (isDualMode) {
      setInstanceB(prev => stepBack(prev));
    }
  };

  const handleReset = () => {
    generateRandomArray(arraySize);
  };

  // Continuous animation loop using rAF + elapsed delta-time for instant speed updates
  useEffect(() => {
    let animId: number;
    let lastStepTime = performance.now();

    const loop = (currentTime: number) => {
      if (isPlayingRef.current) {
        const elapsed = currentTime - lastStepTime;
        if (elapsed >= speedRef.current) {
          lastStepTime = currentTime;

          let anyRunning = false;
          setInstanceA(prevA => {
            if (!prevA.isDone) {
              anyRunning = true;
              return stepInstance(prevA);
            }
            return prevA;
          });

          if (isDualModeRef.current) {
            setInstanceB(prevB => {
              if (!prevB.isDone) {
                anyRunning = true;
                return stepInstance(prevB);
              }
              return prevB;
            });
          }

          if (!anyRunning) {
            setIsPlaying(false);
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

  const renderBars = (inst: SortInstance) => {
    const maxVal = 100;
    const { array, currentStep, isDone } = inst;

    return (
      <div class="flex items-end justify-center h-64 w-full gap-[2px] px-2 py-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
        {array.map((val, idx) => {
          const heightPercent = `${(val / maxVal) * 100}%`;
          let bgColor = 'bg-cyan-500/80';

          if (isDone) {
            bgColor = 'bg-emerald-500';
          } else if (currentStep) {
            if (currentStep.type === 'COMPARE' && currentStep.indices.includes(idx)) {
              bgColor = 'bg-amber-400';
            } else if (currentStep.type === 'SWAP' && currentStep.indices.includes(idx)) {
              bgColor = 'bg-rose-500';
            } else if (currentStep.type === 'SET' && currentStep.indices[0] === idx) {
              bgColor = 'bg-purple-400';
            }
          }

          return (
            <div
              key={idx}
              class={`flex-1 transition-all rounded-t-sm ${bgColor}`}
              style={{ height: heightPercent }}
              title={`Index ${idx}: ${val}`}
            />
          );
        })}
      </div>
    );
  };

  const selectedAlgoInfo = ALGORITHMS.find(a => a.id === algoA);

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
      {/* Controls Sidebar */}
      <div class="lg:col-span-1 flex flex-col gap-5 p-5 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
        <div>
          <span class="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">{t.labBadge}</span>
          <h2 class="text-xl font-bold text-white mt-1">{t.labTitle}</h2>
        </div>

        {/* Algorithm Selection */}
        <div class="space-y-3">
          <label class="text-xs font-mono text-zinc-400">{t.primaryAlgo}</label>
          <select
            class="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            value={algoA}
            onChange={(e) => {
              const val = (e.target as HTMLSelectElement).value as AlgorithmName;
              setAlgoA(val);
              const copy = [...baseArrayRef.current];
              setInstanceA({
                name: val,
                label: ALGORITHMS.find(a => a.id === val)?.name || val,
                array: copy,
                generator: createGenerator(val, copy),
                currentStep: null,
                history: [{ array: [...copy], step: null }],
                historyIndex: 0,
                comparisons: 0,
                swaps: 0,
                writes: 0,
                isDone: false,
                timeMs: 0
              });
              setIsPlaying(false);
            }}
          >
            {ALGORITHMS.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.complexity})</option>
            ))}
          </select>

          {/* Dual Comparison Toggle */}
          <div class="pt-2">
            <label class="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
              <input
                type="checkbox"
                class="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                checked={isDualMode}
                onChange={(e) => setIsDualMode((e.target as HTMLInputElement).checked)}
              />
              <span class="font-medium text-xs font-mono">{t.dualComparison}</span>
            </label>
          </div>

          {isDualMode && (
            <div class="pt-2 animate-fade-in">
              <label class="text-xs font-mono text-zinc-400">{t.secondaryAlgo}</label>
              <select
                class="w-full mt-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                value={algoB}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value as AlgorithmName;
                  setAlgoB(val);
                  const copy = [...baseArrayRef.current];
                  setInstanceB({
                    name: val,
                    label: ALGORITHMS.find(a => a.id === val)?.name || val,
                    array: copy,
                    generator: createGenerator(val, copy),
                    currentStep: null,
                    history: [{ array: [...copy], step: null }],
                    historyIndex: 0,
                    comparisons: 0,
                    swaps: 0,
                    writes: 0,
                    isDone: false,
                    timeMs: 0
                  });
                  setIsPlaying(false);
                }}
              >
                {ALGORITHMS.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.complexity})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Array Size & Delay Sliders */}
        <div class="space-y-4 pt-2 border-t border-white/10">
          <div>
            <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>{t.arraySize}</span>
              <span class="text-cyan-400 font-bold">{arraySize}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={arraySize}
              disabled={isPlaying}
              onInput={(e) => setArraySize(parseInt((e.target as HTMLInputElement).value, 10))}
              class="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono text-zinc-400 mb-1">
              <span>{t.speed}</span>
              <span class="text-cyan-400 font-bold">{speed} ms</span>
            </div>
            <input
              type="range"
              min="2"
              max="150"
              value={speed}
              onInput={(e) => setSpeed(parseInt((e.target as HTMLInputElement).value, 10))}
              class="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div class="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              class={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black'
              }`}
            >
              {isPlaying ? t.pause : t.play}
            </button>
            <button
              onClick={handleReset}
              class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-mono text-xs font-bold border border-white/10 transition"
            >
              {t.reset}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              onClick={handleStepBackward}
              disabled={isPlaying || instanceA.historyIndex <= 0}
              class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded font-mono text-xs border border-white/10 disabled:opacity-40"
            >
              {t.stepBackward}
            </button>
            <button
              onClick={handleStepForward}
              disabled={isPlaying || instanceA.isDone}
              class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded font-mono text-xs border border-white/10 disabled:opacity-40"
            >
              {t.stepForward}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div class="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
          <div class="text-zinc-400 font-semibold mb-1">COLOR ENCODING</div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-cyan-500"></span>
            <span class="text-zinc-300">{t.ready}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-amber-400"></span>
            <span class="text-zinc-300">{t.comparing}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-rose-500"></span>
            <span class="text-zinc-300">{t.swapping}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-xs bg-emerald-500"></span>
            <span class="text-zinc-300">{t.sorted}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas / Visualizer Area */}
      <div class="lg:col-span-3 flex flex-col gap-6">
        <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <span class="text-xs font-mono text-cyan-400">PRIMARY ENGINE</span>
              <h3 class="text-lg font-bold text-white">{instanceA.label}</h3>
            </div>
            <div class="flex items-center gap-4 text-xs font-mono">
              <div class="text-zinc-400">
                {t.comparisons}: <span class="text-white font-bold">{instanceA.comparisons}</span>
              </div>
              <div class="text-zinc-400">
                {t.swaps}: <span class="text-white font-bold">{instanceA.swaps}</span>
              </div>
              <div class="text-zinc-400">
                {t.writes}: <span class="text-white font-bold">{instanceA.writes}</span>
              </div>
              <div class="text-zinc-400">
                {t.status}: <span class={instanceA.isDone ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {instanceA.isDone ? t.completed : isPlaying ? t.running : t.ready}
                </span>
              </div>
            </div>
          </div>

          {renderBars(instanceA)}
        </div>

        {isDualMode && (
          <div class="p-6 bg-surface/90 backdrop-blur rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4 animate-fade-in">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span class="text-xs font-mono text-purple-400">SECONDARY ENGINE</span>
                <h3 class="text-lg font-bold text-white">{instanceB.label}</h3>
              </div>
              <div class="flex items-center gap-4 text-xs font-mono">
                <div class="text-zinc-400">
                  {t.comparisons}: <span class="text-white font-bold">{instanceB.comparisons}</span>
                </div>
                <div class="text-zinc-400">
                  {t.swaps}: <span class="text-white font-bold">{instanceB.swaps}</span>
                </div>
                <div class="text-zinc-400">
                  {t.writes}: <span class="text-white font-bold">{instanceB.writes}</span>
                </div>
                <div class="text-zinc-400">
                  {t.status}: <span class={instanceB.isDone ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {instanceB.isDone ? t.completed : isPlaying ? t.running : t.ready}
                  </span>
                </div>
              </div>
            </div>

            {renderBars(instanceB)}
          </div>
        )}

        {selectedAlgoInfo && (
          <div class="p-5 bg-black/40 rounded-2xl border border-white/10 text-sm">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <h4 class="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                {selectedAlgoInfo.name} — {t.inspectorTitle}
              </h4>
            </div>
            <p class="text-zinc-300 text-sm leading-relaxed">{selectedAlgoInfo.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
