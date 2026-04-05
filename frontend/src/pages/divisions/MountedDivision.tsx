import { useMemo, useState } from 'react'
import NavBar from '../../components/NavBar'
import coverImage from '../../assets/divisions/mounted-cover.jpg'
import './MountedDivision.css'

interface HistoryPhase {
  id: string
  label: string
  title: string
  details: string[]
}

const historyPhases: HistoryPhase[] = [
  {
    id: 'establishment',
    label: '1921',
    title: 'Establishment',
    details: [
      'The Police Mounted Unit was established at Mihindu Mawatha, Colombo in 1921.',
      'The unit was inaugurated with a few high-ranking officers during British rule and recruited several British sergeants as a permanent mounted police unit.',
    ],
  },
  {
    id: 'independence',
    label: 'Post Independence',
    title: 'Reorganization after Independence',
    details: [
      'During the period of Independence of Sri Lanka, the Police Department was reorganized and the Police Mounted Branch was maintained as a special branch of the Sri Lanka Police.',
      'Three Sri Lankan Sub Inspectors were assigned in addition to British officers serving at that time.',
    ],
  },
  {
    id: 'localization',
    label: '1956',
    title: 'Localization and Expansion',
    details: [
      'By 1956, entirely Sri Lankans were appointed and the Police Mounted Branch was revamped by attaching a Sub Inspector, two Police Sergeants, and 22 Police Constables.',
      'The branch was strengthened by adding 23 horses imported from Australia.',
    ],
  },
  {
    id: 'division-era',
    label: '1985 - Present',
    title: 'Division Era',
    details: [
      'The Police Mounted Branch underwent development from time to time and was named a Division in 1985, with a Senior Superintendent of Police assigned.',
      'Since then, the division has expanded by establishing Kandy and Nuwara Eliya Mounted Units, and currently consists of 36 horses.',
    ],
  },
]

const dutyList = [
  'Deploying mounted officers in presidential escort duties and processions during National Independence Day celebrations.',
  'Conducting mounted ceremonial escorts for heads of foreign states.',
  'Deploying mounted escorts for ceremonies of awarding letters of credence by Ambassadors and High Commissioners.',
  'Deploying mounted escorts for the Chief Guest of Police Day Celebrations and ensuring mounted participation in ceremonial parade.',
  'Traffic management duties in the cities of Colombo, Kandy, and Nuwara Eliya.',
  'Deploying mounted officers in escort duties at the commencement of parliamentary sessions.',
  'Deploying mounted officers in crowd control duties at the annual Kandy Esala Perahera Festival.',
]

const relatedLinks = [
  'Presidential Secretariat',
  'Ministry of Public Security & Parliamentary Affairs',
  'Department of Immigration & Emigration',
  'Department of Registration of Persons',
  'National Dangerous Drugs Control Board',
  'National Police Academy',
]

const socialPlatforms = ['Facebook', 'TikTok', 'YouTube', 'Instagram', 'LinkedIn', 'X-twitter']

export default function MountedDivision() {
  const [activePhaseId, setActivePhaseId] = useState<string>(historyPhases[0].id)

  const activePhase = useMemo(
    () => historyPhases.find(item => item.id === activePhaseId) ?? historyPhases[0],
    [activePhaseId],
  )

  return (
    <section className="mounted-page">
      <NavBar activeLabel="Division" />

      <header
        className="mounted-page__hero"
        style={{ backgroundImage: `linear-gradient(115deg, rgba(2, 132, 199, 0.78), rgba(15, 23, 42, 0.72)), url(${coverImage})` }}
      >
        <div className="mounted-page__hero-content">
          <p className="mounted-page__eyebrow">Division</p>
          <h1>Mounted Division</h1>
          <p>
            A ceremonial and operational arm of Sri Lanka Police, dedicated to dignity, visibility, crowd control, and public
            order support through highly trained mounted officers.
          </p>
        </div>
      </header>

      <div className="mounted-page__container">
        <section className="mounted-page__principles">
          <article className="mounted-page__card">
            <h2>Vision</h2>
            <p>To uphold the pride and honor of Sri Lanka Police through an attractive and friendly service.</p>
          </article>

          <article className="mounted-page__card">
            <h2>Mission</h2>
            <p>
              To offer the contribution of mounted officers in state functions, traffic management, and police duties, and to
              enhance the dignity, pride, and reputation of Sri Lanka Police dedicated to maintaining law and order.
            </p>
          </article>
        </section>

        <section className="mounted-page__history">
          <div className="mounted-page__section-head">
            <p className="mounted-page__eyebrow">History</p>
            <h3>Interactive Timeline</h3>
          </div>

          <div className="mounted-page__tabs" role="tablist" aria-label="Mounted Division timeline">
            {historyPhases.map(phase => (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={phase.id === activePhaseId}
                className={`mounted-page__tab${phase.id === activePhaseId ? ' is-active' : ''}`}
                onClick={() => setActivePhaseId(phase.id)}
              >
                <span>{phase.label}</span>
                <strong>{phase.title}</strong>
              </button>
            ))}
          </div>

          <article className="mounted-page__panel" role="tabpanel">
            <h4>{activePhase.title}</h4>
            {activePhase.details.map(detail => (
              <p key={detail}>{detail}</p>
            ))}
          </article>
        </section>

        <section className="mounted-page__duties">
          <div className="mounted-page__section-head">
            <p className="mounted-page__eyebrow">Operations</p>
            <h3>Summary of Duties</h3>
          </div>

          <ul>
            {dutyList.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mounted-page__links-grid">
          <article className="mounted-page__card">
            <h3>Related Links</h3>
            <div className="mounted-page__chips">
              {relatedLinks.map(link => (
                <span key={link}>{link}</span>
              ))}
            </div>
          </article>

          <article className="mounted-page__card">
            <h3>Contact Us</h3>
            <p>Police Headquarters, Colombo 02, Sri Lanka.</p>
            <div className="mounted-page__contact-links">
              <a href="tel:+94112421111">(+94) 11 2421111</a>
              <a href="tel:+94112440584">(+94) 11-2440584</a>
            </div>
            <div className="mounted-page__chips">
              {socialPlatforms.map(platform => (
                <span key={platform}>{platform}</span>
              ))}
            </div>
          </article>
        </section>
      </div>
    </section>
  )
}
