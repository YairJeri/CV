import type { GraphNode, GraphEdge, GraphStepResult } from './types';

// Breadth-First Search on General Graph
export function* graphBfsGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string
): Generator<GraphStepResult, GraphStepResult, void> {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    if (!e.isDirected) adj.get(e.target)?.push(e.source);
  });

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  visited.add(startNodeId);

  yield {
    type: 'VISIT_NODE',
    nodeId: startNodeId,
    description: `Start BFS from node ${startNodeId}`,
    visitedNodes: Array.from(visited)
  };

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        yield {
          type: 'VISIT_NODE',
          nodeId: neighbor,
          description: `Discovered node ${neighbor} from ${curr}`,
          visitedNodes: Array.from(visited)
        };
      }
    }
  }

  return {
    type: 'DONE',
    description: `BFS traversal completed. Visited ${visited.size} nodes.`,
    visitedNodes: Array.from(visited)
  };
}

// Depth-First Search on General Graph
export function* graphDfsGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string
): Generator<GraphStepResult, GraphStepResult, void> {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    if (!e.isDirected) adj.get(e.target)?.push(e.source);
  });

  const visited = new Set<string>();

  function* dfsVisit(nodeId: string): Generator<GraphStepResult, void, void> {
    visited.add(nodeId);
    yield {
      type: 'VISIT_NODE',
      nodeId,
      description: `Visit node ${nodeId}`,
      visitedNodes: Array.from(visited)
    };

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        yield* dfsVisit(neighbor);
      }
    }
  }

  yield* dfsVisit(startNodeId);

  return {
    type: 'DONE',
    description: `DFS traversal completed. Visited ${visited.size} nodes.`,
    visitedNodes: Array.from(visited)
  };
}

// Kruskal's Minimum Spanning Tree
export function* kruskalGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Generator<GraphStepResult, GraphStepResult, void> {
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const parent = new Map<string, string>();
  nodes.forEach(n => parent.set(n.id, n.id));

  function find(i: string): string {
    if (parent.get(i) === i) return i;
    const root = find(parent.get(i)!);
    parent.set(i, root);
    return root;
  }

  function union(i: string, j: string): boolean {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent.set(rootI, rootJ);
      return true;
    }
    return false;
  }

  const mstEdges: string[] = [];

  for (const edge of sortedEdges) {
    yield {
      type: 'EXAMINE_EDGE',
      edgeId: edge.id,
      description: `Evaluating edge ${edge.source} - ${edge.target} (weight: ${edge.weight})`,
      activeEdges: [...mstEdges, edge.id]
    };

    if (union(edge.source, edge.target)) {
      mstEdges.push(edge.id);
      yield {
        type: 'ADD_MST_EDGE',
        edgeId: edge.id,
        description: `Added edge ${edge.source} - ${edge.target} to MST (no cycle)`,
        activeEdges: [...mstEdges]
      };
    }
  }

  return {
    type: 'DONE',
    description: `Kruskal's MST complete with ${mstEdges.length} edges.`,
    activeEdges: mstEdges
  };
}

// Prim's Minimum Spanning Tree
export function* primGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string = nodes[0]?.id || '0'
): Generator<GraphStepResult, GraphStepResult, void> {
  const inMst = new Set<string>([startNodeId]);
  const mstEdges: string[] = [];

  yield {
    type: 'VISIT_NODE',
    nodeId: startNodeId,
    description: `Initialize Prim's MST starting from node ${startNodeId}`,
    visitedNodes: Array.from(inMst)
  };

  while (inMst.size < nodes.length) {
    let minEdge: GraphEdge | null = null;
    let minWeight = Infinity;

    for (const edge of edges) {
      const srcIn = inMst.has(edge.source);
      const dstIn = inMst.has(edge.target);

      // One endpoint in MST, one outside
      if ((srcIn && !dstIn) || (!srcIn && dstIn)) {
        if (edge.weight < minWeight) {
          minWeight = edge.weight;
          minEdge = edge;
        }
      }
    }

    if (!minEdge) break; // Graph disconnected

    const nextNode = inMst.has(minEdge.source) ? minEdge.target : minEdge.source;
    inMst.add(nextNode);
    mstEdges.push(minEdge.id);

    yield {
      type: 'ADD_MST_EDGE',
      edgeId: minEdge.id,
      nodeId: nextNode,
      description: `Connected node ${nextNode} via minimum cut edge ${minEdge.source}-${minEdge.target} (w: ${minEdge.weight})`,
      visitedNodes: Array.from(inMst),
      activeEdges: [...mstEdges]
    };
  }

  return {
    type: 'DONE',
    description: `Prim's MST completed with ${mstEdges.length} edges.`,
    visitedNodes: Array.from(inMst),
    activeEdges: mstEdges
  };
}

// Connected Components (Union-Find)
export function* connectedComponentsGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Generator<GraphStepResult, GraphStepResult, void> {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    adj.get(e.target)?.push(e.source);
  });

  const visited = new Set<string>();
  const components: Record<string, number> = {};
  let currentComponent = 0;

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      currentComponent++;
      const queue = [node.id];
      visited.add(node.id);
      components[node.id] = currentComponent;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        yield {
          type: 'COMPONENT_ASSIGNED',
          nodeId: curr,
          description: `Node ${curr} assigned to Component #${currentComponent}`,
          components: { ...components }
        };

        const neighbors = adj.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            components[neighbor] = currentComponent;
            queue.push(neighbor);
          }
        }
      }
    }
  }

  return {
    type: 'DONE',
    description: `Found ${currentComponent} connected components.`,
    components
  };
}

// Topological Sort (Kahn's Algorithm)
export function* topologicalSortGenerator(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Generator<GraphStepResult, GraphStepResult, void> {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) queue.push(n.id);
  });

  const order: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    order.push(curr);

    yield {
      type: 'TOPOLOGICAL_ORDER',
      nodeId: curr,
      description: `Output node ${curr} (in-degree 0)`,
      order: [...order]
    };

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== nodes.length) {
    return {
      type: 'CYCLE_DETECTED',
      description: `Graph has at least one cycle! Topological sorting is impossible for cyclic graphs.`,
      order
    };
  }

  return {
    type: 'DONE',
    description: `Topological ordering computed: ${order.join(' -> ')}`,
    order
  };
}
