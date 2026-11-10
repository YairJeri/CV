import type { GridNode, Position, StepResult } from '../core/types';

export function* dfsGenerator(
  grid: GridNode[][],
  startNode: Position,
  endNode: Position
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const stack: Position[] = [startNode];
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();

  while (stack.length > 0) {
    const current = stack.pop()!;
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

    if (!visited.has(currentKey)) {
      visited.add(currentKey);
      
      if (currentKey !== `${startNode.row},${startNode.col}`) {
        yield { type: 'VISIT', node: current };
      }

      // Reverse order to process up, down, left, right in an intuitive way
      const neighbors = [
        { row: current.row, col: current.col + 1 }, // Right
        { row: current.row, col: current.col - 1 }, // Left
        { row: current.row + 1, col: current.col }, // Down
        { row: current.row - 1, col: current.col }, // Up
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
          cameFrom.set(neighborKey, current);
          stack.push(neighbor);
        }
      }
    }
  }

  return { type: 'NO_PATH' };
}
