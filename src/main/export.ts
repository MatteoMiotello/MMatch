import { basename, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Track } from '../shared/types'

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
}

const xml = (s: string): string => s.replace(/[&<>"']/g, (c) => XML_ENTITIES[c])

const label = (t: Track): string => (t.artist ? `${t.artist} - ${t.title}` : t.title)

export function toM3u8(tracks: Track[]): string {
  const entries = tracks.map((t) => `#EXTINF:-1,${label(t)}\n${t.path}`)
  return ['#EXTM3U', ...entries, ''].join('\n')
}

export function traktorLocation(path: string): {
  volume: string
  dir: string
  file: string
  key: string
} {
  const external = path.match(/^\/Volumes\/([^/]+)(\/.*)$/)
  // ponytail: assumes the boot volume is named "Macintosh HD"; read it via diskutil if a user renames it
  const volume = external?.[1] ?? 'Macintosh HD'
  const rest = external?.[2] ?? path
  const parts = dirname(rest).split('/').filter(Boolean)
  const dir = '/:' + parts.map((p) => `${p}/:`).join('')
  const file = basename(rest)
  return { volume, dir, file, key: volume + dir + file }
}

export function toNml(tracks: Track[], name: string): string {
  const locations = tracks.map((t) => ({ track: t, ...traktorLocation(t.path) }))

  const collection = locations.map(
    (l) =>
      `<ENTRY TITLE="${xml(l.track.title)}" ARTIST="${xml(l.track.artist ?? '')}">` +
      `<LOCATION DIR="${xml(l.dir)}" FILE="${xml(l.file)}" VOLUME="${xml(l.volume)}" VOLUMEID=""></LOCATION>` +
      `</ENTRY>`
  )

  const playlist = locations.map(
    (l) => `<ENTRY><PRIMARYKEY TYPE="TRACK" KEY="${xml(l.key)}"></PRIMARYKEY></ENTRY>`
  )

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>',
    '<NML VERSION="19"><HEAD COMPANY="www.native-instruments.com" PROGRAM="Traktor"></HEAD>',
    '<MUSICFOLDERS></MUSICFOLDERS>',
    `<COLLECTION ENTRIES="${tracks.length}">`,
    ...collection,
    '</COLLECTION>',
    '<SETS ENTRIES="0"></SETS>',
    '<PLAYLISTS><NODE TYPE="FOLDER" NAME="$ROOT"><SUBNODES COUNT="1">',
    `<NODE TYPE="PLAYLIST" NAME="${xml(name)}">`,
    `<PLAYLIST ENTRIES="${tracks.length}" TYPE="LIST" UUID="${randomUUID().replaceAll('-', '')}">`,
    ...playlist,
    '</PLAYLIST></NODE>',
    '</SUBNODES></NODE></PLAYLISTS>',
    '</NML>',
    ''
  ].join('\n')
}
