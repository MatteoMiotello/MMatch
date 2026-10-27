import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Playlist } from '../../../shared/types'
import logo from '../assets/logo.png'
import { PlaylistCard } from './PlaylistCard'
import { SettingsButton } from './SettingsPanel'
import { NewPlaylist } from './NewPlaylist'

type Props = {
  playlists: Playlist[]
  loading: boolean
  onCreate(name: string): void
  onOpenPlaylist(playlist: Playlist): void
  onChange(playlists: Playlist[]): void
}

export function Home({
  playlists,
  loading,
  onCreate,
  onOpenPlaylist,
  onChange
}: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [opening, setOpening] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const shown = playlists.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
  const taken = (name: string): boolean => playlists.some((p) => p.name === name)

  function open(playlist: Playlist): void {
    setOpening(playlist.name)
    onOpenPlaylist(playlist)
  }

  function rename(playlist: Playlist, name: string): void {
    if (taken(name) && !confirm(t('overwrite', { name }))) return
    window.api.renamePlaylist(playlist.name, name).then(onChange)
  }

  function clone(playlist: Playlist): void {
    let name = t('copyName', { name: playlist.name })
    for (let n = 2; taken(name); n++) name = t('copyNameNumbered', { name: playlist.name, n })
    window.api.savePlaylist({ ...playlist, name }).then(onChange)
  }

  function remove(playlist: Playlist): void {
    if (!confirm(t('confirmDelete', { name: playlist.name }))) return
    window.api.deletePlaylist(playlist.name).then(onChange)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 pt-2 sm:gap-6 sm:p-10 sm:pt-2">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1>
            <img src={logo} alt="MMatch" className="h-14 w-auto sm:h-16" />
          </h1>
          <p className="mt-2 text-neutral-400">{t('tagline')}</p>
        </div>
        <div className="flex items-center gap-2">
          <NewPlaylist loading={loading} taken={taken} onCreate={onCreate} />
          <SettingsButton className="rounded-full bg-neutral-800 p-2.5 hover:bg-neutral-700" />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{t('yourPlaylists')}</h2>
          {playlists.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaylists')}
              aria-label={t('searchPlaylists')}
              className="w-full rounded-full bg-neutral-800 px-4 py-2 text-sm placeholder:text-neutral-500 sm:w-60"
            />
          )}
        </div>
        {playlists.length === 0 && <p className="text-neutral-500">{t('noPlaylists')}</p>}
        {playlists.length > 0 && shown.length === 0 && (
          <p className="text-neutral-500">{t('noMatches', { query })}</p>
        )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] sm:gap-5">
          {shown.map((p) => (
            <PlaylistCard
              key={p.name}
              playlist={p}
              opening={loading && opening === p.name}
              disabled={loading}
              onOpen={() => open(p)}
              onRename={(name) => rename(p, name)}
              onClone={() => clone(p)}
              onDelete={() => remove(p)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
