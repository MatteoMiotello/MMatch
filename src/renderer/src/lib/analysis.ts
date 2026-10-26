import AnalysisWorker from './analysis.worker?worker'

export type Analysis = { key?: string; bpm?: number }
// bpm is the tempo range to search, null skips that analysis
export type AnalysisRequest = { key: boolean; bpm: [min: number, max: number] | null }

// essentia's algorithms default to 44.1 kHz
const SAMPLE_RATE = 44100
// ponytail: only the middle 2 minutes are analysed (intros/outros are often beatless), full track if accuracy suffers
const EXCERPT_SECONDS = 120

let worker = new AnalysisWorker()

async function decodeMono(data: Uint8Array): Promise<Float32Array> {
  const context = new AudioContext({ sampleRate: SAMPLE_RATE })
  try {
    const buffer = await context.decodeAudioData(data.slice().buffer)
    const length = Math.min(buffer.length, EXCERPT_SECONDS * SAMPLE_RATE)
    const start = Math.floor((buffer.length - length) / 2)
    const mono = new Float32Array(length)
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const channel = buffer.getChannelData(c).subarray(start, start + length)
      for (let i = 0; i < length; i++) mono[i] += channel[i] / buffer.numberOfChannels
    }
    return mono
  } finally {
    context.close()
  }
}

export async function analyze(
  data: Uint8Array,
  request: AnalysisRequest,
  signal: AbortSignal
): Promise<Analysis> {
  const samples = await decodeMono(data).catch(() => null)
  if (!samples || signal.aborted) return {}
  const current = worker

  return new Promise((resolve) => {
    function abort(): void {
      // the wasm runs synchronously inside the worker, so killing it is the only way to stop it
      current.terminate()
      worker = new AnalysisWorker()
      resolve({})
    }
    current.onmessage = ({ data }: MessageEvent<Analysis>) => {
      signal.removeEventListener('abort', abort)
      resolve(data)
    }
    signal.addEventListener('abort', abort, { once: true })
    current.postMessage({ samples, ...request }, [samples.buffer])
  })
}
