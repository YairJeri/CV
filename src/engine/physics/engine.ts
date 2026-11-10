import { MAX_PARTICLES, MAX_CONSTRAINTS } from "./types";
import type { ISpatialStructure, AABB, IPhysicsEngine, PhysicsState, SimulationConfig, IIntegrator } from './types';
import { SpatialHashGrid } from './spatialGrid';
import { VerletIntegrator } from './verlet';

export class PhysicsEngine implements IPhysicsEngine {
  public currentSpatialMode: 'SPATIAL_GRID' = 'SPATIAL_GRID';
  public readonly state: PhysicsState;
  public readonly integrator: IIntegrator;
  public positions = new Float32Array(MAX_PARTICLES * 3);
  public oldPositions = new Float32Array(MAX_PARTICLES * 3);
  public radii = new Float32Array(MAX_PARTICLES);
  public invMass = new Float32Array(MAX_PARTICLES);
  public colors = new Uint32Array(MAX_PARTICLES);
  public activeParticles = new Int32Array(MAX_PARTICLES);
  public activeParticleCount = 0;
  private particleFreeList = new Int32Array(MAX_PARTICLES);
  private particleFreeCount = 0;
  private particleToActiveIndex = new Int32Array(MAX_PARTICLES);
  public c_p1 = new Int32Array(MAX_CONSTRAINTS);
  public c_p2 = new Int32Array(MAX_CONSTRAINTS);
  public c_targetLength = new Float32Array(MAX_CONSTRAINTS);
  public c_stiffness = new Float32Array(MAX_CONSTRAINTS);
  public c_isTearable = new Uint8Array(MAX_CONSTRAINTS);
  public c_tearThresholdSq = new Float32Array(MAX_CONSTRAINTS);
  public c_hasCollision = new Uint8Array(MAX_CONSTRAINTS);
  public c_thickness = new Float32Array(MAX_CONSTRAINTS);
  public activeConstraints = new Int32Array(MAX_CONSTRAINTS);
  public activeConstraintCount = 0;
  private constraintFreeList = new Int32Array(MAX_CONSTRAINTS);
  private constraintFreeCount = 0;
  private constraintToActiveIndex = new Int32Array(MAX_CONSTRAINTS);
  public g_positions = new Float32Array(MAX_PARTICLES * 2);
  public g_mass = new Float32Array(MAX_PARTICLES);
  public activeGravityCount = 0;
  public grabbedParticleId: number = -1;
  public grabbedX: number = 0;
  public grabbedY: number = 0;
  public collisionGroup = new Int32Array(MAX_PARTICLES).fill(1);
  public collisionMask = new Int32Array(MAX_PARTICLES).fill(0xFFFFFFFF);
  public p_ignore1 = new Int32Array(MAX_PARTICLES).fill(-1);
  public p_ignore2 = new Int32Array(MAX_PARTICLES).fill(-1);
  public p_ignore3 = new Int32Array(MAX_PARTICLES).fill(-1);
  public p_ignore4 = new Int32Array(MAX_PARTICLES).fill(-1);
  public MAX_SOFTBODIES = 100;
  public MAX_SOFTBODY_PARTICLES = 64;
  public activeSoftbodyCount = 0;
  public sb_particleCount = new Int32Array(this.MAX_SOFTBODIES);
  public sb_particles = new Int32Array(this.MAX_SOFTBODIES * this.MAX_SOFTBODY_PARTICLES);
  public sb_targetVolume = new Float32Array(this.MAX_SOFTBODIES);
  public sb_pressure = new Float32Array(this.MAX_SOFTBODIES);
  public MAX_WALLS = 1000;
  public wall_x1 = new Float32Array(this.MAX_WALLS);
  public wall_y1 = new Float32Array(this.MAX_WALLS);
  public wall_x2 = new Float32Array(this.MAX_WALLS);
  public wall_y2 = new Float32Array(this.MAX_WALLS);
  public wall_radius = new Float32Array(this.MAX_WALLS);
  public activeWallCount = 0;
  private queryBuffer = new Int32Array(10000);
  private searchAABB: AABB = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  public spatialStructure: ISpatialStructure;
  public gravityY: number = 400;
  public gravityX: number = 0;
  public friction: number = 0.99;
  public bounce: number = 0.6;
  public bounds = { width: 800, height: 600 };
  public constraintIterations: number = 3;

