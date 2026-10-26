import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '../shared/types'

const api: Api = {
  pickFolder: () => ipcRenderer.invoke('pickFolder'),
  readTracks: (folder) => ipcRenderer.invoke('readTracks', folder),
  missingFolders: (folders) => ipcRenderer.invoke('missingFolders', folders),
  readTrack: (path) => ipcRenderer.invoke('readTrack', path),
  readAudio: (path) => ipcRenderer.invoke('readAudio', path),
  readCover: (path) => ipcRenderer.invoke('readCover', path),
  exportPlaylist: (tracks, format, name) =>
    ipcRenderer.invoke('exportPlaylist', tracks, format, name),
  listPlaylists: () => ipcRenderer.invoke('listPlaylists'),
  savePlaylist: (playlist) => ipcRenderer.invoke('savePlaylist', playlist),
  renamePlaylist: (from, to) => ipcRenderer.invoke('renamePlaylist', from, to),
  deletePlaylist: (name) => ipcRenderer.invoke('deletePlaylist', name)
}

contextBridge.exposeInMainWorld('api', api)
