import { useCallback, useEffect, useState } from 'react'

/* Basit path tabanlı yönlendirme: sayfa yenilenmeden history API ile geçiş yapar */
export function useRoute() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to)
      setPath(to)
    }
    window.scrollTo(0, 0)
  }, [])

  return { path, navigate }
}
