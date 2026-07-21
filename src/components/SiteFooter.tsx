type SiteFooterProps = {
  content: { uiLabels: { legalNavigation: string }; brand: { logoText: string }; footer: { copyright: string } }
  offices: readonly { city: string; address: readonly string[]; phone: string; email: string }[]
  legalLinks: readonly string[]
}

export function SiteFooter({ content, offices, legalLinks }: SiteFooterProps) {
  return <footer id="footer" className="site-footer">
    <div className="footer-grid">
      <nav aria-label={content.uiLabels.legalNavigation}>
        {legalLinks.map(link => <a href="#footer" key={link}>{link}</a>)}
      </nav>
      {offices.map(office => <address key={office.city}>
        <strong>{office.city}</strong>
        <p>{office.address.map(line => <span key={line}>{line}</span>)}</p>
        <p>P : {office.phone}<br />{office.email}</p>
      </address>)}
    </div>
    <div className="footer-bottom">
      <strong>{content.brand.logoText}</strong>
      <span>{content.footer.copyright}</span>
    </div>
  </footer>
}
