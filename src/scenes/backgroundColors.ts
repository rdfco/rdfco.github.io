import { Color } from 'three'

export const defaultBackgroundColors = {
  sceneBackground: '#000000',
  skyLight: '#3e9bb7', skyDark: '#081219', stars: '#ffffff', aurora: '#3e9bb7',
  mountain: '#ffffff', mountainFog: '#868b80', mountainBackGlow: '#3e9bb7',
  horizonGlow: '#3e9bb7', horizonDark: '#081219',
  risingLines: '#a1d7ff', powerLines: '#a1d7ff', pathLines: '#84d5ff',
  hologram: '#8fc1e5', hologramGlow: '#6bfeff', gridBackground: '#1a697f',
  gridLines: '#4e8399', gridAccent: '#7a9fb6', gridPoints: '#519abc', transition: '#dbd8d4',
} as const

export type BackgroundColorKey = keyof typeof defaultBackgroundColors
type UserConfig = Partial<Record<BackgroundColorKey, unknown>> & { brightness?: Partial<Record<BackgroundColorKey, unknown>> }

declare global { interface Window { FARA_BACKGROUND_COLORS?: UserConfig } }

const userConfig: UserConfig = typeof window === 'undefined' ? {} : (window.FARA_BACKGROUND_COLORS ?? {})
const isColor = (value: unknown): value is string => typeof value === 'string' && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)

export const backgroundColors = Object.fromEntries(
  Object.entries(defaultBackgroundColors).map(([key, fallback]) => [key, isColor(userConfig[key as BackgroundColorKey]) ? userConfig[key as BackgroundColorKey] : fallback]),
) as Record<BackgroundColorKey, string>

export function configuredColor(key: BackgroundColorKey) {
  const rawBrightness = userConfig.brightness?.[key]
  const brightness = typeof rawBrightness === 'number' && Number.isFinite(rawBrightness) ? Math.max(0, rawBrightness) : 1
  return new Color(backgroundColors[key]).multiplyScalar(brightness)
}
