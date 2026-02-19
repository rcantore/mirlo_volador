import { ScoreState } from './types';

const BEST_SCORE_KEY = 'mirlo_volador_best';

export function createScore(): ScoreState {
  return {
    current: 0,
    best: loadBest(),
  };
}

export function incrementScore(score: ScoreState): void {
  score.current++;
  if (score.current > score.best) {
    score.best = score.current;
    saveBest(score.best);
  }
}

export function resetScore(score: ScoreState): void {
  score.current = 0;
}

function loadBest(): number {
  try {
    const val = localStorage.getItem(BEST_SCORE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveBest(best: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(best));
  } catch {
    // localStorage might be unavailable
  }
}
