import { PipePair, Rect } from './types';
import { CONFIG } from './constants';

export class PipeManager {
  pipes: PipePair[] = [];
  private timeSinceSpawn = 0;

  update(dt: number, speed: number, gap: number): void {
    this.timeSinceSpawn += dt;

    // Spawn new pipes
    if (this.timeSinceSpawn >= CONFIG.pipeSpawnInterval) {
      this.spawn(gap);
      this.timeSinceSpawn = 0;
    }

    // Move pipes left
    for (const pipe of this.pipes) {
      pipe.x -= speed * dt;
    }

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(p => p.x + p.width > -10);
  }

  spawn(gap: number): void {
    const playableHeight = CONFIG.canvasHeight - CONFIG.groundHeight;
    const minTop = 60;
    const maxTop = playableHeight - gap - 60;
    const topHeight = minTop + Math.random() * (maxTop - minTop);

    this.pipes.push({
      x: CONFIG.canvasWidth + 10,
      topHeight,
      gap,
      width: CONFIG.pipeWidth,
      scored: false,
    });
  }

  getHitboxes(pipe: PipePair): [Rect, Rect] {
    const top: Rect = {
      x: pipe.x,
      y: 0,
      width: pipe.width,
      height: pipe.topHeight,
    };
    const bottom: Rect = {
      x: pipe.x,
      y: pipe.topHeight + pipe.gap,
      width: pipe.width,
      height: CONFIG.canvasHeight - CONFIG.groundHeight - pipe.topHeight - pipe.gap,
    };
    return [top, bottom];
  }

  reset(): void {
    this.pipes = [];
    this.timeSinceSpawn = 0;
  }
}
