import { CAMERA_WIDTH, CAMERA_HEIGHT, PIP_WIDTH, PIP_HEIGHT, PIP_MARGIN } from './constants';

export class Camera {
  private video: HTMLVideoElement;
  private ready = false;

  constructor() {
    this.video = document.createElement('video');
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('autoplay', '');
    this.video.muted = true;
  }

  async init(): Promise<HTMLVideoElement> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: CAMERA_WIDTH, height: CAMERA_HEIGHT },
    });
    this.video.srcObject = stream;
    await this.video.play();
    this.ready = true;
    return this.video;
  }

  getVideo(): HTMLVideoElement {
    return this.video;
  }

  isReady(): boolean {
    return this.ready;
  }

  // Draw mirrored PiP in bottom-right of canvas
  drawPiP(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (!this.ready) return;
    const x = canvasWidth - PIP_WIDTH - PIP_MARGIN;
    const y = canvasHeight - PIP_HEIGHT - PIP_MARGIN;

    ctx.save();
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, PIP_WIDTH + 2, PIP_HEIGHT + 2);

    // Mirror horizontally for natural feel
    ctx.translate(x + PIP_WIDTH, y);
    ctx.scale(-1, 1);
    ctx.drawImage(this.video, 0, 0, PIP_WIDTH, PIP_HEIGHT);
    ctx.restore();
  }
}
