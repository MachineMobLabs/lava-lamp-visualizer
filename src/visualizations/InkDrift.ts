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
    const bass = audioInput.getFrequencyBand(0, 8) / 255;
    const mid = audioInput.getFrequencyBand(8, 16) / 255;
    const treble = audioInput.getFrequencyBand(16, 32) / 255;

    for (let i = 0; i < this.trails.length; i++) {
      const freq = (freqData[i * 20] || 0) / 255;
      this.trails[i].update(bass, mid, treble, freq, intensity, avgFreq);
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
  private maxPoints: number = 80;

  constructor(p: p5, x: number, y: number, hue: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.hue = hue;
  }

  update(bass: number, mid: number, treble: number, freq: number, intensity: number, avgFreq: number): void {
    // Only add points if there's meaningful audio
    if (avgFreq > 0.05) {
      // Movement driven by frequency bands
      this.x += (mid - 0.5) * 3 * intensity;
      this.y += (bass - 0.5) * 2 * intensity;

      // Slight vertical oscillation from treble
      this.y += Math.sin(freq * 10) * treble * 2 * intensity;

      // Keep within bounds
      this.x = this.p.constrain(this.x, 20, this.p.width - 20);
      this.y = this.p.constrain(this.y, 20, this.p.height - 20);

      this.points.push({ x: this.x, y: this.y, age: 0, freq: freq });

      if (this.points.length > this.maxPoints) {
        this.points.shift();
      }
    } else {
      // Reset to base position when no audio
      this.x = this.baseX;
      this.y = this.baseY;
      this.points = [];
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
      const alpha = 200 * (1 - curr.age / this.maxPoints);
      const size = 2 + curr.freq * 3 * (1 - curr.age / this.maxPoints);

      // Color varies by hue
      const r = Math.sin((this.hue + 0) * 0.01745) * 100 + 155;
      const g = Math.sin((this.hue + 120) * 0.01745) * 100 + 155;
      const b = Math.sin((this.hue + 240) * 0.01745) * 100 + 155;

      this.p.strokeWeight(size);
      this.p.stroke(r, g, b, alpha);
      this.p.line(prev.x, prev.y, curr.x, curr.y);
    }

    // Head glow
    if (this.points.length > 0) {
      const head = this.points[this.points.length - 1];
      this.p.noStroke();
      const r = Math.sin(this.hue * 0.01745) * 100 + 155;
      const g = Math.sin((this.hue + 120) * 0.01745) * 100 + 155;
      const b = Math.sin((this.hue + 240) * 0.01745) * 100 + 155;
      this.p.fill(r, g, b, 180);
      this.p.ellipse(head.x, head.y, 8, 8);
    }
  }
}

interface Point {
  x: number;
  y: number;
  age: number;
  freq: number;
}
