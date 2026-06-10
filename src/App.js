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
    const intensityRef = useRef(0.7);
    const modeRef = useRef('lava');
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const visualizationRef = useRef(null);
    const p5InstanceRef = useRef(null);
    const toggleAudio = async () => {
        if (isInitialized) {
            // Disable microphone
            audioInput.stop();
            setIsInitialized(false);
            setError(null);
        }
        else {
            // Enable microphone
            try {
                await audioInput.initialize();
                setIsInitialized(true);
                setError(null);
            }
            catch (err) {
                setError('Microphone access denied. Please grant permission to use this app.');
                console.error(err);
            }
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
            };
            p.draw = function () {
                // Validate visualization matches current mode every frame
                const currentVizType = visualizationRef.current?.constructor.name;
                const expectedType = modeRef.current === 'lava' ? 'LavaLamp' :
                    modeRef.current === 'bubbles' ? 'Bubbles' :
                        modeRef.current === 'ink' ? 'InkDrift' :
                            'Particles';
                if (currentVizType !== expectedType && p5InstanceRef.current) {
                    // Visualization is wrong, recreate it
                    let newViz;
                    switch (modeRef.current) {
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
                }
                p.background(10, 10, 10, 20); // Slight trail effect
                p.fill(10, 10, 10, 20);
                p.rect(0, 0, p.width, p.height);
                if (visualizationRef.current) {
                    visualizationRef.current.draw(intensityRef.current);
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
    }, []);
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
        modeRef.current = mode;
    }, [mode]);
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);
    return (_jsxs("div", { className: "app", children: [_jsx("div", { className: "canvas-container", ref: p5ContainerRef }), _jsxs("div", { className: "controls", children: [_jsxs("div", { className: "header", children: [_jsx("h1", { children: "Lava Lamp" }), _jsx("button", { className: "mic-button", onClick: toggleAudio, children: !isInitialized ? 'Enable Microphone' : 'Disable Microphone' })] }), error && _jsx("div", { className: "error", children: error }), _jsxs("div", { className: "slider-group", children: [_jsx("label", { children: "Intensity" }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.01", defaultValue: 0.7, onChange: (e) => {
                                    const newIntensity = parseFloat(e.target.value);
                                    intensityRef.current = newIntensity;
                                    // Don't call setIntensity to avoid re-renders
                                } })] }), _jsxs("div", { className: "mode-selector", children: [_jsx("label", { children: "Mode" }), _jsxs("div", { className: "mode-buttons", children: [_jsx("button", { className: `mode-btn ${mode === 'lava' ? 'active' : ''}`, onClick: () => setMode('lava'), children: "\uD83C\uDF0B Lava" }), _jsx("button", { className: `mode-btn ${mode === 'bubbles' ? 'active' : ''}`, onClick: () => setMode('bubbles'), children: "\u2728 Bubbles" }), _jsx("button", { className: `mode-btn ${mode === 'ink' ? 'active' : ''}`, onClick: () => setMode('ink'), children: "\uD83D\uDCA7 Ink" }), _jsx("button", { className: `mode-btn ${mode === 'particles' ? 'active' : ''}`, onClick: () => setMode('particles'), children: "\u2726 Particles" })] })] })] })] }));
}
