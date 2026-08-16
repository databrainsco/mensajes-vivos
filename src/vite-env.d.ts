/// <reference types="vite-plugin-pwa/client" />
interface Navigator {
  getBattery?: () => Promise<{ level: number }>
}
