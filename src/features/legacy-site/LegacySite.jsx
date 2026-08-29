import { useRef } from 'react'
import { appConfig } from '../../config'
import { content } from '../../content'
import { updateFooter } from './legacy-footer.js'
import { useLegacyRouteBridge } from './use-legacy-route-bridge.js'
import { useLegacyScrollbar } from './use-legacy-scrollbar.js'

export default function LegacySite() {
  const frameRef = useRef()
  const { gateRef, location, menuOpen, setStatus, status } = useLegacyRouteBridge(frameRef)
  const { handleScrollbarPointerDown, scrollbarThumbRef } = useLegacyScrollbar(frameRef, status)
  const isHomeRoute = location.pathname === '/'

  const onLoad = event => {
    const frameDocument = event.currentTarget.contentDocument
    if (!frameDocument) {
      setStatus('failed')
      return
    }
    const route = `${location.pathname}${location.search}`
    frameDocument.defaultView?.postMessage(
      { type: appConfig.legacyRuntime.routeMessage, pathname: route },
      window.location.origin,
    )
    updateFooter(frameDocument)
    frameDocument.defaultView?.setTimeout(
      () => updateFooter(frameDocument),
      appConfig.legacyRuntime.delayedFooterSyncMs,
    )
  }

  return (
    <div
      className="legacy-shell"
      data-menu-open={menuOpen ? 'true' : 'false'}
      data-status={status}
      data-route-surface={isHomeRoute ? 'home' : 'content'}
    >
      <div ref={gateRef} className="site-gate" role={status === 'failed' ? 'alert' : 'status'}>
        {status === 'failed' ? (
          content.uiLabels.loadFailure
        ) : (
          <div className="site-loader" aria-label="Loading">
            <span className="site-loader__spinner" aria-hidden="true" />
          </div>
        )}
      </div>
      <iframe
        ref={frameRef}
        className="legacy-site"
        title={appConfig.legacyRuntime.iframeTitle}
        src={appConfig.legacyRuntime.iframeSource}
        onLoad={onLoad}
      />
      <div
        className="fara-scrollbar"
        aria-hidden="true"
        onPointerDown={handleScrollbarPointerDown}
      >
        <div ref={scrollbarThumbRef} className="fara-scrollbar__thumb" />
      </div>
    </div>
  )
}
