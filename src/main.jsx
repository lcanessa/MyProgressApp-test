import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyAppTheme, readStoredIsDark } from './utils/theme.js'
import { refreshAppViewport } from './hooks/useAppViewport.js'

applyAppTheme(readStoredIsDark())
refreshAppViewport()

// Evita zoom por pellizco en iOS cuando la app está instalada como PWA
;['gesturestart', 'gesturechange', 'gestureend'].forEach((event) => {
  document.addEventListener(event, (e) => e.preventDefault(), { passive: false })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
