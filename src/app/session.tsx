import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Discovery, InstalledPackage, PackageLevel, PrivacySettings, VisionResult } from '../types'
import { defaultPrivacy } from '../packages/db'

export interface Session {
  privacy: PrivacySettings
  setPrivacy: (p: PrivacySettings) => void
  coords: { lat: number; lng: number } | null
  setCoords: (c: { lat: number; lng: number } | null) => void
  activePackage: InstalledPackage | null
  setActivePackage: (p: InstalledPackage | null) => void
  pendingLevel: PackageLevel
  setPendingLevel: (l: PackageLevel) => void
  vision: VisionResult | null
  setVision: (v: VisionResult | null) => void
  capture: string | null
  setCapture: (s: string | null) => void
  lastDiscovery: Discovery | null
  setLastDiscovery: (d: Discovery | null) => void
  demoHint: 'coatlicue' | 'ocelotl' | 'xolotl' | 'none'
  setDemoHint: (h: Session['demoHint']) => void
}

const Ctx = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [privacy, setPrivacy] = useState(defaultPrivacy)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [activePackage, setActivePackage] = useState<InstalledPackage | null>(null)
  const [pendingLevel, setPendingLevel] = useState<PackageLevel>('completo')
  const [vision, setVision] = useState<VisionResult | null>(null)
  const [capture, setCapture] = useState<string | null>(null)
  const [lastDiscovery, setLastDiscovery] = useState<Discovery | null>(null)
  const [demoHint, setDemoHint] = useState<Session['demoHint']>('coatlicue')

  const value = useMemo(
    () => ({
      privacy,
      setPrivacy,
      coords,
      setCoords,
      activePackage,
      setActivePackage,
      pendingLevel,
      setPendingLevel,
      vision,
      setVision,
      capture,
      setCapture,
      lastDiscovery,
      setLastDiscovery,
      demoHint,
      setDemoHint,
    }),
    [privacy, coords, activePackage, pendingLevel, vision, capture, lastDiscovery, demoHint],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('session')
  return ctx
}
