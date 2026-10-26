// essentia.js ships no typings for its ES builds; only the calls used here
declare module 'essentia.js/dist/essentia-wasm.es.js' {
  export const EssentiaWASM: unknown
}

declare module 'essentia.js/dist/essentia.js-core.es.js' {
  export type Vector = { delete(): void }

  export default class Essentia {
    constructor(wasm: unknown)
    arrayToVector(array: Float32Array): Vector
    KeyExtractor(
      audio: Vector,
      ...params: (boolean | number | string)[]
    ): {
      key: string
      scale: 'major' | 'minor'
    }
    RhythmExtractor2013(
      audio: Vector,
      maxTempo: number,
      method: string,
      minTempo: number
    ): {
      bpm: number
    }
  }
}
