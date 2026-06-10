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
        this.initialize();
    }
    initialize() {
        const numParticles = 100;
        for (let i = 0; i < numParticles; i++) {
            const x = this.p.random(this.p.width);
            const y = this.p.random(this.p.height);
            this.particles.push(new Particle(this.p, x, y));
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
        const bass = audioInput.getFrequencyBand(0, 8) / 255;
        const mid = audioInput.getFrequencyBand(8, 16) / 255;
        const treble = audioInput.getFrequencyBand(16, 32) / 255;
        // Update particles based on audio
        for (let i = 0; i < this.particles.length; i++) {
            const freq = (freqData[i * 2] || 0) / 255;
            this.particles[i].update(bass, mid, treble, freq, intensity, avgFreq);
        }
        // Draw connections that pulse with audio
        this.drawConnections(avgFreq, bass);
        // Draw particles
        for (let particle of this.particles) {
            particle.display(avgFreq);
        }
    }
    drawConnections(avgFreq, bass) {
        // Connection distance driven by bass (low frequencies trigger wider connections)
        const connectionDistance = 80 + bass * 150 + avgFreq * 50;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < connectionDistance) {
                    const alpha = 80 * (1 - distance / connectionDistance) * (0.3 + bass * 0.7);
                    this.p.stroke(255, 140, 0, alpha);
                    this.p.strokeWeight(0.5 + bass * 2);
                    this.p.line(p1.x, p1.y, p2.x, p2.y);
                }
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
        Object.defineProperty(this, "size", {
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
        this.size = p.random(3, 7);
    }
    update(bass, mid, treble, _freq, intensity, avgFreq) {
        // Only move if there's audio
        if (avgFreq > 0.05) {
            // Move toward center on bass hits
            const pullX = (this.p.width / 2 - this.x) * bass * 0.02 * intensity;
            const pullY = (this.p.height / 2 - this.y) * bass * 0.02 * intensity;
            // Drift with mid frequencies
            const driftX = (mid - 0.5) * 2 * intensity;
            const driftY = (treble - 0.5) * 2 * intensity;
            this.x += pullX + driftX;
            this.y += pullY + driftY;
            // Keep in bounds
            this.x = this.p.constrain(this.x, 10, this.p.width - 10);
            this.y = this.p.constrain(this.y, 10, this.p.height - 10);
        }
        else {
            // Slowly return to base position when silent
            this.x += (this.baseX - this.x) * 0.05;
            this.y += (this.baseY - this.y) * 0.05;
        }
    }
    display(avgFreq) {
        const brightness = 180 + avgFreq * 75;
        this.p.fill(255, 140, 0, brightness);
        this.p.noStroke();
        this.p.ellipse(this.x, this.y, this.size, this.size);
        // Glow intensity tied to audio
        const glowAlpha = avgFreq * 150;
        this.p.fill(255, 140, 0, glowAlpha);
        this.p.ellipse(this.x, this.y, this.size * 3, this.size * 3);
    }
}
