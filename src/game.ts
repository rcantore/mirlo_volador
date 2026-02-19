import { GameState, HandPosition, ScoreState } from './types';
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

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context');
    this.ctx = ctx;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    // Scale to fill viewport height while keeping aspect ratio
    const aspect = CONFIG.canvasWidth / CONFIG.canvasHeight;
    const cssHeight = window.innerHeight;
    const cssWidth = Math.min(window.innerWidth, cssHeight * aspect);
    const scale = cssHeight / CONFIG.canvasHeight;

    // Buffer matches actual screen pixels
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    // CSS logical size
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    // Scale context so game code still uses CONFIG coordinates
    this.ctx.scale(scale * dpr, scale * dpr);
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
    const canRestart = (performance.now() - this.gameOverTime) / 1000 >= CONFIG.restartCooldown;
    drawStateOverlay(ctx, this.state, this.score, this.handPosition.detected, canRestart);
  }

  private startGame(): void {
    this.state = 'playing';
    this.pipes.reset();
    resetScore(this.score);
    this.handDetectedTime = 0;
    this.audio.playSwoosh();
    this.audio.startMusic();
  }

  private gameOver(): void {
    this.state = 'gameover';
    this.gameOverTime = performance.now();
    this.audio.stopMusic();
    this.audio.playCrash();
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
