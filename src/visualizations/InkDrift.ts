import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private particles: InkParticle[];

  constructor(p: p5) {
    this.p = p;
    this.particles = [];

    // Pre-create fixed particle pool like Lava/Bubbles (no dynamic spawning)
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * p.width;
      const y = Math.random() * p.height;
      this.particles.push(new InkParticle(x, y));
    }
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

    // Audio-driven activation - controls how many particles are "active"
    const audioAmount = Math.pow(avgFreq + bass + treble, 1.2);
    const activationThreshold = 0.3 + (audioAmount * 0.6); // 0.3-0.9 range

    // Update and display all particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Audio controls particle activation state
      const isActive = Math.random() < activationThreshold;
      const audioSize = 15 + audioAmount * 30; // Size responds to audio

      particle.update(isActive, audioSize, intensity, avgFreq, bass, treble);
      particle.display(this.p);
    }
  }
}

class InkParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  life: number = 0;
  maxLife: number = 2.5;
  size: number = 0;
  baseSize: number = 0;
  isActive: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
  }

  update(isActive: boolean, audioSize: number, _intensity: number, _avgFreq: number, _bass: number, _treble: number): void {
    // Activate particle if triggered by audio
    if (isActive && this.life <= 0) {
      this.life = this.maxLife;
      this.baseSize = audioSize;
      this.size = audioSize;

      // Spawn at random location on screen
      this.x = Math.random() * 1920; // Approximate max width
      this.y = Math.random() * 1080; // Approximate max height
    }

    // Update active particles
    if (this.life > 0) {
      this.life -= 1 / this.maxLife * 0.016; // ~60fps fade

      // Size decreases as it fades
      const lifePercent = Math.max(0, this.life / this.maxLife);
      this.size = this.baseSize * lifePercent;
    }
  }

  display(p: p5): void {
    if (this.life <= 0) return; // Only draw active particles

    // Calculate opacity based on life
    const opacity = Math.floor((this.life / this.maxLife) * 200);
    const spacing = 5;

    p.fill(164, 164, 164, opacity);
    p.noStroke();

    // Center ellipse at 2x size
    p.ellipse(this.x, this.y, this.size * 2);

    // One ellipse at 1x size, offset down with spacing
    p.ellipse(this.x, this.y + this.size + spacing, this.size);

    // Three ellipses at 0.5x size positioned around the center with spacing
    const offset = this.size * 0.6 + spacing;
    p.ellipse(this.x - offset, this.y, this.size * 0.5);
    p.ellipse(this.x + offset, this.y, this.size * 0.5);
    p.ellipse(this.x, this.y + offset, this.size * 0.5);
  }
}
