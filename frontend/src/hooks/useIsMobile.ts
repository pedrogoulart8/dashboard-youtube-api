import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
      setIsMobile(mql.matches)
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }

    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}
