export class AudioInput {
    constructor() {
        Object.defineProperty(this, "audioContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "analyser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "dataArray", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "stream", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "microphoneSource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                }
            });
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = 0.4;
            // Create microphone source
            this.microphoneSource = this.audioContext.createMediaStreamSource(this.stream);
            this.microphoneSource.connect(this.analyser);
            // Initialize data array
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Error initializing audio input:', error);
            throw error;
        }
    }
    getFrequencyData() {
        if (!this.analyser || !this.dataArray)
            return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }
    getTimeDomainData() {
        if (!this.analyser || !this.dataArray)
            return null;
        this.analyser.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }
    getAverageFrequency() {
        const data = this.getFrequencyData();
        if (!data)
            return 0;
        const sum = data.reduce((a, b) => a + b, 0);
        return sum / data.length;
    }
    getFrequencyBand(start, end) {
        const data = this.getFrequencyData();
        if (!data)
            return 0;
        const bandData = data.slice(start, end);
        return bandData.reduce((a, b) => a + b, 0) / bandData.length;
    }
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isInitialized = false;
    }
    getIsInitialized() {
        return this.isInitialized;
    }
}
export const audioInput = new AudioInput();
