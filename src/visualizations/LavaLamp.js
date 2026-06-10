import { audioInput } from '../AudioInput';
export class LavaLamp {
    constructor(p) {
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "blobs", {
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
        const numBlobs = 3;
        const padding = 60;
        for (let i = 0; i < numBlobs; i++) {
            const x = this.p.random(padding, this.p.width - padding);
            const y = this.p.random(padding, this.p.height - padding);
            this.blobs.push(new Blob(this.p, x, y));
        }
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    draw(intensity) {
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const boost = 0.5 + intensity * 0.5 + avgFreq * 0.3;
        for (let blob of this.blobs) {
            blob.update(this.speed, boost, this.p.width, this.p.height);
            blob.display();
        }
        this.drawGlow();
    }
    drawGlow() {
        this.p.blendMode(this.p.SCREEN);
        for (let blob of this.blobs) {
            this.p.fill(255, 140, 0, 30);
            this.p.noStroke();
            this.p.ellipse(blob.x, blob.y, blob.size * 1.3, blob.size * 1.3);
        }
        this.p.blendMode(this.p.BLEND);
    }
}
class Blob {
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
        Object.defineProperty(this, "size", {
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
        Object.defineProperty(this, "angle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = p.random(60, 120);
        this.vx = p.random(-1, 1);
        this.vy = p.random(-1, 1);
        this.angle = 0;
    }
    update(speed, boost, width, height) {
        this.x += this.vx * speed * boost;
        this.y += this.vy * speed * boost;
        this.angle += 0.02 * boost;
        this.size = 80 + 20 * Math.sin(this.angle) + 20 * boost;
        // Soft bounds
        if (this.x < 0 || this.x > width)
            this.vx *= -1;
        if (this.y < 0 || this.y > height)
            this.vy *= -1;
        this.x = Math.max(0, Math.min(width, this.x));
        this.y = Math.max(0, Math.min(height, this.y));
    }
    display() {
        this.p.fill(255, 140, 0, 200);
        this.p.noStroke();
        this.p.beginShape();
        const segments = 20;
        for (let i = 0; i < segments; i++) {
            const angle = (this.p.TWO_PI / segments) * i;
            const wave = Math.sin(angle * 3 + this.angle) * 8;
            const r = this.size / 2 + wave;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;
            this.p.vertex(px, py);
        }
        this.p.endShape();
    }
}
