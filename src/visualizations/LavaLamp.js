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
        // Smooth position pulls with easing
        const pull = (bass * 0.4 + avgFreq * 0.15) * intensity;
        const targetX = this.baseX * (1 - pull * 0.3) + this.p.width / 2 * pull * 0.3;
        const targetY = this.baseY * (1 - pull * 0.3) + this.p.height / 2 * pull * 0.3;
        this.x = this.x * 0.85 + targetX * 0.15;
        this.y = this.y * 0.85 + targetY * 0.15;
        // Size smoothly modulated by audio
        const baseSize = 70 + mid * 60 + avgFreq * 40;
        const sizeBoost = freq * 80 + bass * 50;
        const size = baseSize + sizeBoost;
        // Draw gooey blob with smooth deformation
        const colorMod = Math.max(0, 1 - bass * 0.8);
        this.p.fill(255, 140 * colorMod, 0, 220);
        this.p.noStroke();
        this.p.beginShape();
        const segments = 40;
        for (let i = 0; i < segments; i++) {
            const angle = (this.p.TWO_PI / segments) * i;
            // Smooth deformation from audio
            const deform = Math.sin(angle * 3 + this.id) * freq * 30 * intensity +
                Math.sin(angle * 2) * avgFreq * 15;
            const r = size / 2 + deform;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;
            this.p.vertex(px, py);
        }
        this.p.endShape();
    }
}
