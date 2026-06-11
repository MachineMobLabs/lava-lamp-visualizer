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
    // Get audio data - same method as Lava/Bubbles
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const audioSensitivity = Math.pow(avgFreq, 0.5); // Boost quiet sounds (square root)

    // Audio drives spawn rate - more particles appear with louder audio
    // Base spawn rate + audio boost
    const baseSpawnRate = intensity * 0.5;
    const audioBoost = audioSensitivity * 3; // Audio significantly increases spawn rate
    const spawnRate = baseSpawnRate + audioBoost;

    // Update and display all particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // More aggressive activation with audio
      // Each frame, particles have a chance to activate based on:
      // - How much time has passed (they still have delays)
      // - Current audio level (higher audio = more particles activate)
      const activationChance = Math.random() < spawnRate;

      particle.update(activationChance, audioSensitivity);
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
  colorCycle: number = 0; // Color based on spawn time
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

  update(canActivate: boolean, audioSensitivity: number): void {
    // Increment time counter for staggering
    this.timeSinceSpawn += 0.016; // ~60fps

    // Only activate after delay has passed AND activation signal is true
    if (canActivate && this.life <= 0 && this.timeSinceSpawn > this.delayBeforeActivation) {
      this.life = this.maxLife;

      // Audio-responsive size - bigger particles with louder audio (30% bigger boost)
      this.baseSize = 15 + audioSensitivity * 52; // 15-67px based on audio (30% bigger)
      this.size = this.baseSize;

      // Spawn at random location on screen
      this.x = Math.random() * 1920; // Approximate max width
      this.y = Math.random() * 1080; // Approximate max height

      // Set unique color based on spawn time (cycles through color spectrum)
      this.colorCycle = (this.timeSinceSpawn * 0.5) % 100;
    }

    // Update active particles
    if (this.life > 0) {
      this.life -= 1 / this.maxLife * 0.016; // ~60fps fade
      this.size = this.baseSize * Math.max(0, this.life / this.maxLife);
    }
  }

  display(p: p5): void {
    if (this.life <= 0) return; // Only draw active particles

    // Calculate color based on spawn time (Lava-style color cycling)
    const r = Math.floor(Math.sin(0.3 * this.colorCycle + 0) * 127 + 128);
    const g = Math.floor(Math.sin(0.3 * this.colorCycle + 2) * 127 + 128);
    const b = Math.floor(Math.sin(0.3 * this.colorCycle + 4) * 127 + 128);

    p.fill(r, g, b, 255); // Fully opaque, dynamic color
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
