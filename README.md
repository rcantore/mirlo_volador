# Mirlo Volador

A Flappy Bird clone where you control a blackbird (mirlo) with your hand via webcam. Point your index finger and move it up and down — the bird follows.

## How It Works

Your webcam captures your hand using [MediaPipe](https://developers.google.com/mediapipe) hand tracking. The index fingertip Y-position maps directly to the bird's Y-position on screen — no gravity, no flapping, just direct hand control.

## Features

- **Hand tracking control** — point your index finger to steer the bird
- **Procedural graphics** — all Canvas 2D, zero image assets
- **Day/night cycle** — sky transitions from day to sunset to starry night as your score climbs
- **Difficulty progression** — pipes speed up and gaps shrink over time
- **Chiptune soundtrack** — procedural background music and sound effects via Web Audio API
- **Responsive** — adapts to mobile phones, tablets, and desktop screens
- **Camera PiP** — mirrored webcam feed in the corner so you can see yourself

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

Open `http://localhost:5173` in your browser. Allow camera access when prompted, then show your hand to start playing.

## Tech Stack

- **Vite** — dev server and bundler
- **TypeScript** — type safety across all modules
- **HTML Canvas 2D** — game rendering
- **@mediapipe/tasks-vision** — hand landmark detection
- **Vitest** — unit testing
- **Web Audio API** — procedural sound effects and music

## Project Structure

```
src/
├── main.ts           # Bootstrap: init canvas, camera, start game
├── types.ts          # Shared interfaces
├── constants.ts      # Game config, colors, difficulty curves
├── game.ts           # Game loop and state machine (menu/playing/gameover)
├── renderer.ts       # Sky, ground, pipes, clouds, day/night cycle
├── bird.ts           # Mirlo drawing, wing animation, hand-to-position mapping
├── pipes.ts          # Pipe spawning, scrolling, hitboxes
├── collision.ts      # AABB collision detection
├── hand-tracker.ts   # MediaPipe HandLandmarker with exponential smoothing
├── camera.ts         # Webcam access and PiP overlay
├── score.ts          # Score tracking with localStorage persistence
├── audio.ts          # Procedural chiptune music and sound effects
├── ui.ts             # Menu, game over, and hand indicator overlays
└── style.css         # Layout and mobile viewport handling
tests/
├── collision.test.ts
├── pipes.test.ts
├── bird.test.ts
└── game.test.ts
```

## Requirements

- A device with a webcam
- A modern browser (Chrome, Firefox, Edge, Safari)
- HTTPS (required for camera access — `localhost` works for development)

## License

[MIT](LICENSE)
