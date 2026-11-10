export function getNextSparseState(aliveCells: Set<string>): Set<string> {
  // Mapa para contar vecinos vivos por cada coordenada
  const neighborCounts = new Map<string, number>();

  // Helper para iterar
  const addNeighbor = (x: number, y: number) => {
    const key = `${x},${y}`;
    const count = neighborCounts.get(key) || 0;
    neighborCounts.set(key, count + 1);
  };

  // 1. Por cada celda viva, incrementamos el contador de sus 8 vecinos
  for (const cellKey of aliveCells) {
    const [xStr, yStr] = cellKey.split(',');
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        addNeighbor(x + dx, y + dy);
      }
    }
  }

  // 2. Evaluamos reglas de Conway basándonos en los contadores
  const nextAliveCells = new Set<string>();

  for (const [key, count] of neighborCounts.entries()) {
    const isAlive = aliveCells.has(key);
    
    // Regla 1: Celda viva con 2 o 3 vecinos sobrevive
    if (isAlive && (count === 2 || count === 3)) {
      nextAliveCells.add(key);
    } 
    // Regla 2: Celda muerta con exactamente 3 vecinos nace
    else if (!isAlive && count === 3) {
      nextAliveCells.add(key);
    }
  }

  return nextAliveCells;
}
