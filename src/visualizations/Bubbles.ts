import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Bubbles {
  private p: p5;
  private particles: Particle[] = [];
  private speed: number = 1;

  constructor(p: p5) {
    this.p = p;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  draw(intensity: number): void {
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const boost = 0.5 + intensity * 0.5 + avgFreq * 0.3;

    // Create new particles based on intensity
    const createChance = 0.1 + intensity * 0.3 + avgFreq * 0.2;
    if (this.p.random() < createChance) {
      const x = this.p.random(this.p.width * 0.2, this.p.width * 0.8);
      const y = this.p.height + 20;
      const size = this.p.random(10, 50);
      this.particles.push(new Particle(this.p, x, y, size));
    }

    // Update and display particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(this.speed, boost);
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
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;

  constructor(p: p5, x: number, y: number, size: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = p.random(-1, 1);
    this.vy = -p.random(1.5, 3);
    this.life = 255;
    this.maxLife = 255;
    this.hue = p.random([0, 30, 240]); // Orange, red, or purple
  }

  update(speed: number, boost: number): void {
    this.x += this.vx * speed * boost * 0.5;
    this.y += this.vy * speed;
    this.vy *= 0.98; // Gravity
    this.vx *= 0.99;
    this.life -= 1.5 * speed;
    this.size *= 0.98;
  }

  display(): void {
    const alpha = (this.life / this.maxLife) * 200;

    // HSL to RGB for vibrant colors
    let r = 255;
    let g = 140;
    let b = 0;

    if (this.hue === 30) {
      g = 80; // More red
    } else if (this.hue === 240) {
      r = 150;
      g = 50;
      b = 150; // Purple
    }

    this.p.fill(r, g, b, alpha);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);

    // Glow
    this.p.fill(r, g, b, alpha * 0.3);
    this.p.ellipse(this.x, this.y, this.size * 1.4, this.size * 1.4);
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
