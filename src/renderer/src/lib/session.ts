import type { Playlist } from '../../../shared/types'

export type Session = Omit<Playlist, 'name'>

// a moved folder (e.g. a USB drive mounted under another name) keeps its keep and seen tracks
export function relinkSession(session: Session, from: string, to: string): Session {
  const move = (path: string): string =>
    path === from || path.startsWith(`${from}/`) ? to + path.slice(from.length) : path
  const unique = (paths: string[]): string[] => [...new Set(paths.map(move))]

  return {
    folders: unique(session.folders),
    hidden: unique(session.hidden),
    seen: unique(session.seen),
    kept: session.kept.map((t) => ({ ...t, path: move(t.path) }))
  }
}
