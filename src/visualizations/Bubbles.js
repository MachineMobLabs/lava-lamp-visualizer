import { audioInput } from '../AudioInput';
export class Bubbles {
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
            value: []
        });
        this.p = p;
    }
    setSpeed(_speed) {
        // Controlled by intensity
    }
    draw(intensity) {
        const freqData = audioInput.getFrequencyData();
        if (!freqData)
            return;
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const peak = audioInput.getPeakFrequency();
        const bass = audioInput.getFrequencyBand(0, 20) / 255;
        const mid = audioInput.getFrequencyBand(20, 80) / 255;
        const treble = audioInput.getFrequencyBand(80, 256) / 255;
        // Spawn continuously based on audio energy (much more aggressive)
        const spawns = Math.floor((avgFreq + peak) * 15 * intensity);
        for (let i = 0; i < spawns; i++) {
            const x = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
            const y = this.p.height;
            const size = 15 + peak * 50;
            this.particles.push(new Particle(this.p, x, y, size));
        }
        // Update and display particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(bass, mid, treble, intensity, avgFreq);
            particle.display();
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
class Particle {
    constructor(p, x, y, size) {
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "life", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxLife", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = size;
        this.life = 250;
        this.maxLife = 250;
        this.vx = p.random(-0.5, 0.5);
    }
    update(bass, mid, treble, intensity, avgFreq) {
        // Smooth rise speed with easing
        const riseSpeed = 1 + bass * 8 + avgFreq * 4;
        this.y -= riseSpeed;
        // Drift with smoothing
        this.vx = this.vx * 0.9 + (mid - 0.5) * 2 * intensity * 0.1;
        this.x += this.vx;
        // Size breathes with audio
        this.size = 12 + treble * 50 + avgFreq * 20;
        // Fade out
        this.life -= 0.8;
    }
    display() {
        const alpha = (this.life / this.maxLife) * 240;
        const r = 255;
        const g = 140;
        const b = 0;
        this.p.fill(r, g, b, alpha);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.size, this.size);
        // Glow
        this.p.fill(r, g, b, alpha * 0.5);
        this.p.ellipse(this.x, this.y, this.size * 1.6, this.size * 1.6);
    }
    isDead() {
        return this.life <= 0 || this.y < -100;
    }
}
