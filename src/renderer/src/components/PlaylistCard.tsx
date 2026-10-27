import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Playlist, Track } from '../../../shared/types'
import { PlaylistMenu } from './PlaylistMenu'

const MOSAIC_SIZE = 4
// many tracks have no artwork, so sample extra to still fill the mosaic
const SAMPLE_SIZE = 12

type Props = {
  playlist: Playlist
  opening: boolean
  disabled: boolean
  onOpen(): void
  onRename(name: string): void
  onClone(): void
  onDelete(): void
}

export function PlaylistCard({
  playlist,
  opening,
  disabled,
  onOpen,
  onRename,
  onClone,
  onDelete
}: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [renaming, setRenaming] = useState(false)
  const empty = playlist.kept.length === 0

  const items = [
    { label: t('rename'), onClick: () => setRenaming(true) },
    { label: t('clone'), onClick: onClone },
    {
      label: t('exportAs', { format: 'M3U8' }),
      disabled: empty,
      onClick: () => window.api.exportPlaylist(playlist.kept, 'm3u8', playlist.name)
    },
    {
      label: t('exportAs', { format: 'NML' }),
      disabled: empty,
      onClick: () => window.api.exportPlaylist(playlist.kept, 'nml', playlist.name)
    },
    { label: t('delete'), danger: true, onClick: onDelete }
  ]

  function rename(name: string): void {
    setRenaming(false)
    if (name && name !== playlist.name) onRename(name)
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl bg-neutral-900 p-3 transition-colors hover:bg-neutral-800">
      {/* stretched button: the whole card opens the playlist, menu and input sit above it */}
      <button
        onClick={onOpen}
        disabled={disabled}
        aria-label={t('open', { name: playlist.name })}
        className="absolute inset-0 rounded-2xl"
      />
      {/* clicks fall through the cover to the stretched button below */}
      <div className="pointer-events-none relative">
        <CoverMosaic tracks={playlist.kept} />
        {opening && <OpeningOverlay />}
      </div>
      <div className="flex items-start gap-1 px-1">
        <div className="min-w-0 flex-1">
          {renaming && (
            <RenameInput name={playlist.name} onDone={rename} onCancel={() => setRenaming(false)} />
          )}
          {!renaming && <p className="truncate font-semibold">{playlist.name}</p>}
          <p className="truncate text-sm text-neutral-400">
            {t('trackCount', { count: playlist.kept.length })}
          </p>
        </div>
        <PlaylistMenu items={items} />
      </div>
    </div>
  )
}

type RenameInputProps = { name: string; onDone(name: string): void; onCancel(): void }

function RenameInput({ name, onDone, onCancel }: RenameInputProps): React.JSX.Element {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // the closing popover hands focus back to its ⋯ invoker, so focus after it has done so
    const timer = setTimeout(() => inputRef.current?.select())
    return () => clearTimeout(timer)
  }, [])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') onDone(e.currentTarget.value.trim())
    if (e.key === 'Escape' && confirm(t('confirmCancelRename'))) onCancel()
  }

  return (
    <input
      ref={inputRef}
      defaultValue={name}
      onKeyDown={onKeyDown}
      className="relative w-full rounded bg-neutral-950 px-1 font-semibold outline-1 outline-primary"
    />
  )
}

function CoverMosaic({ tracks }: { tracks: Track[] }): React.JSX.Element {
  const [covers, setCovers] = useState<string[]>([])

  useEffect(() => {
    // ponytail: sort-by-random shuffle is biased, fine for picking artwork
    const sample = [...tracks].sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE)
    Promise.all(sample.map((t) => window.api.readCover(t.path))).then((found) =>
      setCovers(found.filter((c) => c !== null).slice(0, MOSAIC_SIZE))
    )
  }, [tracks])

  if (covers.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-800 text-5xl text-neutral-600">
        ♪
      </div>
    )
  }

  // flex-wrap with growing halves: 1 cover fills, 2 split, 3 put the last one full width
  return (
    <div className="flex aspect-square flex-wrap overflow-hidden rounded-xl">
      {covers.map((src, i) => (
        <div key={i} className="relative grow basis-1/2">
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}

function OpeningOverlay(): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-neutral-950/60">
      <span
        aria-label={t('opening')}
        className="size-9 animate-spin rounded-full border-3 border-white/30 border-t-primary"
      />
    </div>
  )
}
