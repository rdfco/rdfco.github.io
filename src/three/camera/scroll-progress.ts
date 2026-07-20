export function normalizedScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  viewportHeight: number,
): number {
  const maximum = Math.max(1, scrollHeight - viewportHeight)
  return Math.min(1, Math.max(0, scrollTop / maximum))
}
