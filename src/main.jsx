import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { App } from './app/App'
import { resolveInitialRoute } from './config'
import './app/app.css'

// index.html pre-renders the shell, so the route has to be settled before
// hydration starts. See resolve-initial-route.ts.
const resolved = resolveInitialRoute(window.location.pathname)
if (resolved !== window.location.pathname) {
  window.history.replaceState(null, '', `${resolved}${window.location.search}${window.location.hash}`)
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root application mount')
hydrateRoot(root, <App />)
