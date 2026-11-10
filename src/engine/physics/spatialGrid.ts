import { MAX_PARTICLES } from './types';
import type { ISpatialStructure, AABB, IPhysicsEngine } from './types';
const MAX_PER_CELL = 128;
export class SpatialHashGrid implements ISpatialStructure {
  private engine: IPhysicsEngine;
  private cellSize: number = 40;
  private cols: number = 0;
  private rows: number = 0;
  private totalCells: number = 0;
  private cells!: Int32Array;
  private cellCounts!: Int32Array;
  private p_gridMinX = new Int16Array(MAX_PARTICLES);
  private p_gridMinY = new Int16Array(MAX_PARTICLES);
  private p_gridMaxX = new Int16Array(MAX_PARTICLES);
  private p_gridMaxY = new Int16Array(MAX_PARTICLES);
  private queryTick: number = 0;
  private particleTick = new Int32Array(MAX_PARTICLES);
  private _tempMin = { cx: 0, cy: 0 };
  private _tempMax = { cx: 0, cy: 0 };
  constructor(engine: IPhysicsEngine) {
    this.engine = engine;
  }
  setBounds(width: number, height: number) {
    this.cols = Math.ceil(width / this.cellSize) + 2;
    this.rows = Math.ceil(height / this.cellSize) + 2;
    this.totalCells = this.cols * this.rows;
    this.cells = new Int32Array(this.totalCells * MAX_PER_CELL);
    this.cellCounts = new Int32Array(this.totalCells);
  }
  private getCellCoords(x: number, y: number, out: { cx: number, cy: number }) {
    let cx = Math.floor(x / this.cellSize);
    let cy = Math.floor(y / this.cellSize);
    if (cx < 0) cx = 0;
    if (cx >= this.cols) cx = this.cols - 1;
    if (cy < 0) cy = 0;
    if (cy >= this.rows) cy = this.rows - 1;
    out.cx = cx;
    out.cy = cy;
  }
  insert(pId: number) {
    const offset = pId * 3;
    const x = this.engine.positions[offset];
    const y = this.engine.positions[offset + 1];
    const r = this.engine.radii[pId];
    this.getCellCoords(x - r, y - r, this._tempMin);
    this.getCellCoords(x + r, y + r, this._tempMax);
    this.p_gridMinX[pId] = this._tempMin.cx;
    this.p_gridMinY[pId] = this._tempMin.cy;
    this.p_gridMaxX[pId] = this._tempMax.cx;
    this.p_gridMaxY[pId] = this._tempMax.cy;
    for (let cy = this._tempMin.cy; cy <= this._tempMax.cy; cy++) {
      for (let cx = this._tempMin.cx; cx <= this._tempMax.cx; cx++) {
        const cId = cx + cy * this.cols;
        const count = this.cellCounts[cId];
        if (count < MAX_PER_CELL) {
          this.cells[cId * MAX_PER_CELL + count] = pId;
          this.cellCounts[cId] = count + 1;
        }
      }
    }
  }
  remove(pId: number) {
    const minX = this.p_gridMinX[pId];
    const minY = this.p_gridMinY[pId];
    const maxX = this.p_gridMaxX[pId];
    const maxY = this.p_gridMaxY[pId];
    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const cId = cx + cy * this.cols;
        let count = this.cellCounts[cId];
        const cellOffset = cId * MAX_PER_CELL;
        for (let i = 0; i < count; i++) {
          if (this.cells[cellOffset + i] === pId) {
            this.cells[cellOffset + i] = this.cells[cellOffset + count - 1];
            this.cellCounts[cId] = count - 1;
            break;
          }
        }
      }
    }
  }
  update(pId: number) {
    const offset = pId * 3;
    const x = this.engine.positions[offset];
    const y = this.engine.positions[offset + 1];
    const r = this.engine.radii[pId];
    this.getCellCoords(x - r, y - r, this._tempMin);
    this.getCellCoords(x + r, y + r, this._tempMax);
    if (
      this.p_gridMinX[pId] === this._tempMin.cx &&
      this.p_gridMinY[pId] === this._tempMin.cy &&
      this.p_gridMaxX[pId] === this._tempMax.cx &&
      this.p_gridMaxY[pId] === this._tempMax.cy
    ) {
      return;
    }
    this.remove(pId);
    this.insert(pId);
  }
  query(aabb: AABB, outBuffer: Int32Array): number {
    this.queryTick++;
    let hitCount = 0;
    this.getCellCoords(aabb.minX, aabb.minY, this._tempMin);
    this.getCellCoords(aabb.maxX, aabb.maxY, this._tempMax);
    const maxBuffer = outBuffer.length;
    for (let cy = this._tempMin.cy; cy <= this._tempMax.cy; cy++) {
      for (let cx = this._tempMin.cx; cx <= this._tempMax.cx; cx++) {
        const cId = cx + cy * this.cols;
        const count = this.cellCounts[cId];
        const cellOffset = cId * MAX_PER_CELL;
        for (let i = 0; i < count; i++) {
          const pId = this.cells[cellOffset + i];
          if (this.particleTick[pId] !== this.queryTick) {
            this.particleTick[pId] = this.queryTick;
            if (hitCount < maxBuffer) {
              outBuffer[hitCount++] = pId;
            }
          }
        }
      }
    }
    return hitCount;
  }
  clear() {
    this.cellCounts.fill(0);
    this.particleTick.fill(0);
    this.queryTick = 0;
  }
}
