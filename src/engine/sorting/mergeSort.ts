import type { SortingStepResult } from './types';

export function* mergeSortGenerator(arr: number[]): Generator<SortingStepResult, SortingStepResult, void> {
  yield* mergeSort(arr, 0, arr.length - 1);
  return { type: 'DONE', indices: [] };
}

function* mergeSort(arr: number[], left: number, right: number): Generator<SortingStepResult, void, void> {
  if (left >= right) return;
  const mid = Math.floor(left + (right - left) / 2);
  yield* mergeSort(arr, left, mid);
  yield* mergeSort(arr, mid + 1, right);
  yield* merge(arr, left, mid, right);
}

function* merge(arr: number[], left: number, mid: number, right: number): Generator<SortingStepResult, void, void> {
  const n1 = mid - left + 1;
  const n2 = right - mid;

  const L = new Array(n1);
  const R = new Array(n2);

  for (let i = 0; i < n1; i++) L[i] = arr[left + i];
  for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

  let i = 0, j = 0, k = left;

  while (i < n1 && j < n2) {
    yield { type: 'COMPARE', indices: [left + i, mid + 1 + j] };
    
    if (L[i] <= R[j]) {
      yield { type: 'OVERWRITE', indices: [k], values: [L[i]] };
      arr[k] = L[i];
      i++;
    } else {
      yield { type: 'OVERWRITE', indices: [k], values: [R[j]] };
      arr[k] = R[j];
      j++;
    }
    k++;
  }

  while (i < n1) {
    yield { type: 'OVERWRITE', indices: [k], values: [L[i]] };
    arr[k] = L[i];
    i++;
    k++;
  }

  while (j < n2) {
    yield { type: 'OVERWRITE', indices: [k], values: [R[j]] };
    arr[k] = R[j];
    j++;
    k++;
  }
}
