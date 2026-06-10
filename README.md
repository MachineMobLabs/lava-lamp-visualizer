# Lava Lamp Audio Visualizer

Real-time audio visualizer with microphone input. Four reactive visualization modes built with React, p5.js, and Web Audio API.

## Live Demo

https://lava-lamp-visualizer.vercel.app

## Features

- Microphone input as primary audio source
- Four visualization modes:
  - Lava Lamp: Gooey bouncing blobs that pulse with audio
  - Bubbles: Rising particles spawned from audio energy
  - Ink Drift: Flowing trails responsive to pitch changes
  - Particles: Constellation bursting from center
- Ultra-sensitive to quiet sounds (threshold: 0.003-0.005)
- Pitch-responsive: different frequencies trigger different visual effects
- Smooth, organic motion with velocity interpolation
- Intensity slider for manual control
- Fully responsive design (desktop and mobile)
- Dark theme with warm orange accents

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/MachineMobLabs/lava-lamp-visualizer.git
cd lava-lamp-visualizer
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173

### Build

```bash
npm run build
```

Output is in the `dist` directory.

### Deploy

```bash
npm run build
vercel --prod
```

## How It Works

### Audio Input

The app uses the Web Audio API to capture microphone input:
- FFT size: 512 for frequency resolution
- Smoothing: 0.4 for responsive tracking
- Frequency bands: Bass (0-40Hz), Mid (40-100Hz), Treble (100-256Hz)

### Sensitivity

Audio threshold is set to 0.003-0.005 of maximum frequency magnitude. This makes the visualizations respond to:
- Whispers and quiet sounds
- Subtle pitch changes
- Gentle taps and snaps

### Pitch Responsiveness

Each visualization responds to different frequency bands:
- Treble triggers: fast movement, aggressive spawning, rapid color changes
- Bass triggers: expansion, particle growth, slower drift

## Customizing the Math

Key files for tuning the visualization behavior:

### Global Audio Settings
`src/AudioInput.ts`
- `fftSize`: FFT resolution (higher = more detail)
- `smoothingTimeConstant`: Response time (lower = faster)

### Per-Visualization Parameters

**Bubbles** (`src/visualizations/Bubbles.ts`)
- `avgFreq * 100 * intensity`: Spawn count multiplier
- `targetSize = 10 + avgFreq * 20 + treble * 30`: Size response
- `0.1`: Size smoothing blend (lower = smoother, higher = snappier)

**Lava Lamp** (`src/visualizations/LavaLamp.ts`)
- `avgFreq > 0.003`: Spawn threshold
- `avgFreq * 100 + Math.pow(avgFreq, 0.5) * 40`: Size boost
- `0.15`: Position smoothing blend
- `0.9 + 0.1`: Velocity damping

**Ink Drift** (`src/visualizations/InkDrift.ts`)
- `treble * 0.4`: Spawn probability boost
- `treble * 3 * intensity`: Velocity scaling
- `0.1`: Velocity interpolation factor

**Particles** (`src/visualizations/Particles.ts`)
- `Math.max(avgFreq * 30, treble * 50)`: Spawn formula
- Responsive to both overall volume and high frequencies

## Tech Stack

- React 18 with TypeScript
- p5.js for canvas rendering
- Web Audio API for audio analysis
- Vite for build and development
- Vercel for hosting

## Browser Support

Works on all modern browsers with:
- Web Audio API support
- Canvas support
- getUserMedia support (for microphone)

Note: HTTPS required for microphone access (or localhost).

## License

GNU General Public License v3.0 (GPL-3.0)

## Author

Machine Mob Labs
