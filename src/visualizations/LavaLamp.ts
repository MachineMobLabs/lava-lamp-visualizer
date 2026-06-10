import p5 from 'p5';

export class LavaLamp {
  private p: p5;
  private particles: Particle[];
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;
  private threshold: number = 210;
  private colors: { r: number; g: number; b: number } = { r: 255, g: 0, b: 0 };
  private cycle: number = 0;

  constructor(p: p5) {
    this.p = p;
    this.particles = [];

    // Create temp canvas for metaball rendering
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = p.width;
    this.tempCanvas.height = p.height;
    this.tempCtx = this.tempCanvas.getContext('2d')!;

    // Initialize 50 particles with random velocities (slowed down)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * p.width;
      const y = Math.random() * p.height;
      const vx = (Math.random() * 2) - 1; // Reduced from 8 to 2 for slower motion
      const vy = (Math.random() * 2) - 1; // Reduced from 8 to 2
      const size = Math.floor(Math.random() * 40) + 40; // Adjusted size range

      this.particles.push({ x, y, vx, vy, size });
    }
  }

  setSpeed(_speed: number): void {
    // Speed can be controlled via intensity slider if needed
  }

  draw(intensity: number): void {
    // Clear temp canvas
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

    // Update particle positions with intensity affecting speed
    const speedMult = intensity * 0.5 + 0.5; // Scale 0-1 to 0.5-1
    for (let particle of this.particles) {
      particle.x += particle.vx * speedMult;
      particle.y += particle.vy * speedMult;

      // Wrap around edges
      if (particle.x > this.tempCanvas.width + particle.size) {
        particle.x = -particle.size;
      }
      if (particle.x < -particle.size) {
        particle.x = this.tempCanvas.width + particle.size;
      }
      if (particle.y > this.tempCanvas.height + particle.size) {
        particle.y = -particle.size;
      }
      if (particle.y < -particle.size) {
        particle.y = this.tempCanvas.height + particle.size;
      }

      // Draw radial gradient
      this.tempCtx.beginPath();
      const grad = this.tempCtx.createRadialGradient(
        particle.x,
        particle.y,
        1,
        particle.x,
        particle.y,
        particle.size
      );
      grad.addColorStop(
        0,
        `rgba(${this.colors.r},${this.colors.g},${this.colors.b},1)`
      );
      grad.addColorStop(
        1,
        `rgba(${this.colors.r},${this.colors.g},${this.colors.b},0)`
      );
      this.tempCtx.fillStyle = grad;
      this.tempCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.tempCtx.fill();
    }

    // Apply metaball threshold effect and draw
    this.metaballize();

    // Update color cycle
    this.colorCycle();
  }

  private metaballize(): void {
    const imageData = this.tempCtx.getImageData(
      0,
      0,
      this.tempCanvas.width,
      this.tempCanvas.height
    );
    const pix = imageData.data;

    for (let i = 0; i < pix.length; i += 4) {
      if (pix[i + 3] < this.threshold) {
        pix[i + 3] /= 6;
        if (pix[i + 3] > this.threshold / 4) {
          pix[i + 3] = 0;
        }
      }
    }

    // Put modified image data back
    this.tempCtx.putImageData(imageData, 0, 0);

    // Get p5's canvas context and draw temp canvas to it
    const canvas = (this.p as any).canvas as HTMLCanvasElement;
    if (canvas) {
      const mainCtx = canvas.getContext('2d');
      if (mainCtx) {
        mainCtx.drawImage(this.tempCanvas, 0, 0);
      }
    }
  }

  private colorCycle(): void {
    this.cycle += 0.05; // Slower color cycle
    if (this.cycle > 100) {
      this.cycle = 0;
    }
    this.colors.r = Math.floor(Math.sin(0.3 * this.cycle + 0) * 127 + 128);
    this.colors.g = Math.floor(Math.sin(0.3 * this.cycle + 2) * 127 + 128);
    this.colors.b = Math.floor(Math.sin(0.3 * this.cycle + 4) * 127 + 128);
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}
