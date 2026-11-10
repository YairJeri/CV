import type { GridNode, Position, StepResult } from '../core/types';
import { heuristic, MinHeap } from '../core/utils';

export function* aStarGenerator(
  grid: GridNode[][],
  startNode: Position,
  endNode: Position
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const openSet = new MinHeap<Position>();
  openSet.push(startNode, 0);

  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Position>();

  const gScore = new Map<string, number>();
  gScore.set(`${startNode.row},${startNode.col}`, 0);

  const fScore = new Map<string, number>();
  fScore.set(
    `${startNode.row},${startNode.col}`,
    heuristic(startNode, endNode)
  );

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
      
      yield { type: 'DONE', path: path.reverse() };
      return { type: 'DONE', path: path.reverse() };
    }

    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    if (currentKey !== `${startNode.row},${startNode.col}`) {
      yield { type: 'VISIT', node: current };
    }

    const neighbors = [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.row < 0 || neighbor.row >= rows ||
        neighbor.col < 0 || neighbor.col >= cols
      ) continue;

      const neighborNode = grid[neighbor.row][neighbor.col];
      if (neighborNode.type === 'WALL') continue;

      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1;

      if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        const f = tentativeGScore + heuristic(neighbor, endNode);
        fScore.set(neighborKey, f);
        openSet.push(neighbor, f);
      }
    }
  }

  return { type: 'NO_PATH' };
}
