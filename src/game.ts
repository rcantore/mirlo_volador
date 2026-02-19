import { GameState, HandPosition, ScoreState, LeaderboardEntry } from './types';
import { CONFIG, getDifficultySpeed, getDifficultyGap } from './constants';
import { createBird, updateBird, getBirdHitbox, drawBird } from './bird';
import { PipeManager } from './pipes';
import { checkPipeCollision, isOutOfBounds } from './collision';
import { createScore, incrementScore, resetScore } from './score';
import { Renderer } from './renderer';
import { drawHandIndicator, drawStateOverlay } from './ui';
import { HandTracker } from './hand-tracker';
import { Camera } from './camera';
import { AudioManager } from './audio';
import { getLeaderboard, addEntry, promptScoreEntry } from './leaderboard';
import { track } from '@vercel/analytics';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private state: GameState = 'menu';
  private bird = createBird();
  private pipes = new PipeManager();
  private score: ScoreState = createScore();
  private renderer = new Renderer();
  private handTracker = new HandTracker();
  private camera = new Camera();
  private audio = new AudioManager();

  private lastTime = 0;
  private handDetectedTime = 0;
  private gameOverTime = 0;
  private animFrameId = 0;
  private handPosition: HandPosition = { y: 0.5, detected: false, confidence: 0 };
  private waitingForScoreForm = false;
  private leaderboardCache: LeaderboardEntry[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context');
    this.ctx = ctx;
    this.setupCanvas();

    // Re-fit on resize and orientation change
    window.addEventListener('resize', () => this.setupCanvas());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.setupCanvas(), 100);
    });
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const gameAspect = CONFIG.canvasWidth / CONFIG.canvasHeight;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const winAspect = winW / winH;

    let cssWidth: number;
    let cssHeight: number;

    if (winAspect > gameAspect) {
      // Window is wider than game — fit to height (landscape PC, wide tablet)
      cssHeight = winH;
      cssWidth = winH * gameAspect;
    } else {
      // Window is narrower than game — fit to width (portrait phone)
      cssWidth = winW;
      cssHeight = winW / gameAspect;
    }

    const scale = cssWidth / CONFIG.canvasWidth;

    // Buffer matches actual screen pixels for crisp rendering
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    // CSS logical size
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    // Reset and scale context so game code still uses CONFIG coordinates
    this.ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }

  async init(): Promise<void> {
    await this.camera.init();
    await this.handTracker.init();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loop = (time: number): void => {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = time;

    this.detectHand(time);
    this.update(dt);
    this.render(dt, time);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private detectHand(timestamp: number): void {
    if (!this.camera.isReady()) return;
    this.handPosition = this.handTracker.detect(this.camera.getVideo(), timestamp);
  }

  private update(dt: number): void {
    switch (this.state) {
      case 'menu':
        this.updateMenu(dt);
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'gameover':
        this.updateGameOver();
        break;
    }
  }

  private updateMenu(dt: number): void {
    updateBird(this.bird, this.handPosition, dt);

    if (this.handPosition.detected) {
      this.handDetectedTime += dt;
      if (this.handDetectedTime >= CONFIG.handDetectionDelay) {
        this.startGame();
      }
    } else {
      this.handDetectedTime = 0;
    }
  }

  private updatePlaying(dt: number): void {
    updateBird(this.bird, this.handPosition, dt);
    const speed = getDifficultySpeed(this.score.current);
    const gap = getDifficultyGap(this.score.current);
    this.pipes.update(dt, speed, gap);

    // Check scoring
    const birdRect = getBirdHitbox(this.bird);
    for (const pipe of this.pipes.pipes) {
      if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
        pipe.scored = true;
        incrementScore(this.score);
        this.audio.playScore();
      }

      // Check collision
      const hitboxes = this.pipes.getHitboxes(pipe);
      if (checkPipeCollision(birdRect, hitboxes)) {
        this.gameOver();
        return;
      }
    }

    // Check bounds
    if (isOutOfBounds(this.bird)) {
      this.gameOver();
    }
  }

  private updateGameOver(): void {
    if (this.waitingForScoreForm) return;
    const elapsed = (performance.now() - this.gameOverTime) / 1000;
    if (elapsed >= CONFIG.restartCooldown && this.handPosition.detected) {
      this.restart();
    }
  }

  private render(dt: number, time: number): void {
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Background
    this.renderer.drawSky(ctx, this.score.current);

    // Clouds (parallax layer behind pipes)
    this.renderer.drawClouds(ctx, dt);

    // Pipes (only during play/gameover)
    if (this.state !== 'menu') {
      this.renderer.drawPipes(ctx, this.pipes.pipes);
    }

    // Ground
    this.renderer.drawGround(ctx, dt, this.state === 'playing' || this.state === 'menu');

    // Bird
    drawBird(ctx, this.bird, time);

    // Score
    if (this.state === 'playing') {
      this.renderer.drawScore(ctx, this.score);
    }

    // Camera PiP
    this.camera.drawPiP(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Hand indicator
    drawHandIndicator(ctx, this.handPosition.detected);

    // State overlay
    const canRestart = !this.waitingForScoreForm
      && (performance.now() - this.gameOverTime) / 1000 >= CONFIG.restartCooldown;
    drawStateOverlay(ctx, this.state, this.score, this.handPosition.detected, canRestart, this.leaderboardCache);
  }

  private startGame(): void {
    this.state = 'playing';
    this.pipes.reset();
    resetScore(this.score);
    this.handDetectedTime = 0;
    this.audio.playSwoosh();
    this.audio.startMusic();
    track('game_start');
  }

  private gameOver(): void {
    this.state = 'gameover';
    this.gameOverTime = performance.now();
    this.audio.stopMusic();
    this.audio.playCrash();
    this.leaderboardCache = getLeaderboard();
    track('game_over', { score: this.score.current });
    this.showScoreForm();
  }

  private async showScoreForm(): Promise<void> {
    if (this.score.current === 0) return;
    this.waitingForScoreForm = true;
    const result = await promptScoreEntry(this.score.current);
    if (result) {
      this.leaderboardCache = addEntry(result.name, result.email, this.score.current);
      track('score_submitted', { score: this.score.current });
    }
    this.waitingForScoreForm = false;
    this.gameOverTime = performance.now();
  }

  private restart(): void {
    this.bird = createBird();
    this.pipes.reset();
    resetScore(this.score);
    this.renderer.resetGround();
    this.handTracker.reset();
    this.state = 'menu';
    this.handDetectedTime = 0;
  }

  getState(): GameState {
    return this.state;
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }
}
