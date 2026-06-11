import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Particles {
  private p: p5;
  private particles: Particle[] = [];

  constructor(p: p5) {
    this.p = p;
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

    // Audio-driven spawn rate - more particles with louder audio
    const baseSpawnRate = intensity * 15;
    const audioBoost = audioSensitivity * 4;
    const spawnRate = baseSpawnRate + audioBoost;

    // Spawn particles randomly across entire screen (not from center)
    for (let i = 0; i < spawnRate; i++) {
      if (this.particles.length < 500) {
        const x = Math.random() * this.p.width;
        const y = Math.random() * this.p.height;
        this.particles.push(new Particle(this.p, x, y, audioSensitivity));
      }
    }

    // Update and display
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(intensity, audioSensitivity);
      this.particles[i].display();

      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class Particle {
  private p: p5;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  baseSize: number;

  constructor(p: p5, x: number, y: number, audioSensitivity: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    // Audio-responsive movement
    const baseSpeed = 1 + audioSensitivity * 2;
    this.vx = (Math.random() - 0.5) * 4 * baseSpeed;
    this.vy = (Math.random() - 0.5) * 4 * baseSpeed;
    this.maxLife = 1;
    this.life = 1;
    this.hue = Math.random() * 360;
    // Audio-responsive size
    this.baseSize = 2 + audioSensitivity * 3; // 2-5px based on audio
  }

  update(intensity: number, audioSensitivity: number): void {
    this.x += this.vx * intensity;
    this.y += this.vy * intensity;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= 1 / this.maxLife * 0.016; // ~60fps fade
  }

  display(): void {
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

    // Size and opacity scale with life
    const displaySize = this.baseSize * this.life;
    this.p.fill(r, g, b, this.life * 0.8 * 255);
    this.p.noStroke();
    this.p.rect(this.x, this.y, displaySize, displaySize);
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
