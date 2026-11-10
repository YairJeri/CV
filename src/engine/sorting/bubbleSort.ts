import type { SortingStepResult } from './types';

export function* bubbleSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  const n = arr.length;
  let swapped: boolean;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'COMPARE', indices: [j, j + 1] };
      
      if (arr[j] > arr[j + 1]) {
        yield { type: 'SWAP', indices: [j, j + 1] };
        // Simulate swap in memory for generator context (though actual array mutation happens in the store)
        // Wait, the generator just yields indices. The store handles the actual swapping so the array here gets out of sync?
        // YES. If the generator has a cloned array and only yields instructions, it MUST mutate its own clone to know the next steps.
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  
  return { type: 'DONE', indices: [] };
}
