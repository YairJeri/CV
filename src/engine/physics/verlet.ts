import type { IIntegrator, PhysicsState, SimulationConfig } from './types';

export class VerletIntegrator implements IIntegrator {
  integrate(state: PhysicsState, config: SimulationConfig, dt: number) {
    const substepFriction = Math.pow(config.friction, dt);
    const MAX_VELOCITY_SQ = 16.0;
    const gX = config.gravityX * dt;
    const gY = config.gravityY * dt;

    for (let i = 0; i < state.activeParticleCount; i++) {
      const pId = state.activeParticles[i];
      const offset = pId * 3;
      if (pId === config.grabbedParticleId) {
        state.positions[offset] = config.grabbedX;
        state.positions[offset + 1] = config.grabbedY;
        state.oldPositions[offset] = config.grabbedX;
        state.oldPositions[offset + 1] = config.grabbedY;
        continue;
      }

      if (state.invMass[pId] === 0) continue;

      let px = state.positions[offset];
      let py = state.positions[offset + 1];
      let vx = (px - state.oldPositions[offset]) * substepFriction;
      let vy = (py - state.oldPositions[offset + 1]) * substepFriction;
      let fgX = 0;
      let fgY = 0;

      // Gravitational attractors
      for (let j = 0; j < state.activeGravityCount; j++) {
        const goffset = j * 2;
        const gx = state.g_positions[goffset];
        const gy = state.g_positions[goffset + 1];
        const dx = gx - px;
        const dy = gy - py;
        const distSq = dx * dx + dy * dy;
        if (distSq > 100) {
          const dist = Math.sqrt(distSq);
          const force = (state.g_mass[j] * dt) / distSq;
          fgX += (dx / dist) * force;
          fgY += (dy / dist) * force;
        }
      }

      const velSq = vx * vx + vy * vy;
      if (velSq > MAX_VELOCITY_SQ) {
        const vel = Math.sqrt(velSq);
        vx = (vx / vel) * 4.0;
        vy = (vy / vel) * 4.0;
      }

      state.oldPositions[offset] = px;
      state.oldPositions[offset + 1] = py;
      state.positions[offset] = px + vx + gX + fgX;
      state.positions[offset + 1] = py + vy + gY + fgY;
    }
  }
}
