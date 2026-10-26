import { EssentiaWASM } from 'essentia.js/dist/essentia-wasm.es.js'
import Essentia, { type Vector } from 'essentia.js/dist/essentia.js-core.es.js'
import type { AnalysisRequest } from './analysis'
import { foldBpm } from './music'

// essentia defaults except the 'edma' profile, tuned for electronic dance music
const KEY_PARAMS = [true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'edma']

// the wasm compiles synchronously, which Chromium only allows off the main thread
const essentia = new Essentia(EssentiaWASM)

type Request = AnalysisRequest & { samples: Float32Array }

function detectKey(signal: Vector): string {
  const { key, scale } = essentia.KeyExtractor(signal, ...KEY_PARAMS)
  return `${key}${scale === 'minor' ? 'm' : ''}`
}

function detectBpm(signal: Vector, [min, max]: [number, number]): number {
  // 'degara' is ~6x faster than 'multifeature' and as accurate on steady 4/4
  return foldBpm(essentia.RhythmExtractor2013(signal, max, 'degara', min).bpm, min, max)
}

self.onmessage = ({ data }: MessageEvent<Request>) => {
  const signal = essentia.arrayToVector(data.samples)
  try {
    self.postMessage({
      key: data.key ? detectKey(signal) : undefined,
      bpm: data.bpm ? detectBpm(signal, data.bpm) : undefined
    })
  } catch {
    self.postMessage({})
  } finally {
    signal.delete()
  }
}
