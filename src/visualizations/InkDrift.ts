import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private particles: InkParticle[] = [];
  private noiseOffset: number = 0;

  constructor(p: p5) {
    this.p = p;
  }

  setSpeed(_speed: number): void {
    // Controlled by intensity
  }

  draw(intensity: number): void {
    const canvas = (this.p as any).canvas as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Subtle fade to prevent trails from accumulating forever
    ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const freqData = audioInput.getFrequencyData();
    let avgFreq = 0;
    let bass = 0;
    let treble = 0;

    if (freqData) {
      avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
      bass = audioInput.getFrequencyBand(0, 40) / 255;
      treble = audioInput.getFrequencyBand(100, 256) / 255;
    }

    // Increment noise offset for flowing effect (slowed down 16x total)
    this.noiseOffset += 0.0005;

    // Spawn particles with audio or continuously at base intensity
    const baseSpawnRate = intensity * 3;
    const spawnRate = Math.max(baseSpawnRate, (avgFreq * 6 + treble * 8) * intensity);

    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;

    for (let i = 0; i < spawnRate; i++) {
      if (this.particles.length < 200) {
        // Spawn particles spread across the full page
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 400 + 50;
        this.particles.push(new InkParticle(
          centerX + Math.cos(angle) * distance,
          centerY + Math.sin(angle) * distance
        ));
      }
    }

    // Update and display particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(this.p, this.noiseOffset, intensity, bass, treble);
      this.particles[i].display(ctx, this.p, avgFreq, bass, treble);

      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}

class InkParticle {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  life: number = 1;
  maxLife: number = 1;
  size: number;
  noisePhase: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.maxLife = 1.2 + Math.random() * 0.6;
    this.life = this.maxLife;
    this.size = 20 + Math.random() * 30; // Large drops for dramatic ink effect (20-50px)
    this.noisePhase = Math.random() * 1000;
  }

  update(p: p5, noiseOffset: number, intensity: number, bass: number, treble: number): void {
    // Use Perlin noise to create flowing velocity field
    const noiseScale = 0.004;
    // Audio boosts velocity - stronger response to bass and treble
    const audioMultiplier = 1 + (bass * 0.5 + treble * 0.4);
    const velocityScale = (0.8 + intensity * 0.3) * 0.0625 * audioMultiplier; // Slowed 16x total, but audio-responsive

    // Sample noise at slightly offset locations to create flow field
    const noiseX = this.x * noiseScale + noiseOffset;
    const noiseY = this.y * noiseScale + noiseOffset;
    const noiseZ = this.noisePhase + noiseOffset;

    // Create velocity vectors from noise using p5's noise function
    const angle = (p.noise(noiseX, noiseY, noiseZ) * Math.PI * 2) - Math.PI;
    const speed = (0.5 + (bass + treble) * 0.3) * 0.0625 * audioMultiplier; // Slowed 16x total, but audio-responsive

    this.vx = Math.cos(angle) * speed * velocityScale;
    this.vy = Math.sin(angle) * speed * velocityScale;

    // Add strong outward radial component for spreading effect
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const dx = this.x - centerX;
    const dy = this.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.vx += (dx / dist) * 0.01875 * audioMultiplier; // Slowed 16x total, audio-responsive
      this.vy += (dy / dist) * 0.01875 * audioMultiplier;
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Fade life (slowed 16x total)
    this.life -= 1 / this.maxLife * 0.001;

    // Size decreases as particle ages
    this.size *= 0.997; // Even slower decay
  }

  display(_ctx: CanvasRenderingContext2D, p: p5, avgFreq: number, bass: number, treble: number): void {
    // Draw light grey ink drops that fade with life (#c4c4c4)
    const opacity = Math.floor(this.life * 0.85 * 255);

    // Audio-responsive size: increase with bass and treble
    const audioBoost = 1 + (bass * 0.3 + treble * 0.2);
    const displaySize = this.size * audioBoost;

    p.fill(196, 196, 196, opacity);
    p.noStroke();

    // Make drops oblong - wider than they are tall (like lava)
    const width = displaySize * 1.4;
    const height = displaySize * 0.9;
    p.ellipse(this.x, this.y, width, height);
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}
