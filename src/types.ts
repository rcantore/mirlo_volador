export type GameState = 'menu' | 'playing' | 'gameover';

export interface BirdState {
  x: number;       // fixed horizontal position on canvas
  y: number;       // current Y position (mapped from hand)
  targetY: number; // raw hand Y before smoothing
  width: number;
  height: number;
  rotation: number; // tilt based on movement direction
}

export interface PipePair {
  x: number;
  topHeight: number;    // height of top pipe from top of canvas
  gap: number;          // vertical gap between pipes
  width: number;
  scored: boolean;      // already passed by bird
}

export interface HandPosition {
  y: number;           // normalized 0..1 (top to bottom)
  detected: boolean;
  confidence: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  birdX: number;          // fixed X position of bird
  birdSize: number;
  pipeWidth: number;
  pipeGap: number;        // vertical gap between top and bottom pipe
  pipeSpeed: number;      // pixels per second
  pipeSpawnInterval: number; // seconds between pipe spawns
  groundHeight: number;
  hitboxScale: number;    // 0.8 = 80% of visual size for forgiving collisions
  smoothingAlpha: number; // exponential smoothing factor for hand position
  handDetectionDelay: number; // seconds hand must be visible before game starts
  restartCooldown: number;    // seconds before restart allowed after gameover
}

export interface ScoreState {
  current: number;
  best: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LeaderboardEntry {
  name: string;
  email: string;
  score: number;
  date: string;
}
