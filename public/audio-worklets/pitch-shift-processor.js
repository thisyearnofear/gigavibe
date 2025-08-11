/**
 * Pitch Shift Audio Worklet Processor
 * Real-time pitch shifting for adaptive backing tracks
 */

class PitchShiftProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'pitchShift',
        defaultValue: 1.0,
        minValue: 0.5,
        maxValue: 2.0,
        automationRate: 'a-rate'
      }
    ];
  }

  constructor() {
    super();
    this.bufferSize = 4096;
    this.hopSize = this.bufferSize / 4;
    this.overlapBuffer = new Float32Array(this.bufferSize);
    this.grainWindow = this.createWindow(this.bufferSize);
    this.outputBuffer = new Float32Array(this.bufferSize);
    this.phase = 0;
  }

  createWindow(size) {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
    }
    return window;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (input.length === 0 || output.length === 0) {
      return true;
    }

    const inputChannel = input[0];
    const outputChannel = output[0];
    const pitchShift = parameters.pitchShift;

    // Simple pitch shifting using time-domain approach
    // For production, consider using frequency-domain methods (PSOLA, phase vocoder)
    
    for (let i = 0; i < inputChannel.length; i++) {
      const shift = Array.isArray(pitchShift) ? pitchShift[i] : pitchShift[0];
      
      // Calculate read position with pitch shift
      const readPos = this.phase * shift;
      const readIndex = Math.floor(readPos) % inputChannel.length;
      const fraction = readPos - Math.floor(readPos);
      
      // Linear interpolation
      const sample1 = inputChannel[readIndex];
      const sample2 = inputChannel[(readIndex + 1) % inputChannel.length];
      const interpolatedSample = sample1 + fraction * (sample2 - sample1);
      
      outputChannel[i] = interpolatedSample;
      this.phase = (this.phase + 1) % inputChannel.length;
    }

    return true;
  }
}

registerProcessor('pitch-shift-processor', PitchShiftProcessor);