import { useEffect, useState } from 'react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Daktilo (typewriter) efekti: verilen metinleri sırayla yazar, siler,
 * bir sonrakine geçer. reduced-motion açıksa ilk metni sabit gösterir.
 */
export default function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  pause = 1600,
}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduced()) {
      setText(words[0])
      return
    }
    const full = words[index % words.length]

    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % words.length)
      return
    }

    const t = setTimeout(
      () => {
        setText((cur) =>
          deleting ? full.slice(0, cur.length - 1) : full.slice(0, cur.length + 1)
        )
      },
      deleting ? deleteSpeed : typeSpeed
    )
    return () => clearTimeout(t)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause])

  return (
    <span className="typewriter">
      {text}
      <span className="type-caret" aria-hidden="true" />
    </span>
  )
}
