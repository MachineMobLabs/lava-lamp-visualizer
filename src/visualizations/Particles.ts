import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Particles {
  private p: p5;
  private particles: Particle[] = [];

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize(): void {
    const numParticles = 100;
    for (let i = 0; i < numParticles; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height);
      this.particles.push(new Particle(this.p, x, y));
    }
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    const freqData = audioInput.getFrequencyData();
    if (!freqData) return;

    const avgFreq = audioInput.getAverageFrequency() / 255;
    const bass = audioInput.getFrequencyBand(0, 8) / 255;
    const mid = audioInput.getFrequencyBand(8, 16) / 255;
    const treble = audioInput.getFrequencyBand(16, 32) / 255;

    // Update particles based on audio
    for (let i = 0; i < this.particles.length; i++) {
      const freq = (freqData[i * 2] || 0) / 255;
      this.particles[i].update(bass, mid, treble, freq, intensity, avgFreq);
    }

    // Draw connections that pulse with audio
    this.drawConnections(avgFreq, bass);

    // Draw particles
    for (let particle of this.particles) {
      particle.display(avgFreq);
    }
  }

  private drawConnections(avgFreq: number, bass: number): void {
    // Connection distance driven by bass (low frequencies trigger wider connections)
    const connectionDistance = 80 + bass * 150 + avgFreq * 50;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const alpha = 80 * (1 - distance / connectionDistance) * (0.3 + bass * 0.7);
          this.p.stroke(255, 140, 0, alpha);
          this.p.strokeWeight(0.5 + bass * 2);
          this.p.line(p1.x, p1.y, p2.x, p2.y);
        }
      }
    }
  }
}

class Particle {
  private p: p5;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = p.random(3, 7);
  }

  private vx = 0;
  private vy = 0;

  update(bass: number, mid: number, treble: number, _freq: number, intensity: number, avgFreq: number): void {
    // Smooth velocity-based movement
    const targetVx = (mid - 0.5) * 4 * intensity + bass * 2;
    const targetVy = (treble - 0.5) * 3 * intensity;

    this.vx = this.vx * 0.8 + targetVx * 0.2;
    this.vy = this.vy * 0.8 + targetVy * 0.2;

    // Subtle pull toward center on bass
    const pullStrength = bass * 0.01 * intensity;
    const dx = this.p.width / 2 - this.x;
    const dy = this.p.height / 2 - this.y;

    this.x += this.vx + dx * pullStrength;
    this.y += this.vy + dy * pullStrength;

    // Keep in bounds with damping
    if (this.x < 10) { this.x = 10; this.vx *= -0.3; }
    if (this.x > this.p.width - 10) { this.x = this.p.width - 10; this.vx *= -0.3; }
    if (this.y < 10) { this.y = 10; this.vy *= -0.3; }
    if (this.y > this.p.height - 10) { this.y = this.p.height - 10; this.vy *= -0.3; }

    // Gradually return to base when silent
    if (avgFreq < 0.02) {
      this.x = this.x * 0.96 + this.baseX * 0.04;
      this.y = this.y * 0.96 + this.baseY * 0.04;
      this.vx *= 0.9;
      this.vy *= 0.9;
    }
  }

  display(avgFreq: number): void {
    const brightness = 180 + avgFreq * 75;
    this.p.fill(255, 140, 0, brightness);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);

    // Glow intensity tied to audio
    const glowAlpha = avgFreq * 150;
    this.p.fill(255, 140, 0, glowAlpha);
    this.p.ellipse(this.x, this.y, this.size * 3, this.size * 3);
  }
}
