export type Track = {
  path: string
  title: string
  artist?: string
  bpm?: number
  key?: string
  kbps?: number
  playable: boolean
}

export type ExportFormat = 'm3u8' | 'nml'

export type Playlist = {
  name: string
  folders: string[]
  hidden: string[]
  kept: Track[]
  seen: string[]
}

export type Api = {
  pickFolder(): Promise<string | null>
  readTracks(folder: string): Promise<Track[]>
  missingFolders(folders: string[]): Promise<string[]>
  readTrack(path: string): Promise<Track>
  readAudio(path: string): Promise<Uint8Array>
  readCover(path: string): Promise<string | null>
  exportPlaylist(tracks: Track[], format: ExportFormat, name?: string): Promise<string | null>
  listPlaylists(): Promise<Playlist[]>
  savePlaylist(playlist: Playlist): Promise<Playlist[]>
  renamePlaylist(from: string, to: string): Promise<Playlist[]>
  deletePlaylist(name: string): Promise<Playlist[]>
}
