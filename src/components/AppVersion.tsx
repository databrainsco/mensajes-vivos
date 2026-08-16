export function AppVersion() {
  return (
    <p className="version-bar" aria-label={`Versión desplegada ${__APP_VERSION__}`}>
      {__APP_VERSION__}
    </p>
  )
}