  constructor(width: number = 800, height: number = 600, integrator?: IIntegrator) {
    this.integrator = integrator || new VerletIntegrator();
    this.bounds.width = width;
    this.bounds.height = height;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particleFreeList[i] = MAX_PARTICLES - 1 - i;
      this.particleToActiveIndex[i] = -1;
    }
    this.particleFreeCount = MAX_PARTICLES;
    for (let i = 0; i < MAX_CONSTRAINTS; i++) {
      this.constraintFreeList[i] = MAX_CONSTRAINTS - 1 - i;
      this.constraintToActiveIndex[i] = -1;
    }
    this.constraintFreeCount = MAX_CONSTRAINTS;
    this.currentSpatialMode = 'SPATIAL_GRID';
    this.spatialStructure = new SpatialHashGrid(this);
    this.spatialStructure.setBounds(this.bounds.width, this.bounds.height);
    this.state = {
      positions: this.positions,
      oldPositions: this.oldPositions,
      invMass: this.invMass,
      activeParticles: this.activeParticles,
      activeParticleCount: this.activeParticleCount,
      g_positions: this.g_positions,
      g_mass: this.g_mass,
      activeGravityCount: this.activeGravityCount
    };
  }

  setBounds(width: number, height: number) {
    this.bounds.width = width;
    this.bounds.height = height;
    this.setSpatialStructure(this.currentSpatialMode);
  }

  setSpatialStructure(mode?: string) {
    if (mode) this.currentSpatialMode = mode as any;
    const newStruct = new SpatialHashGrid(this);
    newStruct.setBounds(this.bounds.width, this.bounds.height);
    for (let i = 0; i < this.activeParticleCount; i++) {
      const pId = this.activeParticles[i];
      newStruct.insert(pId);
    }
    this.spatialStructure = newStruct;
  }

  addParticle(x: number, y: number, radius: number, mass: number, color: number, isPinned: boolean): number {
    if (this.particleFreeCount === 0) return -1;
    const pId = this.particleFreeList[--this.particleFreeCount];
    const activeIdx = this.activeParticleCount++;
    this.activeParticles[activeIdx] = pId;
    this.particleToActiveIndex[pId] = activeIdx;
    const offset = pId * 3;
    this.positions[offset] = x;
    this.positions[offset + 1] = y;
    this.positions[offset + 2] = 0;
    this.oldPositions[offset] = x;
    this.oldPositions[offset + 1] = y;
    this.oldPositions[offset + 2] = 0;
    this.radii[pId] = radius;
    this.invMass[pId] = isPinned ? 0 : 1 / Math.max(0.01, mass);
    this.colors[pId] = color;
    this.collisionGroup[pId] = 1;
    this.collisionMask[pId] = 0xFFFFFFFF;
    this.p_ignore1[pId] = -1;
    this.p_ignore2[pId] = -1;
    this.p_ignore3[pId] = -1;
    this.p_ignore4[pId] = -1;
    this.spatialStructure.insert(pId);
    return pId;
  }

  addIgnore(p1: number, p2: number) {
    if (p1 === -1 || p2 === -1) return;
    if (this.p_ignore1[p1] === -1) this.p_ignore1[p1] = p2;
    else if (this.p_ignore2[p1] === -1) this.p_ignore2[p1] = p2;
    else if (this.p_ignore3[p1] === -1) this.p_ignore3[p1] = p2;
    else if (this.p_ignore4[p1] === -1) this.p_ignore4[p1] = p2;
  }

  // Pressure-Driven Softbody (Gauss-Green polygonal area preservation for authentic squash & stretch)
  addSoftbody(x: number, y: number, radius: number, points: number, pressure: number, color: number) {
    if (this.activeSoftbodyCount >= this.MAX_SOFTBODIES) return;
    const sbId = this.activeSoftbodyCount++;
    const pIds: number[] = [];
    const angleStep = (Math.PI * 2) / points;

    for (let i = 0; i < points; i++) {
      const px = x + Math.cos(i * angleStep) * radius;
      const py = y + Math.sin(i * angleStep) * radius;
      const pId = this.addParticle(px, py, 4, 3.0, color, false);
      pIds.push(pId);
      this.sb_particles[sbId * this.MAX_SOFTBODY_PARTICLES + i] = pId;
    }

    let initialVolume = 0;
    for (let i = 0; i < points; i++) {
      const p1 = pIds[i];
      const p2 = pIds[(i + 1) % points];
      const x1 = this.positions[p1 * 3];
      const y1 = this.positions[p1 * 3 + 1];
      const x2 = this.positions[p2 * 3];
      const y2 = this.positions[p2 * 3 + 1];
      initialVolume += (x1 * y2 - x2 * y1);
    }

    this.sb_particleCount[sbId] = points;
    this.sb_pressure[sbId] = pressure;
    this.sb_targetVolume[sbId] = Math.abs(initialVolume) / 2;

    // Perimeter elastic skin
    for (let i = 0; i < points; i++) {
      const p1 = pIds[i];
      const p2 = pIds[(i + 1) % points];
      const dx = this.positions[p1 * 3] - this.positions[p2 * 3];
      const dy = this.positions[p1 * 3 + 1] - this.positions[p2 * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.addConstraint(p1, p2, dist, 1.0, false, 0);
      this.addIgnore(p1, p2);
      this.addIgnore(p2, p1);
    }

    // Gentle cross chords to prevent inverted folding (low stiffness for squishiness)
    const half = Math.floor(points / 2);
    for (let i = 0; i < half; i++) {
      const p1 = pIds[i];
      const p2 = pIds[i + half];
      const dx = this.positions[p1 * 3] - this.positions[p2 * 3];
      const dy = this.positions[p1 * 3 + 1] - this.positions[p2 * 3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.addConstraint(p1, p2, dist, 0.1, false, 0);
      this.addIgnore(p1, p2);
      this.addIgnore(p2, p1);
    }
  }

  addWallLine(x1: number, y1: number, x2: number, y2: number, radius: number, color: number) {
    if (this.activeWallCount >= this.MAX_WALLS) return;
    const wId = this.activeWallCount++;
    this.wall_x1[wId] = x1;
    this.wall_y1[wId] = y1;
    this.wall_x2[wId] = x2;
    this.wall_y2[wId] = y2;
    this.wall_radius[wId] = radius;
  }

  addGravityPoint(x: number, y: number, mass: number) {
    if (this.activeGravityCount >= MAX_PARTICLES) return;
    const offset = this.activeGravityCount * 2;
    this.g_positions[offset] = x;
    this.g_positions[offset + 1] = y;
    this.g_mass[this.activeGravityCount] = mass;
    this.activeGravityCount++;
  }

  getNearestParticle(x: number, y: number, searchRadius: number): number {
    this.searchAABB.minX = x - searchRadius;
    this.searchAABB.maxX = x + searchRadius;
    this.searchAABB.minY = y - searchRadius;
    this.searchAABB.maxY = y + searchRadius;
    const count = this.spatialStructure.query(this.searchAABB, this.queryBuffer);
    let nearest = -1;
    let minDist = searchRadius * searchRadius;
    for (let i = 0; i < count; i++) {
      const pId = this.queryBuffer[i];
      const offset = pId * 3;
      const px = this.positions[offset];
      const py = this.positions[offset + 1];
      const dx = px - x;
      const dy = py - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDist) {
        minDist = distSq;
        nearest = pId;
      }
    }
    return nearest;
  }

  removeParticle(pId: number) {
    const activeIdx = this.particleToActiveIndex[pId];
    if (activeIdx === -1) return;
    for (let i = this.activeConstraintCount - 1; i >= 0; i--) {
      const cId = this.activeConstraints[i];
      if (this.c_p1[cId] === pId || this.c_p2[cId] === pId) {
        this.removeConstraint(cId);
      }
    }
    const lastActiveIdx = --this.activeParticleCount;
    const lastParticleId = this.activeParticles[lastActiveIdx];
    this.activeParticles[activeIdx] = lastParticleId;
    this.particleToActiveIndex[lastParticleId] = activeIdx;
    this.particleToActiveIndex[pId] = -1;
    this.particleFreeList[this.particleFreeCount++] = pId;
    this.spatialStructure.remove(pId);
  }

  addConstraint(
    p1Id: number,
    p2Id: number,
    targetLength: number,
    stiffness: number = 1.0,
    isTearable: boolean = false,
    tearThreshold: number = 0,
    hasCollision: boolean = false,
    thickness: number = 3.0
  ): number {
    if (this.constraintFreeCount === 0 || p1Id === -1 || p2Id === -1) return -1;
    const cId = this.constraintFreeList[--this.constraintFreeCount];
    const activeIdx = this.activeConstraintCount++;
    this.activeConstraints[activeIdx] = cId;
    this.constraintToActiveIndex[cId] = activeIdx;
    this.c_p1[cId] = p1Id;
    this.c_p2[cId] = p2Id;
    this.c_targetLength[cId] = targetLength;
    this.c_stiffness[cId] = stiffness;
    this.c_isTearable[cId] = isTearable ? 1 : 0;
    this.c_tearThresholdSq[cId] = tearThreshold * tearThreshold;
    this.c_hasCollision[cId] = hasCollision ? 1 : 0;
    this.c_thickness[cId] = thickness;
    return cId;
  }

  removeConstraint(cId: number) {
    const activeIdx = this.constraintToActiveIndex[cId];
    if (activeIdx === -1) return;
    const lastActiveIdx = --this.activeConstraintCount;
    const lastConstraintId = this.activeConstraints[lastActiveIdx];
    this.activeConstraints[activeIdx] = lastConstraintId;
    this.constraintToActiveIndex[lastConstraintId] = activeIdx;
    this.constraintToActiveIndex[cId] = -1;
    this.constraintFreeList[this.constraintFreeCount++] = cId;
  }

  clear() {
    this.activeParticleCount = 0;
    this.particleFreeCount = MAX_PARTICLES;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particleFreeList[i] = MAX_PARTICLES - 1 - i;
      this.particleToActiveIndex[i] = -1;
    }
    this.activeConstraintCount = 0;
    this.constraintFreeCount = MAX_CONSTRAINTS;
    for (let i = 0; i < MAX_CONSTRAINTS; i++) {
      this.constraintFreeList[i] = MAX_CONSTRAINTS - 1 - i;
      this.constraintToActiveIndex[i] = -1;
    }
    this.activeGravityCount = 0;
    this.activeSoftbodyCount = 0;
    this.activeWallCount = 0;
    this.spatialStructure.clear();
  }

  update(dt: number = 0.016) {
    const substeps = 4;
    const subDt = dt / substeps;
    this.state.activeParticleCount = this.activeParticleCount;
    this.state.activeGravityCount = this.activeGravityCount;
    const config: SimulationConfig = {
      gravityX: this.gravityX,
      gravityY: this.gravityY,
      friction: this.friction,
      bounce: this.bounce,
      grabbedParticleId: this.grabbedParticleId,
      grabbedX: this.grabbedX,
      grabbedY: this.grabbedY
    };

    for (let step = 0; step < substeps; step++) {
      this.integrator.integrate(this.state, config, subDt);
      this.solveSoftbodies();
      this.updateSpatialStructure();
      for (let i = 0; i < this.constraintIterations; i++) {
        this.solveConstraints();
      }
      this.solveCollisions();
      this.solveConstraintCollisions();
      this.solveWalls();
      this.applyBounds();
    }
  }

  private tempFx = new Float32Array(1024);
  private tempFy = new Float32Array(1024);

  private solveSoftbodies() {
    for (let s = 0; s < this.activeSoftbodyCount; s++) {
      const count = this.sb_particleCount[s];
      if (count < 3) continue;
      const offset = s * this.MAX_SOFTBODY_PARTICLES;

      let signedArea2 = 0;
      for (let i = 0; i < count; i++) {
        const p1 = this.sb_particles[offset + i];
        const p2 = this.sb_particles[offset + ((i + 1) % count)];
        const x1 = this.positions[p1 * 3];
        const y1 = this.positions[p1 * 3 + 1];
        const x2 = this.positions[p2 * 3];
        const y2 = this.positions[p2 * 3 + 1];
        signedArea2 += (x1 * y2 - x2 * y1);
      }
      if (signedArea2 === 0) continue;

      const currentVolume = Math.abs(signedArea2) * 0.5;
      const targetVolume = this.sb_targetVolume[s];
      const pressure = this.sb_pressure[s];
      const volumeError = targetVolume - currentVolume;
      const invVolume = targetVolume > 0 ? 1 / targetVolume : 1;

      let pressureForce = volumeError * pressure * invVolume * 0.5;
      const MAX_PRESSURE = 10.0;
      if (pressureForce > MAX_PRESSURE) pressureForce = MAX_PRESSURE;
      if (pressureForce < -MAX_PRESSURE) pressureForce = -MAX_PRESSURE;

      const windingSign = signedArea2 > 0 ? 1 : -1;
      this.tempFx.fill(0, 0, count);
      this.tempFy.fill(0, 0, count);

      for (let i = 0; i < count; i++) {
        const p1 = this.sb_particles[offset + i];
        const p2 = this.sb_particles[offset + ((i + 1) % count)];
        const x1 = this.positions[p1 * 3];
        const y1 = this.positions[p1 * 3 + 1];
        const x2 = this.positions[p2 * 3];
        const y2 = this.positions[p2 * 3 + 1];

        const dx = x2 - x1;
        const dy = y2 - y1;
        const nx = dy * windingSign;
        const ny = -dx * windingSign;

        let fx = nx * pressureForce * 0.5;
        let fy = ny * pressureForce * 0.5;
        const MAX_DISP = 1.0;
        if (fx > MAX_DISP) fx = MAX_DISP;
        if (fx < -MAX_DISP) fx = -MAX_DISP;
        if (fy > MAX_DISP) fy = MAX_DISP;
        if (fy < -MAX_DISP) fy = -MAX_DISP;

        this.tempFx[i] += fx;
        this.tempFy[i] += fy;
        this.tempFx[(i + 1) % count] += fx;
        this.tempFy[(i + 1) % count] += fy;
      }

      for (let i = 0; i < count; i++) {
        const p = this.sb_particles[offset + i];
        const idx = p * 3;
        if (this.invMass[p] > 0 && p !== this.grabbedParticleId) {
          const fx = this.tempFx[i];
          const fy = this.tempFy[i];
          this.positions[idx] += fx;
          this.positions[idx + 1] += fy;
          this.oldPositions[idx] += fx;
          this.oldPositions[idx + 1] += fy;
        }
      }
    }
  }

  private updateSpatialStructure() {
    for (let i = 0; i < this.activeParticleCount; i++) {
      this.spatialStructure.update(this.activeParticles[i]);
    }
  }

  private solveCollisions() {
    for (let i = 0; i < this.activeParticleCount; i++) {
      const p1 = this.activeParticles[i];
      // Particles with collisionGroup === 0 (like cloth) do not participate in collisions
      if (this.collisionGroup[p1] === 0) continue;

      const offset1 = p1 * 3;
      const x1 = this.positions[offset1];
      const y1 = this.positions[offset1 + 1];
      const r1 = this.radii[p1];
      const invM1 = this.invMass[p1];
      this.searchAABB.minX = x1 - r1;
      this.searchAABB.maxX = x1 + r1;
      this.searchAABB.minY = y1 - r1;
      this.searchAABB.maxY = y1 + r1;
      const count = this.spatialStructure.query(this.searchAABB, this.queryBuffer);
      for (let j = 0; j < count; j++) {
        const p2 = this.queryBuffer[j];
        if (p1 >= p2) continue;
        if (this.collisionGroup[p2] === 0) continue;
        if ((this.collisionGroup[p1] & this.collisionMask[p2]) === 0) continue;
        if (
          this.p_ignore1[p1] === p2 ||
          this.p_ignore2[p1] === p2 ||
          this.p_ignore3[p1] === p2 ||
          this.p_ignore4[p1] === p2
        ) continue;
        const invM2 = this.invMass[p2];
        if (invM1 === 0 && invM2 === 0) continue;
        const offset2 = p2 * 3;
        const x2 = this.positions[offset2];
        const y2 = this.positions[offset2 + 1];
        const r2 = this.radii[p2];
        const dx = x1 - x2;
        const dy = y1 - y2;
        const minDistance = r1 + r2;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistance * minDistance && distSq > 0.0001) {
          const distance = Math.sqrt(distSq);
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          const sumInvMass = invM1 + invM2;
          const m1Ratio = invM1 / sumInvMass;
          const m2Ratio = invM2 / sumInvMass;
          const RELAXATION = 0.9;
          const sepX = nx * overlap * RELAXATION;
          const sepY = ny * overlap * RELAXATION;
          this.positions[offset1] += sepX * m1Ratio;
          this.positions[offset1 + 1] += sepY * m1Ratio;
          if (invM2 !== 0) {
            this.positions[offset2] -= sepX * m2Ratio;
            this.positions[offset2 + 1] -= sepY * m2Ratio;
          }
        }
      }
    }
  }

  private solveConstraintCollisions() {
    for (let i = 0; i < this.activeConstraintCount; i++) {
      const cId = this.activeConstraints[i];
      if (this.c_hasCollision[cId] === 0) continue;

      const p1 = this.c_p1[cId];
      const p2 = this.c_p2[cId];
      const off1 = p1 * 3;
      const off2 = p2 * 3;
      const x1 = this.positions[off1];
      const y1 = this.positions[off1 + 1];
      const x2 = this.positions[off2];
      const y2 = this.positions[off2 + 1];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const l2 = dx * dx + dy * dy;
      if (l2 < 0.0001) continue;

      const halfThick = this.c_thickness[cId] || 3.0;

      // Check collision against all dynamic particles that aren't endpoints of this constraint
      for (let j = 0; j < this.activeParticleCount; j++) {
        const pId = this.activeParticles[j];
        if (pId === p1 || pId === p2) continue;
        if (this.collisionGroup[pId] === 0) continue;
        if (this.invMass[pId] === 0) continue;

        const pOff = pId * 3;
        let px = this.positions[pOff];
        let py = this.positions[pOff + 1];
        const r = this.radii[pId];

        // Project particle onto constraint line segment
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        const distX = px - projX;
        const distY = py - projY;
        const distSq = distX * distX + distY * distY;
        const minDist = r + halfThick;

        if (distSq < minDist * minDist && distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const penetration = minDist - dist;
          const nx = distX / dist;
          const ny = distY / dist;

          // Push ball out of beam
          this.positions[pOff] += nx * penetration * 0.85;
          this.positions[pOff + 1] += ny * penetration * 0.85;

          // Push constraint nodes in opposite reaction (Newton's 3rd law) if mobile
          const invM1 = this.invMass[p1];
          const invM2 = this.invMass[p2];
          const reaction = penetration * 0.15;
          if (invM1 > 0) {
            this.positions[off1] -= nx * reaction * (1 - t);
            this.positions[off1 + 1] -= ny * reaction * (1 - t);
          }
          if (invM2 > 0) {
            this.positions[off2] -= nx * reaction * t;
            this.positions[off2 + 1] -= ny * reaction * t;
          }
        }
      }
    }
  }

  private solveWalls() {
    for (let i = 0; i < this.activeParticleCount; i++) {
      const pId = this.activeParticles[i];
      if (this.invMass[pId] === 0) continue;
      const offset = pId * 3;
      let px = this.positions[offset];
      let py = this.positions[offset + 1];
      const r = this.radii[pId];
      for (let w = 0; w < this.activeWallCount; w++) {
        const x1 = this.wall_x1[w];
        const y1 = this.wall_y1[w];
        const x2 = this.wall_x2[w];
        const y2 = this.wall_y2[w];
        const wRadius = this.wall_radius[w];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const l2 = dx * dx + dy * dy;
        if (l2 === 0) continue;
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        const distX = px - projX;
        const distY = py - projY;
        const distSq = distX * distX + distY * distY;
        const minDistance = r + wRadius;
        if (distSq < minDistance * minDistance && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const penetration = minDistance - dist;
          const nx = distX / dist;
          const ny = distY / dist;
          px += nx * penetration;
          py += ny * penetration;
        }
      }
      this.positions[offset] = px;
      this.positions[offset + 1] = py;
    }
  }

  private applyBounds() {
    const w = this.bounds.width;
    const h = this.bounds.height;
    for (let i = 0; i < this.activeParticleCount; i++) {
      const pId = this.activeParticles[i];
      if (this.invMass[pId] === 0) continue;
      const offset = pId * 3;
      const r = this.radii[pId];
      let x = this.positions[offset];
      let y = this.positions[offset + 1];
      let oldX = this.oldPositions[offset];
      let oldY = this.oldPositions[offset + 1];
      let vx = (x - oldX) * this.friction;
      let vy = (y - oldY) * this.friction;
      if (x - r < 0) {
        x = r;
        oldX = x + vx * this.bounce;
      } else if (x + r > w) {
        x = w - r;
        oldX = x + vx * this.bounce;
      }
      if (y - r < 0) {
        y = r;
        oldY = y + vy * this.bounce;
      } else if (y + r > h) {
        y = h - r;
        oldY = y + vy * this.bounce;
      }
      this.positions[offset] = x;
      this.positions[offset + 1] = y;
      this.oldPositions[offset] = oldX;
      this.oldPositions[offset + 1] = oldY;
    }
  }

  private solveConstraints() {
    // Total relaxation passes per update = substeps (4) * constraintIterations (3) = 12
    const totalPasses = 12;

    for (let i = this.activeConstraintCount - 1; i >= 0; i--) {
      const cId = this.activeConstraints[i];
      const p1 = this.c_p1[cId];
      const p2 = this.c_p2[cId];
      const offset1 = p1 * 3;
      const offset2 = p2 * 3;
      const x1 = this.positions[offset1];
      const y1 = this.positions[offset1 + 1];
      const x2 = this.positions[offset2];
      const y2 = this.positions[offset2 + 1];
      const dx = x1 - x2;
      const dy = y1 - y2;
      const distSq = dx * dx + dy * dy;
      if (this.c_isTearable[cId]) {
        if (distSq > this.c_tearThresholdSq[cId]) {
          this.removeConstraint(cId);
          continue;
        }
      }
      const distance = Math.sqrt(distSq);
      if (distance === 0) continue;
      const difference = this.c_targetLength[cId] - distance;

      // Compliant spring relaxation factor:
      // Scaled by total passes so setting stiffness to e.g. 0.40 delivers 40% compliance per frame rather than compounding to near-100% rigidity
      const effectiveStiffness = (this.c_stiffness[cId] || 1.0) / totalPasses;
      const percent = (difference / distance) * effectiveStiffness;
      const offsetX = dx * percent;
      const offsetY = dy * percent;

      // When dragging a particle, keep it anchored firmly to cursor
      const invM1 = p1 === this.grabbedParticleId ? 0 : this.invMass[p1];
      const invM2 = p2 === this.grabbedParticleId ? 0 : this.invMass[p2];
      const sumInvMass = invM1 + invM2;
      if (sumInvMass === 0) continue;
      const m1Ratio = invM1 / sumInvMass;
      const m2Ratio = invM2 / sumInvMass;
      if (invM1 > 0) {
        this.positions[offset1] += offsetX * m1Ratio;
        this.positions[offset1 + 1] += offsetY * m1Ratio;
      }
      if (invM2 > 0) {
        this.positions[offset2] -= offsetX * m2Ratio;
        this.positions[offset2 + 1] -= offsetY * m2Ratio;
      }
    }
  }
}
