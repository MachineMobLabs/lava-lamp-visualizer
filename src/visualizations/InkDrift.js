import { audioInput } from '../AudioInput';
export class InkDrift {
    constructor(p) {
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trails", {
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
        this.p.fill(10, 10, 10, 15);
        this.p.rect(0, 0, this.p.width, this.p.height);
        // Spawn trails
        if (Math.random() < 0.3) {
            const centerX = this.p.width / 2;
            const centerY = this.p.height / 2;
            this.trails.push(new Trail(this.p, centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 200, Math.random() * 360));
        }
        // Update and display
        for (let i = this.trails.length - 1; i >= 0; i--) {
            this.trails[i].update(avgFreq, intensity);
            this.trails[i].display();
            if (this.trails[i].isDead()) {
                this.trails.splice(i, 1);
            }
        }
    }
}
class Trail {
    constructor(p, x, y, hue) {
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
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.hue = hue;
        this.size = 5;
    }
    update(avgFreq, intensity) {
        this.x += this.vx * intensity;
        this.y += this.vy * intensity;
        this.life -= 0.008;
        this.size *= 0.98;
        this.size += avgFreq * 20;
    }
    display() {
        const h = this.hue;
        const s = 100;
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
        this.p.fill(r, g, b, this.life * 0.5 * 255);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.size, this.size);
    }
    isDead() {
        return this.life <= 0;
    }
}
