import type { Track } from '../../../shared/types'
import { useTranslation } from 'react-i18next'
import { PlaylistMenu } from './PlaylistMenu'

type Props = {
  tracks: Track[]
  open: boolean
  onClose(): void
  onRemove(track: Track): void
  name: string | null
}

export function KeptList({ tracks, open, onClose, onRemove, name }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const exports = (['m3u8', 'nml'] as const).map((format) => ({
    label: format.toUpperCase(),
    onClick: () => window.api.exportPlaylist(tracks, format, name ?? undefined)
  }))

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/50" />}

      <aside
        className={`fixed top-16 right-3 bottom-3 flex w-80 max-w-[calc(100%-1.5rem)] flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-[calc(100%+4rem)]'}`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">{name ?? 'Keep'}</h2>
            <p className="text-sm text-neutral-400">{t('trackCount', { count: tracks.length })}</p>
          </div>
          <PlaylistMenu items={exports} label={t('export')} disabled={tracks.length === 0} />
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <ol className="flex-1 space-y-1 overflow-y-auto text-sm">
          {tracks.map((track) => (
            <KeptItem key={track.path} track={track} onRemove={() => onRemove(track)} />
          ))}
        </ol>
      </aside>
    </>
  )
}

function KeptItem({ track, onRemove }: { track: Track; onRemove(): void }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <li className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-800">
      <button
        onClick={onRemove}
        aria-label={t('remove', { title: track.title })}
        className="shrink-0 text-neutral-500 hover:text-primary"
      >
        <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
          <path
            d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="min-w-0 flex-1 truncate text-neutral-300">
        {track.artist && <span className="text-neutral-500">{track.artist} – </span>}
        {track.title}
      </span>
    </li>
  )
}
