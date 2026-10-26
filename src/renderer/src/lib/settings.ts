import { useState } from 'react'
import type { KeyNotation } from './music'

export type Settings = {
  showKey: boolean
  keyNotation: KeyNotation
  showBpm: boolean
  bpmMin: number
  bpmMax: number
  showKbps: boolean
}

const STORAGE_KEY = 'mmatch.settings'

const DEFAULTS: Settings = {
  showKey: true,
  keyNotation: 'camelot',
  showBpm: true,
  bpmMin: 65,
  bpmMax: 130,
  showKbps: true
}

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

export function useSettings(): [Settings, (settings: Settings) => void] {
  const [settings, setSettings] = useState(load)

  function update(next: Settings): void {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return [settings, update]
}
