import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Particles {
  private p: p5;
  private particles: ColorfulParticle[];

  constructor(p: p5) {
    this.p = p;
    this.particles = [];

    // Pre-create fixed particle pool divided into 3 staggered partitions
    // Each partition overlaps so particles always on screen even as others fade
    // Fade duration is ~5.2 seconds, so partitions overlap significantly
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * p.width;
      const y = Math.random() * p.height;
      // Divide into 3 groups with OVERLAPPING delays:
      // Partition 1: 0-2 seconds
      // Partition 2: 1.5-3.5 seconds (overlaps Partition 1)
      // Partition 3: 3-5 seconds (overlaps Partition 2)
      // Result: Each partition starts before previous partition fades completely
      const partition = Math.floor(i / 150); // 0, 1, or 2
      // Short delays that overlap: particles appear quickly and continuously
      // Partition 1: 0-0.5s, Partition 2: 0.3-0.8s, Partition 3: 0.6-1.1s
      const baseDelay = partition * 0.3; // 0, 0.3, 0.6 seconds
      const windowSize = 0.5; // Each partition spans 0.5 seconds
      const delayBeforeActivation = baseDelay + Math.random() * windowSize;
      this.particles.push(new ColorfulParticle(x, y, delayBeforeActivation));
    }
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    // Get audio data - same method as Lava/Bubbles/Ink
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const audioSensitivity = Math.pow(avgFreq, 0.5); // Boost quiet sounds (square root)

    // Light trail effect - subtle fade
    this.p.fill(10, 10, 10, 5);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Audio drives activation rate - more particles activate with louder audio
    // With 450 particles, 13s fade duration, and visible overlapping partitions:
    // Need high activation to keep canvas continuously populated
    const baseActivationRate = intensity * 1.2; // High base rate for constant stream
    const audioBoost = audioSensitivity * 3;
    const activationRate = Math.min(1.0, baseActivationRate + audioBoost); // Cap at 100%

    // Update and display all particles in fixed pool
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Activation chance based on audio and time delay
      const canActivate = Math.random() < activationRate;
      particle.update(canActivate, intensity, audioSensitivity, this.p);
      particle.display(this.p, audioSensitivity);
    }
  }
}

class ColorfulParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number = 2.5;
  hue: number;
  baseSize: number;
  timeSinceSpawn: number = 0;
  delayBeforeActivation: number;

  constructor(x: number, y: number, delayBeforeActivation: number) {
    this.x = x;
    this.y = y;
    this.delayBeforeActivation = delayBeforeActivation;
    this.life = 0;
    this.hue = Math.random() * 360;
    this.baseSize = 2; // Base size, will be boosted by audio during activation
    this.vx = 0;
    this.vy = 0;
  }

  update(canActivate: boolean, intensity: number, audioSensitivity: number, p: p5): void {
    // Increment time counter for staggering
    this.timeSinceSpawn += 0.016; // ~60fps

    // Only activate after delay has passed AND activation signal is true
    if (canActivate && this.life <= 0 && this.timeSinceSpawn > this.delayBeforeActivation) {
      this.life = this.maxLife;

      // Spawn at random location on screen using p5 canvas dimensions
      this.x = Math.random() * p.width;
      this.y = Math.random() * p.height;

      // Audio-responsive movement speed
      const baseSpeed = 1 + audioSensitivity * 2;
      this.vx = (Math.random() - 0.5) * 4 * baseSpeed;
      this.vy = (Math.random() - 0.5) * 4 * baseSpeed;

      // Audio-responsive size
      this.baseSize = 2 + audioSensitivity * 3; // 2-5px based on audio
    }

    // Update active particles
    if (this.life > 0) {
      // Update position with velocity
      this.x += this.vx * intensity;
      this.y += this.vy * intensity;

      // CRITICAL: Velocity decay must match fade duration (13 seconds)
      // Fade: 2.5 / (1/2.5 * 0.008) = ~781 frames = 13 seconds
      // Velocity decay with 0.9974 keeps motion at ~20% after 13 seconds
      // This ensures particles move for the ENTIRE fade duration, not just first 5 seconds
      this.vx *= 0.9974;
      this.vy *= 0.9974;

      this.life -= 1 / this.maxLife * 0.008; // 13 seconds to completely fade
    }
  }

  display(p: p5, audioSensitivity: number): void {
    if (this.life <= 0) return; // Only draw active particles

    const h = this.hue;
    const s = 100;
    const l = 60;

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = (l / 100) - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    // Audio-responsive pulsing - each particle pulses with louder audio
    const sizeMultiplier = 1 + audioSensitivity * 0.6;
    const displaySize = this.baseSize * this.life * sizeMultiplier;

    p.fill(r, g, b, this.life * 0.8 * 255);
    p.noStroke();
    p.rect(this.x, this.y, displaySize, displaySize);
  }
}
