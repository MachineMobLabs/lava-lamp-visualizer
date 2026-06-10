import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Bubbles {
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

    const avgFreq = audioInput.getAverageFrequency() / 255;
    const bass = audioInput.getFrequencyBand(0, 8) / 255;
    const mid = audioInput.getFrequencyBand(8, 20) / 255;
    const treble = audioInput.getFrequencyBand(20, 32) / 255;

    // Only spawn if there's meaningful audio
    if (avgFreq > 0.05) {
      const particleCount = Math.floor(bass * 8 * intensity);
      for (let i = 0; i < particleCount; i++) {
        const x = this.p.random(this.p.width);
        const y = this.p.height + 10;
        const size = 20 + treble * 60;
        this.particles.push(new Particle(this.p, x, y, size, treble));
      }
    }

    // Update and display particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(bass, mid, treble, intensity);
      p.display();

      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class Particle {
  private p: p5;
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  treble: number;

  constructor(p: p5, x: number, y: number, size: number, treble: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.life = 200;
    this.maxLife = 200;
    this.treble = treble;
  }

  update(bass: number, mid: number, treble: number, intensity: number): void {
    // Rise speed driven by bass
    this.y -= bass * 5 * intensity;
    // Drift driven by mid frequencies
    this.x += (mid - 0.5) * 3 * intensity;
    // Size modulated by treble
    this.size = 10 + treble * 60;
    // Fade based on life
    this.life -= 1;
  }

  display(): void {
    const alpha = (this.life / this.maxLife) * 220;
    const color = this.treble > 0.5 ? [200, 100, 200] : [255, 140, 0]; // Purple if high treble, orange if low

    this.p.fill(color[0], color[1], color[2], alpha);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);

    // Glow
    this.p.fill(color[0], color[1], color[2], alpha * 0.4);
    this.p.ellipse(this.x, this.y, this.size * 1.5, this.size * 1.5);
  }

  isDead(): boolean {
    return this.life <= 0 || this.y < -50;
  }
}
