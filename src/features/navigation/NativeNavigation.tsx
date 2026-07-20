import { useState } from 'react'
import { content } from '../../content'

export function NativeNavigation() {
  const [open, setOpen] = useState(false)
  return <>
    <header className="native-header">
      <a className="wordmark" href="#home">{content.brand.logoText}</a>
      <nav aria-label={content.uiLabels.primaryNavigation}>
        {content.navigation.map((item, index) => (
          <a key={item.label} className={index ? 'muted' : ''} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-controls="main-menu"
        aria-expanded={open}
      >
        {content.uiLabels.menu} <i /><i />
      </button>
    </header>
    <div id="main-menu" className={`menu-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      {content.navigation.map(item => (
        <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
      ))}
    </div>
  </>
}
