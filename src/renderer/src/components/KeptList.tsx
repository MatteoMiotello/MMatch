import type { ExportFormat, Track } from '../../../shared/types'

const FORMATS: ExportFormat[] = ['m3u8', 'nml']

type Props = {
  tracks: Track[]
  open: boolean
  onClose(): void
  onRemove(track: Track): void
  name: string | null
}

export function KeptList({ tracks, open, onClose, onRemove, name }: Props): React.JSX.Element {
  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/50" />}

      <aside
        className={`fixed inset-y-0 right-0 flex w-80 max-w-full flex-col gap-4 border-l border-neutral-800 bg-neutral-900 p-4 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Keep ({tracks.length})</h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <ol className="flex-1 space-y-1 overflow-y-auto text-sm">
          {tracks.map((t) => (
            <KeptItem key={t.path} track={t} onRemove={() => onRemove(t)} />
          ))}
        </ol>

        <div className="flex gap-2">
          {FORMATS.map((format) => (
            <button
              key={format}
              disabled={tracks.length === 0}
              onClick={() => window.api.exportPlaylist(tracks, format, name ?? undefined)}
              className="flex-1 rounded-lg bg-primary text-white py-2 text-sm font-medium uppercase hover:bg-primary-light disabled:opacity-30"
            >
              {format}
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}

function KeptItem({ track, onRemove }: { track: Track; onRemove(): void }): React.JSX.Element {
  return (
    <li className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-800">
      <span className="min-w-0 flex-1 truncate text-neutral-300">
        {track.artist && <span className="text-neutral-500">{track.artist} – </span>}
        {track.title}
      </span>
      <button
        onClick={onRemove}
        aria-label={`Rimuovi ${track.title}`}
        className="shrink-0 text-neutral-500 hover:text-primary"
      >
        ✕
      </button>
    </li>
  )
}
