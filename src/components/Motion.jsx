import { Fragment, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* ------------------------------------------------------------
   SplitText: metni kelime (ya da harf) bazında maskeli parçalara
   böler; görünür olunca parçalar alttan sırayla yükselir.
   ------------------------------------------------------------ */
export function SplitText({ text, as = 'span', className = '', by = 'word', delay = 0, stagger, play }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  // play verilirse görünürlük dışarıdan kontrol edilir (ör. hero, açılış ekranından sonra)
  const visible = play ?? seen

  useEffect(() => {
    if (play !== undefined) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [play])

  const step = stagger ?? (by === 'char' ? 28 : 70)
  const Tag = as
  const words = text.split(' ')
  let i = 0

  return (
    <Tag ref={ref} className={`split ${visible ? 'is-in' : ''} ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
        <span className="split-word" aria-hidden="true">
          {by === 'char' ? (
            [...word].map((ch, ci) => (
              <span key={ci} className="split-mask">
                <span className="split-inner" style={{ transitionDelay: `${delay + i++ * step}ms` }}>
                  {ch}
                </span>
              </span>
            ))
          ) : (
            <span className="split-mask">
              <span className="split-inner" style={{ transitionDelay: `${delay + i++ * step}ms` }}>
                {word}
              </span>
            </span>
          )}
        </span>
        {/* Boşluk inline-block dışında kalmalı, yoksa tarayıcı onu yutar */}
        {wi < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------
   Özel imleç: küçük nokta + gecikmeli halka.
   [data-cursor="Metin"] olan öğelerin üzerinde halka büyür ve etiket gösterir.
   ------------------------------------------------------------ */
export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches || prefersReducedMotion()) return
    document.documentElement.classList.add('has-cursor')
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pos }
    let raf = 0
    let shown = false

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!shown) {
        shown = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        document.documentElement.classList.add('cursor-visible')
      }
      const target = e.target.closest?.('[data-cursor], a, button, [role="link"]')
      const text = target?.getAttribute?.('data-cursor') || ''
      ring.current.classList.toggle('is-hover', !!target)
      ring.current.classList.toggle('has-label', !!text)
      if (label.current.textContent !== text) label.current.textContent = text
    }
    const onLeave = () => {
      shown = false
      document.documentElement.classList.remove('cursor-visible')
    }
    const onDown = () => ring.current?.classList.add('is-down')
    const onUp = () => ring.current?.classList.remove('is-down')

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor', 'cursor-visible')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

/* ------------------------------------------------------------
   Açılış ekranı: isim + 0→100 sayaç, sonra perde gibi yukarı kalkar.
   Oturum başına bir kez gösterilir.
   ------------------------------------------------------------ */
export function Preloader({ onDone }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('ks-intro') === '1'
    } catch {
      /* depolama kapalı olabilir */
    }
    if (seen || prefersReducedMotion()) {
      setGone(true)
      onDone()
      return
    }
    const start = performance.now()
    const dur = 1150
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        onDone()
        try {
          sessionStorage.setItem('ks-intro', '1')
        } catch {
          /* yoksay */
        }
        setTimeout(() => setGone(true), 1000)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  if (gone) return null
  return (
    <div className={`preloader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader-inner">
        <span className="preloader-name">Kerem Salim</span>
        <span className="preloader-count">{String(count).padStart(3, '0')}</span>
      </div>
      <div className="preloader-bar" style={{ transform: `scaleX(${count / 100})` }} />
    </div>
  )
}
