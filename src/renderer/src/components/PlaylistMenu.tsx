import { useId } from 'react'
import { useTranslation } from 'react-i18next'

type Item = { label: string; onClick(): void; disabled?: boolean; danger?: boolean }

type Props = { items: Item[]; label?: string; disabled?: boolean }

// without a label it's the ⋯ "more actions" button
export function PlaylistMenu({ items, label, disabled }: Props): React.JSX.Element {
  const id = useId()

  return (
    <>
      {label && <LabelTrigger menuId={id} label={label} disabled={disabled} />}
      {!label && <MoreTrigger menuId={id} />}
      {/* popover = native light dismiss; position-area anchors it to the invoker button */}
      <div
        id={id}
        popover="auto"
        className="inset-auto m-0 mt-1 w-44 rounded-xl border border-neutral-700 bg-neutral-900 p-1 text-sm text-neutral-100 shadow-xl [position-area:bottom_span-left] [position-try-fallbacks:flip-block]"
      >
        {items.map((item) => (
          <MenuItem key={item.label} item={item} menuId={id} />
        ))}
      </div>
    </>
  )
}

function MenuItem({ item, menuId }: { item: Item; menuId: string }): React.JSX.Element {
  return (
    <button
      popoverTarget={menuId}
      popoverTargetAction="hide"
      disabled={item.disabled}
      onClick={item.onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-800 disabled:opacity-30 ${item.danger ? 'text-red-400' : ''}`}
    >
      {item.label}
    </button>
  )
}

function MoreTrigger({ menuId }: { menuId: string }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <button
      popoverTarget={menuId}
      aria-label={t('moreActions')}
      className="relative rounded-full px-2 text-lg leading-none text-neutral-400 hover:bg-neutral-700 hover:text-white"
    >
      ⋯
    </button>
  )
}

type LabelTriggerProps = { menuId: string; label: string; disabled?: boolean }

function LabelTrigger({ menuId, label, disabled }: LabelTriggerProps): React.JSX.Element {
  return (
    <button
      popoverTarget={menuId}
      disabled={disabled}
      className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-light disabled:opacity-30"
    >
      {label} ▾
    </button>
  )
}
