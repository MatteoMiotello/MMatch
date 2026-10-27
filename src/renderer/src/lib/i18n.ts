import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  tagline: 'Listen, match, play.',
  trackCount_one: '{{count}} track',
  trackCount_other: '{{count}} tracks',
  yourPlaylists: 'Your playlists',
  searchPlaylists: 'Search playlists',
  noMatches: 'No playlists match "{{query}}".',
  noPlaylists: 'No playlists yet: create one and pick the folder to listen to.',
  newPlaylist: 'New',
  readingTracks: 'Reading tracks…',
  playlistName: 'Playlist name',
  nameTaken: 'A playlist with this name already exists',
  next: 'Next →',
  overwrite: 'Overwrite the playlist "{{name}}"?',
  copyName: '{{name}} copy',
  copyNameNumbered: '{{name}} copy {{n}}',
  confirmDelete: 'Delete the playlist "{{name}}"? The audio files stay where they are.',
  confirmCancelRename: 'Discard the name change?',
  rename: 'Rename',
  clone: 'Clone',
  exportAs: 'Export {{format}}',
  export: 'Export',
  delete: 'Delete',
  moreActions: 'More actions',
  open: 'Open {{name}}',
  opening: 'Opening…',
  home: 'Home',
  addFolder: '+ Folder',
  showFolder: 'Show: {{folder}}',
  hideFolder: 'Hide: {{folder}}',
  folderMissing: 'Not found: {{folder}}. Click to choose where it is now',
  folderNotFound: 'Folder not found',
  folderNotFoundHelp:
    'Choose where it is now to continue. Tracks already seen and your keeps stay.',
  chooseFolder: 'Choose folder',
  retry: 'Reconnected the drive? Retry',
  finished_one: 'Done! {{count}} track kept.',
  finished_other: 'Done! {{count}} tracks kept.',
  unknownArtist: 'Unknown artist',
  analyzing: 'Analyzing…',
  unplayable: "AIFF can't be played: decide or move on.",
  position: 'Position',
  mute: 'Mute',
  unmute: 'Unmute',
  openKeepList: 'Open keep list ({{count}})',
  close: 'Close',
  remove: 'Remove {{title}}',
  hintBack: 'back',
  hintPlay: 'play/pause',
  settings: 'Settings',
  language: 'Language',
  showKey: 'Show key',
  notation: 'Notation',
  notationMusical: 'Musical (Am)',
  showBpm: 'Show BPM',
  bpmRange: 'Analysis range',
  bpmRangeHelp:
    'Only for computed BPM: a halved or doubled tempo is folded into the range. Tag values stay as they are.',
  showKbps: 'Show kbps'
}

const it: typeof en = {
  tagline: 'Listen, match, play.',
  trackCount_one: '{{count}} traccia',
  trackCount_other: '{{count}} tracce',
  yourPlaylists: 'Le tue playlist',
  searchPlaylists: 'Cerca playlist',
  noMatches: 'Nessuna playlist corrisponde a "{{query}}".',
  noPlaylists: 'Nessuna playlist: creane una nuova e scegli la cartella da ascoltare.',
  newPlaylist: 'Nuova',
  readingTracks: 'Lettura tracce…',
  playlistName: 'Nome playlist',
  nameTaken: 'Esiste già una playlist con questo nome',
  next: 'Avanti →',
  overwrite: 'Sovrascrivere la playlist "{{name}}"?',
  copyName: '{{name}} copia',
  copyNameNumbered: '{{name}} copia {{n}}',
  confirmDelete: 'Eliminare la playlist "{{name}}"? I file audio restano dove sono.',
  confirmCancelRename: 'Annullare la modifica del nome?',
  rename: 'Rinomina',
  clone: 'Clona',
  exportAs: 'Esporta {{format}}',
  export: 'Esporta',
  delete: 'Elimina',
  moreActions: 'Altre azioni',
  open: 'Apri {{name}}',
  opening: 'Apertura…',
  home: 'Home',
  addFolder: '+ Cartella',
  showFolder: 'Mostra: {{folder}}',
  hideFolder: 'Oscura: {{folder}}',
  folderMissing: 'Non trovata: {{folder}}. Clicca per scegliere dove si trova ora',
  folderNotFound: 'Cartella non trovata',
  folderNotFoundHelp:
    'Per continuare scegli dove si trova ora. Le track già viste e le keep restano valide.',
  chooseFolder: 'Scegli cartella',
  retry: 'Hai ricollegato il disco? Riprova',
  finished_one: 'Finito! {{count}} traccia keep.',
  finished_other: 'Finito! {{count}} tracce keep.',
  unknownArtist: 'Artista sconosciuto',
  analyzing: 'Analisi…',
  unplayable: 'AIFF non riproducibile: decidi o passa oltre.',
  position: 'Posizione',
  mute: 'Muto',
  unmute: 'Riattiva audio',
  openKeepList: 'Apri lista keep ({{count}})',
  close: 'Chiudi',
  remove: 'Rimuovi {{title}}',
  hintBack: 'indietro',
  hintPlay: 'play/pausa',
  settings: 'Impostazioni',
  language: 'Lingua',
  showKey: 'Mostra key',
  notation: 'Notazione',
  notationMusical: 'Musicale (Am)',
  showBpm: 'Mostra BPM',
  bpmRange: 'Range analisi',
  bpmRangeHelp:
    'Solo per i BPM calcolati: un tempo dimezzato o doppio viene riportato nel range. Quelli dei tag restano invariati.',
  showKbps: 'Mostra kbps'
}

const resources = { en: { translation: en }, it: { translation: it } }
export type Locale = keyof typeof resources

// each language named in itself, so it stays recognisable whatever the current one is
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' }

export function systemLocale(): Locale {
  return navigator.language.startsWith('it') ? 'it' : 'en'
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}

i18n.on('languageChanged', (lng) => (document.documentElement.lang = lng))

i18n.use(initReactI18next).init({
  resources,
  lng: systemLocale(),
  fallbackLng: 'en',
  // React already escapes rendered text
  interpolation: { escapeValue: false }
})
