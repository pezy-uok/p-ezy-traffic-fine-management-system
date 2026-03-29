import { useMemo, useState, type ChangeEvent } from 'react'
import NavBar from '../components/NavBar'
import heroImage from '../assets/slider/slide-2.png'
import './PoliceHistory.css'

interface TimelineChapter {
  id: string
  period: string
  title: string
  summary: string
  body: string[]
}

interface ProgramFocus {
  id: string
  title: string
  description: string[]
  tag: string
}

interface StatHighlight {
  id: string
  value: string
  label: string
  description: string
}

const timelineChapters: TimelineChapter[] = [
  {
    id: 'colonial',
    period: '1500s - 1658',
    title: 'Portuguese & Dutch Administrations',
    summary: 'Colonial rulers preserved civil systems while birthing organized night patrols across Colombo.',
    body: [
      'The Portuguese who controlled certain areas of the maritime provinces of Sri Lanka did not effect any serious changes to the existing system of civil administration of the country.',
      'The Dutch, who arrived in Sri Lanka in 1602, were able to bring the Maritime Provinces and the Jaffna Peninsula under their rule by 1658.',
      'The concept of policing in Sri Lanka started with the Dutch who saddled the military with the responsibility of policing the City of Colombo.',
      'In 1659 the Colombo Municipal Council adopted a resolution to appoint paid guards to protect the city by night. Four fat and slow soldiers patrolled the city after dusk, becoming the fore-runners of policing in the country.',
      'It was the Dutch who established the earliest police stations. Three police stations were initially opened at the northern entrance to the Fort, at the causeway connecting Fort and Pettah, and at Kayman\'s Gate in the Pettah. The "Maduwa" or the office of the Disawa of Colombo at Hulftsdorp also served the suburbs.',
    ],
  },
  {
    id: 'british-reforms',
    period: '1796 - 1806',
    title: 'British Administrative Reforms',
    summary: 'Magistrates, police judges, and defined duties created a structured colonial constabulary.',
    body: [
      'The Dutch surrendered to the British on 16 February 1796. After the occupation of the city by the British, law and order were, for some time, maintained by the military.',
      'In 1797 the office of Fiscal, which had been abolished, was re-created. Governor Fredric North, having found that the Fiscal was over-burdened with the additional duty of supervising the police, obtained the concurrence of the Chief Justice and entrusted the magistrates and police judges with the task of supervising the police.',
      'By 1805 police functions came to be clearly defined. Apart from matters connected with the safety, comfort, and convenience of the people, police work became tied to crime prevention, detection, and maintenance of law and order.',
      'The rank of police constable was created and came to be associated with all types of police work.',
      'By Act No. 14 of 1806 the City of Colombo was divided into 15 divisions and police constables were appointed to supervise the divisions.',
    ],
  },
  {
    id: 'national-force',
    period: '1865 - 1867',
    title: 'Birth of the National Police',
    summary: 'G. W. R. Campbell unified island-wide policing under the Inspector-General.',
    body: [
      'The Governor, who was looking for a dynamic person to reorganize the police in the island, turned to India to obtain the services of a capable officer.',
      'The Governor of Bombay recommended Mr. G. W. R. Campbell, who was in charge of the Rathnagheri Rangers of the Bombay Police, to shoulder this onerous responsibility.',
      'Mr. Campbell was selected by the Governor and assumed duties as the Chief Superintendent of Police on 3 September 1866.',
      'In 1867, by an amendment to the Police Ordinance No. 16 of 1865, the designation of the head of the police force was changed from Chief Superintendent to Inspector-General of Police.',
      'Therefore, 3 September 1866 can be considered as the beginning of the country\'s present police service. Mr. Campbell is credited with shaping the police force into an efficient organization and giving it a distinct identity. He brought the whole island under his purview and the police became a national rather than a local force.',
    ],
  },
  {
    id: 'leadership',
    period: '1840s - 1947',
    title: 'Leadership & Localization',
    summary: 'Local officers took charge, new ranks emerged, and Sir Richard Aluvihare ushered in a national ethos.',
    body: [
      'Mr. Thomas Oswin, Secretary to the Chief Justice, was appointed the first Superintendent of Police of Colombo.',
      'C. M. Schubert was appointed as the Chief Constable, five Dutch constables, ten police sergeants, and 150 peons were also appointed.',
      'Mr. Lokubanda Dunuwila, the Disawa of Uva, became the Superintendent of Police for Kandy and goes into history as the very first Sri Lankan to be a Superintendent of Police.',
      'Mr. Colepeper was entrusted with the task of reorganizing the Colombo Police. He divided the force into three classes of officers - the inspectors, the sergeants, and the constables, and the new rank of peon was abolished.',
      'In 1847 the ranks of Assistant Superintendent of Police and Sub Inspector of Police were created. Inspector De La Harpe was promoted as the first Assistant Superintendent of Police.',
      'On 1 June 1947 Sir Richard Aluvihare, the first Sri Lankan to hold the office of Inspector General, assumed duties. The police department, which was under the Home Ministry, was brought under the purview of the Defense Ministry.',
      'Sir Richard was faced with the unenviable responsibility of transforming the police force from its colonial outlook to a national police with the gaining of independence in 1948.',
      'He introduced a large number of innovative measures embracing welfare of the men, investigation, prevention and detection of crime, the women police, crime prevention societies, rural volunteers, police kennels, public relations, new methods of training, and improved conditions of service. He transformed the police force into a police service whose role focused on maintaining law and order plus the prevention and detection of crime.',
    ],
  },
  {
    id: 'modern-era',
    period: '1983 - Present',
    title: 'Modern Mandate & Specialization',
    summary: 'From the Special Task Force to today\'s 90,000 officers, heritage drives future readiness.',
    body: [
      'It is duty cast on us, on this occasion when we commemorate the 159th anniversary of the establishment of the police service in our country, to recall with gratitude the great sacrifices of officers who preceded the present generation, even at the cost of their own lives.',
      'They maintained law and order, preserved territorial integrity, and in 1983 the Special Task Force set an example to their brethren and continues to play a key role in providing security to VIPs.',
      'Presently there are 45 territorial divisions, 80 functional divisions, and 607 police stations with a strength of more than 90,000 dedicated personnel.',
      'We extend a hearty handshake to all who continue to serve the police service today with dedication and devotion to uphold the traditions left behind for them and to solicit public cooperation as stakeholders of policing.',
      'To fulfill the expectations of the general public, future policing activities have been planned out where society should be made free of fear of crime mainly.',
    ],
  },
]

