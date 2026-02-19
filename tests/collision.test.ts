import { describe, it, expect } from 'vitest';
import { rectsOverlap, isOutOfBounds, checkPipeCollision } from '../src/collision';
import { Rect, BirdState } from '../src/types';

describe('rectsOverlap', () => {
  it('returns true for overlapping rectangles', () => {
    const a: Rect = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rect = { x: 5, y: 5, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it('returns false for non-overlapping rectangles', () => {
    const a: Rect = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rect = { x: 20, y: 20, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('returns false for touching but not overlapping rectangles', () => {
    const a: Rect = { x: 0, y: 0, width: 10, height: 10 };
    const b: Rect = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('returns true when one rect contains the other', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 10, y: 10, width: 10, height: 10 };
    expect(rectsOverlap(a, b)).toBe(true);
  });
});

describe('isOutOfBounds', () => {
  it('returns true when bird hits the ground', () => {
    const bird: BirdState = { x: 120, y: 680, targetY: 680, width: 36, height: 36, rotation: 0 };
    expect(isOutOfBounds(bird)).toBe(true);
  });

  it('returns true when bird hits the ceiling', () => {
    const bird: BirdState = { x: 120, y: 0, targetY: 0, width: 36, height: 36, rotation: 0 };
    expect(isOutOfBounds(bird)).toBe(true);
  });

  it('returns false when bird is in playable area', () => {
    const bird: BirdState = { x: 120, y: 360, targetY: 360, width: 36, height: 36, rotation: 0 };
    expect(isOutOfBounds(bird)).toBe(false);
  });
});

describe('checkPipeCollision', () => {
  it('returns true when bird hits top pipe', () => {
    const birdRect: Rect = { x: 100, y: 50, width: 30, height: 30 };
    const pipes: [Rect, Rect] = [
      { x: 90, y: 0, width: 64, height: 100 },
      { x: 90, y: 260, width: 64, height: 460 },
    ];
    expect(checkPipeCollision(birdRect, pipes)).toBe(true);
  });

  it('returns true when bird hits bottom pipe', () => {
    const birdRect: Rect = { x: 100, y: 300, width: 30, height: 30 };
    const pipes: [Rect, Rect] = [
      { x: 90, y: 0, width: 64, height: 100 },
      { x: 90, y: 260, width: 64, height: 460 },
    ];
    expect(checkPipeCollision(birdRect, pipes)).toBe(true);
  });

  it('returns false when bird passes through gap', () => {
    const birdRect: Rect = { x: 100, y: 170, width: 30, height: 30 };
    const pipes: [Rect, Rect] = [
      { x: 90, y: 0, width: 64, height: 100 },
      { x: 90, y: 260, width: 64, height: 460 },
    ];
    expect(checkPipeCollision(birdRect, pipes)).toBe(false);
  });
});
