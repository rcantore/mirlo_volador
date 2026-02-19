import { Game } from './game';
import './style.css';

async function main(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  const game = new Game(canvas);

  try {
    await game.init();
  } catch (err) {
    console.error('Failed to initialize game:', err);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 480;
      canvas.height = 720;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 480, 720);
      ctx.font = '24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Camera access required', 240, 320);
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Please allow camera permissions', 240, 360);
      ctx.fillText('and refresh the page', 240, 385);
    }
  }
}

main();
