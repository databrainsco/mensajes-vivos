import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './app/session'
import { SplashScreen } from './screens/SplashScreen'
import { IntroScreen } from './screens/IntroScreen'
import { PermissionsScreen } from './screens/PermissionsScreen'
import { CameraScreen } from './screens/CameraScreen'
import { ZoneScreen } from './screens/ZoneScreen'
import { DownloadChoiceScreen } from './screens/DownloadChoiceScreen'
import { DownloadProgressScreen } from './screens/DownloadProgressScreen'
import { AnalysisScreen } from './screens/AnalysisScreen'
import { ResultScreen } from './screens/ResultScreen'
import { SymbolsScreen } from './screens/SymbolsScreen'
import { MapScreen } from './screens/MapScreen'
import { SoundScreen } from './screens/SoundScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { PackagesScreen } from './screens/PackagesScreen'
import { PrivacyScreen } from './screens/PrivacyScreen'
import { ModelScreen } from './screens/ModelScreen'

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/intro" element={<IntroScreen />} />
          <Route path="/permisos" element={<PermissionsScreen />} />
          <Route path="/camara" element={<CameraScreen />} />
          <Route path="/zona" element={<ZoneScreen />} />
          <Route path="/descarga" element={<DownloadChoiceScreen />} />
          <Route path="/progreso" element={<DownloadProgressScreen />} />
          <Route path="/analisis" element={<AnalysisScreen />} />
          <Route path="/resultado" element={<ResultScreen />} />
          <Route path="/simbolos" element={<SymbolsScreen />} />
          <Route path="/mapa" element={<MapScreen />} />
          <Route path="/sonido" element={<SoundScreen />} />
          <Route path="/biblioteca" element={<LibraryScreen />} />
          <Route path="/paquetes" element={<PackagesScreen />} />
          <Route path="/privacidad" element={<PrivacyScreen />} />
          <Route path="/modelo" element={<ModelScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </SessionProvider>
  )
}
