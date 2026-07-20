export interface BrowserScrollMetrics {
  scrollTop: number
  scrollHeight: number
  viewportHeight: number
}

export function readBrowserScrollMetrics(): BrowserScrollMetrics {
  return {
    scrollTop: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }
}
