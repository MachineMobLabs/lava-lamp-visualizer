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
        this.p = p;
        this.initialize();
    }
    initialize() {
        const numBlobs = 3;
        for (let i = 0; i < numBlobs; i++) {
            const x = this.p.width / 2 + this.p.cos((i / 3) * this.p.TWO_PI) * 80;
            const y = this.p.height / 2 + this.p.sin((i / 3) * this.p.TWO_PI) * 80;
            this.blobs.push(new Blob(this.p, x, y, i));
        }
    }
    setSpeed(_speed) {
        // Speed controlled by intensity slider in UI
    }
    draw(intensity) {
        const freqData = audioInput.getFrequencyData();
        if (!freqData)
            return;
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const bass = audioInput.getFrequencyBand(0, 10) / 255;
        const mid = audioInput.getFrequencyBand(10, 30) / 255;
        for (let i = 0; i < this.blobs.length; i++) {
            const freq = (freqData[i * 10] || 0) / 255;
            this.blobs[i].display(avgFreq, bass, mid, freq, intensity);
        }
        this.drawGlow(avgFreq);
    }
    drawGlow(avgFreq) {
        this.p.blendMode(this.p.SCREEN);
        for (let blob of this.blobs) {
            const glowSize = 60 + avgFreq * 100;
            this.p.fill(255, 140, 0, 20 + avgFreq * 80);
            this.p.noStroke();
            this.p.ellipse(blob.x, blob.y, glowSize, glowSize);
        }
        this.p.blendMode(this.p.BLEND);
    }
}
class Blob {
    constructor(p, x, y, id) {
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
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.id = id;
    }
    display(avgFreq, bass, mid, freq, intensity) {
        // Position pulls toward center based on bass (gravity effect)
        const pull = bass * 0.3 + avgFreq * 0.1;
        this.x = this.baseX * (1 - pull * 0.5) + this.p.width / 2 * pull * 0.5;
        this.y = this.baseY * (1 - pull * 0.5) + this.p.height / 2 * pull * 0.5;
        // Size DIRECTLY tied to audio
        const baseSize = 60 + mid * 80;
        const sizeBoost = freq * 100 * intensity;
        const size = baseSize + sizeBoost;
        // Draw gooey blob with deformation based on frequency
        this.p.fill(255, 140 - bass * 100, 0, 200);
        this.p.noStroke();
        this.p.beginShape();
        const segments = 30;
        for (let i = 0; i < segments; i++) {
            const angle = (this.p.TWO_PI / segments) * i;
            // Deformation directly from frequency data
            const deform = Math.sin(angle * 4 + this.id) * freq * 40 * intensity;
            const r = size / 2 + deform;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;
            this.p.vertex(px, py);
        }
        this.p.endShape();
    }
}
