export const MAX_PARTICLES = 100000;
export const MAX_CONSTRAINTS = 100000;
export interface ISpatialStructure {
  insert(pId: number): void;
  remove(pId: number): void;
  update(pId: number): void;
  query(aabb: AABB, outBuffer: Int32Array): number;
  clear(): void;
  setBounds(width: number, height: number): void;
}
export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
export interface AABBNode {
  id: number;
  aabb: AABB;
  particleId: number;
  left: number;
  right: number;
  parent: number;
  height: number;
}
export const NULL_NODE = -1;
export interface PhysicsState {
  positions: Float32Array;
  oldPositions: Float32Array;
  invMass: Float32Array;
  activeParticles: Int32Array;
  activeParticleCount: number;
  g_positions: Float32Array;
  g_mass: Float32Array;
  activeGravityCount: number;
}
export interface SimulationConfig {
  gravityX: number;
  gravityY: number;
  friction: number;
  bounce: number;
  grabbedParticleId: number;
  grabbedX: number;
  grabbedY: number;
}
export interface IIntegrator {
  integrate(state: PhysicsState, config: SimulationConfig, dt: number): void;
}
export interface IPhysicsEngine {
  positions: Float32Array;
  colors: Uint32Array;
  radii: Float32Array;
  invMass: Float32Array;
  activeParticleCount: number;
  activeParticles: Int32Array;
  activeConstraintCount: number;
  activeConstraints: Int32Array;
  c_p1: Int32Array;
  c_p2: Int32Array;
  c_targetLength: Float32Array;
  c_isTearable: Uint8Array;
  activeWallCount: number;
  wall_x1: Float32Array;
  wall_y1: Float32Array;
  wall_x2: Float32Array;
  wall_y2: Float32Array;
  activeGravityCount: number;
  grabbedParticleId: number;
  grabbedX: number;
  grabbedY: number;
  gravityY: number;
  bounce: number;
  setBounds(width: number, height: number): void;
  setSpatialStructure(mode: string): void;
  update(dt?: number): void;
  clear(): void;
  addParticle(x: number, y: number, radius: number, mass: number, color: number, isPinned: boolean): number;
  removeParticle(pId: number): void;
  addConstraint(p1Id: number, p2Id: number, targetLength: number, stiffness?: number, isTearable?: boolean, tearThreshold?: number): number;
  removeConstraint(cId: number): void;
  addIgnore(p1: number, p2: number): void;
  addGravityPoint(x: number, y: number, mass: number): void;
  addWallLine(x1: number, y1: number, x2: number, y2: number, radius: number, color: number): void;
  addSoftbody(x: number, y: number, radius: number, points: number, pressure: number, color: number): void;
  getNearestParticle(x: number, y: number, searchRadius: number): number;
  collisionGroup: Int32Array;
  collisionMask: Int32Array;
}
