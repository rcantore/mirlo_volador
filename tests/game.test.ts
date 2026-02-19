import { describe, it, expect, vi } from 'vitest';
import { createScore, incrementScore, resetScore } from '../src/score';

describe('Score', () => {
  it('starts at zero', () => {
    const score = createScore();
    expect(score.current).toBe(0);
  });

  it('increments current score', () => {
    const score = createScore();
    incrementScore(score);
    expect(score.current).toBe(1);
  });

  it('tracks best score', () => {
    const score = createScore();
    incrementScore(score);
    incrementScore(score);
    incrementScore(score);
    expect(score.best).toBeGreaterThanOrEqual(3);
  });

  it('resets current but keeps best', () => {
    const score = createScore();
    incrementScore(score);
    incrementScore(score);
    const best = score.best;
    resetScore(score);
    expect(score.current).toBe(0);
    expect(score.best).toBe(best);
  });
});
