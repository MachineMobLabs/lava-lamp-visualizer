import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class LavaLamp {
  private p: p5;
  private blobs: Blob[] = [];
  private speed: number = 1;

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize(): void {
    const numBlobs = 3;
    const padding = 60;
    for (let i = 0; i < numBlobs; i++) {
      const x = this.p.random(padding, this.p.width - padding);
      const y = this.p.random(padding, this.p.height - padding);
      this.blobs.push(new Blob(this.p, x, y));
    }
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  draw(intensity: number): void {
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const boost = 0.5 + intensity * 0.5 + avgFreq * 0.3;

    for (let blob of this.blobs) {
      blob.update(this.speed, boost, this.p.width, this.p.height);
      blob.display();
    }

    this.drawGlow();
  }

  private drawGlow(): void {
    this.p.blendMode(this.p.SCREEN);
    for (let blob of this.blobs) {
      this.p.fill(255, 140, 0, 30);
      this.p.noStroke();
      this.p.ellipse(blob.x, blob.y, blob.size * 1.3, blob.size * 1.3);
    }
    this.p.blendMode(this.p.BLEND);
  }
}

class Blob {
  private p: p5;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;

  constructor(p: p5, x: number, y: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = p.random(60, 120);
    this.vx = p.random(-1, 1);
    this.vy = p.random(-1, 1);
    this.angle = 0;
  }

  update(speed: number, boost: number, width: number, height: number): void {
    this.x += this.vx * speed * boost;
    this.y += this.vy * speed * boost;
    this.angle += 0.02 * boost;
    this.size = 80 + 20 * Math.sin(this.angle) + 20 * boost;

    // Soft bounds
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));
  }

  display(): void {
    this.p.fill(255, 140, 0, 200);
    this.p.noStroke();
    this.p.beginShape();
    const segments = 20;
    for (let i = 0; i < segments; i++) {
      const angle = (this.p.TWO_PI / segments) * i;
      const wave = Math.sin(angle * 3 + this.angle) * 8;
      const r = this.size / 2 + wave;
      const px = this.x + Math.cos(angle) * r;
      const py = this.y + Math.sin(angle) * r;
      this.p.vertex(px, py);
    }
    this.p.endShape();
  }
}
