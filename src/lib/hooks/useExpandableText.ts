import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from '@/lib/helper'

const DURATION_MS = 250
// Below the sticky header (h-12) plus a little breathing room.
const SCROLL_TOP_OFFSET_PX = 64

type Phase = 'expanding' | 'collapsing' | null

// useExpandableText drives a "See more" / "See less" paragraph clamped with a
// `line-clamp-*` class. line-clamp can't be transitioned, so the height is
// animated between measured values instead:
//
//   - expand: pin the clamped height, drop the clamp, animate to scrollHeight,
//     then clear the inline height so the text reflows on resize.
//   - collapse: pin the current height, animate to the clamped height (measured
//     by briefly re-applying the class), then re-apply the clamp so the
//     ellipsis comes back.
//
// A click mid-animation reverses from the current height. `expanded` (the
// label and aria-expanded) flips on click, not when the animation ends. With
// reduced motion on, both directions are instant.
//
// `clampClass` is the class applied while collapsed; `content` is the text,
// and a change to it collapses the paragraph again instantly. `isLong` is true
// only when the clamped text overflows, re-measured on resize and once web
// fonts have loaded.
export function useExpandableText<T extends HTMLElement>(
  content: string,
  clampClass: string,
) {
  const ref = useRef<T>(null)
  const [expanded, setExpanded] = useState(false)
  // Whether clampClass is applied. Off from the start of an expand until the
  // end of the next collapse.
  const [clamp, setClamp] = useState(true)
  const [overflowing, setOverflowing] = useState(false)
  const phase = useRef<Phase>(null)
  // The transitionend listener of the running animation, if any.
  const onEnd = useRef<((e: TransitionEvent) => void) | null>(null)

  const clearInline = (el: T) => {
    if (onEnd.current) el.removeEventListener('transitionend', onEnd.current)
    onEnd.current = null
    el.style.removeProperty('height')
    el.style.removeProperty('overflow')
    el.style.removeProperty('transition')
  }

  // Collapse instantly when the text changes (e.g. another location).
  const prevContent = useRef(content)
  useEffect(() => {
    if (prevContent.current === content) return
    prevContent.current = content
    phase.current = null
    if (ref.current) clearInline(ref.current)
    setExpanded(false)
    setClamp(true)
  }, [content])

  // "See more" shows only when the clamped text actually overflows.
  useEffect(() => {
    const el = ref.current
    if (!el || !clamp) return
    let active = true
    const measure = () => {
      if (active) setOverflowing(el.scrollHeight > el.clientHeight + 1)
    }
    measure()
    void document.fonts.ready.then(measure)
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(el)
    return () => {
      active = false
      observer?.disconnect()
    }
  }, [content, clampClass, clamp])

  const toggle = useCallback(() => {
    const el = ref.current
    const expand = !expanded
    const animate = !!el && !prefersReducedMotion()

    if (!expand && el) {
      // Long text read to the end: bring its top back below the header.
      const top = el.getBoundingClientRect().top
      if (top < SCROLL_TOP_OFFSET_PX) {
        window.scrollBy({
          top: top - SCROLL_TOP_OFFSET_PX,
          behavior: animate ? 'smooth' : 'auto',
        })
      }
    }

    if (!el || !animate) {
      phase.current = null
      if (el) clearInline(el)
      setExpanded(expand)
      setClamp(!expand)
      return
    }

    // Pin the current height (mid-animation too, so a reversal doesn't snap).
    const from = el.getBoundingClientRect().height
    el.style.transition = 'none'
    el.style.overflow = 'hidden'
    el.style.height = `${from}px`

    let to: number
    if (expand) {
      flushSync(() => {
        setExpanded(true)
        setClamp(false)
      })
      to = el.scrollHeight
    } else {
      // The clamp is off here (fully or partly expanded). Apply it for one
      // synchronous measurement, then put the pinned height back.
      el.style.removeProperty('height')
      el.classList.add(clampClass)
      to = el.getBoundingClientRect().height
      el.classList.remove(clampClass)
      el.style.height = `${from}px`
      setExpanded(false)
    }

    if (Math.abs(to - from) < 1) {
      phase.current = null
      if (!expand) flushSync(() => setClamp(true))
      clearInline(el)
      return
    }

    phase.current = expand ? 'expanding' : 'collapsing'
    // One listener per element at a time; a reversal keeps the same one and
    // only the latest transition's end finishes the animation.
    if (!onEnd.current) {
      const handler = (e: TransitionEvent) => {
        if (e.target !== el || e.propertyName !== 'height') return
        const done = phase.current
        phase.current = null
        if (done === 'collapsing') flushSync(() => setClamp(true))
        clearInline(el)
      }
      onEnd.current = handler
      el.addEventListener('transitionend', handler)
    }
    void el.offsetHeight // commit the pinned height before transitioning
    el.style.transition = `height ${DURATION_MS}ms ease-out`
    el.style.height = `${to}px`
  }, [expanded, clampClass])

  return {
    ref,
    expanded,
    // Apply clampClass to the paragraph while this is true.
    clamp,
    // Show the toggle: the clamped text overflows, or it is (being) expanded.
    isLong: overflowing || expanded || !clamp,
    toggle,
  }
}
