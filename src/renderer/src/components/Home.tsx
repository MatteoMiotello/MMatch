import type { Playlist } from '../../../shared/types'
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
  const taken = (name: string): boolean => playlists.some((p) => p.name === name)

  function rename(playlist: Playlist, name: string): void {
    if (taken(name) && !confirm(`Sovrascrivere la playlist "${name}"?`)) return
    window.api.renamePlaylist(playlist.name, name).then(onChange)
  }

  function clone(playlist: Playlist): void {
    let name = `${playlist.name} copia`
    for (let i = 2; taken(name); i++) name = `${playlist.name} copia ${i}`
    window.api.savePlaylist({ ...playlist, name }).then(onChange)
  }

  function remove(playlist: Playlist): void {
    if (!confirm(`Eliminare la playlist "${playlist.name}"? I file audio restano dove sono.`))
      return
    window.api.deletePlaylist(playlist.name).then(onChange)
  }

  return (
    <main className="flex h-full flex-col gap-8 overflow-y-auto p-5 sm:gap-10 sm:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">MMatch</h1>
          <p className="mt-1 text-neutral-400">Ascolta, decidi, esporta.</p>
        </div>
        <div className="flex items-center gap-2">
          <NewPlaylist loading={loading} taken={taken} onCreate={onCreate} />
          <SettingsButton className="rounded-full bg-neutral-800 p-3.5 hover:bg-neutral-700" />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Le tue playlist</h2>
        {playlists.length === 0 && (
          <p className="text-neutral-500">
            Nessuna playlist: creane una nuova e scegli la cartella da ascoltare.
          </p>
        )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] sm:gap-5">
          {playlists.map((p) => (
            <PlaylistCard
              key={p.name}
              playlist={p}
              onOpen={() => onOpenPlaylist(p)}
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
