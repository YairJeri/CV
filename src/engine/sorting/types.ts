export type SortingAlgorithmType = 'BUBBLE' | 'QUICK' | 'MERGE' | 'INSERTION' | 'SELECTION' | 'HEAP';

export type SortingStepType = 'COMPARE' | 'SWAP' | 'OVERWRITE' | 'DONE';

export interface SortingStepResult {
  type: SortingStepType;
  indices: number[]; // Indices affected
  values?: number[]; // Used for OVERWRITE (like in MergeSort)
}
