import { describe, it, expect } from 'vitest';
import { PipeManager } from '../src/pipes';
import { CONFIG } from '../src/constants';

describe('PipeManager', () => {
  it('starts with no pipes', () => {
    const pm = new PipeManager();
    expect(pm.pipes.length).toBe(0);
  });

  it('spawns a pipe after the spawn interval', () => {
    const pm = new PipeManager();
    pm.update(CONFIG.pipeSpawnInterval + 0.01, CONFIG.pipeSpeed, CONFIG.pipeGap);
    expect(pm.pipes.length).toBe(1);
  });

  it('pipe spawns at canvas right edge', () => {
    const pm = new PipeManager();
    pm.spawn(CONFIG.pipeGap);
    expect(pm.pipes[0].x).toBeGreaterThan(CONFIG.canvasWidth - 1);
  });

  it('pipes move left over time', () => {
    const pm = new PipeManager();
    pm.spawn(CONFIG.pipeGap);
    const initialX = pm.pipes[0].x;
    pm.update(1, CONFIG.pipeSpeed, CONFIG.pipeGap);
    expect(pm.pipes[0].x).toBeLessThan(initialX);
  });

  it('removes pipes that scroll off-screen', () => {
    const pm = new PipeManager();
    pm.spawn(CONFIG.pipeGap);
    pm.pipes[0].x = -100;
    pm.update(0.016, CONFIG.pipeSpeed, CONFIG.pipeGap);
    expect(pm.pipes.length).toBe(0);
  });

  it('returns correct hitbox pairs', () => {
    const pm = new PipeManager();
    pm.spawn(CONFIG.pipeGap);
    const [top, bottom] = pm.getHitboxes(pm.pipes[0]);
    expect(top.y).toBe(0);
    expect(top.height).toBe(pm.pipes[0].topHeight);
    expect(bottom.y).toBe(pm.pipes[0].topHeight + pm.pipes[0].gap);
  });

  it('resets clears all pipes', () => {
    const pm = new PipeManager();
    pm.spawn(CONFIG.pipeGap);
    pm.spawn(CONFIG.pipeGap);
    pm.reset();
    expect(pm.pipes.length).toBe(0);
  });
});
