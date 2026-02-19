import { BirdState, HandPosition, Rect } from './types';
import { CONFIG, COLORS } from './constants';

export function createBird(): BirdState {
  return {
    x: CONFIG.birdX,
    y: CONFIG.canvasHeight / 2,
    targetY: CONFIG.canvasHeight / 2,
    width: CONFIG.birdSize,
    height: CONFIG.birdSize,
    rotation: 0,
  };
}

export function updateBird(bird: BirdState, hand: HandPosition, _dt: number): void {
  const playableTop = 0;
  const playableBottom = CONFIG.canvasHeight - CONFIG.groundHeight;

  if (hand.detected) {
    bird.targetY = playableTop + hand.y * (playableBottom - playableTop);
  }

  // Smooth movement towards target
  const prevY = bird.y;
  bird.y += (bird.targetY - bird.y) * 0.15;

  // Clamp within bounds
  bird.y = Math.max(bird.height / 2, Math.min(playableBottom - bird.height / 2, bird.y));

  // Rotation based on vertical movement direction
  const dy = bird.y - prevY;
  bird.rotation = Math.max(-0.4, Math.min(0.4, dy * 0.05));
}

export function getBirdHitbox(bird: BirdState): Rect {
  const scale = CONFIG.hitboxScale;
  const w = bird.width * scale;
  const h = bird.height * scale;
  return {
    x: bird.x - w / 2,
    y: bird.y - h / 2,
    width: w,
    height: h,
  };
}

export function drawBird(ctx: CanvasRenderingContext2D, bird: BirdState, time: number): void {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  const s = bird.width / 2;

  // Wing flap animation: oscillate using sin(time)
  const flap = Math.sin(time * 0.01); // -1 to 1
  const wingY = -s * 0.3 + (flap + 1) * 0.5 * (s * 0.4); // from -s*0.3 (up) to +s*0.1 (down)
  const wingRadiusY = s * (0.2 + (flap + 1) * 0.5 * 0.25); // from s*0.2 to s*0.45

  // Tail feather
  ctx.fillStyle = COLORS.birdWing;
  ctx.beginPath();
  ctx.ellipse(-s * 0.9, 0, s * 0.3, s * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Body (black mirlo)
  ctx.fillStyle = COLORS.bird;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing (animated)
  ctx.fillStyle = COLORS.birdWing;
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, wingY, s * 0.6, wingRadiusY, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye (white)
  ctx.fillStyle = COLORS.birdEye;
  ctx.beginPath();
  ctx.arc(s * 0.45, -s * 0.2, s * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = COLORS.birdPupil;
  ctx.beginPath();
  ctx.arc(s * 0.52, -s * 0.2, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Beak (orange)
  ctx.fillStyle = COLORS.birdBeak;
  ctx.beginPath();
  ctx.moveTo(s * 0.75, -s * 0.05);
  ctx.lineTo(s * 1.2, s * 0.05);
  ctx.lineTo(s * 0.75, s * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
