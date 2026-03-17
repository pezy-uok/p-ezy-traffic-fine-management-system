import heroImg from '../assets/hero.png'
import { Link } from 'react-router-dom'

const serviceCards = [
  {
    title: 'E-Services',
    description: 'Clearance reports, fine checks, and online support services.',
  },
  {
    title: 'Media',
    description: 'Latest traffic updates, public notices, and announcements.',
  },
  {
    title: 'Contact Us',
    description: 'Reach traffic control, station hotlines, and emergency lines.',
  },
]

export default function Home() {
  return (
    <div className="w-full">
      <section
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(2, 6, 23, 0.88), rgba(15, 23, 42, 0.74)), url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(245,158,11,0.22),transparent_45%)]" />

        <div className="relative mx-auto grid min-h-[68svh] w-full max-w-7xl items-end gap-10 px-5 pb-10 pt-14 text-left sm:px-8 md:min-h-[72svh] md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] md:items-center md:pb-14 md:pt-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-sm border border-amber-300/60 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Sri Lanka Traffic Police Services
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Safer Roads Through
              <span className="block text-amber-300">Digital Traffic Management</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200/95 md:text-lg">
              Access traffic fine services, public alerts, and police support from a modern platform built
              for fast response and citizen convenience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-sm bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-sm border border-slate-200/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
              >
                View Profile
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {serviceCards.map(card => (
              <article
                key={card.title}
                className="rounded-md border border-white/25 bg-slate-900/45 p-4 backdrop-blur-sm"
              >
                <h2 className="text-base font-semibold text-amber-200">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
