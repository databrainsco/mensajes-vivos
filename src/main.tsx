import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

function setupPwa() {
  if (!('serviceWorker' in navigator)) return
  const hadController = Boolean(navigator.serviceWorker.controller)

  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
    .then((registration) => {
      const ping = () => {
        void registration.update()
      }
      window.setInterval(ping, 30_000)
      window.addEventListener('focus', ping)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') ping()
      })
    })

  if (hadController) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
}

setupPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
