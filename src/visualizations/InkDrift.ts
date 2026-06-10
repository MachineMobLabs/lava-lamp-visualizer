import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private trails: Trail[] = [];

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize(): void {
    const numTrails = 4;
    for (let i = 0; i < numTrails; i++) {
      const x = this.p.width / 2;
      const y = (this.p.height / (numTrails + 1)) * (i + 1);
      const hue = i * 90;
      this.trails.push(new Trail(this.p, x, y, hue));
    }
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    const freqData = audioInput.getFrequencyData();
    if (!freqData) return;

    const avgFreq = audioInput.getAverageFrequency() / 255;
    const bass = audioInput.getFrequencyBand(0, 30) / 255;
    const mid = audioInput.getFrequencyBand(30, 100) / 255;
    const treble = audioInput.getFrequencyBand(100, 256) / 255;

    for (let i = 0; i < this.trails.length; i++) {
      this.trails[i].update(bass, mid, treble, intensity, avgFreq);
      this.trails[i].display();
    }
  }
}

class Trail {
  private p: p5;
  private points: Point[] = [];
  private x: number;
  private y: number;
  private baseX: number;
  private baseY: number;
  private hue: number;
  private vx: number = 0;
  private vy: number = 0;
  private maxPoints: number = 150;

  constructor(p: p5, x: number, y: number, hue: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.hue = hue;
  }

  update(bass: number, mid: number, treble: number, intensity: number, avgFreq: number): void {
    // Add point every frame if there's audio
    if (avgFreq > 0.01) {
      // Smoothed velocity for fluid motion
      const targetVx = (mid - 0.5) * 6 * intensity;
      const targetVy = (bass - 0.5) * 4 * intensity + treble * 2;

      this.vx = this.vx * 0.7 + targetVx * 0.3;
      this.vy = this.vy * 0.7 + targetVy * 0.3;

      this.x += this.vx;
      this.y += this.vy;

      // Keep within bounds with bounce
      if (this.x < 30 || this.x > this.p.width - 30) this.vx *= -0.5;
      if (this.y < 30 || this.y > this.p.height - 30) this.vy *= -0.5;

      this.x = this.p.constrain(this.x, 30, this.p.width - 30);
      this.y = this.p.constrain(this.y, 30, this.p.height - 30);

      this.points.push({ x: this.x, y: this.y, age: 0 });

      if (this.points.length > this.maxPoints) {
        this.points.shift();
      }
    } else {
      // Gradually return to base when silent
      this.x = this.x * 0.95 + this.baseX * 0.05;
      this.y = this.y * 0.95 + this.baseY * 0.05;
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    // Age all points
    for (let point of this.points) {
      point.age++;
    }
  }

  display(): void {
    this.p.noFill();
    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const progress = 1 - curr.age / this.maxPoints;
      const alpha = 200 * progress;
      const size = 1.5 + progress * 3;

      // Color based on hue
      const r = Math.sin((this.hue + 0) * 0.01745) * 80 + 160;
      const g = Math.sin((this.hue + 120) * 0.01745) * 80 + 160;
      const b = Math.sin((this.hue + 240) * 0.01745) * 80 + 160;

      this.p.strokeWeight(size);
      this.p.stroke(r, g, b, alpha);
      this.p.line(prev.x, prev.y, curr.x, curr.y);
    }

    // Head glow
    if (this.points.length > 0) {
      const head = this.points[this.points.length - 1];
      this.p.noStroke();
      const r = Math.sin(this.hue * 0.01745) * 80 + 160;
      const g = Math.sin((this.hue + 120) * 0.01745) * 80 + 160;
      const b = Math.sin((this.hue + 240) * 0.01745) * 80 + 160;
      this.p.fill(r, g, b, 200);
      this.p.ellipse(head.x, head.y, 10, 10);
    }
  }
}

interface Point {
  x: number;
  y: number;
  age: number;
}
