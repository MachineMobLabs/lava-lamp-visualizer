import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private particles: InkParticle[];

  constructor(p: p5) {
    this.p = p;
    this.particles = [];

    // Pre-create fixed particle pool like Lava/Bubbles (no dynamic spawning)
    // Stagger the timing so particles don't all spawn at once
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * p.width;
      const y = Math.random() * p.height;
      // Stagger activation delay - spread particles over time
      const delayBeforeActivation = Math.random() * 8; // 0-8 second stagger
      this.particles.push(new InkParticle(x, y, delayBeforeActivation));
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
  life: number = 0;
  maxLife: number = 2.5;
  size: number = 0;
  baseSize: number = 0;
  timeSinceSpawn: number = 0;
  delayBeforeActivation: number;

  constructor(x: number, y: number, delayBeforeActivation: number) {
    this.x = x;
    this.y = y;
    this.delayBeforeActivation = delayBeforeActivation;
  }

  update(isActive: boolean, audioSize: number, _intensity: number, _avgFreq: number, _bass: number, _treble: number): void {
    // Increment time counter for staggering
    this.timeSinceSpawn += 0.016; // ~60fps

    // Only activate after delay has passed
    if (isActive && this.life <= 0 && this.timeSinceSpawn > this.delayBeforeActivation) {
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
      this.size = this.baseSize * Math.max(0, this.life / this.maxLife);
    }
  }

  display(p: p5): void {
    if (this.life <= 0) return; // Only draw active particles

    const spacing = 10;
    const opacity = 200; // Solid opacity, no transparency

    p.fill(164, 164, 164, opacity);
    p.noStroke();

    // Center ellipse at 2x size (biggest)
    p.ellipse(this.x, this.y, this.size * 2);

    // Four surrounding ellipses at different sizes with 10px spacing
    // Top ellipse - 1x size
    p.ellipse(this.x, this.y - this.size - spacing, this.size);

    // Right ellipse - 0.75x size
    p.ellipse(this.x + this.size * 0.75 + spacing, this.y, this.size * 0.75);

    // Bottom ellipse - 0.5x size
    p.ellipse(this.x, this.y + this.size * 0.5 + spacing, this.size * 0.5);

    // Left ellipse - 0.25x size
    p.ellipse(this.x - this.size * 0.25 - spacing, this.y, this.size * 0.25);
  }
}
