import { audioInput } from '../AudioInput';
export class Bubbles {
    constructor(p) {
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bubbles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.p = p;
        this.createBubbles(50);
    }
    setSpeed(_speed) {
        // Controlled by intensity
    }
    draw(intensity) {
        // Clear canvas with very subtle fade
        this.p.fill(10, 10, 10, 10);
        this.p.rect(0, 0, this.p.width, this.p.height);
        // Get audio data
        const avgFreq = audioInput.getAverageFrequency() / 255;
        const audioSensitivity = Math.pow(avgFreq, 0.5); // Boost quiet sounds
        // Update and draw bubbles
        for (let bubble of this.bubbles) {
            bubble.move(intensity, audioSensitivity);
            bubble.draw(this.p);
        }
    }
    createBubbles(max) {
        const colors = [
            'rgba(255, 182, 193, 1)', // soft pink
            'rgba(230, 190, 255, 1)', // soft lavender
            'rgba(200, 230, 255, 1)', // soft blue
            'rgba(220, 237, 200, 1)', // soft sage
            'rgba(255, 218, 185, 1)', // soft peach
            'rgba(176, 224, 230, 1)', // soft mint
        ];
        for (let i = 0; i < max; i++) {
            const x = Math.random() * this.p.width;
            const y = Math.random() * this.p.height;
            const radius = Math.floor(Math.random() * 50) + 15;
            const baseColor = colors[Math.floor(Math.random() * colors.length)];
            const accentColor = 'rgba(255,255,255,0.3)';
            this.bubbles.push(new Bubble(x, y, radius, baseColor, accentColor, 1, this.p));
        }
    }
}
class Bubble {
    constructor(x, y, radius, baseColor, accentColor, lineWidth, p) {
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
        Object.defineProperty(this, "baseRadius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "accentColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lineWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.p = p;
        this.x = x;
        this.y = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.baseColor = baseColor;
        this.accentColor = accentColor;
        this.lineWidth = lineWidth;
        // Half speed from original (originally 2-1, now 1-0.5)
        this.dx = (Math.random() * 1) - 0.5;
        this.dy = (Math.random() * 1) + 0.5;
    }
    move(intensity, audioSensitivity) {
        // Audio affects velocity - faster with sound
        const speedMultiplier = 1 + audioSensitivity * 2;
        const finalDx = this.dx * speedMultiplier * intensity;
        const finalDy = this.dy * speedMultiplier * intensity;
        // Bounce off sides
        if (this.x + this.radius >= this.p.width) {
            this.dx = Math.abs(this.dx) * -1;
        }
        else if (this.x - this.radius <= 0) {
            this.dx = Math.abs(this.dx);
        }
        // Reset y when below canvas
        if (this.y < -this.radius) {
            this.y = this.p.height + this.radius;
        }
        this.x += finalDx;
        this.y -= finalDy;
        // Audio affects size - pulses with sound
        const sizeMultiplier = 1 + audioSensitivity * 0.6;
        this.radius = this.baseRadius * sizeMultiplier;
    }
    draw(p) {
        const canvas = p.canvas;
        const ctx = canvas.getContext('2d');
        ctx.save();
        // Create radial gradient
        const gradient = this.createGradient(ctx);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.baseColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    createGradient(ctx) {
        const rgbBase = this.getRgbValues(this.baseColor);
        const rgbAccent = this.getRgbValues(this.accentColor);
        const alphas = [0.15, 0.12, 0.05, 0.08, 0.15];
        const colorStops = [0, 0.33, 0.67, 0.9, 1];
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x - this.radius / 2, this.y - this.radius / 2, 0);
        for (let i = 0; i < alphas.length; i++) {
            let rgb;
            let alpha = alphas[i];
            if (i === alphas.length - 1 || i === alphas.length - 2) {
                rgb = rgbAccent;
            }
            else {
                rgb = rgbBase;
            }
            const colorStr = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
            gradient.addColorStop(colorStops[i], colorStr);
        }
        return gradient;
    }
    getRgbValues(rgbString) {
        const commaOne = rgbString.indexOf(',', 0);
        const commaTwo = rgbString.indexOf(',', commaOne + 1);
        const commaThree = rgbString.indexOf(',', commaTwo + 1);
        const r = rgbString.substring(5, commaOne);
        const g = rgbString.substring(commaOne + 1, commaTwo);
        const b = rgbString.substring(commaTwo + 1, commaThree);
        return { r, g, b };
    }
}
