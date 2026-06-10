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
        const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
        // Light trail effect
        this.p.fill(10, 10, 10, 20);
        this.p.rect(0, 0, this.p.width, this.p.height);
        // Only spawn if there's audio
        if (avgFreq > 0.02) {
            const spawnCount = Math.floor(avgFreq * 50 * intensity);
            for (let i = 0; i < spawnCount; i++) {
                if (this.particles.length < 100) {
                    this.particles.push(new Particle(this.p));
                }
            }
        }
        else {
            // Clear particles when silent
            this.particles = [];
        }
        // Update and display
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(avgFreq, intensity);
            this.particles[i].display();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
class Particle {
    constructor(p) {
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
        Object.defineProperty(this, "size", {
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
        Object.defineProperty(this, "life", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = p.random(p.width);
        this.y = p.height + 20;
        this.vx = (p.random() - 0.5) * 1.5;
        this.vy = -p.random() * 2;
        this.size = p.random() * 30 + 10;
        this.hue = p.random() * 60 + 20;
        this.life = 1;
    }
    update(avgFreq, intensity) {
        this.x += this.vx;
        this.y += this.vy * (1 + intensity);
        this.vy *= 0.98;
        this.life -= 0.005;
        this.size += avgFreq * 10 - 3;
    }
    display() {
        const h = this.hue;
        const s = 80;
        const l = 50;
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
        this.p.fill(r, g, b, this.life * 0.3 * 255);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.size, this.size);
        this.p.fill(r, g, b, this.life * 0.15 * 255);
        this.p.ellipse(this.x, this.y, this.size * 1.4, this.size * 1.4);
    }
    isDead() {
        return this.life <= 0 || this.y < -50;
    }
}
