export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  isDirected?: boolean;
  highlighted?: boolean;
}

export type GraphStepType = 
  | 'VISIT_NODE'
  | 'EXAMINE_EDGE'
  | 'ADD_MST_EDGE'
  | 'CYCLE_DETECTED'
  | 'COMPONENT_ASSIGNED'
  | 'TOPOLOGICAL_ORDER'
  | 'DONE';

export interface GraphStepResult {
  type: GraphStepType;
  nodeId?: string;
  edgeId?: string;
  description: string;
  visitedNodes?: string[];
  activeEdges?: string[];
  components?: Record<string, number>;
  order?: string[];
}
