import type { GridNode, Position, StepResult } from '../core/types';

export function* bfsGenerator(
  grid: GridNode[][],
  startNode: Position,
  endNode: Position
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const queue: Position[] = [startNode];
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();

  visited.add(`${startNode.row},${startNode.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
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
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);
      }
    }
  }

  return { type: 'NO_PATH' };
}
