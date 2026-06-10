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
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

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
    const bandData = data.slice(start, end);
    return bandData.reduce((a, b) => a + b, 0) / bandData.length;
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
