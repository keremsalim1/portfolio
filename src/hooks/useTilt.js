import { useEffect, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Mouse'a göre 3D eğilme (tilt) + ışık yansıması (glare) efekti.
 * Elemana ref ver; CSS içinde --rx / --ry (derece) ve --gx / --gy (%)
 * değişkenlerini kullanır. Dokunmatik cihazlarda ve reduced-motion'da devre dışı.
 */
export function useTilt({ max = 10, scale = 1.02 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    // Dokunmatik ana giriş ise tilt'i atla
    if (window.matchMedia('(hover: none)').matches) return

    let raf = 0

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width // 0..1
      const py = (e.clientY - rect.top) / rect.height // 0..1
      const ry = (px - 0.5) * 2 * max // sağ/sol -> Y ekseni
      const rx = (0.5 - py) * 2 * max // yukarı/aşağı -> X ekseni

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
        el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
        el.style.setProperty('--tilt-scale', String(scale))
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
        el.style.setProperty('--glare', '1')
      })
    }

    const onLeave = () => {
      cancelAnimationFrame(raf)
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--tilt-scale', '1')
      el.style.setProperty('--glare', '0')
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [max, scale])

  return ref
}
