export function Cover({ src }: { src: string | null }): React.JSX.Element {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center bg-black/30 text-6xl text-neutral-600">
        ♪
      </div>
    )
  }

  return <img src={src} alt="" draggable={false} className="size-full object-cover" />
}
