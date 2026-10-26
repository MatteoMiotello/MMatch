const HINTS = [
  ['←', 'skip'],
  ['→', 'keep'],
  ['⌫', 'indietro'],
  ['↑ ↓', '±10 s'],
  ['⇧ ↑ ↓', '±30 s'],
  ['space', 'play/pausa']
]

export function KeyHints(): React.JSX.Element {
  return (
    <div className="hidden flex-wrap justify-center gap-4 text-xs text-neutral-500 sm:flex">
      {HINTS.map(([key, label]) => (
        <span key={key}>
          <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">{key}</kbd> {label}
        </span>
      ))}
    </div>
  )
}
