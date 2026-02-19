import { GameState, ScoreState, LeaderboardEntry } from './types';
import { CONFIG, COLORS } from './constants';

export function drawHandIndicator(
  ctx: CanvasRenderingContext2D,
  detected: boolean
): void {
  const radius = 8;
  const x = 30;
  const y = 30;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = detected ? COLORS.handIndicator : COLORS.handIndicatorOff;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(detected ? 'Hand detected' : 'Show your hand', x + 16, y + 5);
}

export function drawMenuOverlay(ctx: CanvasRenderingContext2D, handDetected: boolean): void {
  // Semi-transparent overlay
  ctx.fillStyle = COLORS.menuOverlay;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  // Title
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.menuText;
  ctx.fillText('Mirlo Volador', CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 - 60);

  // Subtitle
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('A blackbird adventure', CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 - 25);

  // Instructions
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = COLORS.menuText;
  if (handDetected) {
    ctx.fillText('Keep your hand steady to start...', CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 + 30);
  } else {
    ctx.fillText('Show your hand to the camera', CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 + 30);
  }

  ctx.font = '14px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Move your hand up and down to control the bird', CONFIG.canvasWidth / 2, CONFIG.canvasHeight / 2 + 65);
}

export function drawGameOverOverlay(
  ctx: CanvasRenderingContext2D,
  score: ScoreState,
  canRestart: boolean,
  leaderboard: LeaderboardEntry[]
): void {
  // Overlay
  ctx.fillStyle = COLORS.menuOverlay;
  ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

  const cx = CONFIG.canvasWidth / 2;

  // Game Over text
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FF4444';
  ctx.fillText('Game Over', cx, 200);

  // Score
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillStyle = COLORS.menuText;
  ctx.fillText(`Score: ${score.current}`, cx, 252);

  // Best score
  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`Best: ${score.best}`, cx, 288);

  // Leaderboard
  if (leaderboard.length > 0) {
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('Leaderboard', cx, 340);

    const top5 = leaderboard.slice(0, 5);
    for (let i = 0; i < top5.length; i++) {
      const entry = top5[i];
      const y = 370 + i * 30;

      // Rank
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#FFFFFF';
      ctx.fillText(`${i + 1}.`, cx - 130, y);

      // Name
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(truncate(entry.name, 14), cx - 105, y);

      // Score
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText(String(entry.score), cx + 130, y);
    }
  }

  // Restart instruction
  ctx.textAlign = 'center';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = canRestart ? COLORS.menuText : 'rgba(255,255,255,0.4)';
  ctx.fillText(
    canRestart ? 'Raise your hand to play again' : 'Wait...',
    cx,
    CONFIG.canvasHeight - CONFIG.groundHeight - 30
  );
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
}

export function drawStateOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  score: ScoreState,
  handDetected: boolean,
  canRestart: boolean,
  leaderboard: LeaderboardEntry[]
): void {
  if (state === 'menu') {
    drawMenuOverlay(ctx, handDetected);
  } else if (state === 'gameover') {
    drawGameOverOverlay(ctx, score, canRestart, leaderboard);
  }
}
