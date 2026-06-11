import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private particles: InkParticle[] = [];

  constructor(p: p5) {
    this.p = p;
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    const freqData = audioInput.getFrequencyData();
    let avgFreq = 0;
    let bass = 0;
    let treble = 0;

    if (freqData) {
      avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
      bass = audioInput.getFrequencyBand(0, 40) / 255;
      treble = audioInput.getFrequencyBand(100, 256) / 255;
    }

    // Spawn particles - heavily driven by audio presence
    const audioAmount = Math.pow(avgFreq + bass + treble, 1.2);
    const spawnRate = (intensity * 0.5) + (audioAmount * 8);

    for (let i = 0; i < spawnRate; i++) {
      if (this.particles.length < 150) {
        const x = Math.random() * this.p.width;
        const y = Math.random() * this.p.height;
        const audioSize = 15 + audioAmount * 40; // Size responds to audio
        this.particles.push(new InkParticle(x, y, audioSize, avgFreq, bass, treble));
      }
    }

    // Update and display particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].display(this.p);

      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class InkParticle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  baseSize: number;
  opacity: number;

  constructor(x: number, y: number, size: number, _avgFreq: number, _bass: number, _treble: number) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.size = size;
    this.maxLife = 1.5 + Math.random() * 1;
    this.life = this.maxLife;
    this.opacity = 180 + Math.random() * 75;
  }

  update(): void {
    // Simple fade - no movement
    this.life -= 1 / this.maxLife * 0.016; // ~60fps

    // Size decreases gently as it fades
    const lifePercent = this.life / this.maxLife;
    this.size = this.baseSize * lifePercent;
  }

  display(p: p5): void {
    // Composite splatter effect with 5 ellipses
    const opacity = Math.floor((this.life / this.maxLife) * this.opacity);

    p.fill(164, 164, 164, opacity);
    p.noStroke();
    p.drawingContext.filter = 'blur(2px)';

    // Center ellipse at 2x size
    p.ellipse(this.x, this.y, this.size * 2);

    // One ellipse at 1x size
    p.ellipse(this.x, this.y, this.size);

    // Three ellipses at 0.5x size positioned around the center
    const offset = this.size * 0.4;
    p.ellipse(this.x - offset, this.y, this.size * 0.5);
    p.ellipse(this.x + offset, this.y, this.size * 0.5);
    p.ellipse(this.x, this.y + offset, this.size * 0.5);

    p.drawingContext.filter = 'none';
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
