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
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        this.p = p;
        this.initialize();
    }
    initialize() {
        const numTrails = 4;
        for (let i = 0; i < numTrails; i++) {
            const x = this.p.width / 2;
            const y = (this.p.height / (numTrails + 1)) * (i + 1);
            const hue = (i * 60) % 360;
            this.trails.push(new Trail(this.p, x, y, hue));
        }
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    draw(intensity) {
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const boost = 0.5 + intensity * 0.5 + avgFreq * 0.3;
        for (let trail of this.trails) {
            trail.update(this.speed, boost);
            trail.display();
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
        Object.defineProperty(this, "hue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxPoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.hue = hue;
    }
    update(speed, boost) {
        this.time += 0.05 * speed * boost;
        const noise1 = this.p.noise(this.time, 0);
        const noise2 = this.p.noise(this.time, 100);
        this.x += (noise1 - 0.5) * 4 * speed * boost;
        this.y += (noise2 - 0.5) * 2 * speed * boost;
        // Soft bounds
        if (this.x < 0 || this.x > this.p.width) {
            this.x = this.p.constrain(this.x, 0, this.p.width);
        }
        if (this.y < 0 || this.y > this.p.height) {
            this.y = this.p.constrain(this.y, 0, this.p.height);
        }
        this.points.push({ x: this.x, y: this.y, age: 0 });
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
        for (let point of this.points) {
            point.age++;
        }
    }
    display() {
        this.p.noFill();
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const alpha = 255 * (1 - curr.age / this.maxPoints);
            const size = 3 * (1 - curr.age / this.maxPoints);
            // Color based on hue with variation
            const r = Math.sin(this.hue * 0.01745) * 127 + 128;
            const g = Math.sin((this.hue + 120) * 0.01745) * 127 + 128;
            const b = Math.sin((this.hue + 240) * 0.01745) * 127 + 128;
            this.p.strokeWeight(size);
            this.p.stroke(r, g, b, alpha * 0.8);
            this.p.line(prev.x, prev.y, curr.x, curr.y);
        }
        // Head glow
        if (this.points.length > 0) {
            const head = this.points[this.points.length - 1];
            this.p.noStroke();
            const r = Math.sin(this.hue * 0.01745) * 127 + 128;
            const g = Math.sin((this.hue + 120) * 0.01745) * 127 + 128;
            const b = Math.sin((this.hue + 240) * 0.01745) * 127 + 128;
            this.p.fill(r, g, b, 150);
            this.p.ellipse(head.x, head.y, 8, 8);
        }
    }
}
