import type { SortingStepResult } from './types';

export function* insertionSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    // Mostramos el índice actual como siendo procesado
    yield { type: 'COMPARE', indices: [i, j >= 0 ? j : 0] };

    while (j >= 0 && arr[j] > key) {
      yield { type: 'COMPARE', indices: [j, j + 1] };
      yield { type: 'SWAP', indices: [j, j + 1] };
      
      // Swap in our local clone
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      
      j = j - 1;
    }
    // Aunque el algoritmo clásico sobreescribe, visualmente el swap que hicimos arriba ya lo arregló.
  }
  
  return { type: 'DONE', indices: [] };
}
