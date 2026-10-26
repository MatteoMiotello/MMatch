import { useId, useRef } from 'react'

type Props = {
  loading: boolean
  taken(name: string): boolean
  onCreate(name: string): void
}

export function NewPlaylist({ loading, taken, onCreate }: Props): React.JSX.Element {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  function submit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const input = inputRef.current!
    const name = input.value.trim()
    input.setCustomValidity(taken(name) ? 'Esiste già una playlist con questo nome' : '')
    if (!input.reportValidity()) return
    e.currentTarget.hidePopover()
    input.value = ''
    onCreate(name)
  }

  return (
    <>
      <button
        popoverTarget={id}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 font-semibold transition-colors hover:bg-primary-light disabled:opacity-60"
      >
        <span className="text-xl leading-none">+</span>
        {loading ? 'Lettura tracce…' : 'Nuova'}
      </button>
      <form
        id={id}
        popover="auto"
        onSubmit={submit}
        // the popover is always mounted, so focus on every open rather than on mount
        onToggle={(e) => e.newState === 'open' && inputRef.current?.focus()}
        className="inset-auto m-0 mt-2 w-80 max-w-[calc(100vw-2rem)] [position-try-fallbacks:flip-inline] rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-neutral-100 shadow-2xl [position-area:bottom_span-left]"
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nome playlist
          <input
            ref={inputRef}
            required
            onInput={(e) => e.currentTarget.setCustomValidity('')}
            className="rounded-lg bg-neutral-800 px-3 py-2 font-normal"
          />
        </label>
        <button className="mt-3 w-full rounded-lg bg-primary text-white py-2 text-sm font-medium hover:bg-primary-light">
          Avanti →
        </button>
      </form>
    </>
  )
}
