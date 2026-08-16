import { openDB } from 'idb'
import type { Discovery, InstalledPackage, PackageLevel, PrivacySettings } from '../types'

const DB = 'mensajes-vivos'
const VERSION = 1

export const defaultPrivacy: PrivacySettings = {
  locationEnabled: true,
  cameraOnly: false,
  vibrateOnMatch: false,
  dismissedGeofences: [],
  introSeen: false,
}

function db() {
  return openDB(DB, VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('packages')) database.createObjectStore('packages', { keyPath: 'id' })
      if (!database.objectStoreNames.contains('discoveries')) database.createObjectStore('discoveries', { keyPath: 'id' })
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' })
      if (!database.objectStoreNames.contains('files')) database.createObjectStore('files', { keyPath: 'key' })
    },
  })
}

export async function getPrivacy(): Promise<PrivacySettings> {
  const stored = (await (await db()).get('settings', 'privacy')) as (PrivacySettings & { key?: string }) | undefined
  if (!stored) return defaultPrivacy
  return {
    locationEnabled: stored.locationEnabled,
    cameraOnly: stored.cameraOnly,
    vibrateOnMatch: stored.vibrateOnMatch,
    dismissedGeofences: stored.dismissedGeofences,
    introSeen: stored.introSeen,
  }
}

export async function setPrivacy(next: PrivacySettings) {
  await (await db()).put('settings', { ...next, key: 'privacy' })
}

export async function savePackage(pkg: InstalledPackage) {
  await (await db()).put('packages', pkg)
}

export async function getPackage(id: string) {
  return (await (await db()).get('packages', id)) as InstalledPackage | undefined
}

export async function listPackages() {
  return (await (await db()).getAll('packages')) as InstalledPackage[]
}

export async function deletePackage(id: string) {
  const database = await db()
  await database.delete('packages', id)
  const keys = await database.getAllKeys('files')
  for (const key of keys) {
    if (String(key).startsWith(`${id}/`)) await database.delete('files', key)
  }
}

export async function saveDiscovery(item: Discovery) {
  await (await db()).put('discoveries', item)
}

export async function listDiscoveries() {
  return (await (await db()).getAll('discoveries')) as Discovery[]
}

export async function clearDiscoveries() {
  await (await db()).clear('discoveries')
}

export async function putFile(key: string, blob: Blob) {
  await (await db()).put('files', { key, blob })
}

export async function getFile(key: string) {
  return (await (await db()).get('files', key)) as { key: string; blob: Blob } | undefined
}

export async function estimateUsage(): Promise<{ usage: number; quota: number }> {
  if (navigator.storage?.estimate) {
    const e = await navigator.storage.estimate()
    return { usage: e.usage ?? 0, quota: e.quota ?? 0 }
  }
  return { usage: 0, quota: 0 }
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(0)} MB`
}

export function levelSize(level: PackageLevel, bytesMap: Record<PackageLevel, { bytes: number }>) {
  const order: PackageLevel[] = ['esencial', 'sonoro', 'completo']
  let total = 0
  for (const l of order) {
    total += bytesMap[l].bytes
    if (l === level) break
  }
  return total
}
