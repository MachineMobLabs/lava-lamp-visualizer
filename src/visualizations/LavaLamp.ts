import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class LavaLamp {
  private p: p5;
  private blobs: Blob[] = [];

  constructor(p: p5) {
    this.p = p;
    this.initialize();
  }

  private initialize(): void {
    const numBlobs = 3;
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    for (let i = 0; i < numBlobs; i++) {
      this.blobs.push(new Blob(
        this.p,
        centerX + (Math.random() - 0.5) * 200,
        centerY + (Math.random() - 0.5) * 200,
        i
      ));
    }
  }

  setSpeed(_speed: number): void {
    // Speed controlled by intensity slider
  }

  draw(intensity: number): void {
    const freqData = audioInput.getFrequencyData();
    if (!freqData) return;

    const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;

    // Light trail effect
    this.p.fill(10, 10, 10, 25);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Update and draw blobs
    for (let blob of this.blobs) {
      blob.update(avgFreq, intensity);
      blob.display(avgFreq);
    }
  }
}

class Blob {
  private p: p5;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  id: number;

  constructor(p: p5, x: number, y: number, id: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = 60 + Math.random() * 40;
    this.baseSize = this.size;
    this.id = id;
  }

  update(avgFreq: number, intensity: number): void {
    // Only move when there's audio
    if (avgFreq > 0.02) {
      // Movement
      this.x += this.vx * intensity;
      this.y += this.vy * intensity;

      // Bounce off walls
      if (this.x < 0 || this.x > this.p.width) this.vx *= -1;
      if (this.y < 0 || this.y > this.p.height) this.vy *= -1;

      // Keep in bounds
      this.x = Math.max(0, Math.min(this.p.width, this.x));
      this.y = Math.max(0, Math.min(this.p.height, this.y));
    }

    // Size pulses with audio
    const targetSize = this.baseSize + avgFreq * 60;
    this.size = this.size * 0.9 + targetSize * 0.1;
  }

  display(avgFreq: number): void {
    const hue = (this.id * 120 + avgFreq * 60) % 360;
    const s = 100;
    const l = 50;

    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = (l / 100) - c / 2;

    let r = 0, g = 0, b = 0;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    // Draw blob with gooey effect
    this.p.fill(r, g, b, 100);
    this.p.noStroke();
    this.p.ellipse(this.x, this.y, this.size, this.size);

    // Glow
    this.p.fill(r, g, b, 40);
    this.p.ellipse(this.x, this.y, this.size * 1.5, this.size * 1.5);
  }
}
