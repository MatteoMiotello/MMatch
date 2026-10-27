import { useState } from 'react'
import type { KeyNotation } from './music'
import i18n from 'i18next'
import { systemLocale, type Locale } from './i18n'

export type Settings = {
  locale: Locale
  showKey: boolean
  keyNotation: KeyNotation
  showBpm: boolean
  bpmMin: number
  bpmMax: number
  showKbps: boolean
}

const STORAGE_KEY = 'picky.settings'
// ponytail: key from the MMatch days, drop once nobody upgrades from 1.0.0
const LEGACY_STORAGE_KEY = 'mmatch.settings'

const DEFAULTS: Settings = {
  locale: systemLocale(),
  showKey: true,
  keyNotation: 'camelot',
  showBpm: true,
  bpmMin: 65,
  bpmMax: 130,
  showKbps: true
}

function load(): Settings {
  try {
    return {
      ...DEFAULTS,
      ...JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? '{}'
      )
    }
  } catch {
    return DEFAULTS
  }
}

export function useSettings(): [Settings, (settings: Settings) => void] {
  const [settings, setSettings] = useState(() => {
    const saved = load()
    // before the first render, so the app never flashes in the system language
    i18n.changeLanguage(saved.locale)
    return saved
  })

  function update(next: Settings): void {
    setSettings(next)
    i18n.changeLanguage(next.locale)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return [settings, update]
}
