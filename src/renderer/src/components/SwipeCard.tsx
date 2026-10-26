import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

export type Decision = 'keep' | 'skip'

export const SWIPE_MS = 300
const SWIPE_THRESHOLD_PX = 120

const SWIPE_OUT: Record<Decision, string> = {
  keep: 'translate-x-[120%] rotate-12 opacity-0',
  skip: '-translate-x-[120%] -rotate-12 opacity-0'
}

type Props = {
  leaving: Decision | null
  onSwipe(decision: Decision): void
  children: ReactNode
}

export function SwipeCard({ leaving, onSwipe, children }: Props): React.JSX.Element {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)

  function onPointerDown(e: PointerEvent<HTMLDivElement>): void {
    // the seek and volume sliders need their own drag
    if ((e.target as HTMLElement).closest('input')) return
    startX.current = e.clientX
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>): void {
    if (dragging) setDragX(e.clientX - startX.current)
  }

  function onPointerUp(): void {
    if (!dragging) return
    setDragging(false)
    if (Math.abs(dragX) < SWIPE_THRESHOLD_PX) setDragX(0)
    else onSwipe(dragX > 0 ? 'keep' : 'skip')
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
        transitionDuration: dragging ? '0ms' : `${SWIPE_MS}ms`
      }}
      className={`w-full max-w-xl cursor-grab touch-none transition ease-out select-none active:cursor-grabbing starting:scale-95 starting:opacity-0 ${leaving ? SWIPE_OUT[leaving] : ''}`}
    >
      {children}
    </div>
  )
}
