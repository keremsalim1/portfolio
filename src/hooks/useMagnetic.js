import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* ------------------------------------------------------------
   useMagnetic: imleç yaklaşınca eleman ona doğru hafifçe çekilir.
   ------------------------------------------------------------ */
export function useMagnetic(strength = 0.3) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (window.matchMedia('(hover: none)').matches) return
    let raf = 0
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) * strength
      const y = (e.clientY - (r.top + r.height / 2)) * strength
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])
  return ref
}
