export class AudioInput {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: any = null;
  private stream: MediaStream | null = null;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

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
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

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
    } catch (error) {
      console.error('Error initializing audio input:', error);
      throw error;
    }
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getTimeDomainData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getAverageFrequency(): number {
    const data = this.getFrequencyData();
    if (!data) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  getFrequencyBand(start: number, end: number): number {
    const data = this.getFrequencyData();
    if (!data) return 0;
    let sum = 0;
    const length = Math.min(end, data.length) - start;
    for (let i = start; i < Math.min(end, data.length); i++) {
      sum += data[i];
    }
    return length > 0 ? sum / length : 0;
  }

  getPeakFrequency(): number {
    const data = this.getFrequencyData();
    if (!data) return 0;
    return Math.max(...data) / 255;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export const audioInput = new AudioInput();
