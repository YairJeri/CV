import type { SortingStepResult } from './types';

export function* heapSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  const n = arr.length;

  // Build heap (rearrange array)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i);
  }

  // One by one extract an element from heap
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    yield { type: 'SWAP', indices: [0, i] };
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;

    // call max heapify on the reduced heap
    yield* heapify(arr, i, 0);
  }

  return { type: 'DONE', indices: [] };
}

function* heapify(arr: number[], n: number, i: number): Generator<SortingStepResult, void, void> {
  let largest = i; // Initialize largest as root
  const l = 2 * i + 1; // left = 2*i + 1
  const r = 2 * i + 2; // right = 2*i + 2

  // If left child is larger than root
  if (l < n) {
    yield { type: 'COMPARE', indices: [l, largest] };
    if (arr[l] > arr[largest]) {
      largest = l;
    }
  }

  // If right child is larger than largest so far
  if (r < n) {
    yield { type: 'COMPARE', indices: [r, largest] };
    if (arr[r] > arr[largest]) {
      largest = r;
    }
  }

  // If largest is not root
  if (largest !== i) {
    yield { type: 'SWAP', indices: [i, largest] };
    const swap = arr[i];
    arr[i] = arr[largest];
    arr[largest] = swap;

    // Recursively heapify the affected sub-tree
    yield* heapify(arr, n, largest);
  }
}
