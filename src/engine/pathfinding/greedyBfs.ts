import type { GridNode, Position, StepResult } from '../core/types';
import { heuristic, MinHeap } from '../core/utils';

export function* greedyBfsGenerator(
  grid: GridNode[][],
  startNode: Position,
  endNode: Position
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const openSet = new MinHeap<Position>();
  openSet.push(startNode, heuristic(startNode, endNode));

  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Position>();

  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    if (!current) break;

    const currentKey = `${current.row},${current.col}`;

    if (current.row === endNode.row && current.col === endNode.col) {
      const path: Position[] = [];
      let currPos: Position | undefined = current;
      
      while (currPos) {
        path.push(currPos);
        currPos = cameFrom.get(`${currPos.row},${currPos.col}`);
      }
      return { type: 'PATH_FOUND', path: path.reverse() };
    }

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    yield {
      type: 'EXPLORE_NODE',
      position: current,
      distance: 0
    };

    const neighbors = [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 }
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.row >= 0 &&
        neighbor.row < rows &&
        neighbor.col >= 0 &&
        neighbor.col < cols
      ) {
        if (grid[neighbor.row][neighbor.col].isWall) continue;

        const neighborKey = `${neighbor.row},${neighbor.col}`;
        if (closedSet.has(neighborKey)) continue;

        if (!cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          const h = heuristic(neighbor, endNode);
          openSet.push(neighbor, h);
        }
      }
    }
  }

  return { type: 'PATH_NOT_FOUND' };
}
