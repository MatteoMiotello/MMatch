import { useEffect, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { WAVEFORM_BARS } from '../lib/waveform'

const VOLUME_KEY = 'mmatch.volume'

function savedVolume(): number {
  try {
    return Number(localStorage.getItem(VOLUME_KEY) ?? 1)
  } catch {
    return 1
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// null while the track is still being decoded
type Props = { audioRef: RefObject<HTMLAudioElement | null>; peaks: number[] | null }

export function AudioControls({ audioRef, peaks }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(savedVolume)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    // every track mounts a new <audio>, so carry the volume over from the last one
    audio.volume = savedVolume()
    const onTime = (): void => setTime(audio.currentTime)
    const onDuration = (): void => setDuration(audio.duration)
    const onVolume = (): void => {
      setVolume(audio.volume)
      setMuted(audio.muted)
      localStorage.setItem(VOLUME_KEY, String(audio.volume))
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('volumechange', onVolume)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('volumechange', onVolume)
    }
  }, [audioRef])

  function seek(ratio: number): void {
    const audio = audioRef.current
    if (audio && Number.isFinite(audio.duration)) audio.currentTime = ratio * audio.duration
  }

  function changeVolume(value: number): void {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = value
    audio.muted = false
  }

  function toggleMute(): void {
    const audio = audioRef.current
    if (audio) audio.muted = !audio.muted
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-black/30 px-3 py-2.5 text-white backdrop-blur-md">
      <Waveform peaks={peaks} value={duration ? time / duration : 0} onChange={seek} />
      <div className="flex items-center justify-between text-xs text-white/70 tabular-nums">
        <span>
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <div className="flex w-28 items-center gap-2">
          <button onClick={toggleMute} aria-label={muted ? t('unmute') : t('mute')}>
            <VolumeIcon muted={muted || volume === 0} />
          </button>
          <Slider label="Volume" value={muted ? 0 : volume} onChange={changeVolume} />
        </div>
      </div>
    </div>
  )
}

type SliderProps = { label: string; value: number; onChange(value: number): void }

// a styled bar with a transparent native range on top: drag, click and a11y come for free
function Slider({ label, value, onChange }: SliderProps): React.JSX.Element {
  return (
    <div className="group relative flex h-3 flex-1 items-center">
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover:h-1.5">
        <div className="h-full bg-white" style={{ width: `${value * 100}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  )
}

type WaveformProps = { peaks: number[] | null; value: number; onChange(value: number): void }

// flat pulsing bars while the track decodes, so the layout never jumps
const LOADING_PEAKS = Array<number>(WAVEFORM_BARS).fill(0.1)

// SoundCloud-style bars, with the same transparent native range on top as Slider
function Waveform({ peaks, value, onChange }: WaveformProps): React.JSX.Element {
  const { t } = useTranslation()
  const bars = peaks ?? LOADING_PEAKS
  return (
    <div className={`relative flex h-12 items-center gap-px ${peaks ? '' : 'animate-pulse'}`}>
      {bars.map((peak, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-[height] duration-300 ${i / bars.length < value ? 'bg-white' : 'bg-white/30'}`}
          style={{ height: `${Math.max(peak * 100, 6)}%` }}
        />
      ))}
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        value={value}
        aria-label={t('position')}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  )
}

function VolumeIcon({ muted }: { muted: boolean }): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
      <path d="M4 9h4l5-4v14l-5-4H4z" strokeLinejoin="round" className="fill-current" />
      {muted && <path d="M17 9l5 5M22 9l-5 5" strokeLinecap="round" />}
      {!muted && <path d="M17 8a5 5 0 0 1 0 8" strokeLinecap="round" />}
    </svg>
  )
}
