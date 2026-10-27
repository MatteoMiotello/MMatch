import { useTranslation } from 'react-i18next'
export function KeyHints(): React.JSX.Element {
  const { t } = useTranslation()
  const hints = [
    ['←', 'skip'],
    ['→', 'keep'],
    ['⌫', t('hintBack')],
    ['↑ ↓', '±10 s'],
    ['⇧ ↑ ↓', '±30 s'],
    ['space', t('hintPlay')]
  ]
  return (
    <div className="hidden flex-wrap justify-center gap-4 text-xs text-neutral-500 sm:flex">
      {hints.map(([key, label]) => (
        <span key={key}>
          <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">{key}</kbd> {label}
        </span>
      ))}
    </div>
  )
}
