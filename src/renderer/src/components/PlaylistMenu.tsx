import { useId } from 'react'

type Item = { label: string; onClick(): void; disabled?: boolean; danger?: boolean }

export function PlaylistMenu({ items }: { items: Item[] }): React.JSX.Element {
  const id = useId()

  return (
    <>
      <button
        popoverTarget={id}
        aria-label="Altre azioni"
        className="relative rounded-full px-2 text-lg leading-none text-neutral-400 hover:bg-neutral-700 hover:text-white"
      >
        ⋯
      </button>
      {/* popover = native light dismiss; position-area anchors it to the invoker button */}
      <div
        id={id}
        popover="auto"
        className="inset-auto m-0 mt-1 w-44 rounded-xl border border-neutral-700 bg-neutral-900 p-1 text-sm text-neutral-100 shadow-xl [position-area:bottom_span-left]"
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
