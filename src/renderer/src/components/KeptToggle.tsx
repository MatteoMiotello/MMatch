export function KeptToggle({
  count,
  onClick
}: {
  count: number
  onClick(): void
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-label={`Apri lista keep (${count})`}
      className="fixed top-4 right-4 rounded-full bg-neutral-800 p-3 hover:bg-neutral-700"
    >
      <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2">
        <path d="M3 6h12M3 12h12M3 18h7M17 18V6l4-1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="18" r="2" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-xs font-semibold tabular-nums">
          {count}
        </span>
      )}
    </button>
  )
}
