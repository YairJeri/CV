import type { GridNode, Position, StepResult } from '../core/types';

export function* bidirectionalBfsGenerator(
  grid: GridNode[][],
  startNode: Position,
  endNode: Position
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;

  const queueStart: Position[] = [startNode];
  const queueEnd: Position[] = [endNode];

  const parentStart = new Map<string, Position>();
  const parentEnd = new Map<string, Position>();

  const visitedStart = new Set<string>([`${startNode.row},${startNode.col}`]);
  const visitedEnd = new Set<string>([`${endNode.row},${endNode.col}`]);

  let meetingNode: Position | null = null;

  while (queueStart.length > 0 && queueEnd.length > 0) {
    // Step forward from Start
    const currentStart = queueStart.shift()!;
    yield {
      type: 'EXPLORE_NODE',
      position: currentStart,
      distance: 0
    };

    if (visitedEnd.has(`${currentStart.row},${currentStart.col}`)) {
      meetingNode = currentStart;
      break;
    }

    const startNeighbors = [
      { row: currentStart.row - 1, col: currentStart.col },
      { row: currentStart.row + 1, col: currentStart.col },
      { row: currentStart.row, col: currentStart.col - 1 },
      { row: currentStart.row, col: currentStart.col + 1 }
    ];

    for (const n of startNeighbors) {
      if (n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols) {
        if (grid[n.row][n.col].isWall) continue;
        const key = `${n.row},${n.col}`;
        if (!visitedStart.has(key)) {
          visitedStart.add(key);
          parentStart.set(key, currentStart);
          queueStart.push(n);
          if (visitedEnd.has(key)) {
            meetingNode = n;
            break;
          }
        }
      }
    }
    if (meetingNode) break;

    // Step backward from End
    const currentEnd = queueEnd.shift()!;
    yield {
      type: 'EXPLORE_NODE',
      position: currentEnd,
      distance: 0
    };

    if (visitedStart.has(`${currentEnd.row},${currentEnd.col}`)) {
      meetingNode = currentEnd;
      break;
    }

    const endNeighbors = [
      { row: currentEnd.row - 1, col: currentEnd.col },
      { row: currentEnd.row + 1, col: currentEnd.col },
      { row: currentEnd.row, col: currentEnd.col - 1 },
      { row: currentEnd.row, col: currentEnd.col + 1 }
    ];

    for (const n of endNeighbors) {
      if (n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols) {
        if (grid[n.row][n.col].isWall) continue;
        const key = `${n.row},${n.col}`;
        if (!visitedEnd.has(key)) {
          visitedEnd.add(key);
          parentEnd.set(key, currentEnd);
          queueEnd.push(n);
          if (visitedStart.has(key)) {
            meetingNode = n;
            break;
          }
        }
      }
    }
    if (meetingNode) break;
  }

  if (meetingNode) {
    // Reconstruct path
    const pathFromStart: Position[] = [];
    let curr: Position | undefined = meetingNode;
    while (curr) {
      pathFromStart.push(curr);
      curr = parentStart.get(`${curr.row},${curr.col}`);
    }
    pathFromStart.reverse();

    const pathToEnd: Position[] = [];
    curr = parentEnd.get(`${meetingNode.row},${meetingNode.col}`);
    while (curr) {
      pathToEnd.push(curr);
      curr = parentEnd.get(`${curr.row},${curr.col}`);
    }

    return { type: 'PATH_FOUND', path: [...pathFromStart, ...pathToEnd] };
  }

  return { type: 'PATH_NOT_FOUND' };
}
