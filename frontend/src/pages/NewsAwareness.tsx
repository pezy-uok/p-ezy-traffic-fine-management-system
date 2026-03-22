import { Link } from 'react-router-dom'

type NewsItem = {
  title: string
  date: string
  summary: string
  category: 'Advisory' | 'Traffic' | 'Community' | 'Safety'
}

type AwarenessTip = {
  title: string
  detail: string
  action: string
}

const newsItems: NewsItem[] = [
  {
    title: 'City-wide Road Safety Week kicks off',
    date: 'March 14, 2026',
    summary:
      'Joint operations with schools and transit partners to reduce speeding near crosswalks and school zones.',
    category: 'Community',
  },
  {
    title: 'Hit-and-run suspect apprehended within 42 minutes',
    date: 'March 12, 2026',
    summary:
      'Real-time CCTV coordination and citizen hotline tips led to a quick arrest and recovery of the victim\'s vehicle.',
    category: 'Advisory',
  },
  {
    title: 'Night patrol saturation on Marine Drive',
    date: 'March 10, 2026',
    summary:
      'Expect DUI checkpoints and lane closures between 10:00 p.m. and 3:00 a.m. this weekend.',
    category: 'Traffic',
  },
]

const awarenessTips: AwarenessTip[] = [
  {
    title: 'Report suspicious vehicles',
    detail:
      'If you notice vehicles parked for unusually long periods near critical infrastructure, call the non-emergency line.',
    action: 'Non-emergency hotline: 011-2345678',
  },
  {
    title: 'Stay updated on digital fraud',
    detail:
      'Phishing emails are mimicking traffic fine notices. Verify payment links only through the official eZy portal.',
    action: 'Bookmark: fines.police.lk',
  },
  {
    title: 'Share road space with responders',
    detail:
      'When you hear sirens, slow down, signal, and pull over to the left to clear a lane within 10 seconds.',
    action: 'Violation carries Rs. 3,000 fine',
  },
]

const outreachPrograms = [
  {
    name: 'Community Townhall',
    date: 'March 22, 2026',
    location: 'Central Civic Auditorium',
    focus: 'Vision Zero progress update and Q&A with commanders',
  },
  {
    name: 'Helmet Fitment Clinic',
    date: 'March 27, 2026',
    location: 'Traffic Training Institute, Borella',
    focus: 'Free fittings for school riders and gig couriers',
  },
  {
    name: 'Cyber Safety Webinar',
    date: 'March 30, 2026',
    location: 'Virtual (Teams link emailed upon RSVP)',
    focus: 'Avoiding QR-code payment scams',
  },
]

const scamAlerts = [
  'Only on-the-spot fines include QR codes printed with holograms. Plain paper slips are counterfeit.',
  'Officers never request mobile wallet transfers to personal numbers. Report such attempts immediately.',
  'Email notices always originate from the @police.lk domain. Flag other domains as phishing.',
]

export default function NewsAwareness() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="container mx-auto px-6 py-16 flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="uppercase tracking-widest text-sm font-semibold text-blue-100">
              Colombo Metropolitan Police
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              News & Public Awareness Hub
            </h1>
            <p className="text-lg text-blue-100">
              Timely updates on enforcement, community outreach, and safety advisories so you can stay informed and help
              keep every street secure.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="bg-white text-blue-700 px-6 py-3 rounded font-semibold shadow hover:translate-y-0.5 transition"
              >
                Report an Incident
              </Link>
              <a
                href="mailto:safety@police.lk"
                className="border border-white/60 px-6 py-3 rounded font-semibold text-white hover:bg-white/10"
              >
                Contact Public Affairs
              </a>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 text-center">
            {[{ label: 'Citizen tips this week', value: '286' }, { label: 'Patrol hours logged', value: '3,420' }, { label: 'School briefings delivered', value: '18' }, { label: 'Cyber fraud cases resolved', value: '42' }].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 space-y-16">
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-600 dark:text-blue-300">Latest Alerts</p>
              <h2 className="text-3xl font-semibold">Operational updates & advisories</h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Updated daily at 06:00 hrs</span>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {newsItems.map(item => (
              <article key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  {item.category}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                <p className="mt-4 text-gray-700 dark:text-gray-300">{item.summary}</p>
                <button className="mt-6 text-blue-600 dark:text-blue-300 font-semibold hover:underline">
                  Read full briefing
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-sm uppercase tracking-widest text-green-600">Community Safety Tips</p>
            <h2 className="text-2xl font-semibold mt-2">Everyday actions that make a difference</h2>
            <div className="mt-6 space-y-6">
              {awarenessTips.map(tip => (
                <div key={tip.title} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold">{tip.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{tip.detail}</p>
                  <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">{tip.action}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-8 border border-blue-200 dark:border-blue-900 shadow-inner">
            <p className="text-sm uppercase tracking-widest text-blue-800 dark:text-blue-200">Scam Alerts</p>
            <h2 className="text-2xl font-semibold mt-2 text-blue-900 dark:text-white">Protect your wallet & data</h2>
            <ul className="mt-6 space-y-4 text-blue-900 dark:text-blue-100">
              {scamAlerts.map(alert => (
                <li key={alert} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
                  <p>{alert}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-violet-600 dark:text-violet-300">Engage Locally</p>
              <h2 className="text-3xl font-semibold">Upcoming outreach programs</h2>
            </div>
            <Link
              to="/profile"
              className="text-sm font-semibold text-violet-600 dark:text-violet-300 hover:underline"
            >
              View RSVP details
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {outreachPrograms.map(program => (
              <div key={program.name} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">{program.date}</p>
                <h3 className="mt-2 text-xl font-semibold">{program.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{program.location}</p>
                <p className="mt-4 text-gray-700 dark:text-gray-200">{program.focus}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-500">Emergency Readiness</p>
              <h2 className="text-3xl font-semibold">Key contacts & rapid channels</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Save these numbers, share them with your household, and rehearse what to report before dialing.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ label: 'Emergency dispatch', value: '119 (24/7)' }, { label: 'Accident reconstruction unit', value: '011-4422110' }, { label: 'Cyber crime lab', value: '011-4589901' }, { label: 'Community relations desk', value: '011-2678899' }].map(contact => (
                <div key={contact.label} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{contact.label}</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{contact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

