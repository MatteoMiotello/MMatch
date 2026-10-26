import type { KeyNotation } from '../lib/music'
import type { Settings } from '../lib/settings'

// essentia's RhythmExtractor accepts tempos only in this range
const BPM_LIMITS = { min: 40, max: 208 }
const SETTINGS_ID = 'settings'

const NOTATIONS: { value: KeyNotation; label: string }[] = [
  { value: 'camelot', label: 'Camelot (8A)' },
  { value: 'musical', label: 'Musicale (Am)' },
  { value: 'openkey', label: 'Open Key (1m)' }
]

export function SettingsButton({ className }: { className: string }): React.JSX.Element {
  return (
    <button popoverTarget={SETTINGS_ID} aria-label="Impostazioni" className={className}>
      <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
        <path d="M4 7h16M4 17h16" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2.5" className="fill-neutral-800" />
        <circle cx="15" cy="17" r="2.5" className="fill-neutral-800" />
      </svg>
    </button>
  )
}

type Props = { settings: Settings; onChange(settings: Settings): void }

export function SettingsPanel({ settings, onChange }: Props): React.JSX.Element {
  const set = (patch: Partial<Settings>): void => onChange({ ...settings, ...patch })

  return (
    <div
      id={SETTINGS_ID}
      popover="auto"
      className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-700 bg-neutral-900 p-5 text-neutral-100 shadow-2xl backdrop:bg-black/50"
    >
      <h2 className="mb-4 text-lg font-semibold">Impostazioni</h2>

      <section className="flex flex-col gap-3 border-b border-neutral-800 pb-4">
        <Toggle
          label="Mostra key"
          checked={settings.showKey}
          onChange={(showKey) => set({ showKey })}
        />
        <label className="flex items-center justify-between gap-3 text-sm">
          Notazione
          <select
            value={settings.keyNotation}
            disabled={!settings.showKey}
            onChange={(e) => set({ keyNotation: e.target.value as KeyNotation })}
            className="rounded-lg bg-neutral-800 px-2 py-1.5 disabled:opacity-30"
          >
            {NOTATIONS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-col gap-3 py-4">
        <Toggle
          label="Mostra BPM"
          checked={settings.showBpm}
          onChange={(showBpm) => set({ showBpm })}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          Range analisi
          <span className="flex items-center gap-2">
            <BpmInput
              value={settings.bpmMin}
              disabled={!settings.showBpm}
              max={settings.bpmMax}
              onChange={(bpmMin) => set({ bpmMin })}
            />
            –
            <BpmInput
              value={settings.bpmMax}
              disabled={!settings.showBpm}
              min={settings.bpmMin}
              onChange={(bpmMax) => set({ bpmMax })}
            />
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          Solo per i BPM calcolati: un tempo dimezzato o doppio viene riportato nel range. Quelli
          dei tag restano invariati.
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-800 pt-4">
        <Toggle
          label="Mostra kbps"
          checked={settings.showKbps}
          onChange={(showKbps) => set({ showKbps })}
        />
      </section>
    </div>
  )
}

type ToggleProps = { label: string; checked: boolean; onChange(checked: boolean): void }

function Toggle({ label, checked, onChange }: ToggleProps): React.JSX.Element {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-medium">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-fuchsia-600"
      />
    </label>
  )
}

type BpmInputProps = {
  value: number
  disabled: boolean
  min?: number
  max?: number
  onChange(value: number): void
}

function BpmInput({ value, disabled, min, max, onChange }: BpmInputProps): React.JSX.Element {
  const lower = min ?? BPM_LIMITS.min
  const upper = max ?? BPM_LIMITS.max

  return (
    <input
      type="number"
      // uncontrolled, so typing "1" on the way to "100" isn't rejected mid-edit
      defaultValue={value}
      min={lower}
      max={upper}
      disabled={disabled}
      onChange={(e) => {
        const next = e.target.valueAsNumber
        if (next >= lower && next <= upper) onChange(next)
      }}
      className="w-16 rounded-lg bg-neutral-800 px-2 py-1.5 text-center tabular-nums disabled:opacity-30"
    />
  )
}
