# MMatch

App desktop "Tinder per tracce": il DJ sceglie una cartella, ascolta una traccia alla volta e decide **keep** o **skip**. Le tracce keep si esportano come playlist.

## Vocabolario
Usa questi termini identici in codice, UI e discussione:
- **track**: un file audio della cartella scelta
- **keep** (`→`) / **skip** (`←`): le due decisioni
- **seek** (`↑` +10 s, `↓` −10 s)
- **export**: scrittura della lista keep in M3U8 o NML, formato scelto dall'utente al momento

## Stack
Electron + React (electron-vite), TypeScript strict, Tailwind CSS v4 (plugin `@tailwindcss/vite`). Stile solo con classi Tailwind nel JSX; un file CSS unico con `@import "tailwindcss"`. Stato locale con `useState`/`useReducer`, app a schermata singola. Player = `<audio>` nativo. BPM e key da tag con `music-metadata`; quando il tag manca li calcola `essentia.js` in un Web Worker (`src/renderer/src/lib/analysis.ts`).

## Confini main / renderer
Il main process possiede filesystem, metadata ed export. Il renderer vede soltanto le funzioni di `Api` in `src/shared/types.ts`, esposte dal preload su `window.api`. L'audio arriva al renderer come bytes (`readAudio`) e diventa un blob URL: così il seek funziona senza protocolli custom. Ogni nuova capacità di sistema passa da qui come funzione esplicita.
## Gotcha
- **AIFF**: Chromium non lo riproduce (mp3, wav, flac, m4a, ogg sì). Mostra le track AIFF come non riproducibili; conversione ffmpeg solo su richiesta.
- **Percorsi NML** (Traktor): `LOCATION VOLUME="Macintosh HD" DIR="/:Users/:matteo/:Music/:" FILE="x.mp3"` e `PRIMARYKEY KEY="Macintosh HD/:Users/:matteo/:Music/:x.mp3"`. Ogni separatore è `/:`.
- **M3U8**: `#EXTM3U` in testa, percorsi assoluti, UTF-8.

## Verifica
Le funzioni di export (M3U8, NML, conversione percorsi) sono coperte da `test/export.test.ts` (`yarn test`): ogni modifica all'export lascia `yarn test` e `yarn typecheck` verdi.

## Stile codice
- Componenti piccoli e piatti: una responsabilità, JSX leggibile dall'alto in basso. Quando il JSX si annida oltre 2-3 livelli, estrai un componente.
- Condizioni con early return o `&&`; il ternario solo per scelte semplici a due valori, mai annidato.
- Codice auto-esplicativo con nomi chiari; commento solo per il *perché* non ovvio (es. un gotcha), in una riga.

## Lingua
Codice e identificatori in inglese; risposte all'utente in italiano.
