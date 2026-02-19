import { PipePair, ScoreState } from './types';
import { CONFIG, COLORS, GROUND_SCROLL_SPEED } from './constants';

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}

export class Renderer {
  private groundOffset = 0;
  private clouds: Cloud[];
  private stars: Array<{x: number; y: number; size: number; brightness: number}> = [];

  constructor() {
    this.clouds = this.initClouds();
  }

  private initClouds(): Cloud[] {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * CONFIG.canvasWidth,
        y: 30 + Math.random() * (CONFIG.canvasHeight * 0.35),
        width: 60 + Math.random() * 80,
        speed: 20 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.3,
      });
    }
    return clouds;
  }

  private ensureStars(): void {
    if (this.stars.length === 0) {
      for (let i = 0; i < 60; i++) {
        this.stars.push({
          x: Math.random() * CONFIG.canvasWidth,
          y: Math.random() * (CONFIG.canvasHeight - CONFIG.groundHeight) * 0.7,
          size: 0.5 + Math.random() * 1.5,
          brightness: 0.3 + Math.random() * 0.7,
        });
      }
    }
  }

  drawSky(ctx: CanvasRenderingContext2D, score: number): void {
    this.ensureStars();
    const skyH = CONFIG.canvasHeight - CONFIG.groundHeight;
    const gradient = ctx.createLinearGradient(0, 0, 0, skyH);

    // Phase: 0-25 = day, 25-50 = sunset, 50+ = night (gradual transition)
    const phase = Math.min(score / 25, 3); // 0..3

    let topColor: string;
    let bottomColor: string;

    if (phase <= 1) {
      // Day -> golden hour transition
      topColor = lerpColor('#87CEEB', '#E8A04C', phase);
      bottomColor = lerpColor('#E0F0FF', '#FCCB6E', phase);
    } else if (phase <= 2) {
      // Golden hour -> sunset -> dusk
      const t = phase - 1;
      topColor = lerpColor('#E8A04C', '#2E1A47', t);
      bottomColor = lerpColor('#FCCB6E', '#4A2060', t);
    } else {
      // Deep night
      topColor = lerpColor('#2E1A47', '#0B0B3B', Math.min(1, phase - 2));
      bottomColor = lerpColor('#4A2060', '#1A1A4E', Math.min(1, phase - 2));
    }

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, skyH);

    // Draw stars when it's getting dark (score > 40)
    if (score > 40) {
      const starAlpha = Math.min(1, (score - 40) / 20);
      for (const star of this.stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(performance.now() * 0.003 + star.x);
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * star.brightness * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawGround(ctx: CanvasRenderingContext2D, dt: number, scrolling: boolean): void {
    const groundY = CONFIG.canvasHeight - CONFIG.groundHeight;

    if (scrolling) {
      this.groundOffset = (this.groundOffset + GROUND_SCROLL_SPEED * dt) % 32;
    }

    // Grass strip
    ctx.fillStyle = COLORS.groundTop;
    ctx.fillRect(0, groundY, CONFIG.canvasWidth, 4);

    // Ground body
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, groundY + 4, CONFIG.canvasWidth, CONFIG.groundHeight - 4);

    // Ground texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let x = -this.groundOffset; x < CONFIG.canvasWidth; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 10);
      ctx.lineTo(x + 16, groundY + CONFIG.groundHeight);
      ctx.stroke();
    }
  }

  drawPipes(ctx: CanvasRenderingContext2D, pipes: PipePair[]): void {
    for (const pipe of pipes) {
      this.drawPipe(ctx, pipe);
    }
  }

  private drawPipe(ctx: CanvasRenderingContext2D, pipe: PipePair): void {
    const capHeight = 26;
    const capOverhang = 4;
    const groundY = CONFIG.canvasHeight - CONFIG.groundHeight;

    // Top pipe body
    ctx.fillStyle = COLORS.pipeBody;
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

    // Top pipe cap
    ctx.fillStyle = COLORS.pipeCap;
    ctx.fillRect(
      pipe.x - capOverhang,
      pipe.topHeight - capHeight,
      pipe.width + capOverhang * 2,
      capHeight
    );

    // Top pipe border
    ctx.strokeStyle = COLORS.pipeBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
    ctx.strokeRect(
      pipe.x - capOverhang,
      pipe.topHeight - capHeight,
      pipe.width + capOverhang * 2,
      capHeight
    );

    // Bottom pipe body
    const bottomY = pipe.topHeight + pipe.gap;
    const bottomHeight = groundY - bottomY;
    ctx.fillStyle = COLORS.pipeBody;
    ctx.fillRect(pipe.x, bottomY, pipe.width, bottomHeight);

    // Bottom pipe cap
    ctx.fillStyle = COLORS.pipeCap;
    ctx.fillRect(
      pipe.x - capOverhang,
      bottomY,
      pipe.width + capOverhang * 2,
      capHeight
    );

    // Bottom pipe border
    ctx.strokeStyle = COLORS.pipeBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, bottomY, pipe.width, bottomHeight);
    ctx.strokeRect(
      pipe.x - capOverhang,
      bottomY,
      pipe.width + capOverhang * 2,
      capHeight
    );
  }

  drawScore(ctx: CanvasRenderingContext2D, score: ScoreState): void {
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.scoreText;
    ctx.strokeStyle = COLORS.scoreStroke;
    ctx.lineWidth = 4;
    const text = String(score.current);
    ctx.strokeText(text, CONFIG.canvasWidth / 2, 60);
    ctx.fillText(text, CONFIG.canvasWidth / 2, 60);
  }

  drawClouds(ctx: CanvasRenderingContext2D, dt: number): void {
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt;

      // Wrap around when cloud exits left side
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.canvasWidth + cloud.width * 0.5;
        cloud.y = 30 + Math.random() * (CONFIG.canvasHeight * 0.35);
      }

      // Draw cloud as 2-3 overlapping white ellipses
      ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
      const w = cloud.width;
      const h = w * 0.4;

      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cloud.x - w * 0.25, cloud.y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cloud.x + w * 0.25, cloud.y + h * 0.05, w * 0.3, h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resetGround(): void {
    this.groundOffset = 0;
  }
}
