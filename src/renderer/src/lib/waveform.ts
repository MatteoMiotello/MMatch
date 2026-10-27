// a waveform only needs the envelope, and a low rate makes the full-track decode cheap
const SAMPLE_RATE = 8000
export const WAVEFORM_BARS = 96

// loudness (RMS) per bar, scaled so the loudest bar is 1: peaks would be flat on mastered tracks
export async function waveform(data: Uint8Array): Promise<number[]> {
  const context = new AudioContext({ sampleRate: SAMPLE_RATE })
  try {
    const samples = (await context.decodeAudioData(data.slice().buffer)).getChannelData(0)
    const size = Math.floor(samples.length / WAVEFORM_BARS)
    const peaks = Array.from({ length: WAVEFORM_BARS }, (_, b) => {
      let sum = 0
      for (let i = b * size; i < (b + 1) * size; i++) sum += samples[i] * samples[i]
      return Math.sqrt(sum / size)
    })
    const loudest = Math.max(...peaks) || 1
    // squared to stretch the narrow loudness range of mastered dance music, so breakdowns stand out
    return peaks.map((p) => (p / loudest) ** 2)
  } finally {
    context.close()
  }
}
