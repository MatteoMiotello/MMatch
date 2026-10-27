import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { existsSync, type Dirent } from 'node:fs'
import { readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { parseFile, selectCover } from 'music-metadata'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { toM3u8, toNml } from './export'
import type { ExportFormat, Playlist, Track } from '../shared/types'

// 1.0.0 shipped as MMatch: keep using its folder, since Electron creates the new one before we could move it
const legacyData = join(app.getPath('appData'), 'mmatch')
if (existsSync(legacyData)) app.setPath('userData', legacyData)

const AUDIO = /\.(mp3|wav|flac|m4a|aac|ogg|aif|aiff)$/i
const UNPLAYABLE = /\.(aif|aiff)$/i

function fileTrack(path: string): Track {
  return { path, title: basename(path, extname(path)), playable: !UNPLAYABLE.test(path) }
}

async function readTrack(path: string): Promise<Track> {
  const fallback = fileTrack(path)
  try {
    const { common, format } = await parseFile(path, { duration: false, skipCovers: true })
    return {
      ...fallback,
      title: common.title ?? fallback.title,
      artist: common.artist,
      bpm: common.bpm,
      key: common.key,
      kbps: format.bitrate && Math.round(format.bitrate / 1000)
    }
  } catch {
    return fallback
  }
}

async function readCover(path: string): Promise<string | null> {
  try {
    const { common } = await parseFile(path, { duration: false })
    const cover = selectCover(common.picture)
    return cover && `data:${cover.format};base64,${Buffer.from(cover.data).toString('base64')}`
  } catch {
    return null
  }
}

async function listAudio(dir: string): Promise<string[]> {
  // unreadable system folders (e.g. .Spotlight-V100 on USB drives) must not abort the scan
  const entries = await readdir(dir, { withFileTypes: true }).catch((): Dirent[] => [])
  const nested = await Promise.all(
    entries
      // dotfiles include macOS "._x.mp3" AppleDouble junk on USB drives
      .filter((e) => !e.name.startsWith('.'))
      .map(async (e) => {
        const path = join(dir, e.name)
        if (e.isDirectory()) return listAudio(path)
        return AUDIO.test(e.name) ? [path] : []
      })
  )
  return nested.flat()
}

async function readTracks(folder: string): Promise<Track[]> {
  // tags are read lazily per track (readTrack), so a scan only lists files
  return (await listAudio(folder)).sort().map(fileTrack)
}

async function missingFolders(folders: string[]): Promise<string[]> {
  const present = await Promise.all(
    folders.map((f) =>
      stat(f).then(
        (s) => s.isDirectory(),
        () => false
      )
    )
  )
  return folders.filter((_, i) => !present[i])
}

async function pickFolder(): Promise<string | null> {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.filePaths[0] ?? null
}

async function exportPlaylist(
  tracks: Track[],
  format: ExportFormat,
  name = 'Picky'
): Promise<string | null> {
  const result = await dialog.showSaveDialog({
    defaultPath: `${name}.${format}`,
    filters: [{ name: format.toUpperCase(), extensions: [format] }]
  })
  if (!result.filePath) return null

  const fileName = basename(result.filePath, extname(result.filePath))
  const content = format === 'nml' ? toNml(tracks, fileName) : toM3u8(tracks)
  await writeFile(result.filePath, content, 'utf8')
  return result.filePath
}

function playlistsFile(): string {
  return join(app.getPath('userData'), 'playlists.json')
}

async function listPlaylists(): Promise<Playlist[]> {
  try {
    const playlists: (Playlist & { folder?: string })[] = JSON.parse(
      await readFile(playlistsFile(), 'utf8')
    )
    // ponytail: playlists saved before multi-folder had a single `folder`, drop once none are left
    return playlists.map(({ folder, ...p }) =>
      folder ? { ...p, folders: [folder], hidden: [] } : p
    )
  } catch (e) {
    // only a missing file means "no playlists": a corrupt one must not be overwritten by the next save
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw e
  }
}

let saving: Promise<unknown> = Promise.resolve()

function updatePlaylists(change: (playlists: Playlist[]) => Playlist[]): Promise<Playlist[]> {
  // writes are chained so two quick swipes never interleave their read-modify-write
  const next = saving.then(async () => {
    const playlists = change(await listPlaylists())
    const file = playlistsFile()
    await writeFile(`${file}.tmp`, JSON.stringify(playlists, null, 2), 'utf8')
    await rename(`${file}.tmp`, file)
    return playlists
  })
  saving = next.catch(() => {})
  return next
}

function savePlaylist(playlist: Playlist): Promise<Playlist[]> {
  // most recently touched first, so the home shows it at the top
  return updatePlaylists((list) => [playlist, ...list.filter((p) => p.name !== playlist.name)])
}

function renamePlaylist(from: string, to: string): Promise<Playlist[]> {
  return updatePlaylists((list) =>
    list.filter((p) => p.name !== to).map((p) => (p.name === from ? { ...p, name: to } : p))
  )
}

function deletePlaylist(name: string): Promise<Playlist[]> {
  return updatePlaylists((list) => list.filter((p) => p.name !== name))
}

function createWindow(): void {
  const window = new BrowserWindow({
    // the player card is max-w-xl (576px): leave a modest margin around it
    width: 760,
    height: 820,
    show: false,
    backgroundColor: '#353535',
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    // the renderer draws a 36px drag strip: mac centres its traffic lights in it, Windows/Linux overlay their buttons on it
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 14, y: 12 } }
      : { titleBarOverlay: { color: '#353535', symbolColor: '#ffffff', height: 36 } }),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.on('ready-to-show', () => window.show())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.matteomiotello.picky')
  // packaged builds take build/icon.icns; this shows the logo in the dock during `yarn dev` too
  if (process.platform === 'darwin') app.dock?.setIcon(icon)
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  ipcMain.handle('pickFolder', () => pickFolder())
  ipcMain.handle('readTracks', (_, folder: string) => readTracks(folder))
  ipcMain.handle('missingFolders', (_, folders: string[]) => missingFolders(folders))
  ipcMain.handle('readTrack', (_, path: string) => readTrack(path))
  ipcMain.handle('readAudio', (_, path: string) => readFile(path))
  ipcMain.handle('readCover', (_, path: string) => readCover(path))
  ipcMain.handle('exportPlaylist', (_, tracks: Track[], format: ExportFormat, name?: string) =>
    exportPlaylist(tracks, format, name)
  )
  ipcMain.handle('listPlaylists', () => listPlaylists())
  ipcMain.handle('savePlaylist', (_, playlist: Playlist) => savePlaylist(playlist))
  ipcMain.handle('renamePlaylist', (_, from: string, to: string) => renamePlaylist(from, to))
  ipcMain.handle('deletePlaylist', (_, name: string) => deletePlaylist(name))

  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
