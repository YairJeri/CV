export type NodeType = 'EMPTY' | 'WALL' | 'START' | 'END';

export interface Position {
  row: number;
  col: number;
}

export interface GridNode extends Position {
  type: NodeType;
  isVisited: boolean;
  isPath: boolean;
}

export type SimulationState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'SWEEPING';

export type AlgorithmType = 
  // Pathfinding
  | 'ASTAR' 
  | 'DIJKSTRA' 
  | 'BFS' 
  | 'DFS'
  // Maze
  | 'MAZE_DFS'
  | 'MAZE_PRIM'
  // Automata
  | 'GAMEOFLIFE';

export interface StepResult {
  type: 'VISIT' | 'PATH' | 'DONE' | 'NO_PATH' | 'TICK';
  node?: Position | Position[];
  path?: Position[];
}
