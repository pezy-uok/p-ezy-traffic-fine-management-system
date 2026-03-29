import { useMemo, useState } from 'react'
import NavBar from '../../components/NavBar'
import coverImage from '../../assets/divisions/traffic-management-cover.jpg'
import './TrafficRoadSafetyDivision.css'

interface Milestone {
  id: string
  period: string
  title: string
  details: string[]
}

const milestones: Milestone[] = [
  {
    id: 'early-transport',
    period: '1899 - 1917',
    title: 'Beginning of Motor Transport Regulation',
    details: [
      'A tram car was first operated in Sri Lanka on 01.12.1899, followed by a post van on 14.12.1899.',
      'The first motor car was imported in 1902, and the first bus in 1906, creating the need for traffic management rules.',
      'A gazette took effect from 01.01.1906. Traffic Ordinance No. 04 of 1916 was drafted and implemented from 01.01.1917 due to rapid growth from 745 registered vehicles in 1909 to 4805 by 1911.',
      'A Motor Vehicle Registration Office was established in 1917.',
    ],
  },
  {
    id: 'hq-foundation',
    period: '1920 - 1957',
    title: 'Formation of Traffic Units and Headquarters',
    details: [
      'Police officers were deployed at major intersections to control traffic by 1920.',
      'A Traffic Unit was established in 1950 in terms of Police Order D-01 to manage traffic in Colombo.',
      'Traffic Police Headquarters was established on 27.11.1953 under Assistant Superintendent of Police Mr. Lambruggan, as per Police Gazette II No. 5202 dated 11.11.1953.',
      'Traffic Police Headquarters provided escort duty for Queen Elizabeth II during her 1954 visit.',
      'A traffic demonstration team was established in 1955 under Sub-Inspector Wijeratne Warakagoda and Police Sergeant Wally Bastian to raise public awareness of traffic laws.',
      "The first IG's Traffic Course for police officers was successfully conducted in 1957.",
    ],
  },
  {
    id: 'modernization',
    period: '1984 - 1993',
    title: 'Modernization and Range Establishment',
    details: [
      'The post of Director-Traffic was created in 1984 to take charge of Traffic Headquarters.',
      'Measures were taken in 1985 to establish Police Emergency Unit to manage increasing traffic congestion in Colombo.',
      'The Junior Traffic Management Course for Sergeants and Constables was introduced in 1992.',
      'Traffic command was established as a range in 1993, creating the post of Deputy Inspector General of Police in charge of Traffic Management and Road Safety Range.',
    ],
  },
  {
    id: 'current-model',
    period: 'Present',
    title: 'Current Islandwide Management Model',
    details: [
      'City Traffic Police and Police Emergency Service perform as two separate units to manage congestion in Colombo.',
      'A Traffic Unit is maintained at every police station, while divisional Traffic Divisions supervise these units.',
      'The Traffic Management and Road Safety Division regularly monitors and issues instructions on traffic duties islandwide.',
    ],
  },
]

const duties = [
  'Providing instructions to relevant police divisions on traffic issues and preparing policies and plans on traffic management and road safety.',
  'Submitting recommendations to relevant authorities after inspections and surveys on engineering and other defects in the road system.',
  'Conducting traffic demonstrations and seminars for students and the community to create polite and law-abiding drivers and road users.',
  'Planning and implementing traffic management duties and escort duties for state ceremonies, state heads, foreign delegates, and VIPs.',
  'Providing required assistance for boards of interview to recruit and promote drivers for ministries and departments.',
  'Providing instructions on behalf of Inspector General of Police to departments and institutions to conduct discussions and seminars on traffic management and road safety.',
  'Preparing statistical data on fatal road accidents in the country.',
  'Organizing island-wide programs on road safety.',
  'Organizing and providing instructions on traffic management during special events.',
  'Providing instructions to police stations to minimize congestion after conducting surveys on areas with increasing traffic.',
  'Raising awareness among officers regarding changing traffic laws and preparing relevant circulars.',
  'Inspecting maintenance of books and registers in traffic units and ensuring proper deployment of officers for designated duties.',
  'Facilitating national-level cycle races and cycle tours with escort services.',
  "Training officers in the Inspectors' Grade and maintaining related training programs.",
  'Conducting Junior Traffic Courses for Sergeants and Constables.',
  'Maintaining a divisional store for uniforms and insignia of traffic officers.',
  'Assisting Inspector General of Police in annual rough estimates for required supplies related to traffic management and road safety.',
  'Implementing all rules and regulations for motor vehicles within the road network and providing necessary plans.',
  'Collecting and analyzing traffic accident data and case data, then informing institutions to improve effective traffic management.',
]

