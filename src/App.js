import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { audioInput } from './AudioInput';
import { LavaLamp } from './visualizations/LavaLamp';
import { Bubbles } from './visualizations/Bubbles';
import { InkDrift } from './visualizations/InkDrift';
import { Particles } from './visualizations/Particles';
import './App.css';
export default function App() {
    const p5ContainerRef = useRef(null);
    const [mode, setMode] = useState('lava');
    const [intensity, setIntensity] = useState(0.7);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const visualizationRef = useRef(null);
    const p5InstanceRef = useRef(null);
    const initializeAudio = async () => {
        try {
            await audioInput.initialize();
            setIsInitialized(true);
            setError(null);
        }
        catch (err) {
            setError('Microphone access denied. Please grant permission to use this app.');
            console.error(err);
        }
    };
    useEffect(() => {
        if (!p5ContainerRef.current)
            return;
        const sketch = (p) => {
            p5InstanceRef.current = p;
            p.setup = function () {
                const container = p5ContainerRef.current;
                if (!container)
                    return;
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                p.createCanvas(width, height);
                p.background(10, 10, 10);
                p.smooth();
                // Create initial visualization
                visualizationRef.current = new LavaLamp(p);
            };
            p.draw = function () {
                p.background(10, 10, 10, 20); // Slight trail effect
                p.fill(10, 10, 10, 20);
                p.rect(0, 0, p.width, p.height);
                if (visualizationRef.current) {
                    visualizationRef.current.draw(intensity);
                }
            };
            p.windowResized = function () {
                const container = p5ContainerRef.current;
                if (!container)
                    return;
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                p.resizeCanvas(width, height);
            };
        };
        const instance = new p5(sketch, p5ContainerRef.current);
        return () => {
            instance.remove();
        };
    }, [intensity]);
    useEffect(() => {
        if (!p5InstanceRef.current)
            return;
        let newViz;
        // Create visualization based on mode
        switch (mode) {
            case 'lava':
                newViz = new LavaLamp(p5InstanceRef.current);
                break;
            case 'bubbles':
                newViz = new Bubbles(p5InstanceRef.current);
                break;
            case 'ink':
                newViz = new InkDrift(p5InstanceRef.current);
                break;
            case 'particles':
                newViz = new Particles(p5InstanceRef.current);
                break;
        }
        visualizationRef.current = newViz;
    }, [mode, isInitialized]);
    useEffect(() => {
        if (visualizationRef.current && 'setSpeed' in visualizationRef.current) {
            visualizationRef.current.setSpeed(intensity);
        }
    }, [intensity]);
    return (_jsxs("div", { className: "app", children: [_jsx("div", { className: "canvas-container", ref: p5ContainerRef }), _jsxs("div", { className: "controls", children: [_jsxs("div", { className: "header", children: [_jsx("h1", { children: "Lava Lamp." }), !isInitialized && (_jsx("button", { className: "mic-button", onClick: initializeAudio, children: "\uD83C\uDFA4 Enable Microphone" })), isInitialized && _jsx("span", { className: "status", children: "\uD83C\uDFA4 Listening" })] }), error && _jsx("div", { className: "error", children: error }), _jsxs("div", { className: "slider-group", children: [_jsx("label", { children: "Intensity" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", value: intensity, onChange: (e) => setIntensity(parseFloat(e.target.value)), disabled: !isInitialized })] }), _jsxs("div", { className: "mode-selector", children: [_jsx("label", { children: "Mode" }), _jsxs("div", { className: "mode-buttons", children: [_jsx("button", { className: `mode-btn ${mode === 'lava' ? 'active' : ''}`, onClick: () => setMode('lava'), disabled: !isInitialized, children: "\uD83C\uDF0B Lava" }), _jsx("button", { className: `mode-btn ${mode === 'bubbles' ? 'active' : ''}`, onClick: () => setMode('bubbles'), disabled: !isInitialized, children: "\u2728 Bubbles" }), _jsx("button", { className: `mode-btn ${mode === 'ink' ? 'active' : ''}`, onClick: () => setMode('ink'), disabled: !isInitialized, children: "\uD83D\uDCA7 Ink" }), _jsx("button", { className: `mode-btn ${mode === 'particles' ? 'active' : ''}`, onClick: () => setMode('particles'), disabled: !isInitialized, children: "\u2726 Particles" })] })] })] })] }));
}
