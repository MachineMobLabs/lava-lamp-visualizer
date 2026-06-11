import { audioInput } from '../AudioInput';
export class InkDrift {
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
        Object.defineProperty(this, "noiseOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.p = p;
    }
    setSpeed(_speed) {
        // Controlled by intensity
    }
    draw(intensity) {
        const freqData = audioInput.getFrequencyData();
        let avgFreq = 0;
        let bass = 0;
        let treble = 0;
        if (freqData) {
            avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length / 255;
            bass = audioInput.getFrequencyBand(0, 40) / 255;
            treble = audioInput.getFrequencyBand(100, 256) / 255;
        }
        // Increment noise offset for flowing effect
        this.noiseOffset += 0.01;
        // Spawn particles with audio or continuously at base intensity
        const baseSpawnRate = intensity * 8;
        const spawnRate = Math.max(baseSpawnRate, (avgFreq * 20 + treble * 30) * intensity);
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        for (let i = 0; i < spawnRate; i++) {
            if (this.particles.length < 800) {
                // Spawn particles in a circle around center
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 40 + 20;
                this.particles.push(new InkParticle(centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance));
            }
        }
        // Set blend mode for organic diffusion effect
        const canvas = this.p.canvas;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'lighter';
        // Update and display particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(this.p, this.noiseOffset, intensity, bass, treble);
            this.particles[i].display(this.p);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over';
    }
}
class InkParticle {
    constructor(x, y) {
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
            value: 0
        });
        Object.defineProperty(this, "vy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "life", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "maxLife", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
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
        Object.defineProperty(this, "noisePhase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.maxLife = 0.8 + Math.random() * 0.4;
        this.life = this.maxLife;
        this.size = 2 + Math.random() * 3;
        this.hue = Math.random() * 60 + 180; // Cyan to blue hues
        this.noisePhase = Math.random() * 1000;
    }
    update(p, noiseOffset, intensity, bass, treble) {
        // Use Perlin noise to create flowing velocity field
        const noiseScale = 0.005;
        const velocityScale = 1.5 + intensity * 0.5;
        // Sample noise at slightly offset locations to create flow field
        const noiseX = this.x * noiseScale + noiseOffset;
        const noiseY = this.y * noiseScale + noiseOffset;
        const noiseZ = this.noisePhase + noiseOffset;
        // Create velocity vectors from noise using p5's noise function
        const angle = (p.noise(noiseX, noiseY, noiseZ) * Math.PI * 2) - Math.PI;
        const speed = 0.8 + (bass + treble) * 0.5;
        this.vx = Math.cos(angle) * speed * velocityScale;
        this.vy = Math.sin(angle) * speed * velocityScale;
        // Add slight outward radial component
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.vx += (dx / dist) * 0.2;
            this.vy += (dy / dist) * 0.2;
        }
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        // Fade life
        this.life -= 1 / this.maxLife * 0.016; // Normalized fade
        // Size decreases as particle ages
        this.size *= 0.98;
    }
    display(p) {
        // HSL to RGB conversion for vibrant colors
        const h = this.hue;
        const s = 80 + this.life * 20; // More saturated when young
        const l = 50;
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
        // Opacity fades as particle travels
        const opacity = this.life * 0.6 * 255;
        p.fill(r, g, b, opacity);
        p.noStroke();
        p.ellipse(this.x, this.y, this.size, this.size);
    }
    isDead() {
        return this.life <= 0;
    }
}
