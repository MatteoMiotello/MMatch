import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

export type Decision = 'keep' | 'skip'

export const SWIPE_MS = 300
const SWIPE_THRESHOLD_PX = 120

const SWIPE_OUT: Record<Decision, string> = {
  keep: 'translate-x-[120%] rotate-12 opacity-0',
  skip: '-translate-x-[120%] -rotate-12 opacity-0'
}

const BADGE: Record<Decision, string> = {
  keep: 'left-4 -rotate-12 border-primary text-primary',
  skip: 'right-4 rotate-12 border-neutral-300 text-neutral-300'
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

  // fades in with the drag, fully visible once the decision is made (keys included)
  function badgeOpacity(decision: Decision): number {
    if (leaving) return leaving === decision ? 1 : 0
    const toward = decision === 'keep' ? dragX : -dragX
    return Math.min(Math.max(toward / SWIPE_THRESHOLD_PX, 0), 1)
  }

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
      className={`relative w-full max-w-xl cursor-grab touch-none transition ease-out select-none active:cursor-grabbing starting:scale-95 starting:opacity-0 ${leaving ? SWIPE_OUT[leaving] : ''}`}
    >
      <Badge decision="keep" opacity={badgeOpacity('keep')} />
      <Badge decision="skip" opacity={badgeOpacity('skip')} />
      {children}
    </div>
  )
}

function Badge({ decision, opacity }: { decision: Decision; opacity: number }): React.JSX.Element {
  return (
    <span
      style={{ opacity }}
      className={`pointer-events-none absolute top-6 z-10 rounded-xl border-4 bg-neutral-950 px-4 py-1 text-3xl font-black tracking-wider uppercase sm:text-4xl ${BADGE[decision]}`}
    >
      {decision}
    </span>
  )
}
