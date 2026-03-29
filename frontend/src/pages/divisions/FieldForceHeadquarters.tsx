import { useMemo, useState } from 'react'
import NavBar from '../../components/NavBar'
import coverImage from '../../assets/divisions/field-force-cover.jpg'
import './FieldForceHeadquarters.css'

interface Milestone {
  id: string
  period: string
  title: string
  details: string[]
}

const milestones: Milestone[] = [
  {
    id: 'origins',
    period: '1861 - 1892',
    title: 'Origins of Organized Field Response',
    details: [
      'The Sri Lanka Police Service marked its inception in 1861 while Sri Lanka was under British rule from 1795 to 1948.',
      'Although the service remained unorganized at the outset, it was reorganized on 3rd September 1866 during the tenure of the first Inspector General of Police, Mr. Robert William Campbell, after amendments to Police Ordinance No. 16 of 1867.',
      'In December 1867, land opposite the Maradana Mosque was purchased from Manuel Fernando, and Police Headquarters was established there in December 1869.',
      'With rising unrest, including riots in Jaffna in 1867, disturbances in Maradana in 1870, and clashes in Kotahena in 1883, 25 serving officers and 25 sturdy outsiders were selected for emergency deployment under Inspector Marshall.',
      'Because of limited space, a barrack on Kew Road was selected and a bugler was attached to summon officers during emergencies. The office operated under an Assistant Superintendent of Police and was established on 01 August 1892 as Depot Police.',
    ],
  },
  {
    id: 'college-relocation',
    period: '1923 - 1948',
    title: 'Police College and Relocation',
    details: [
      'In 1923, two new two-storied buildings were constructed for Rs. 286,000.00.',
      'In 1925, Sri Lanka Police College was established at this location, which is known today as the Police Field Force Headquarters.',
      'The present Police College location in Kalutara had previously served as a Royal Air Force base.',
      'After that base was removed in 1948, the Police College was relocated to Kalutara and the Depot Police in Maradana shifted to this site.',
    ],
  },
  {
    id: 'expansion',
    period: '1958 - 1977',
    title: 'Expansion and Riot Control Development',
    details: [
      'The Depot Police focused on counterinsurgency duties and, in 1958, expanded capabilities by establishing an armoury ranging from small weapons to war weapons.',
      'Separate units were also created, including a sports unit, police band, cultural unit, and a first aid unit.',
      'In 1962, during an anti-government coup and uprising, Superintendent Mr. T.H. Kelaart reorganized the Riot Control Unit and formed five riot control teams with 100 well-built officers trained by Sergeant Major Sarap.',
      'These teams were later deployed for armed duty during the 1971 armed struggle.',
      'On 01.07.1977, Depot Police was renamed as Police Field Force Headquarters, and the head post changed from Superintendent of Depot Police to Commandant.',
    ],
  },
  {
    id: 'modern-range',
    period: '1980s - Present',
    title: 'Modern Headquarters and Range Administration',
    details: [
      'By the 1980s, the Riot Control Unit was further developed and barracks named Vijaya and Gemunu were built, with four additional barracks made of coconut fronds.',
      'In 1983, during anti-riot duty near Sri Abhayarama Purana Viharaya, Narahenpita, a person was killed when troops opened fire under then Assistant Superintendent of Police Mr. Ghafoor; the trial established justifiable homicide.',
      'Field Force Headquarters, established in 1892, completed its 100th year at this location and progressively adopted new methodologies and strategies to control riots and public uprisings.',
      'Units such as Police Cultural Unit, Sports, and Police Band, now functioning as divisions, were once administered under this establishment. The Police Environment Protection Division now functions as a sub-accounts unit under Field Force Headquarters.',
      'Since expanded administration in 1993, this headquarters functions as a Police Range. Mr. M.D. Perera served as the inaugural Deputy Inspector General, and Mr. A.G.J. Chandrakumara serves as the 26th Deputy Inspector General of Police, Police Field Force Headquarters.',
      'Woman Senior Superintendent of Police Mrs. R.A. Darshika Kumari, the first female Commandant of this establishment, performs duties as the 71st Commandant of the Police Field Force Headquarters.',
    ],
  },
]

export default function FieldForceHeadquarters() {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(milestones[0].id)

  const activeMilestone = useMemo(
    () => milestones.find(item => item.id === activeMilestoneId) ?? milestones[0],
    [activeMilestoneId],
  )

  return (
    <section className="field-force-page">
      <NavBar activeLabel="Division" />

      <header
        className="field-force-page__hero"
        style={{ backgroundImage: `linear-gradient(110deg, rgba(2, 132, 199, 0.82), rgba(15, 23, 42, 0.72)), url(${coverImage})` }}
      >
        <div className="field-force-page__hero-content">
          <p className="field-force-page__eyebrow">Division</p>
          <h1>Field Force Headquarters</h1>
          <p>
            Established in 1892 and developed through every major phase of public order operations, the Field Force Headquarters
            continues to lead riot control readiness, specialized support units, and range-level command coordination.
          </p>
        </div>
      </header>

      <div className="field-force-page__container">
        <section className="field-force-page__summary">
          <article className="field-force-page__summary-card">
            <h2>Historical Significance</h2>
            <p>
              Police teams were repeatedly deployed during major disturbances in the late 1800s. This operational pressure shaped
              the creation of emergency response structures that became the foundation of Depot Police and later Field Force
              Headquarters.
            </p>
          </article>

          <article className="field-force-page__summary-card">
            <h2>Current Identity</h2>
            <p>
              The headquarters now functions as a Police Range and supports key operational divisions while sustaining a legacy of
              riot control, training, culture, sports, and public order preparedness.
            </p>
          </article>
        </section>

        <section className="field-force-page__timeline">
          <div className="field-force-page__timeline-head">
            <p className="field-force-page__eyebrow">Chronology</p>
            <h3>Interactive Milestones</h3>
          </div>

          <div className="field-force-page__milestone-tabs" role="tablist" aria-label="Field Force milestones">
            {milestones.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeMilestoneId}
                className={`field-force-page__milestone-tab${item.id === activeMilestoneId ? ' is-active' : ''}`}
                onClick={() => setActiveMilestoneId(item.id)}
              >
                <span>{item.period}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>

          <article className="field-force-page__milestone-panel" role="tabpanel">
            <h4>{activeMilestone.title}</h4>
            <p className="field-force-page__period">{activeMilestone.period}</p>
            {activeMilestone.details.map(detail => (
              <p key={detail}>{detail}</p>
            ))}
          </article>
        </section>
      </div>
    </section>
  )
}
