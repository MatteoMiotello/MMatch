import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Playlist, Track } from '../../shared/types'
import { Player } from './components/Player'
import { KeptList } from './components/KeptList'
import { KeptToggle } from './components/KeptToggle'
import { KeyHints } from './components/KeyHints'
import { Home } from './components/Home'
import { FolderBar } from './components/FolderBar'
import { SettingsButton, SettingsPanel } from './components/SettingsPanel'
import { useSettings } from './lib/settings'
import { useTranslation } from 'react-i18next'
import { relinkSession, type Session } from './lib/session'
import { MissingFolders } from './components/MissingFolders'
import { SwipeCard, SWIPE_MS, type Decision } from './components/SwipeCard'

async function readQueue({ folders, hidden, seen }: Session, missing: string[]): Promise<Track[]> {
  const visible = folders.filter((f) => !hidden.includes(f) && !missing.includes(f))
  const lists = await Promise.all(visible.map((f) => window.api.readTracks(f)))
  const done = new Set(seen)
  // a Map by path drops duplicates when one added folder is nested in another
  return [
    ...new Map(
      lists
        .flat()
        .filter((t) => !done.has(t.path))
        .map((t) => [t.path, t])
    ).values()
  ]
}

const SEEK_SECONDS = 10
const LONG_SEEK_SECONDS = 30

