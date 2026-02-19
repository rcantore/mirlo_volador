import { Rect, BirdState } from './types';
import { CONFIG } from './constants';

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function isOutOfBounds(bird: BirdState): boolean {
  const groundY = CONFIG.canvasHeight - CONFIG.groundHeight;
  return bird.y - bird.height / 2 <= 0 || bird.y + bird.height / 2 >= groundY;
}

export function checkPipeCollision(birdRect: Rect, pipeHitboxes: [Rect, Rect]): boolean {
  return rectsOverlap(birdRect, pipeHitboxes[0]) || rectsOverlap(birdRect, pipeHitboxes[1]);
}
