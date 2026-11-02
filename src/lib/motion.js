import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null

/** Lenis yumuşak kaydırmayı başlatır ve GSAP ScrollTrigger ile senkronlar. */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.95,
    // #anchor linklerini Lenis yönetir; menü payı CSS'teki scroll-padding-top'tan gelir
    anchors: true,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

/** Sayfa başına anında dön (rota değişimlerinde). */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

export { gsap, ScrollTrigger }
