import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { audioInput } from './AudioInput';
import { LavaLamp } from './visualizations/LavaLamp';
import { Bubbles } from './visualizations/Bubbles';
import { InkDrift } from './visualizations/InkDrift';
import { Particles } from './visualizations/Particles';
import './App.css';

type VisualizationMode = 'lava' | 'bubbles' | 'ink' | 'particles';

const INTENSITY = 0.7;

export default function App() {
  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<VisualizationMode>('lava');
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  const visualizationRef = useRef<LavaLamp | Bubbles | InkDrift | Particles | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  const toggleAudio = async () => {
    if (isInitialized) {
      // Disable microphone
      audioInput.stop();
      setIsInitialized(false);
      setError(null);
    } else {
      // Enable microphone
      try {
        await audioInput.initialize();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError('Microphone access denied. Please grant permission to use this app.');
        console.error(err);
      }
    }
  };

  const enterFullscreen = () => {
    const element = p5ContainerRef.current;
    if (element) {
      element.requestFullscreen().catch(() => {
        // Fallback: try webkit/moz versions
        (element as any).webkitRequestFullscreen?.();
        (element as any).mozRequestFullScreen?.();
      });
    }
  };

  // Handle Escape key to toggle controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!p5ContainerRef.current) return;

    const sketch = (p: p5) => {
      p5InstanceRef.current = p;

      p.setup = function () {
        const container = p5ContainerRef.current;
        if (!container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;
        p.createCanvas(width, height);
        p.background(10, 10, 10);
        p.smooth();
      };

      p.draw = function () {
        p.background(10, 10, 10); // Clean black background, no trails

        if (visualizationRef.current) {
          visualizationRef.current.draw(INTENSITY);
        }
      };

      p.windowResized = function () {
        const container = p5ContainerRef.current;
        if (!container) return;
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
    if (!p5InstanceRef.current) return;

    let newViz: LavaLamp | Bubbles | InkDrift | Particles;

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
  }, [mode]);

  return (
    <div className="app">
      <div className="canvas-container" ref={p5ContainerRef} />

      <button
        className={`toggle-controls ${!showControls ? 'hidden-controls' : ''}`}
        onClick={() => setShowControls(!showControls)}
        title={showControls ? 'Hide controls (press Esc)' : 'Show controls (press Esc)'}
      >
        {showControls ? '▼' : '▲'}
      </button>

      <div className={`controls ${!showControls ? 'hidden' : ''}`}>
        <div className="header">
          <div className="header-top">
            <h1>Visualizer:</h1>
            <div className="button-group">
              <button className="mic-button" onClick={toggleAudio}>
                {!isInitialized ? 'Enable Microphone' : 'Disable Microphone'}
              </button>
              <button className="mic-button" onClick={enterFullscreen} title="Enter fullscreen (press Esc to exit)">
                ⛶ Fullscreen
              </button>
            </div>
          </div>
          <hr className="header-divider" />
          <p>Works solo or with your mic. Click <i>Enable Microphone</i> to watch your audio come to life.</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="mode-selector">
          <label>Mode</label>
          <div className="mode-buttons">
            <button
              className={`mode-btn ${mode === 'lava' ? 'active' : ''}`}
              onClick={() => setMode('lava')}
            >
              🌋 Lava
            </button>
            <button
              className={`mode-btn ${mode === 'bubbles' ? 'active' : ''}`}
              onClick={() => setMode('bubbles')}
            >
              ✨ Bubbles
            </button>
            <button
              className={`mode-btn ${mode === 'ink' ? 'active' : ''}`}
              onClick={() => setMode('ink')}
            >
              💧 Ink
            </button>
            <button
              className={`mode-btn ${mode === 'particles' ? 'active' : ''}`}
              onClick={() => setMode('particles')}
            >
              ✦ Particles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
