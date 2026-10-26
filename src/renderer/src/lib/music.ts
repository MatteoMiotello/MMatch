export type KeyNotation = 'camelot' | 'musical' | 'openkey'

// index = Camelot number - 1; pitch classes with C = 0
const MINOR_PITCHES = [8, 3, 10, 5, 0, 7, 2, 9, 4, 11, 6, 1]
const MAJOR_PITCHES = [11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9, 4]
const MINOR_NAMES = ['Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm', 'Am', 'Em', 'Bm', 'F#m', 'Dbm']
const MAJOR_NAMES = ['B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E']
const NOTE_PITCHES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

type Key = { camelot: number; minor: boolean }

function parseKey(raw: string): Key | null {
  const text = raw.trim().replace('♯', '#').replace('♭', 'b')

  const camelot = text.match(/^(\d{1,2})\s*([AB])$/i)
  if (camelot) return { camelot: Number(camelot[1]), minor: camelot[2].toUpperCase() === 'A' }

  // Open Key 1d = C major = Camelot 8B
  const openKey = text.match(/^(\d{1,2})\s*([MD])$/i)
  if (openKey) {
    const camelotNumber = ((Number(openKey[1]) + 6) % 12) + 1
    return { camelot: camelotNumber, minor: openKey[2].toLowerCase() === 'm' }
  }

  const musical = text.match(/^([A-G])([#b]?)\s*(m|min|minor|maj|major)?$/i)
  if (!musical) return null
  const accidental = { '#': 1, b: -1 }[musical[2]] ?? 0
  const pitch = (NOTE_PITCHES[musical[1].toUpperCase()] + accidental + 12) % 12
  // a lone "m" is minor; "maj"/"major" or no suffix is major
  const minor = /^(m|min|minor)$/i.test(musical[3] ?? '')
  const camelotNumber = (minor ? MINOR_PITCHES : MAJOR_PITCHES).indexOf(pitch) + 1
  return { camelot: camelotNumber, minor }
}

export function formatKey(raw: string, notation: KeyNotation): string {
  const key = parseKey(raw)
  if (!key || key.camelot < 1 || key.camelot > 12) return raw

  if (notation === 'camelot') return `${key.camelot}${key.minor ? 'A' : 'B'}`
  if (notation === 'openkey') return `${((key.camelot + 4) % 12) + 1}${key.minor ? 'm' : 'd'}`
  return (key.minor ? MINOR_NAMES : MAJOR_NAMES)[key.camelot - 1]
}

// detectors often land on half or double tempo: move by octaves into the chosen range
export function foldBpm(bpm: number, min: number, max: number): number {
  if (bpm <= 0) return bpm
  let folded = bpm
  while (folded < min && folded * 2 <= max) folded *= 2
  while (folded > max && folded / 2 >= min) folded /= 2
  return folded
}
