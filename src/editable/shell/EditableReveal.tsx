'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  index?: number
  as?: 'div' | 'section' | 'article' | 'span' | 'li'
  className?: string
  delayStep?: number
  once?: boolean
  style?: CSSProperties
}

/*
  Scroll-triggered fade + slide-up. JS-off visitors see content immediately —
  the "is-primed" class (which hides the element) is only applied AFTER mount,
  so first paint stays visible for search engines and no-JS clients.
*/
export function EditableReveal({
  children,
  index = 0,
  as = 'div',
  className = '',
  delayStep = 90,
  once = true,
  style,
}: EditableRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const node = ref.current
    if (!node) return

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [mounted, once])

  const primed = mounted
  const classes = ['editable-reveal', primed ? 'is-primed' : '', visible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  const mergedStyle: CSSProperties = {
    ...style,
    transitionDelay: primed && !visible ? `${index * delayStep}ms` : undefined,
  }

  const Tag = as as 'div'
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={classes} style={mergedStyle}>
      {children}
    </Tag>
  )
}
