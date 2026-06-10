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
        const bass = audioInput.getFrequencyBand(0, 8) / 255;
        const mid = audioInput.getFrequencyBand(8, 20) / 255;
        const treble = audioInput.getFrequencyBand(20, 32) / 255;
        // Only spawn if there's meaningful audio
        if (avgFreq > 0.05) {
            const particleCount = Math.floor(bass * 8 * intensity);
            for (let i = 0; i < particleCount; i++) {
                const x = this.p.random(this.p.width);
                const y = this.p.height + 10;
                const size = 20 + treble * 60;
                this.particles.push(new Particle(this.p, x, y, size, treble));
            }
        }
        // Update and display particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(bass, mid, treble, intensity);
            p.display();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
class Particle {
    constructor(p, x, y, size, treble) {
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
        Object.defineProperty(this, "treble", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = size;
        this.life = 200;
        this.maxLife = 200;
        this.treble = treble;
    }
    update(bass, mid, treble, intensity) {
        // Rise speed driven by bass
        this.y -= bass * 5 * intensity;
        // Drift driven by mid frequencies
        this.x += (mid - 0.5) * 3 * intensity;
        // Size modulated by treble
        this.size = 10 + treble * 60;
        // Fade based on life
        this.life -= 1;
    }
    display() {
        const alpha = (this.life / this.maxLife) * 220;
        const color = this.treble > 0.5 ? [200, 100, 200] : [255, 140, 0]; // Purple if high treble, orange if low
        this.p.fill(color[0], color[1], color[2], alpha);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.size, this.size);
        // Glow
        this.p.fill(color[0], color[1], color[2], alpha * 0.4);
        this.p.ellipse(this.x, this.y, this.size * 1.5, this.size * 1.5);
    }
    isDead() {
        return this.life <= 0 || this.y < -50;
    }
}
