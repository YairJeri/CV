import type { SortingStepResult } from './types';

export function* selectionSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'COMPARE', indices: [j, minIdx] };
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    
    if (minIdx !== i) {
      yield { type: 'SWAP', indices: [i, minIdx] };
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
  }

  return { type: 'DONE', indices: [] };
}
