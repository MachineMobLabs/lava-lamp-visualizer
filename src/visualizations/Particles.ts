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
    const freqData = audioInput.getFrequencyData();
    if (!freqData) return;

    const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
    const treble = audioInput.getFrequencyBand(100, 256) / 255;

    // Light trail effect
    this.p.fill(10, 10, 10, 5);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Much lower threshold, highly sensitive to treble
    if (avgFreq > 0.003 || treble > 0.01) {
      const centerX = this.p.width / 2;
      const centerY = this.p.height / 2;

      for (let i = 0; i < Math.max(avgFreq * 30, treble * 50) * intensity + 1; i++) {
        if (this.particles.length < 600) {
          this.particles.push(new Particle(this.p, centerX, centerY));
        }
      }
    } else if (this.particles.length === 0) {
      this.particles = [];
    }

    // Update and display
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(intensity);
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
  hue: number;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 1;
    this.hue = Math.random() * 360;
  }

  update(intensity: number): void {
    this.x += this.vx * intensity;
    this.y += this.vy * intensity;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= 0.01;
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

    this.p.fill(r, g, b, this.life * 0.6 * 255);
    this.p.noStroke();
    this.p.rect(this.x, this.y, 2, 2);
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
