import type { GridNode, Position, StepResult } from '../core/types';

export function* recursiveBacktrackerGenerator(
  grid: GridNode[][]
): Generator<StepResult, StepResult, void> {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Asumimos que la grilla empieza toda como MURO
  const startPos: Position = { row: 1, col: 1 };
  
  const stack: Position[] = [startPos];
  const visited = new Set<string>();
  visited.add(`${startPos.row},${startPos.col}`);
  
  yield { type: 'VISIT', node: startPos };

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Buscar vecinos válidos (saltando de 2 en 2 para dejar muros)
    const neighbors = [
      { row: current.row - 2, col: current.col }, // Arriba
      { row: current.row + 2, col: current.col }, // Abajo
      { row: current.row, col: current.col - 2 }, // Izquierda
      { row: current.row, col: current.col + 2 }, // Derecha
    ].filter(n => 
      n.row > 0 && n.row < rows - 1 &&
      n.col > 0 && n.col < cols - 1 &&
      !visited.has(`${n.row},${n.col}`)
    );

    if (neighbors.length > 0) {
      // Elegir un vecino al azar
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Eliminar el muro entre current y next
      const wallToRemove = {
        row: current.row + (next.row - current.row) / 2,
        col: current.col + (next.col - current.col) / 2
      };
      
      yield { type: 'VISIT', node: wallToRemove };
      yield { type: 'VISIT', node: next };
      
      visited.add(`${next.row},${next.col}`);
      stack.push(next);
    } else {
      // No hay vecinos válidos, backtrack
      stack.pop();
    }
  }

  return { type: 'DONE' };
}

export function generateRecursiveBacktrackerMaze(rows: number, cols: number): { isWall: boolean }[][] {
  const result: { isWall: boolean }[][] = [];
  for (let r = 0; r < rows; r++) {
    result[r] = [];
    for (let c = 0; c < cols; c++) {
      result[r][c] = { isWall: true };
    }
  }

  const mockGrid: any = result;
  const gen = recursiveBacktrackerGenerator(mockGrid);
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
