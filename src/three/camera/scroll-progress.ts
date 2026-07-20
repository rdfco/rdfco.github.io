export function normalizedScrollProgress(): number {
  const maximum = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  )
  return Math.min(1, Math.max(0, window.scrollY / maximum))
}
