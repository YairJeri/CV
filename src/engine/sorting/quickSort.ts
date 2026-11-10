import type { SortingStepResult } from './types';

export function* quickSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  yield* quickSort(arr, 0, arr.length - 1);
  return { type: 'DONE', indices: [] };
}

function* quickSort(arr: number[], low: number, high: number): Generator<SortingStepResult, void, void> {
  if (low < high) {
    const pi = yield* partition(arr, low, high);
    yield* quickSort(arr, low, pi - 1);
    yield* quickSort(arr, pi + 1, high);
  }
}

function* partition(arr: number[], low: number, high: number): Generator<SortingStepResult, number, void> {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    yield { type: 'COMPARE', indices: [j, high] };
    if (arr[j] < pivot) {
      i++;
      yield { type: 'SWAP', indices: [i, j] };
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  yield { type: 'SWAP', indices: [i + 1, high] };
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  
  return i + 1;
}
