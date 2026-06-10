import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class Bubbles {
  private p: p5;
  private bubbles: Bubble[] = [];

  constructor(p: p5) {
    this.p = p;
    this.createBubbles(50);
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    // Clear canvas with slight fade
    this.p.fill(10, 10, 10, 30);
    this.p.rect(0, 0, this.p.width, this.p.height);

    // Get audio data
    const avgFreq = audioInput.getAverageFrequency() / 255;
    const audioSensitivity = Math.pow(avgFreq, 0.5); // Boost quiet sounds

    // Update and draw bubbles
    for (let bubble of this.bubbles) {
      bubble.move(intensity, audioSensitivity);
      bubble.draw(this.p);
    }
  }

  private createBubbles(max: number): void {
    const colors = [
      'rgba(75,0,130,1)',
      'rgba(25,25,112,1)',
      'rgba(143,188,143,1)',
      'rgba(47,79,79,1)',
      'rgba(0,139,139,1)',
      'rgba(139,0,0,1)',
    ];

    for (let i = 0; i < max; i++) {
      const x = Math.random() * this.p.width;
      const y = Math.random() * this.p.height;
      const radius = Math.floor(Math.random() * 50) + 15;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const accentColor = 'rgba(248,248,255,1)';

      this.bubbles.push(
        new Bubble(x, y, radius, baseColor, accentColor, 2, this.p)
      );
    }
  }
}

class Bubble {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  baseColor: string;
  accentColor: string;
  lineWidth: number;
  dx: number;
  dy: number;
  p: p5;

  constructor(
    x: number,
    y: number,
    radius: number,
    baseColor: string,
    accentColor: string,
    lineWidth: number,
    p: p5
  ) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.baseRadius = radius;
    this.radius = radius;
    this.baseColor = baseColor;
    this.accentColor = accentColor;
    this.lineWidth = lineWidth;
    // Half speed from original (originally 2-1, now 1-0.5)
    this.dx = (Math.random() * 1) - 0.5;
    this.dy = (Math.random() * 1) + 0.5;
  }

  move(intensity: number, audioSensitivity: number): void {
    // Audio affects velocity - faster with sound
    const speedMultiplier = 1 + audioSensitivity * 2;
    const finalDx = this.dx * speedMultiplier * intensity;
    const finalDy = this.dy * speedMultiplier * intensity;

    // Bounce off sides
    if (this.x + this.radius >= this.p.width) {
      this.dx = Math.abs(this.dx) * -1;
    } else if (this.x - this.radius <= 0) {
      this.dx = Math.abs(this.dx);
    }

    // Reset y when below canvas
    if (this.y < -this.radius) {
      this.y = this.p.height + this.radius;
    }

    this.x += finalDx;
    this.y -= finalDy;

    // Audio affects size - pulses with sound
    const sizeMultiplier = 1 + audioSensitivity * 0.6;
    this.radius = this.baseRadius * sizeMultiplier;
  }

  draw(p: p5): void {
    const canvas = (p as any).canvas as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    ctx.save();

    // Create radial gradient
    const gradient = this.createGradient(ctx);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = this.baseColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  private createGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
    const rgbBase = this.getRgbValues(this.baseColor);
    const rgbAccent = this.getRgbValues(this.accentColor);

    const alphas = [0.8, 0.6, 0.3, 0.5, 0.8];
    const colorStops = [0, 0.25, 0.5, 0.85, 1];

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius,
      this.x - this.radius / 2,
      this.y - this.radius / 2,
      0
    );

    for (let i = 0; i < alphas.length; i++) {
      let rgb: { r: string; g: string; b: string };
      if (i === alphas.length - 1 || i === alphas.length - 2) {
        rgb = rgbAccent;
      } else {
        rgb = rgbBase;
      }

      const colorStr = `rgba(${rgb.r},${rgb.g},${rgb.b},${alphas[i]})`;
      gradient.addColorStop(colorStops[i], colorStr);
    }

    return gradient;
  }

  private getRgbValues(
    rgbString: string
  ): { r: string; g: string; b: string } {
    const commaOne = rgbString.indexOf(',', 0);
    const commaTwo = rgbString.indexOf(',', commaOne + 1);
    const commaThree = rgbString.indexOf(',', commaTwo + 1);

    const r = rgbString.substring(5, commaOne);
    const g = rgbString.substring(commaOne + 1, commaTwo);
    const b = rgbString.substring(commaTwo + 1, commaThree);

    return { r, g, b };
  }
}
