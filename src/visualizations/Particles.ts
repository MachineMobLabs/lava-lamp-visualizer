import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Particles {
  private p: p5;
  private particles: Particle[] = [];
  private speed: number = 1;

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize(): void {
    const numParticles = 80;
    for (let i = 0; i < numParticles; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height);
      this.particles.push(new Particle(this.p, x, y));
    }
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  draw(intensity: number): void {
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const boost = 0.5 + intensity * 0.5 + avgFreq * 0.5;

    // Update particles
    for (let particle of this.particles) {
      particle.update(this.speed, boost, this.p.width, this.p.height);
    }

    // Draw lines between nearby particles
    this.drawConnections(avgFreq, boost);

    // Draw particles
    for (let particle of this.particles) {
      particle.display();
    }
  }

  private drawConnections(avgFreq: number, boost: number): void {
    const connectionDistance = 150 + avgFreq * 100 + boost * 50;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const alpha = 100 * (1 - distance / connectionDistance) * (0.5 + boost);
          this.p.stroke(255, 140, 0, alpha);
          this.p.strokeWeight(0.5 + avgFreq * 1.5);
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
  vx: number;
  vy: number;
  size: number;
  angle: number;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = p.random(-0.5, 0.5);
    this.vy = p.random(-0.5, 0.5);
    this.size = p.random(2, 6);
    this.angle = p.random(this.p.TWO_PI);
  }

  update(speed: number, boost: number, width: number, height: number): void {
    this.x += this.vx * speed * boost * 0.3;
    this.y += this.vy * speed * boost * 0.3;
    this.angle += 0.02 * boost;

    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Perlin noise influence
    const noise = this.p.noise(this.angle, this.x * 0.01, this.y * 0.01);
    this.vx = Math.cos(noise * this.p.TWO_PI) * 0.3;
    this.vy = Math.sin(noise * this.p.TWO_PI) * 0.3;
  }

  display(): void {
    this.p.fill(255, 140, 0, 220);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size * 1.2, this.size * 1.2);

    // Glow
    this.p.fill(255, 140, 0, 80);
    this.p.ellipse(this.x, this.y, this.size * 3, this.size * 3);
  }
}
