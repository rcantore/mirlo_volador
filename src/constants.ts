import { GameConfig } from './types';

export const CONFIG: GameConfig = {
  canvasWidth: 480,
  canvasHeight: 720,
  birdX: 120,
  birdSize: 36,
  pipeWidth: 64,
  pipeGap: 160,
  pipeSpeed: 150,
  pipeSpawnInterval: 1.8,
  groundHeight: 80,
  hitboxScale: 0.8,
  smoothingAlpha: 0.3,
  handDetectionDelay: 1.0,
  restartCooldown: 2.0,
};

export const COLORS = {
  sky: '#87CEEB',
  skyBottom: '#E0F0FF',
  ground: '#8B6914',
  groundTop: '#90EE90',
  pipeBody: '#2E8B2E',
  pipeCap: '#1E6B1E',
  pipeBorder: '#1A5A1A',
  bird: '#1A1A1A',         // black mirlo body
  birdBeak: '#FF8C00',     // orange beak
  birdEye: '#FFFFFF',
  birdPupil: '#000000',
  birdWing: '#333333',
  scoreText: '#FFFFFF',
  scoreStroke: '#000000',
  menuOverlay: 'rgba(0, 0, 0, 0.5)',
  menuText: '#FFFFFF',
  handIndicator: '#00FF00',
  handIndicatorOff: '#FF0000',
} as const;

export const HAND_LANDMARK_INDEX = 8; // index fingertip
export const GROUND_SCROLL_SPEED = 150; // pixels per second, matches pipe speed
export const CAMERA_WIDTH = 320;
export const CAMERA_HEIGHT = 240;
export const PIP_WIDTH = 160;
export const PIP_HEIGHT = 120;
export const PIP_MARGIN = 10;

export function getDifficultySpeed(score: number): number {
  // Speed increases by 8% every 5 points, capped at 2x base speed
  return Math.min(CONFIG.pipeSpeed * 2, CONFIG.pipeSpeed * (1 + score * 0.016));
}

export function getDifficultyGap(score: number): number {
  // Gap shrinks by 3px every 5 points, minimum 100px
  return Math.max(100, CONFIG.pipeGap - score * 0.6);
}

export function getDifficultySpawnInterval(score: number): number {
  // Spawn interval decreases slightly, minimum 1.0s
  return Math.max(1.0, CONFIG.pipeSpawnInterval - score * 0.03);
}
