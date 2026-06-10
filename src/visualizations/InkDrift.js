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
        this.initialize();
    }
    initialize() {
        const numTrails = 4;
        for (let i = 0; i < numTrails; i++) {
            const x = this.p.width / 2;
            const y = (this.p.height / (numTrails + 1)) * (i + 1);
            const hue = i * 90;
            this.trails.push(new Trail(this.p, x, y, hue));
        }
    }
    setSpeed(_speed) {
        // Controlled by intensity
    }
    draw(intensity) {
        const freqData = audioInput.getFrequencyData();
        if (!freqData)
            return;
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const bass = audioInput.getFrequencyBand(0, 30) / 255;
        const mid = audioInput.getFrequencyBand(30, 100) / 255;
        const treble = audioInput.getFrequencyBand(100, 256) / 255;
        for (let i = 0; i < this.trails.length; i++) {
            this.trails[i].update(bass, mid, treble, intensity, avgFreq);
            this.trails[i].display();
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
        Object.defineProperty(this, "points", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
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
        Object.defineProperty(this, "baseX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseY", {
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
        Object.defineProperty(this, "vx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "vy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxPoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 150
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.hue = hue;
    }
    update(bass, mid, treble, intensity, avgFreq) {
        // Add point every frame if there's audio
        if (avgFreq > 0.01) {
            // Smoothed velocity for fluid motion
            const targetVx = (mid - 0.5) * 6 * intensity;
            const targetVy = (bass - 0.5) * 4 * intensity + treble * 2;
            this.vx = this.vx * 0.7 + targetVx * 0.3;
            this.vy = this.vy * 0.7 + targetVy * 0.3;
            this.x += this.vx;
            this.y += this.vy;
            // Keep within bounds with bounce
            if (this.x < 30 || this.x > this.p.width - 30)
                this.vx *= -0.5;
            if (this.y < 30 || this.y > this.p.height - 30)
                this.vy *= -0.5;
            this.x = this.p.constrain(this.x, 30, this.p.width - 30);
            this.y = this.p.constrain(this.y, 30, this.p.height - 30);
            this.points.push({ x: this.x, y: this.y, age: 0 });
            if (this.points.length > this.maxPoints) {
                this.points.shift();
            }
        }
        else {
            // Gradually return to base when silent
            this.x = this.x * 0.95 + this.baseX * 0.05;
            this.y = this.y * 0.95 + this.baseY * 0.05;
            this.vx *= 0.9;
            this.vy *= 0.9;
        }
        // Age all points
        for (let point of this.points) {
            point.age++;
        }
    }
    display() {
        this.p.noFill();
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const progress = 1 - curr.age / this.maxPoints;
            const alpha = 200 * progress;
            const size = 1.5 + progress * 3;
            // Color based on hue
            const r = Math.sin((this.hue + 0) * 0.01745) * 80 + 160;
            const g = Math.sin((this.hue + 120) * 0.01745) * 80 + 160;
            const b = Math.sin((this.hue + 240) * 0.01745) * 80 + 160;
            this.p.strokeWeight(size);
            this.p.stroke(r, g, b, alpha);
            this.p.line(prev.x, prev.y, curr.x, curr.y);
        }
        // Head glow
        if (this.points.length > 0) {
            const head = this.points[this.points.length - 1];
            this.p.noStroke();
            const r = Math.sin(this.hue * 0.01745) * 80 + 160;
            const g = Math.sin((this.hue + 120) * 0.01745) * 80 + 160;
            const b = Math.sin((this.hue + 240) * 0.01745) * 80 + 160;
            this.p.fill(r, g, b, 200);
            this.p.ellipse(head.x, head.y, 10, 10);
        }
    }
}
