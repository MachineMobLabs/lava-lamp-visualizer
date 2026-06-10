import { audioInput } from '../AudioInput';
export class LavaLamp {
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
            value: void 0
        });
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.p = p;
        // Create 6 heat particles with varied timing for rich animation
        this.particles = [
            new LavaParticle(this.p, this.p.width * 0.25, this.p.height * 0.7, 0.0),
            new LavaParticle(this.p, this.p.width * 0.75, this.p.height * 0.75, 0.7),
            new LavaParticle(this.p, this.p.width * 0.5, this.p.height * 0.8, 1.4),
            new LavaParticle(this.p, this.p.width * 0.4, this.p.height * 0.68, 0.35),
            new LavaParticle(this.p, this.p.width * 0.6, this.p.height * 0.76, 2.1),
            new LavaParticle(this.p, this.p.width * 0.5, this.p.height * 0.88, 1.05),
        ];
    }
    setSpeed(_speed) {
        // Speed controlled by intensity slider
    }
    draw(intensity) {
        // Fade trail for ghosting effect
        this.p.fill(10, 10, 10, 30);
        this.p.rect(0, 0, this.p.width, this.p.height);
        this.time += 0.016;
        const audioFreq = audioInput.getAverageFrequency() / 255;
        // Update particles
        for (let particle of this.particles) {
            particle.update(this.time, intensity, audioFreq);
        }
        // Draw with blend mode for merging effect
        this.p.blendMode(this.p.ADD);
        for (let particle of this.particles) {
            particle.display(this.p);
        }
        this.p.blendMode(this.p.BLEND);
    }
}
class LavaParticle {
    constructor(p, x, y, noisePhase) {
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
        Object.defineProperty(this, "currentY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "heat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "noiseOffsetX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "noiseOffsetY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "noiseOffsetHeat", {
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
        this.currentY = y;
        this.noiseOffsetX = noisePhase * 100;
        this.noiseOffsetY = noisePhase * 100 + 50;
        this.noiseOffsetHeat = noisePhase * 100 + 200;
    }
    update(time, intensity, audioFreq) {
        // Heat cycle using Perlin noise - slower for dramatic cycle
        const heatNoise = this.p.noise(this.noiseOffsetHeat + time * 0.3);
        // Shape the heat curve to favor cooler temps (more time in orange/red phase)
        this.heat = Math.pow(heatNoise * 1.2, 1.3);
        this.heat = Math.max(0, Math.min(1, this.heat));
        // Movement up when hot, down when cool - more dramatic range
        const riseAmount = Math.pow(this.heat, 1.2) * 280 * intensity;
        const targetY = this.baseY - riseAmount;
        this.currentY += (targetY - this.currentY) * 0.12;
        // Organic horizontal movement with Perlin noise
        const noiseX = this.p.noise(this.noiseOffsetX + time * 0.4);
        const wobble = (noiseX - 0.5) * 100 * intensity;
        this.x = this.baseX + wobble;
        // Vertical oscillation with audio influence
        const noiseY = this.p.noise(this.noiseOffsetY + time * 0.25);
        const oscillation = (noiseY - 0.5) * 50 * intensity;
        this.y = this.currentY + oscillation + audioFreq * 20;
    }
    display(p) {
        p.noStroke();
        // Color gradient: orange (cool) → red → purple (hot)
        let r, g, b;
        if (this.heat < 0.5) {
            // Cool phase: orange to red
            const t = this.heat * 2;
            r = 255;
            g = Math.round(140 - t * 60);
            b = Math.round(t * 100);
        }
        else {
            // Hot phase: red to purple
            const t = (this.heat - 0.5) * 2;
            r = 255 - Math.round(t * 80);
            g = Math.round(80 - t * 80);
            b = Math.round(100 + t * 150);
        }
        // Base radius expands dramatically with heat
        const baseRadius = 55;
        const heatRadius = Math.pow(this.heat, 1.1) * 100;
        const totalRadius = baseRadius + heatRadius;
        // Multiple concentric circles for organic blob effect with more layers
        const layers = [
            { scale: 1.8, alpha: 60 },
            { scale: 1.5, alpha: 90 },
            { scale: 1.25, alpha: 130 },
            { scale: 1.0, alpha: 180 },
            { scale: 0.75, alpha: 230 },
            { scale: 0.5, alpha: 255 },
        ];
        for (const layer of layers) {
            p.fill(r, g, b, layer.alpha);
            const size = totalRadius * layer.scale * 2;
            p.ellipse(this.x, this.y, size, size);
        }
        // Extra bright core highlight - shifts color when hot
        p.fill(255, 200 + this.heat * 55, 150 - this.heat * 80, 180);
        p.ellipse(this.x - totalRadius * 0.12, this.y - totalRadius * 0.12, totalRadius * 0.55 * 2, totalRadius * 0.55 * 2);
    }
}