const branches = [
  'Administration Branch',
  'Education Branch',
  'Law Enforcement Branch',
  'Engineering Branch',
  'Statistic Branch',
  'Logistics Branch',
  'Transportation Branch',
]

export default function TrafficRoadSafetyDivision() {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(milestones[0].id)

  const activeMilestone = useMemo(
    () => milestones.find(item => item.id === activeMilestoneId) ?? milestones[0],
    [activeMilestoneId],
  )

  return (
    <section className="traffic-page">
      <NavBar activeLabel="Division" />

      <header
        className="traffic-page__hero"
        style={{ backgroundImage: `linear-gradient(115deg, rgba(2, 132, 199, 0.78), rgba(15, 23, 42, 0.74)), url(${coverImage})` }}
      >
        <div className="traffic-page__hero-content">
          <p className="traffic-page__eyebrow">Division</p>
          <h1>Traffic Management and Road Safety Division</h1>
          <p>
            Building safer roads by combining law enforcement, evidence-based planning, officer training, and public awareness
            programs across Sri Lanka.
          </p>
        </div>
      </header>

      <div className="traffic-page__container">
        <section className="traffic-page__principles">
          <article className="traffic-page__card">
            <h2>Vision</h2>
            <p>To create safe roads devoid of road accidents and traffic congestion.</p>
          </article>

          <article className="traffic-page__card">
            <h2>Mission</h2>
            <p>
              Adopting road safety measures islandwide to create an environment where all can travel safely, through statistical
              analysis of road accidents, joint implementation of road rules with relevant institutions, training officers
              performing traffic duties, and raising awareness among students, drivers, and the general public.
            </p>
          </article>
        </section>

        <section className="traffic-page__timeline">
          <div className="traffic-page__section-head">
            <p className="traffic-page__eyebrow">History and Development</p>
            <h3>Interactive Milestones</h3>
          </div>

          <div className="traffic-page__tabs" role="tablist" aria-label="Traffic division timeline">
            {milestones.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeMilestoneId}
                className={`traffic-page__tab${item.id === activeMilestoneId ? ' is-active' : ''}`}
                onClick={() => setActiveMilestoneId(item.id)}
              >
                <span>{item.period}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>

          <article className="traffic-page__panel" role="tabpanel">
            <h4>{activeMilestone.title}</h4>
            {activeMilestone.details.map(detail => (
              <p key={detail}>{detail}</p>
            ))}
          </article>
        </section>

        <section className="traffic-page__duties">
          <div className="traffic-page__section-head">
            <p className="traffic-page__eyebrow">Mandate</p>
            <h3>Duties and Functions</h3>
          </div>
          <p className="traffic-page__meta">As assigned in Police Gazette II No. 5202 dated 11.11.1953</p>

          <ol>
            {duties.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="traffic-page__branches">
          <div className="traffic-page__section-head">
            <p className="traffic-page__eyebrow">Operational Sections</p>
            <h3>Branch Structure</h3>
          </div>

          <div className="traffic-page__chips">
            {branches.map(branch => (
              <span key={branch}>{branch}</span>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
