import { describe, it, expect } from 'vitest';
import { createBird, updateBird, getBirdHitbox } from '../src/bird';
import { CONFIG } from '../src/constants';
import { HandPosition } from '../src/types';

describe('createBird', () => {
  it('creates bird at correct initial position', () => {
    const bird = createBird();
    expect(bird.x).toBe(CONFIG.birdX);
    expect(bird.y).toBe(CONFIG.canvasHeight / 2);
    expect(bird.rotation).toBe(0);
  });
});

describe('updateBird', () => {
  it('moves bird toward hand Y position', () => {
    const bird = createBird();
    const hand: HandPosition = { y: 0.2, detected: true, confidence: 0.9 };
    const initialY = bird.y;
    updateBird(bird, hand, 0.016);
    expect(bird.y).not.toBe(initialY);
  });

  it('does not move when hand is not detected', () => {
    const bird = createBird();
    bird.targetY = bird.y;
    const hand: HandPosition = { y: 0.8, detected: false, confidence: 0 };
    const beforeY = bird.y;
    updateBird(bird, hand, 0.016);
    // targetY unchanged when hand not detected, so bird stays near same position
    expect(Math.abs(bird.y - beforeY)).toBeLessThan(1);
  });

  it('clamps bird within playable bounds', () => {
    const bird = createBird();
    const hand: HandPosition = { y: 1.5, detected: true, confidence: 0.9 };
    // Run many updates to push bird to extreme
    for (let i = 0; i < 100; i++) {
      updateBird(bird, hand, 0.016);
    }
    const groundY = CONFIG.canvasHeight - CONFIG.groundHeight;
    expect(bird.y + bird.height / 2).toBeLessThanOrEqual(groundY);
  });
});

describe('getBirdHitbox', () => {
  it('returns hitbox smaller than visual size', () => {
    const bird = createBird();
    const hitbox = getBirdHitbox(bird);
    expect(hitbox.width).toBeLessThan(bird.width);
    expect(hitbox.height).toBeLessThan(bird.height);
  });

  it('hitbox is centered on bird position', () => {
    const bird = createBird();
    const hitbox = getBirdHitbox(bird);
    const hitboxCenterX = hitbox.x + hitbox.width / 2;
    const hitboxCenterY = hitbox.y + hitbox.height / 2;
    expect(Math.abs(hitboxCenterX - bird.x)).toBeLessThan(0.01);
    expect(Math.abs(hitboxCenterY - bird.y)).toBeLessThan(0.01);
  });
});
