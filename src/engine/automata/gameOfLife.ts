import { GridNode, Position } from '../core/types';

export function getNextGameOfLifeState(grid: GridNode[][]): { changes: Position[], deletes: Position[] } {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const changes: Position[] = [];
  const deletes: Position[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isAlive = grid[r][c].type === 'WALL'; // Usaremos WALL como 'Vivo'
      let aliveNeighbors = 0;

      // Contar vecinos (8 direcciones)
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          
          const nr = r + i;
          const nc = c + j;

          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (grid[nr][nc].type === 'WALL') {
              aliveNeighbors++;
            }
          }
        }
      }

      // Reglas de Conway
      if (isAlive && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
        deletes.push({ row: r, col: c });
      } else if (!isAlive && aliveNeighbors === 3) {
        changes.push({ row: r, col: c });
      }
    }
  }

  return { changes, deletes };
}
