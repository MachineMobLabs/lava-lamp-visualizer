import { audioInput } from '../AudioInput';
export class LavaLamp {
    constructor(p) {
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tempCanvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tempCtx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "threshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 210
        });
        Object.defineProperty(this, "colors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { r: 255, g: 0, b: 0 }
        });
        Object.defineProperty(this, "cycle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.p = p;
        this.particles = [];
        // Create temp canvas for metaball rendering
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.width = p.width;
        this.tempCanvas.height = p.height;
        this.tempCtx = this.tempCanvas.getContext('2d');
        // Initialize 50 particles with random velocities (slowed down)
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * p.width;
            const y = Math.random() * p.height;
            const vx = (Math.random() * 2) - 1; // Reduced from 8 to 2 for slower motion
            const vy = (Math.random() * 2) - 1; // Reduced from 8 to 2
            const size = Math.floor(Math.random() * 80) + 80; // 2x larger: was 40+40, now 80+80
            this.particles.push({ x, y, vx, vy, size });
        }
    }
    setSpeed(_speed) {
        // Speed can be controlled via intensity slider if needed
    }
    draw(intensity) {
        // Clear temp canvas
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        // Get audio frequency data for responsiveness
        const avgFreq = audioInput.getAverageFrequency() / 255;
        // Update particle positions with intensity and audio affecting speed
        const speedMult = (intensity * 0.5 + 0.5) * (1 + avgFreq * 0.5); // Audio boosts speed
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
            const grad = this.tempCtx.createRadialGradient(particle.x, particle.y, 1, particle.x, particle.y, particle.size);
            grad.addColorStop(0, `rgba(${this.colors.r},${this.colors.g},${this.colors.b},1)`);
            grad.addColorStop(1, `rgba(${this.colors.r},${this.colors.g},${this.colors.b},0)`);
            this.tempCtx.fillStyle = grad;
            this.tempCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.tempCtx.fill();
        }
        // Apply metaball threshold effect and draw
        this.metaballize();
        // Update color cycle with audio influence
        this.colorCycle(avgFreq);
    }
    metaballize() {
        const imageData = this.tempCtx.getImageData(0, 0, this.tempCanvas.width, this.tempCanvas.height);
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
        const canvas = this.p.canvas;
        if (canvas) {
            const mainCtx = canvas.getContext('2d');
            if (mainCtx) {
                mainCtx.drawImage(this.tempCanvas, 0, 0);
            }
        }
    }
    colorCycle(audioFreq) {
        // Color cycle speed increases with audio
        this.cycle += 0.05 + audioFreq * 0.1;
        if (this.cycle > 100) {
            this.cycle = 0;
        }
        this.colors.r = Math.floor(Math.sin(0.3 * this.cycle + 0) * 127 + 128);
        this.colors.g = Math.floor(Math.sin(0.3 * this.cycle + 2) * 127 + 128);
        this.colors.b = Math.floor(Math.sin(0.3 * this.cycle + 4) * 127 + 128);
    }
}
