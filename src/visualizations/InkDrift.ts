import p5 from 'p5';
import { audioInput } from '../AudioInput';

export class InkDrift {
  private p: p5;
  private blobs: InkBlob[] = [];

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

    // Spawn ink blobs with audio
    const baseSpawnRate = intensity * 0.3;
    const spawnRate = Math.max(baseSpawnRate, (avgFreq * 2 + treble * 1.5) * intensity);

    for (let i = 0; i < spawnRate; i++) {
      if (this.blobs.length < 8) {
        const x = Math.random() * this.p.width;
        const y = Math.random() * this.p.height;
        this.blobs.push(new InkBlob(x, y, this.p));
      }
    }

    // Update and display blobs
    for (let i = this.blobs.length - 1; i >= 0; i--) {
      this.blobs[i].update(avgFreq, bass, treble);
      this.blobs[i].display(this.p, avgFreq, bass, treble);

      if (this.blobs[i].isDead()) {
        this.blobs.splice(i, 1);
      }
    }
  }
}

class InkBlob {
  x: number;
  y: number;
  life: number = 1;
  maxLife: number;
  time: number = 0;

  // Blubb orbits (8 particles)
  bubbs: BubbParticle[] = [];
  // Sparkle orbits (10 particles)
  sparkles: SparkleParticle[] = [];

  constructor(x: number, y: number, _p: p5) {
    this.x = x;
    this.y = y;
    this.maxLife = 6 + Math.random() * 4;

    // Create blubb particles
    const blubbConfigs = [
      { angle: 150, duration: 2.7, delay: 0.2, size: 50, blur: 5, originDist: 37 },
      { angle: 276, duration: 2.9, delay: 0.4, size: 50, blur: 5, originDist: 34 },
      { angle: 76, duration: 3.1, delay: 0.6, size: 50, blur: 5, originDist: 31 },
      { angle: 295, duration: 3.3, delay: 0.8, size: 50, blur: 5, originDist: 28 },
      { angle: 92, duration: 3.5, delay: 1.0, size: 50, blur: 5, originDist: 25 },
      { angle: 83, duration: 3.7, delay: 1.2, size: 50, blur: 5, originDist: 22 },
      { angle: 215, duration: 3.9, delay: 1.4, size: 50, blur: 5, originDist: 19 },
      { angle: 158, duration: 4.1, delay: 1.6, size: 50, blur: 5, originDist: 16 },
    ];

    for (const config of blubbConfigs) {
      this.bubbs.push(new BubbParticle(
        config.angle,
        config.duration,
        config.delay,
        config.size,
        config.blur,
        config.originDist
      ));
    }

    // Create sparkle particles
    const sparkleConfigs = [
      { angle: 292, duration: 3.7, delay: 0.2, size: 15, blur: 3, originDist: 58 },
      { angle: 215, duration: 3.9, delay: 0.4, size: 9, blur: 3, originDist: 56 },
      { angle: 127, duration: 4.1, delay: 0.6, size: 10, blur: 3, originDist: 54 },
      { angle: 49, duration: 4.3, delay: 0.8, size: 11, blur: 3, originDist: 52 },
      { angle: 286, duration: 4.5, delay: 1.0, size: 12, blur: 3, originDist: 50 },
      { angle: 120, duration: 4.7, delay: 1.2, size: 13, blur: 3, originDist: 48 },
      { angle: 196, duration: 4.9, delay: 1.4, size: 20, blur: 3, originDist: 46 },
      { angle: 157, duration: 5.1, delay: 1.6, size: 15, blur: 3, originDist: 44 },
      { angle: 36, duration: 5.3, delay: 1.8, size: 6, blur: 3, originDist: 42 },
      { angle: 115, duration: 5.5, delay: 2.0, size: 20, blur: 3, originDist: 40 },
    ];

    for (const config of sparkleConfigs) {
      this.sparkles.push(new SparkleParticle(
        config.angle,
        config.duration,
        config.delay,
        config.size,
        config.blur,
        config.originDist
      ));
    }
  }

  update(_avgFreq: number, _bass: number, _treble: number): void {
    this.time += 0.016; // ~60fps
    this.life = Math.max(0, this.maxLife - this.time);
  }

  display(p: p5, _avgFreq: number, bass: number, treble: number): void {
    p.push();
    p.translate(this.x, this.y);

    // Fade based on life
    const opacity = (this.life / this.maxLife) * 255;

    // Central blurred ball
    const centerSize = 90 + (bass + treble) * 30;
    p.fill(164, 164, 164, opacity * 0.8);
    p.noStroke();
    p.drawingContext.filter = 'blur(15px)';
    p.ellipse(0, 0, centerSize);
    p.drawingContext.filter = 'none';

    // Draw blubb particles
    for (const bubb of this.bubbs) {
      bubb.display(p, this.time, opacity, bass, treble);
    }

    // Draw sparkle particles
    for (const sparkle of this.sparkles) {
      sparkle.display(p, this.time, opacity, bass, treble);
    }

    p.pop();
  }

  isDead(): boolean {
    return this.life <= 0;
  }
}

class BubbParticle {
  angle: number;
  duration: number;
  delay: number;
  size: number;
  blur: number;
  originDist: number;

  constructor(
    angle: number,
    duration: number,
    delay: number,
    size: number,
    blur: number,
    originDist: number
  ) {
    this.angle = angle;
    this.duration = duration;
    this.delay = delay;
    this.size = size;
    this.blur = blur;
    this.originDist = originDist;
  }

  display(p: p5, time: number, opacity: number, bass: number, treble: number): void {
    const effectiveTime = Math.max(0, time - this.delay);
    const progress = (effectiveTime % this.duration) / this.duration;
    const rotation = progress * Math.PI * 2;

    const audioBoost = 1 + (bass * 0.4 + treble * 0.2);
    const displaySize = this.size * audioBoost;

    p.push();
    p.rotate((this.angle * Math.PI) / 180);

    p.fill(164, 164, 164, opacity * 0.6);
    p.noStroke();
    p.drawingContext.filter = `blur(${this.blur}px)`;

    // Position particle in orbit using transform-origin style calculation
    const x = Math.cos(rotation) * this.originDist;
    const y = Math.sin(rotation) * this.originDist;

    p.ellipse(x, y, displaySize);
    p.drawingContext.filter = 'none';

    p.pop();
  }
}

class SparkleParticle {
  angle: number;
  duration: number;
  delay: number;
  size: number;
  blur: number;
  originDist: number;

  constructor(
    angle: number,
    duration: number,
    delay: number,
    size: number,
    blur: number,
    originDist: number
  ) {
    this.angle = angle;
    this.duration = duration;
    this.delay = delay;
    this.size = size;
    this.blur = blur;
    this.originDist = originDist;
  }

  display(p: p5, time: number, opacity: number, bass: number, treble: number): void {
    const effectiveTime = Math.max(0, time - this.delay);
    const progress = (effectiveTime % this.duration) / this.duration;
    const rotation = progress * Math.PI * 2;

    const audioBoost = 1 + (bass * 0.3 + treble * 0.2);
    const displaySize = this.size * audioBoost;

    p.push();
    p.rotate((this.angle * Math.PI) / 180);

    p.fill(164, 164, 164, opacity * 0.5);
    p.noStroke();
    p.drawingContext.filter = `blur(${this.blur}px)`;

    // Position particle in orbit
    const x = Math.cos(rotation) * this.originDist;
    const y = Math.sin(rotation) * this.originDist;

    p.ellipse(x, y, displaySize);
    p.drawingContext.filter = 'none';

    p.pop();
  }
}
