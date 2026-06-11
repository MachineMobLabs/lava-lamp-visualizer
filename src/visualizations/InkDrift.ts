import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private particles: InkParticle[];

  constructor(p: p5) {
    this.p = p;
    this.particles = [];

    // Pre-create fixed particle pool like Lava/Bubbles (no dynamic spawning)
    // Stagger the timing so particles don't all spawn at once
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * p.width;
      const y = Math.random() * p.height;
      // Stagger activation delay - spread particles over time
      const delayBeforeActivation = Math.random() * 8; // 0-8 second stagger
      this.particles.push(new InkParticle(x, y, delayBeforeActivation));
    }
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    const freqData = audioInput.getFrequencyData();
    let avgFreq = 0;
    let bass = 0;
    let treble = 0;

    if (freqData) {
      avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
      bass = audioInput.getFrequencyBand(0, 40) / 255;
      treble = audioInput.getFrequencyBand(100, 256) / 255;
    }

    // Audio-driven activation - controls how many particles are "active"
    const audioAmount = Math.pow(avgFreq + bass + treble, 1.2);
    const activationThreshold = 0.3 + (audioAmount * 0.6); // 0.3-0.9 range

    // Update and display all particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Audio controls particle activation state
      const isActive = Math.random() < activationThreshold;
      const audioSize = 15 + audioAmount * 30; // Size responds to audio

      particle.update(isActive, audioSize, intensity, avgFreq, bass, treble);
      particle.display(this.p);
    }
  }
}

class InkParticle {
  x: number;
  y: number;
  life: number = 0;
  maxLife: number = 2.5;
  size: number = 0;
  baseSize: number = 0;
  timeSinceSpawn: number = 0;
  delayBeforeActivation: number;
  // Pre-generate random positions and sizes for the 9 surrounding ellipses
  randomEllipses: Array<{ angle: number; distance: number; sizeMultiplier: number }>;

  constructor(x: number, y: number, delayBeforeActivation: number) {
    this.x = x;
    this.y = y;
    this.delayBeforeActivation = delayBeforeActivation;
    // Generate 9 random ellipses with varied sizes (0.25x to 1x) and positions
    this.randomEllipses = [];
    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 20; // 20-100px distance, 2x spacing
      const sizeMultiplier = Math.random() * 0.75 + 0.25; // 0.25x to 1x size
      this.randomEllipses.push({ angle, distance, sizeMultiplier });
    }
  }

  update(isActive: boolean, audioSize: number, _intensity: number, _avgFreq: number, _bass: number, _treble: number): void {
    // Increment time counter for staggering
    this.timeSinceSpawn += 0.016; // ~60fps

    // Only activate after delay has passed
    if (isActive && this.life <= 0 && this.timeSinceSpawn > this.delayBeforeActivation) {
      this.life = this.maxLife;
      this.baseSize = audioSize;
      this.size = audioSize;

      // Spawn at random location on screen
      this.x = Math.random() * 1920; // Approximate max width
      this.y = Math.random() * 1080; // Approximate max height
    }

    // Update active particles
    if (this.life > 0) {
      this.life -= 1 / this.maxLife * 0.016; // ~60fps fade
      this.size = this.baseSize * Math.max(0, this.life / this.maxLife);
    }
  }

  display(p: p5): void {
    if (this.life <= 0) return; // Only draw active particles

    p.fill(164, 164, 164, 255); // Fully opaque, no transparency
    p.noStroke();

    // Center ellipse at 2x size (fixed)
    p.ellipse(this.x, this.y, this.size * 2);

    // Nine randomly-placed ellipses with varied sizes (0.25x to 1x)
    for (const ellipse of this.randomEllipses) {
      const posX = this.x + Math.cos(ellipse.angle) * ellipse.distance;
      const posY = this.y + Math.sin(ellipse.angle) * ellipse.distance;
      const ellipseSize = this.size * ellipse.sizeMultiplier;
      p.ellipse(posX, posY, ellipseSize);
    }
  }
}
