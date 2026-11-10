import type { IPhysicsEngine } from './types';

export class SceneBuilder {
  // Pure 2D Rigid Quad with 2 diagonal shear springs (no center vertex)
  static spawnBox(engine: IPhysicsEngine, x: number, y: number, size: number, particleRadius: number, mass: number, color: number) {
    const p1 = engine.addParticle(x - size, y - size, particleRadius, mass, color, false);
    const p2 = engine.addParticle(x + size, y - size, particleRadius, mass, color, false);
    const p3 = engine.addParticle(x + size, y + size, particleRadius, mass, color, false);
    const p4 = engine.addParticle(x - size, y + size, particleRadius, mass, color, false);

    if (p1 !== -1 && p2 !== -1 && p3 !== -1 && p4 !== -1) {
      // Perimeter
      engine.addConstraint(p1, p2, size * 2, 1.0, false);
      engine.addConstraint(p2, p3, size * 2, 1.0, false);
      engine.addConstraint(p3, p4, size * 2, 1.0, false);
      engine.addConstraint(p4, p1, size * 2, 1.0, false);
      // Diagonals
      const diag = Math.SQRT2 * size * 2;
      engine.addConstraint(p1, p3, diag, 1.0, false);
      engine.addConstraint(p2, p4, diag, 1.0, false);
    }
  }

  // Pure Cloth Grid (Pure quad springs: horizontal & vertical distance constraints only)
  // Completely disables self-collision within the cloth by setting collisionGroup to 0 and collisionMask to 0
  static spawnCloth(engine: IPhysicsEngine, x: number, y: number, cols: number, rows: number, spacing: number, particleRadius: number, mass: number, color: number, stiffness: number = 0.35) {
    // Ensure odd number of columns so the top intercalation pins both ends symmetrically (c=0 and c=cols-1) without leaving a hanging edge column
    const effectiveCols = cols % 2 === 0 ? cols + 1 : cols;
    const startX = x - (effectiveCols * spacing) / 2;
    const startY = y - (rows * spacing) / 2;
    const clothIds: number[][] = [];

    for (let r = 0; r < rows; r++) {
      clothIds[r] = [];
      for (let c = 0; c < effectiveCols; c++) {
        const px = startX + c * spacing;
        const py = startY + r * spacing;
        // Intercalated pinning: every other node pinned (c=0, 2, 4, ... up to last col)
        const isPinned = r === 0 && (c % 2 === 0);
        const pId = engine.addParticle(px, py, particleRadius, mass, color, isPinned);
        if (pId !== -1) {
          // Setting collisionGroup = 0 completely excludes cloth nodes from particle-particle collision solving
          engine.collisionGroup[pId] = 0;
          engine.collisionMask[pId] = 0;
        }
        clothIds[r][c] = pId;
      }
    }

    // Pure 2D Cloth Spring Grid: Horizontal and Vertical structural constraints only
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < effectiveCols; c++) {
        const current = clothIds[r][c];
        if (current === -1) continue;

        // Structural Right
        if (c < effectiveCols - 1) {
          const right = clothIds[r][c + 1];
          if (right !== -1) {
            // Tear threshold set to 5x rest length so constraints don't break unless extremely stretched
            engine.addConstraint(current, right, spacing, stiffness, true, spacing * 5);
            engine.addIgnore(current, right);
            engine.addIgnore(right, current);
          }
        }

        // Structural Down
        if (r < rows - 1) {
          const down = clothIds[r + 1][c];
          if (down !== -1) {
            engine.addConstraint(current, bottomNeighbor(clothIds, r, c), spacing, stiffness, true, spacing * 5);
            engine.addIgnore(current, down);
            engine.addIgnore(down, current);
          }
        }
      }
    }
  }

  // Precision line-segment intersection cut (exact scissor blade through constraints)
  static sliceConstraints(engine: IPhysicsEngine, x1: number, y1: number, x2: number, y2: number) {
    for (let i = engine.activeConstraintCount - 1; i >= 0; i--) {
      const cId = engine.activeConstraints[i];
      if (!engine.c_isTearable[cId]) continue;

      const p1 = engine.c_p1[cId];
      const p2 = engine.c_p2[cId];
      const cx1 = engine.positions[p1 * 3];
      const cy1 = engine.positions[p1 * 3 + 1];
      const cx2 = engine.positions[p2 * 3];
      const cy2 = engine.positions[p2 * 3 + 1];

      if (segmentsIntersect(x1, y1, x2, y2, cx1, cy1, cx2, cy2)) {
        engine.removeConstraint(cId);
      }
    }
  }

  // Exact point cut: severs a constraint only if the point is directly on it (tolerance ~2px)
  static tearArea(engine: IPhysicsEngine, x: number, y: number, tolerance: number = 2) {
    const tolSq = tolerance * tolerance;
    for (let i = engine.activeConstraintCount - 1; i >= 0; i--) {
      const cId = engine.activeConstraints[i];
      if (!engine.c_isTearable[cId]) continue;

      const p1 = engine.c_p1[cId];
      const p2 = engine.c_p2[cId];
      const x1 = engine.positions[p1 * 3];
      const y1 = engine.positions[p1 * 3 + 1];
      const x2 = engine.positions[p2 * 3];
      const y2 = engine.positions[p2 * 3 + 1];

      // Distance from point (x, y) to line segment (x1, y1)-(x2, y2)
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      let t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);

      if (distSq <= tolSq) {
        engine.removeConstraint(cId);
      }
    }
  }
}

// 2D line segment intersection test
function segmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(d) < 0.0001) return false;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function bottomNeighbor(grid: number[][], r: number, c: number): number {
  return grid[r + 1][c];
}
