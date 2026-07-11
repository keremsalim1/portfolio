import { useEffect, useState } from 'react'

/**
 * Görünümdeki aktif bölümün id'sini döndürür (aktif menü vurgusu için).
 * Bölümün üst kısmı viewport'un ~%40'ına gelince aktif sayılır.
 */
export function useScrollSpy(ids, offset = 0.4) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!sections.length) return

    const onScroll = () => {
      const line = window.innerHeight * offset
      let current = sections[0].id
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= line) current = sec.id
      }
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, offset])

  return active
}

/** Sayfanın ne kadarının kaydırıldığını 0..1 arası döndürür. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? h.scrollTop / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return progress
}
