import { footerConfig } from '../config/footer'

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

      <div className="border-b border-slate-700/80">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 text-left sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <section className="lg:col-span-4">
            <h2 className="text-lg font-semibold tracking-wide text-amber-300">
              {footerConfig.organizationName}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              {footerConfig.description}
            </p>
          </section>

          <section className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-6">
              {footerConfig.quickLinks.map(link => (
                <li key={link.label}>
                  <a className="inline-flex text-slate-300 transition-colors duration-200 hover:text-amber-200" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Related Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-6">
              {footerConfig.relatedLinks.map(link => (
                <li key={link.label}>
                  <a
                    className="inline-flex text-slate-300 transition-colors duration-200 hover:text-amber-200"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Contact Us</h3>
            <address className="mt-4 not-italic text-sm leading-6 text-slate-300">
              {footerConfig.addressLines.map(line => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <ul className="mt-4 space-y-2 text-sm leading-6">
              {footerConfig.emergencyNumbers.map(item => (
                <li key={item.label} className="flex items-baseline justify-between gap-4 border-b border-slate-700/50 pb-1 last:border-b-0">
                  <span className="font-medium text-slate-100">{item.label}</span>
                  <span className="text-right text-amber-200">{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-5 text-left text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="leading-6">{footerConfig.copyrightText}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
          {footerConfig.legalLinks.map(link => (
            <a key={link.label} className="transition-colors duration-200 hover:text-amber-200" href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
