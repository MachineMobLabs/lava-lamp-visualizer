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
        // Create temp canvas for metaball rendering - get dimensions from actual canvas
        const canvas = p.canvas;
        const width = canvas?.width || 800;
        const height = canvas?.height || 600;
        this.tempCanvas = document.createElement('canvas');
        this.tempCanvas.width = width;
        this.tempCanvas.height = height;
        this.tempCtx = this.tempCanvas.getContext('2d');
        // Initialize 50 particles with random velocities (slowed down)
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * p.width;
            const y = Math.random() * p.height;
            const vx = (Math.random() * 2) - 1; // Reduced from 8 to 2 for slower motion
            const vy = (Math.random() * 2) - 1; // Reduced from 8 to 2
            const baseSize = Math.floor(Math.random() * 64) + 64; // 2x larger minus 20%: 64-127px
            this.particles.push({ x, y, vx, vy, size: baseSize, baseSize });
        }
    }
    setSpeed(_speed) {
        // Speed can be controlled via intensity slider if needed
    }
    draw(intensity) {
        // Sync tempCanvas dimensions with actual p5 canvas (handles window resize)
        const canvas = this.p.canvas;
        if (canvas && (this.tempCanvas.width !== canvas.width || this.tempCanvas.height !== canvas.height)) {
            this.tempCanvas.width = canvas.width;
            this.tempCanvas.height = canvas.height;
        }
        // Clear temp canvas
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        // Get audio frequency data with high sensitivity (captures whispers and loud sounds)
        const freqData = audioInput.getFrequencyData();
        let avgFreq = 0;
        if (freqData) {
            // Ultra-sensitive to low volumes - use normalized average
            avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
            // Apply non-linear scaling to boost sensitivity to quiet sounds
            avgFreq = Math.pow(avgFreq, 0.5); // Square root makes whispers more visible
        }
        // Update particle positions with intensity and audio affecting speed
        // Audio dramatically boosts speed - responds to whispers and loud music
        const speedMult = (intensity * 1.2 + 0.8) * (1 + avgFreq * 2.5); // Faster base animation
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
            // Size pulses with audio - makes response visible
            // Ranges from baseSize to baseSize * 1.7 based on audio (70% increase)
            const sizeMultiplier = 1 + avgFreq * 0.7;
            particle.size = particle.baseSize * sizeMultiplier;
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
        // Safety check: ensure canvas has valid dimensions
        if (this.tempCanvas.width === 0 || this.tempCanvas.height === 0) {
            return;
        }
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
