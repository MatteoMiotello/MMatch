import { useEffect, useEffectEvent, useState, type RefObject } from 'react'
import type { Track } from '../../../shared/types'
import { analyze, type Analysis } from '../lib/analysis'
import { formatKey } from '../lib/music'
import type { Settings } from '../lib/settings'
import { Cover } from './Cover'
import { AudioControls } from './AudioControls'

type Props = {
  track: Track
  settings: Settings
  audioRef: RefObject<HTMLAudioElement | null>
}

export function Player({ track, settings, audioRef }: Props): React.JSX.Element {
  const [src, setSrc] = useState<string>()
  const [cover, setCover] = useState<string | null>(null)
  // null until essentia has answered; only ever started when a tag is missing
  const [detected, setDetected] = useState<Analysis | null>(null)
  const { path, playable } = track
  const analyzing = playable && detected === null
  const bpm = track.bpm ?? detected?.bpm
  const key = track.key ?? detected?.key

  // tags may arrive after the audio: read the latest ones without re-running the audio effect
  const analyzeIfUntagged = useEffectEvent(async (data: Uint8Array, signal: AbortSignal) => {
    const key = settings.showKey && !track.key
    const bpm = settings.showBpm && !track.bpm
    if (!key && !bpm) return
    const range: [number, number] = [settings.bpmMin, settings.bpmMax]
    const analysis = await analyze(data, { key, bpm: bpm ? range : null }, signal)
    if (!signal.aborted) setDetected(analysis)
  })

  useEffect(() => {
    window.api.readCover(path).then(setCover)
  }, [path])

  useEffect(() => {
    if (!playable) return
    let url = ''
    // aborted on swipe, so a track that left the screen never keeps the analysis busy
    const controller = new AbortController()

    window.api.readAudio(path).then((data) => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(new Blob([data as BlobPart]))
      setSrc(url)
      analyzeIfUntagged(data, controller.signal)
    })

    return () => {
      controller.abort()
      URL.revokeObjectURL(url)
    }
  }, [path, playable])

  return (
    <div className="relative isolate flex w-full flex-col gap-5 sm:gap-6 overflow-hidden rounded-3xl bg-neutral-900 p-5 shadow-2xl sm:p-8">
      {cover && <CoverGlow src={cover} />}
      <div className="mx-auto size-48 overflow-hidden sm:size-64 rounded-2xl shadow-lg">
        <Cover src={cover} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">{track.title}</h1>
          <p className="truncate text-neutral-400">{track.artist ?? 'Artista sconosciuto'}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {settings.showKey && (
            <Stat
              value={key && formatKey(key, settings.keyNotation)}
              loading={analyzing}
              label="Key"
            />
          )}
          {settings.showBpm && (
            <Stat value={bpm && Math.round(bpm)} loading={analyzing} label="BPM" />
          )}
          {settings.showKbps && <Stat value={track.kbps} loading={false} label="kbps" />}
        </div>
      </div>

      {playable && <audio ref={audioRef} src={src} autoPlay />}
      {playable && <AudioControls audioRef={audioRef} />}
      {!playable && <UnplayableNote />}
    </div>
  )
}

type StatProps = { value?: string | number; loading: boolean; label: string }

function Stat({ value, loading, label }: StatProps): React.JSX.Element {
  return (
    <div className="flex min-w-16 flex-col items-center rounded-xl bg-black/30 px-3 py-2">
      {value !== undefined && <p className="text-2xl font-bold tabular-nums">{value}</p>}
      {value === undefined && loading && (
        <p className="my-1 h-6 w-10 animate-pulse rounded bg-white/20" aria-label="Analisi…" />
      )}
      {value === undefined && !loading && <p className="text-2xl font-bold text-neutral-600">–</p>}
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  )
}

// the cover itself, blurred and dimmed behind the card: its colours without extracting them
function CoverGlow({ src }: { src: string }): React.JSX.Element {
  return (
    <div className="absolute inset-0 -z-10">
      <img src={src} alt="" className="size-full scale-125 object-cover opacity-60 blur-3xl" />
      <div className="absolute inset-0 bg-neutral-950/50" />
    </div>
  )
}

function UnplayableNote(): React.JSX.Element {
  return (
    <p className="rounded-xl bg-black/30 px-3 py-2.5 text-sm text-amber-300 backdrop-blur-md">
      AIFF non riproducibile: decidi o passa oltre.
    </p>
  )
}