const programFocus: ProgramFocus[] = [
  {
    id: 'traffic',
    title: 'Traffic Administration & Road Safety Range',
    tag: 'Mobility',
    description: [
      'The Traffic Administration and Road Safety Range has been formed under the supervision of a DIG at Police Headquarters for the purpose of bringing under its control the growing number of motor vehicles that converge onto the main thoroughfares every day.',
      'This range is responsible for preventing motor accidents, protecting property from such accidents, and issuing circular instructions to all territorial police divisions in order to implement better traffic management in the country. Traffic branches have been formed in each police station, with range traffic divisions guiding them in liaison with respective Range DIGs and Police Headquarters.',
    ],
  },
  {
    id: 'awareness',
    title: 'Awareness & Community Education',
    tag: 'Education',
    description: [
      'There are awareness-building programmes carried out with various segments of society as target groups in order to give them an orientation on the correct usage of roads.',
    ],
  },
  {
    id: 'crime',
    title: 'Range Crime Detection Branches',
    tag: 'Investigations',
    description: [
      'With a view to curb the high incidence of crime in the country, which is assuming alarming proportions, range crime detection branches have been established in all police stations.',
      'These range branches are headed by senior gazetted officers.',
    ],
  },
  {
    id: 'women-children',
    title: 'Bureau for Prevention of Abuse of Children & Women',
    tag: 'Protection',
    description: [
      'There is a Division in the police titled as the Bureau for the Prevention of Abuse of Children and Women that is assigned with the task of taking different action against all crime perpetrated on women and children, ranging from physical violence to sexual abuse.',
      'There are facilities available for complaints to be recorded by female police officers in a space away from public gaze so as to insulate victims from derisive comment by uncouth elements.',
      'Specially selected officers attached to all police stations in the country have been trained by this Bureau to carry out these services island wide.',
    ],
  },
  {
    id: 'narcotics',
    title: 'Police Narcotic Bureau',
    tag: 'Counter-Narcotics',
    description: [
      'The growing menace of drug addiction that is assuming alarming proportions, particularly among the youth segment of society, is kept in constant check with the establishment of the Police Narcotic Bureau based at Police Headquarters.',
      'Every police officer receives the necessary training on how to deal with instances of drug addiction because the police are conscious of the need to wipe out this scourge from society as soon as possible.',
    ],
  },
  {
    id: 'informants',
    title: 'Informant Protection & Civic Partnership',
    tag: 'Trust',
    description: [
      'In order to provide protection to police informants, strict measures are taken not to expose them by revealing their identity to the general public. Provision is also available for any member of the public to convey information relating to crime committed or about to be committed, even through anonymous telephone messages or letters.',
      'This provides a fool-proof method for informants to perform their tasks unhindered and without danger of their identity being revealed. Information can be furnished either to the respective police station or to the 1-1-9 Emergency Service.',
      'As encouragement, informants can be rewarded handsomely as an incentive for their public-spirited initiatives.',
    ],
  },
  {
    id: 'service-ethos',
    title: 'People-First Policing Ethos',
    tag: 'Community',
    description: [
      'The police of today in principle are committed to serve the needs of the people in particular. Personnel are expected to treat communities with fraternal care, an attitude that should be understood by both the police and the general public.',
      'When complaints are investigated in an atmosphere of cordiality, goodwill, and understanding, it is possible to develop a healthy relationship between the police and the neighboring community.',
      'It is therefore from police officers who have qualities of leadership, honesty, and efficiency that civil society benefits most.',
    ],
  },
]

