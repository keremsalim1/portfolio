import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// react-three-fiber hâlâ three.js'in deprecated ettiği THREE.Clock'u kullanıyor.
// Kütüphane kaynaklı, zararsız bu tek uyarıyı sustur; diğer tüm uyarılar geçsin.
const _warn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Timer')) return
  _warn(...args)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
