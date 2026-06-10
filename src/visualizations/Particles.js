import { audioInput } from '../AudioInput';
export class Particles {
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
        const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
        // Light trail effect
        this.p.fill(10, 10, 10, 5);
        this.p.rect(0, 0, this.p.width, this.p.height);
        // Only spawn if there's audio
        if (avgFreq > 0.02) {
            const centerX = this.p.width / 2;
            const centerY = this.p.height / 2;
            for (let i = 0; i < avgFreq * 20 * intensity; i++) {
                if (this.particles.length < 500) {
                    this.particles.push(new Particle(this.p, centerX, centerY));
                }
            }
        }
        else {
            // Clear particles when silent
            this.particles = [];
        }
        // Update and display
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(intensity);
            this.particles[i].display();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
class Particle {
    constructor(p, x, y) {
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
        Object.defineProperty(this, "vx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vy", {
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
        Object.defineProperty(this, "hue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.hue = Math.random() * 360;
    }
    update(intensity) {
        this.x += this.vx * intensity;
        this.y += this.vy * intensity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= 0.01;
    }
    display() {
        const h = this.hue;
        const s = 100;
        const l = 60;
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = (l / 100) - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) {
            r = c;
            g = x;
            b = 0;
        }
        else if (h < 120) {
            r = x;
            g = c;
            b = 0;
        }
        else if (h < 180) {
            r = 0;
            g = c;
            b = x;
        }
        else if (h < 240) {
            r = 0;
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            g = 0;
            b = c;
        }
        else {
            r = c;
            g = 0;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        this.p.fill(r, g, b, this.life * 0.6 * 255);
        this.p.noStroke();
        this.p.rect(this.x, this.y, 2, 2);
    }
    isDead() {
        return this.life <= 0;
    }
}
