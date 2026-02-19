// Catchy chiptune melody (note frequencies in Hz)
const MELODY_NOTES = [
  // Bar 1: C major bounce
  523, 659, 784, 659,  523, 659, 784, 1047,
  // Bar 2: step down
  880, 784, 659, 784,  659, 523, 440, 523,
  // Bar 3: playful climb
  587, 659, 784, 880,  784, 659, 784, 659,
  // Bar 4: resolve
  523, 587, 659, 523,  440, 523, 659, 523,
];

const BASS_NOTES = [
  // Simple root notes, one per beat (4 notes per bar)
  262, 262, 349, 349,  440, 440, 330, 330,
  294, 294, 392, 392,  262, 262, 220, 262,
];

const NOTE_DURATION = 0.15; // seconds per melody note
const MELODY_LOOP_TIME = MELODY_NOTES.length * NOTE_DURATION;

export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicPlaying = false;
  private musicTimerId: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  startMusic(): void {
    if (this.musicPlaying) return;
    try {
      const ctx = this.getContext();
      this.musicGain = ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.06, ctx.currentTime);
      this.musicGain.connect(ctx.destination);
      this.musicPlaying = true;
      this.scheduleLoop();
    } catch {
      // Audio not available
    }
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(0.001, this.getContext().currentTime);
      this.musicGain = null;
    }
  }

  private scheduleLoop(): void {
    if (!this.musicPlaying || !this.musicGain) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Schedule melody (square wave for chiptune feel)
      for (let i = 0; i < MELODY_NOTES.length; i++) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(MELODY_NOTES[i], now + i * NOTE_DURATION);
        noteGain.gain.setValueAtTime(0.3, now + i * NOTE_DURATION);
        noteGain.gain.setValueAtTime(0.001, now + (i + 0.9) * NOTE_DURATION);
        osc.connect(noteGain);
        noteGain.connect(this.musicGain);
        osc.start(now + i * NOTE_DURATION);
        osc.stop(now + (i + 0.95) * NOTE_DURATION);
      }

      // Schedule bass (triangle wave for warmth)
      for (let i = 0; i < BASS_NOTES.length; i++) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        const beatDuration = NOTE_DURATION * 2; // bass plays half as often
        bassOsc.frequency.setValueAtTime(BASS_NOTES[i], now + i * beatDuration);
        bassGain.gain.setValueAtTime(0.5, now + i * beatDuration);
        bassGain.gain.setValueAtTime(0.001, now + (i + 0.85) * beatDuration);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now + i * beatDuration);
        bassOsc.stop(now + (i + 0.9) * beatDuration);
      }

      // Schedule next loop
      this.musicTimerId = window.setTimeout(() => {
        this.scheduleLoop();
      }, MELODY_LOOP_TIME * 1000 - 50); // slight overlap to avoid gaps
    } catch {
      this.musicPlaying = false;
    }
  }

  playScore(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Happy ascending ding
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not available
    }
  }

  playCrash(): void {
    try {
      const ctx = this.getContext();

      // White noise burst for crash
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      // Low-pass filter for thud feel
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(ctx.currentTime);
    } catch {
      // Audio not available
    }
  }

  playSwoosh(): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not available
    }
  }
}