const statHighlights: StatHighlight[] = [
  {
    id: 'anniversary',
    value: '159',
    label: 'Years of service',
    description:
      'It is duty cast on us, at the 159th anniversary of the establishment of the police service, to recall the great sacrifices of officers who have maintained law and order and preserved national integrity.',
  },
  {
    id: 'territorial',
    value: '45',
    label: 'Territorial divisions',
    description:
      'Presently there are 45 territorial divisions that provide island-wide coverage and keep policing close to communities.',
  },
  {
    id: 'functional',
    value: '80',
    label: 'Functional divisions',
    description:
      'Eighty specialized functional divisions support everything from training to technology so that front-line teams can act decisively.',
  },
  {
    id: 'stations',
    value: '607',
    label: 'Police stations',
    description:
      'A network of 607 police stations enables rapid response while keeping public services accessible.',
  },
  {
    id: 'strength',
    value: '90K+',
    label: 'Personnel strength',
    description:
      'More than 90,000 dedicated officers and staff carry the mission forward with devotion to duty.',
  },
  {
    id: 'future',
    value: 'Fear-Free Society',
    label: 'Future outlook',
    description:
      'Planned future policing activities focus on fulfilling public expectations by ensuring society is free of the fear of crime.',
  },
]

export default function PoliceHistory() {
  const [activeChapterId, setActiveChapterId] = useState<string>(timelineChapters[0].id)
  const [activeProgramId, setActiveProgramId] = useState<string>(programFocus[0].id)
  const [statIndex, setStatIndex] = useState<number>(0)

  const activeChapter = useMemo(
    () => timelineChapters.find(chapter => chapter.id === activeChapterId) ?? timelineChapters[0],
    [activeChapterId],
  )

  const activeProgram = useMemo(
    () => programFocus.find(program => program.id === activeProgramId) ?? programFocus[0],
    [activeProgramId],
  )

  const activeStat = statHighlights[statIndex]

  const handleScrollToTimeline = () => {
    document.querySelector('#history-timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleShareMemory = () => {
    window.open('mailto:heritage@srilankapolice.lk?subject=Police%20Heritage%20Memory', '_blank', 'noopener,noreferrer')
  }

  const handleStatChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStatIndex(Number(event.target.value))
  }

  return (
    <section className="history">
      <NavBar activeLabel="About Us" />

      <header
        className="history__hero"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(2, 132, 199, 0.88), rgba(15, 23, 42, 0.7)), url(${heroImage})`,
        }}
      >
        <div className="history__hero-content">
          <p className="history__eyebrow">Heritage & Service</p>
          <h1>Police History & Community Heritage</h1>
          <p>
            From the Portuguese era through modern specialization, Sri Lanka Police evolved alongside the nation. Explore
            the full chronicle, experience immersive artefacts, and discover how 159 years of duty continue to inspire the
            road ahead.
          </p>

          <div className="history__hero-actions">
            <button type="button" className="history__hero-btn is-primary" onClick={handleScrollToTimeline}>
              Explore Timeline
            </button>
            <button type="button" className="history__hero-btn" onClick={handleShareMemory}>
              Share a Memory
            </button>
          </div>
        </div>

        <div className="history__hero-stats" role="presentation">
          {statHighlights.slice(0, 3).map(stat => (
            <div key={stat.id} className="history__hero-stat">
              <span>{stat.value}</span>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="history__container">
        <section className="history__intro">
          <div>
            <h2>Recorded Legacy</h2>
            <p>
              The text below preserves the original narrative supplied by the Sri Lanka Police history record. Each paragraph
              is kept intact so that researchers, students, and visitors can read the words exactly as they were archived.
            </p>
          </div>
          <div className="history__intro-panel">
            <p>
              These chronicles reveal how every reform was anchored to community safety - from the first night guards inside
              Colombo to today\'s specialized bureaus.
            </p>
            <p>
              Use the interactive controls to travel through time, surface modern initiatives, and connect figures with the
              milestones that shaped them.
            </p>
          </div>
        </section>

        <section className="history__timeline" id="history-timeline">
          <div className="history__section-heading">
            <div>
              <p className="history__eyebrow">Chronicle</p>
              <h3>Interactive Timeline</h3>
            </div>
            <p>{activeChapter.summary}</p>
          </div>

          <div className="history__timeline-tabs" role="tablist" aria-label="History chapters">
            {timelineChapters.map(chapter => (
              <button
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={activeChapterId === chapter.id}
                className={`history__timeline-tab${activeChapterId === chapter.id ? ' is-active' : ''}`}
                onClick={() => setActiveChapterId(chapter.id)}
              >
                <span>{chapter.period}</span>
                <strong>{chapter.title}</strong>
              </button>
            ))}
          </div>

          <article className="history__timeline-panel" role="tabpanel">
            <h4>{activeChapter.title}</h4>
            <p className="history__timeline-period">{activeChapter.period}</p>
            {activeChapter.body.map(sentence => (
              <p key={sentence}>{sentence}</p>
            ))}
          </article>
        </section>

        <section className="history__programs">
          <div className="history__section-heading">
            <div>
              <p className="history__eyebrow">Operational Pillars</p>
              <h3>Modern Initiatives</h3>
            </div>
            <p>Tap through each initiative to read the full extracts describing today\'s community-facing services.</p>
          </div>

          <div className="history__program-grid">
            <div className="history__program-list" role="tablist" aria-label="Programmes">
              {programFocus.map(program => (
                <button
                  key={program.id}
                  type="button"
                  className={`history__program-item${activeProgramId === program.id ? ' is-active' : ''}`}
                  aria-selected={activeProgramId === program.id}
                  onClick={() => setActiveProgramId(program.id)}
                >
                  <span>{program.tag}</span>
                  <strong>{program.title}</strong>
                </button>
              ))}
            </div>

            <article className="history__program-detail" role="tabpanel">
              <h4>{activeProgram.title}</h4>
              {activeProgram.description.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          </div>
        </section>

        <section className="history__stats">
          <div className="history__section-heading">
            <div>
              <p className="history__eyebrow">Scale & Readiness</p>
              <h3>Living Metrics</h3>
            </div>
            <p>Drag the dial to surface figures highlighted in the official record.</p>
          </div>

          <label className="history__stat-slider">
            <span>Focus</span>
            <input
              type="range"
              min={0}
              max={statHighlights.length - 1}
              value={statIndex}
              onChange={handleStatChange}
              aria-valuemin={0}
              aria-valuemax={statHighlights.length - 1}
              aria-valuenow={statIndex}
              aria-label="Browse headline statistics"
            />
          </label>

          <div className="history__stat-cards">
            {statHighlights.map((stat, index) => (
              <div key={stat.id} className={`history__stat-card${index === statIndex ? ' is-active' : ''}`}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="history__stat-description">{activeStat.description}</p>
        </section>
      </div>
    </section>
  )
}