export default function App(): React.JSX.Element {
  const [tracks, setTracks] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [kept, setKept] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState<Decision | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [name, setName] = useState<string | null>(null)
  const [seenBefore, setSeenBefore] = useState<string[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [settings, setSettings] = useSettings()
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const requestedTags = useRef(new Set<string>())
  const track = tracks[index]
  const available = folders.filter((f) => !hidden.includes(f) && !missing.includes(f))
  const blocked = folders.length > 0 && !loading && available.length === 0
  const finished = folders.length > 0 && !loading && !blocked && !track

  async function load(session: Session, sessionName: string | null): Promise<void> {
    setLoading(true)
    setError(null)
    requestedTags.current.clear()
    try {
      const gone = await window.api.missingFolders(session.folders)
      setTracks(await readQueue(session, gone))
      setMissing(gone)
      setIndex(0)
      setKept(session.kept)
      setFolders(session.folders)
      setHidden(session.hidden)
      setSeenBefore(session.seen)
      setName(sessionName)
    } finally {
      setLoading(false)
    }
  }

  function current(): Session {
    return {
      folders,
      hidden,
      kept,
      seen: [...seenBefore, ...tracks.slice(0, index).map((t) => t.path)]
    }
  }

  async function create(newName: string): Promise<void> {
    const folder = await window.api.pickFolder()
    if (folder) load({ folders: [folder], hidden: [], kept: [], seen: [] }, newName)
  }

  async function addFolder(): Promise<void> {
    const folder = await window.api.pickFolder()
    if (!folder || folders.includes(folder)) return
    load({ ...current(), folders: [...folders, folder] }, name)
  }

  async function relink(folder: string): Promise<void> {
    const to = await window.api.pickFolder()
    if (to) load(relinkSession(current(), folder, to), name)
  }

  function toggleHidden(folder: string): void {
    const next = hidden.includes(folder) ? hidden.filter((f) => f !== folder) : [...hidden, folder]
    // the last available folder can never be hidden, or there would be nothing to match
    if (folders.every((f) => next.includes(f) || missing.includes(f))) return
    load({ ...current(), hidden: next }, name)
  }

  function goHome(): void {
    setFolders([])
    setTracks([])
    setIndex(0)
    setKept([])
    setName(null)
    setListOpen(false)
  }

  useEffect(() => {
    window.api.listPlaylists().then(setPlaylists)
  }, [])

  useEffect(() => {
    // once named, every decision is saved so the playlist can be resumed later
    if (!name || !folders.length) return
    const seen = [...seenBefore, ...tracks.slice(0, index).map((t) => t.path)]
    window.api.savePlaylist({ name, folders, hidden, kept, seen }).then(setPlaylists)
  }, [name, folders, hidden, kept, index, seenBefore, tracks])

  useEffect(() => {
    // every failed window.api call (scan, audio, export) ends up here instead of only in the console
    function onRejection(e: PromiseRejectionEvent): void {
      const message = e.reason instanceof Error ? e.reason.message : String(e.reason)
      setError(message.replace(/^Error invoking remote method '\w+': /, ''))
    }
    window.addEventListener('unhandledrejection', onRejection)
    return () => window.removeEventListener('unhandledrejection', onRejection)
  }, [])

  useEffect(() => {
    // tags for the current track plus the next one, so a swipe never waits on them
    for (const { path } of tracks.slice(index, index + 2)) {
      if (requestedTags.current.has(path)) continue
      requestedTags.current.add(path)
      window.api.readTrack(path).then((tagged) => {
        const withTags = (list: Track[]): Track[] =>
          list.map((t) => (t.path === tagged.path ? tagged : t))
        setTracks(withTags)
        setKept(withTags)
      })
    }
  }, [tracks, index])

  function decide(decision: Decision): void {
    if (!track || leaving) return
    setLeaving(decision)
    // let the swipe-out transition finish before the next track mounts
    setTimeout(() => {
      if (decision === 'keep') setKept((k) => [...k, track])
      setIndex((i) => i + 1)
      setLeaving(null)
    }, SWIPE_MS)
  }

  function remove(track: Track): void {
    setKept((k) => k.filter((t) => t.path !== track.path))
  }

  function back(): void {
    if (index === 0 || leaving) return
    const previous = tracks[index - 1]
    // keeps are appended in order, so a kept previous track is always the last keep
    setKept((k) => (k.at(-1)?.path === previous.path ? k.slice(0, -1) : k))
    setIndex(index - 1)
  }

  function seek(seconds: number): void {
    if (audioRef.current) audioRef.current.currentTime += seconds
  }

  function togglePlay(): void {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const step = e.shiftKey ? LONG_SEEK_SECONDS : SEEK_SECONDS
    const actions: Record<string, () => void> = {
      ArrowRight: () => decide('keep'),
      ArrowLeft: () => decide('skip'),
      ArrowUp: () => seek(step),
      ArrowDown: () => seek(-step),
      ' ': togglePlay,
      Backspace: back
    }
    const action = actions[e.key]
    // sliders keep the shortcuts; only fields you type into swallow them
    const typing =
      e.target instanceof HTMLSelectElement ||
      (e.target instanceof HTMLInputElement && ['text', 'number', 'search'].includes(e.target.type))
    if (typing) return
    if (!tracks.length || !action || e.repeat) return
    e.preventDefault()
    action()
  })

  useEffect(() => {
    // capture phase so a focused slider never handles the arrows too
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  if (!folders.length) {
    return (
      <div className="flex h-dvh flex-col bg-neutral-950 text-neutral-100">
        <TitleBar />
        {error && <p className="px-5 pt-6 text-sm text-red-400 sm:px-10">{error}</p>}
        <Home
          playlists={playlists}
          loading={loading}
          onCreate={create}
          onOpenPlaylist={(p) => load(p, p.name)}
          onChange={setPlaylists}
        />
        <SettingsPanel settings={settings} onChange={setSettings} />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col bg-neutral-950 text-neutral-100">
      <TitleBar />
      <header className="flex flex-wrap items-center gap-2 p-4 pr-20">
        <button
          onClick={goHome}
          aria-label={t('home')}
          className="rounded-full bg-neutral-800 p-2.5 hover:bg-neutral-700"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
            <path
              d="M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <SettingsButton className="rounded-full bg-neutral-800 p-2.5 hover:bg-neutral-700" />
        <FolderBar
          folders={folders}
          hidden={hidden}
          missing={missing}
          onAdd={addFolder}
          onToggle={toggleHidden}
          onRelink={relink}
        />
      </header>
      {name && <h1 className="truncate px-4 pb-4 text-center text-lg font-semibold">{name}</h1>}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center-safe gap-6 overflow-x-hidden overflow-y-auto px-4 pb-6 sm:gap-8 sm:px-8">
        {error && <p className="max-w-xl text-center text-sm text-red-400">{error}</p>}
        {track && (
          <SwipeCard key={track.path} leaving={leaving} onSwipe={decide}>
            <Player track={track} settings={settings} audioRef={audioRef} />
          </SwipeCard>
        )}
        {blocked && (
          <MissingFolders
            folders={folders.filter((f) => missing.includes(f) && !hidden.includes(f))}
            onRelink={relink}
            onRetry={() => load(current(), name)}
          />
        )}
        {finished && <p className="text-xl">{t('finished', { count: kept.length })}</p>}

        {tracks.length > 0 && (
          <p className="text-sm text-neutral-500">
            {Math.min(index + 1, tracks.length)} / {tracks.length}
          </p>
        )}
        <KeyHints />
      </main>

      <SettingsPanel settings={settings} onChange={setSettings} />
      <KeptToggle count={kept.length} onClick={() => setListOpen(true)} />
      <KeptList
        tracks={kept}
        open={listOpen}
        onClose={() => setListOpen(false)}
        onRemove={remove}
        name={name}
      />
    </div>
  )
}

function TitleBar(): React.JSX.Element {
  return <div className="h-9 shrink-0 [app-region:drag]" />
}
