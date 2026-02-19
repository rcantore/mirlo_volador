import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { HandPosition } from './types';
import { HAND_LANDMARK_INDEX, CONFIG } from './constants';

export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private smoothedY = 0.5;
  private lastDetected = false;

  async init(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    });
  }

  detect(video: HTMLVideoElement, timestamp: number): HandPosition {
    if (!this.landmarker) {
      return { y: this.smoothedY, detected: false, confidence: 0 };
    }

    const result = this.landmarker.detectForVideo(video, timestamp);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmark = result.landmarks[0][HAND_LANDMARK_INDEX];
      const rawY = landmark.y; // 0..1 normalized

      // Exponential smoothing
      this.smoothedY = CONFIG.smoothingAlpha * rawY + (1 - CONFIG.smoothingAlpha) * this.smoothedY;
      this.lastDetected = true;

      return {
        y: this.smoothedY,
        detected: true,
        confidence: result.handedness?.[0]?.[0]?.score ?? 0,
      };
    }

    this.lastDetected = false;
    return { y: this.smoothedY, detected: false, confidence: 0 };
  }

  isDetected(): boolean {
    return this.lastDetected;
  }

  reset(): void {
    this.smoothedY = 0.5;
    this.lastDetected = false;
  }
}
