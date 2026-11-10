import type { GridNode, Position, StepResult } from '../core/types';

export function* primsGenerator(
  grid: GridNode[][]
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Lista de paredes
  const walls: { current: Position, wall: Position }[] = [];
  const visited = new Set<string>();

  const startPos: Position = { row: 1, col: 1 };
  visited.add(`${startPos.row},${startPos.col}`);
  yield { type: 'VISIT', node: startPos };

  // Agregar paredes iniciales
  const addWalls = (pos: Position) => {
    const directions = [
      { row: -2, col: 0 },
      { row: 2, col: 0 },
      { row: 0, col: -2 },
      { row: 0, col: 2 }
    ];

    for (const dir of directions) {
      const neighbor = { row: pos.row + dir.row, col: pos.col + dir.col };
      const wall = { row: pos.row + dir.row / 2, col: pos.col + dir.col / 2 };
      
      if (
        neighbor.row > 0 && neighbor.row < rows - 1 &&
        neighbor.col > 0 && neighbor.col < cols - 1 &&
        !visited.has(`${neighbor.row},${neighbor.col}`)
      ) {
        walls.push({ current: neighbor, wall });
      }
    }
  };

  addWalls(startPos);

  while (walls.length > 0) {
    // Escoger una pared al azar
    const randomIndex = Math.floor(Math.random() * walls.length);
    const { current, wall } = walls[randomIndex];
    
    // Remover de la lista
    walls.splice(randomIndex, 1);

    if (!visited.has(`${current.row},${current.col}`)) {
      visited.add(`${current.row},${current.col}`);
      yield { type: 'VISIT', node: wall }; // Convertir muro en camino
      yield { type: 'VISIT', node: current }; // Convertir celda en camino
      
      addWalls(current);
    }
  }

  return { type: 'DONE' };
}

export function generatePrimsMaze(rows: number, cols: number): { isWall: boolean }[][] {
  const result: { isWall: boolean }[][] = [];
  for (let r = 0; r < rows; r++) {
    result[r] = [];
    for (let c = 0; c < cols; c++) {
      result[r][c] = { isWall: true };
    }
  }

  // Pre-seed grid for primsGenerator
  const mockGrid: any = result;
  const gen = primsGenerator(mockGrid);
  let step = gen.next();
  while (!step.done) {
    if (step.value && 'node' in step.value) {
      const node = (step.value as any).node;
      if (node && node.row < rows && node.col < cols) {
        result[node.row][node.col].isWall = false;
      }
    }
    step = gen.next();
  }
  return result;
}
