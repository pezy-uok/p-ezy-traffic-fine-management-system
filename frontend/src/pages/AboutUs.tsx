import { useState } from 'react'
import { Link } from 'react-router-dom'
import pLogo from '../assets/plogo.png'
import paradeModern from '../assets/about/about-1.jpg'
import formationTroops from '../assets/about/about-2.jpg'
import legacySquad from '../assets/about/about-3.jpg'
import vintageOfficers from '../assets/about/about-4.jpg'
import './AboutUs.css'

type TabId = 'history' | 'vision'

type HeroAction = {
  label: string
  href: string
}

type HeroSlide = {
  image: string
  alt: string
  title: string
  subtitle: string
  actions: HeroAction[]
}

type MenuLink = {
  label: string
  path?: string
}

const menuLinks: MenuLink[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Fine Pay', path: '/fine-pay' },
  { label: 'Criminal Records', path: '/criminal-records' },
  { label: 'Division' },
  { label: 'Downloads' },
  { label: 'Library' },
  { label: 'Survey' },
]

const heroSlides: HeroSlide[] = [
  {
    image: paradeModern,
    alt: 'Modern Sri Lanka police parade with officers marching in formation',
    title: 'Committed to Protect & Serve the Nation',
    subtitle: 'Emergency response, traffic operations, and community policing united under one mission.',
    actions: [
      { label: 'Emergency Contacts', href: 'tel:119' },
      { label: 'Online Services', href: '/fine-pay' },
    ],
  },
  {
    image: formationTroops,
    alt: 'Joint forces marching during national ceremony',
    title: 'Joint Readiness Across Divisions',
    subtitle: 'Traffic, STF, and military partners coordinate daily to secure every province.',
    actions: [
      { label: 'Public Affairs', href: 'mailto:publicaffairs@police.lk' },
      { label: 'Division Network', href: '/about#history' },
    ],
  },
  {
    image: legacySquad,
    alt: 'Historic Sri Lanka police officers posing in front of the station',
    title: 'Legacy of Discipline Since 1866',
    subtitle: 'Generations of officers laid the foundation for today\'s national police service.',
    actions: [
      { label: 'Explore History', href: '/about#history' },
      { label: 'Archives', href: '/news' },
    ],
  },
  {
    image: vintageOfficers,
    alt: 'Early Sri Lanka police unit portrait',
    title: 'Tradition Meets Progress',
    subtitle: 'Modern training builds on the service, empathy, and integrity of earlier pioneers.',
    actions: [
      { label: 'Join Campaigns', href: '/news' },
      { label: 'Community Desk', href: 'mailto:publicaffairs@police.lk' },
    ],
  },
]

const aboutTabs: { id: TabId; label: string; description: string }[] = [
  { id: 'history', label: 'History', description: 'Origins, reforms, and national milestones' },
  { id: 'vision', label: 'Vision & Mission', description: 'Future-ready policing priorities' },
]

const serviceHighlights = [
  {
    title: 'Emergency Operations',
    detail: '119 dispatch, coastal vigilance, and Special Task Force readiness around the clock.',
  },
  {
    title: 'Community Programs',
    detail: 'Road-safety drives, school outreach, and neighborhood watch councils across 45 divisions.',
  },
  {
    title: 'Citizen Services',
    detail: 'Online payments, clearance certificates, e-complaints, and status tracking portals.',
  },
  {
    title: 'Women & Children Support',
    detail: 'Dedicated bureaus with trained female officers, private interview spaces, and counseling links.',
  },
]

const quickStats = [
  { label: 'Territorial Divisions', value: '45+' },
  { label: 'Police Stations', value: '607' },
  { label: 'Functional Divisions', value: '80' },
  { label: 'Personnel Strength', value: '90,000+' },
]

const historyParagraphs: string[] = [
  'The Portuguese who controlled certain areas of the maritime provinces of Sri Lanka did not effect any serious changes to the existing system of civil administration of the country. The Dutch, who arrived in Sri Lanka in 1602, were able to bring the Maritime Provinces and the Jaffna Peninsula under their rule by 1658.',
  'The concept of policing in Sri Lanka started with the Dutch who saddled the Military with the responsibility of policing the City of Colombo. In the year 1659 the Colombo Municipal Council adopted a resolution to appoint paid guards to protect the city by night. Accordingly, four fat and slow soldiers were appointed to patrol the city by night. Hence they could be considered as the forerunners of the police in the country. It was the Dutch who established the earliest police stations. Three Police Stations were initially opened: one at the northern entrance to the Fort, second at the cause-way connecting Fort and Pettah and a third at Kayman\'s Gate in the Pettah. In addition to these the "Maduwa" or the office of Disawa of Colombo, who was a Dutch official at Hulftsdorp, also served as a Police Station for these suburbs.',
  'The British Period: The Dutch surrendered to the British on 16 February 1796. After the occupation of the city by the British, law and order were, for some time, maintained by the Military. In 1797 the office of Fiscal, which had been abolished, was recreated. Governor Fredric North, having found that the Fiscal was overburdened with the additional duty of supervising the police, obtained the concurrence of the Chief Justice and entrusted the Magistrates and Police Judges with the task of supervising the Police.',
  'In 1805 police functions came to be clearly defined. Apart from matters connected with the safety, comfort and convenience of the people, police functions also came to be connected with prevention and detection of crime and maintenance of law and order. The rank of police constable was created and it came to be associated with all types of police work.',
  'By Act No. 14 of 1806 the City of Colombo was divided into 15 divisions and Police Constables were appointed to supervise the divisions.',
  'The National Police: The Governor, who was looking for a dynamic person to reorganize the police in the island, turned to India to obtain the services of a capable officer. The Governor of Bombay recommended Mr. G. W. R. Campbell, who was in charge of the "Ratnagheri rangers" of the Bombay Police, to shoulder this onerous responsibility. Mr. Campbell was selected by the Governor and he assumed duties as the Chief Superintendent of Police on 3 September 1866. In 1867, by an amendment to the Police Ordinance No. 16 of 1865, the designation of the Head of the Police Force was changed from Chief Superintendent to Inspector-General of Police. Therefore, 3 September 1866 can be considered as the beginning of the country\'s present Police Service. Mr. Campbell is credited with shaping the Police Force into an efficient organization and giving it a distinct identity. He brought the whole island under his purview and the police became a national rather than a local Force.',
  'First Superintendent of Police & his Staff: Mr. Thomas Oswin, Secretary to the Chief Justice, was appointed the first Superintendent of Police of Colombo. C. M. Schubert was appointed as the Chief Constable, five Dutch Constables, ten Police Sergeants and 150 Peons were also appointed. Mr. Lokubanda Dunuwila, who was the Disawa of Uva, was appointed as the Superintendent of Police for Kandy. He goes into history as the very first Sri Lankan to be a Superintendent of Police. Mr. Colepeper was entrusted with the task of reorganizing the Colombo Police. He divided the Force into three classes of officers - the Inspectors, the Sergeants and the Constables. The new rank of Peon was abolished. In 1847 the ranks of Assistant Superintendent of Police and Sub Inspector of Police were created. Inspector De La Harpe was promoted as the first Assistant Superintendent of Police.',
  'First Sri Lankan Inspector General: On 1 June 1947 Sir Richard Aluvihare, the first Sri Lankan to hold the office of Inspector General, assumed duties. The Police Department, which was under the Home Ministry, was brought under the purview of the Defense Ministry. Sir Richard was faced with the unenviable responsibility of transforming the Police Force from its colonial outlook to a National Police with the gaining of independence in 1948. To this end he introduced a large number of innovative measures, which embraced the welfare of the men, investigation, prevention and detection of crime, the women police, crime prevention societies, rural volunteers, police kennels, public relations, new methods of training and improvement of conditions of service. He transformed the Police Force into a Police Service. Its role was narrowly defined and restricted to the maintenance of law and order and prevention and detection of crime.',
  'The Traffic Administration and Road Safety Range has been formed under the supervision of a DIG at the Police Headquarters for the purpose of bringing under its control the growing number of motor vehicles that converge on to the main thoroughfares every day. This Range is also responsible for the prevention of motor accidents from occurring, together with protecting property from such motor accidents, and also issuing circular instructions to all the Territorial Police in order to implement a better traffic management in the country. In order to carry out these tasks in an organized manner throughout the country, Traffic Branches have been formed in each of the Police Stations in the country. Range Traffic Divisions also have been set up to supervise and guide these traffic branches who should liaise with the respective Range DIG\'s and the Police Headquarters Traffic Range.',
  'In addition, there are awareness-building programmes, which are being carried out with various segments of society as target groups in order to give them an orientation on the correct usage of roads.',
  'With a view to curb the high incidence of crime in the country, which is assuming alarming proportions, Range Crime Detection Branches have been established in all the Police Stations. These Range Branches are headed by Senior Gazetted Officers.',
  'There is also a Division in the Police titled as the Bureau for the Prevention of Abuse of Children & Women that is assigned with the task of taking different action against all crime perpetrated on women and children, which ranges from physical violence to sexual abuse.',
  'There are also facilities available to them for their complaints to be recorded by female Police Officers and that too in a place away from public gaze so as to insulate them from any derisive comment by uncouth elements that would affect their self-respect. Specially selected Officers attached to all the Police Stations in the country have been trained by this Bureau to carry out these services island-wide.',
  'The growing menace of drug addiction that is assuming alarming proportions, particularly among the youth segment of our society, is in constant check with the establishment of the Police Narcotic Bureau based in the Police Headquarters. Also, every Police Officer is being given the necessary training on how they should deal with such instances of drug addiction. These steps have been taken because the Police is conscious of the need to wipe out this scourge from our society as soon as possible.',
  'Also, in order to provide protection to Police informants, strict measures are being taken not to expose them by revealing their identity to the general public. Provision is also available for any member of the general public to convey to the Police any information relating to crime committed or about to be committed, even through anonymous telephone messages or letters, all of which will be entertained and looked into. This would provide a foolproof method for such Police informants to perform their tasks unhindered and without any danger of their identity being revealed, which would otherwise have serious consequences to them for being dutiful in their obligations to society. This information can be furnished either to the respective Police station or to the 1-1-9 Emergency Service. As an encouragement to such civic-conscious citizens to bring to the notice of the Police vital information that will lead to the detection and apprehension of offenders, there is provision for informants to be rewarded handsomely as an incentive for their public-spirited initiatives.',
  'The Police of today in principle is committed to serve the needs of the people in particular. In order to do so, its personnel are expected to treat them with fraternal care, which attitude should be well understood by both the Police and the general public. For, it should be borne in mind that when there is a need to make a complaint or seek redress the public almost invariably have to go to the Police Station close to them. If under such an atmosphere of cordiality investigations into such complaints are conducted with mutual goodwill and understanding, then it will be possible to develop a healthy relationship between the Police and the neighboring community that comes within their area. It is therefore from such Police officers who have the qualities of leadership, honesty and efficiency that civil society would be benefited in no measure.',
  'It is duty cast on us, on this occasion when we are commemorating the 159th Anniversary of the establishment of the Police service in our country, to recall with gratitude the great sacrifices of all those officers who have preceded the present generation of such officers, even at the cost of their own precious lives. They had done so in that manner in the course of carrying out their duties conscientiously not only to maintain law and order in the country but also to preserve its territorial integrity in the midst of so many odds. In this regard, the risk taken by the Special Task Force which was set up in 1983 cannot be allowed to pass unnoticed which, to say the least, is an example to the rest of their brethren in the Police Service today. They also play a key role in providing security to VIPs.',
  'Presently there are 45 Territorial Divisions, 80 Functional Divisions and 607 Police Stations with a strength of more than 90,000 personnel. We also consider this occasion to be opportune to extend a hearty handshake to all those who continue to serve the Police Service today with dedication and devotion in order to uphold the hoary traditions their predecessors have left behind for them to emulate and to solicit the public cooperation as stakeholders of policing.',
  'To fulfill the expectations of the general public, future policing activities have been planned out, where the society should be made free of fear of crime mainly.',
]

const historyTimeline = [
  { year: '1659', detail: 'Colombo Municipal Council formalizes paid night guards, the earliest organized patrols.' },
  { year: '1806', detail: 'Act No. 14 divides Colombo into 15 divisions each under assigned constables.' },
  { year: '1866', detail: 'G. W. R. Campbell becomes Chief Superintendent and charts the modern national force.' },
  { year: '1947', detail: 'Sir Richard Aluvihare assumes office as the first Sri Lankan Inspector General.' },
  { year: '1983', detail: 'Special Task Force established to counter high-risk threats and secure VIP movements.' },
]

const missionPillars = [
  {
    title: 'Protect & Reassure',
    description: 'Uphold law and order, prevent and detect crime, and ensure every neighborhood feels safeguarded.',
  },
  {
    title: 'Serve with Empathy',
    description: 'Provide people-first services, from women and children desks to secure informant channels.',
  },
  {
    title: 'Modernize Capability',
    description: 'Advance training, technology, and specialized units such as Traffic, Narcotics, and Cyber teams.',
  },
  {
    title: 'Partner with Communities',
    description: 'Promote road safety, awareness drives, and civic participation to solve shared challenges.',
  },
]

const visionStatements = [
  'Be the most trusted guardian of public safety in Sri Lanka.',
  'Lead proactive, intelligence-led policing that prevents harm before it occurs.',
  'Champion transparency, accountability, and professionalism in every rank.',
]

const coreValues = ['Integrity', 'Courage', 'Service', 'Empathy', 'Accountability', 'Innovation']

const engagementInitiatives = [
  {
    title: 'Community Relations Desk',
    detail: 'Dedicated officers connect residents with services, reinforce confidence, and manage feedback loops.',
  },
  {
    title: 'Traffic & Road Safety Range',
    detail: 'Island-wide traffic branches coordinate directly with HQ to reduce collisions and congestion.',
  },
  {
    title: 'Bureau for Prevention of Abuse of Children & Women',
    detail: 'Confidential spaces led by trained female officers encourage reporting and compassionate response.',
  },
  {
    title: 'Range Crime Detection Branches',
    detail: 'Senior Gazetted Officers guide investigations and intelligence sharing across all stations.',
  },
]

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState<TabId>('history')
  const [activeSlide, setActiveSlide] = useState(0)

  const currentSlide = heroSlides[activeSlide]

  const goToSlide = (direction: 'next' | 'prev') => {
    setActiveSlide(index => {
      if (direction === 'next') {
        return (index + 1) % heroSlides.length
      }
      return (index - 1 + heroSlides.length) % heroSlides.length
    })
  }

  const renderAction = (action: HeroAction) => {
    const baseClass = 'hero-action'
    const isInternal = action.href.startsWith('/')

    if (isInternal) {
      return (
        <Link key={action.label} to={action.href} className={baseClass}>
          {action.label}
        </Link>
      )
    }

    return (
      <a key={action.label} href={action.href} className={baseClass}>
        {action.label}
      </a>
    )
  }

  return (
    <section className="about">
      <header className="about__banner">
        <div className="about__topbar">
          <div className="about__container about__brand-row">
            <div className="about__brand">
              <img src={pLogo} alt="Sri Lanka Police crest" />
              <div>
                <p className="about__badge">Official Website</p>
                <h1>SRI LANKA POLICE</h1>
              </div>
            </div>
            <span className="about__lang">ENGLISH</span>
          </div>
        </div>

        <div className="about__menu-shell">
          <div className="about__container about__menu-row">
            <nav className="about__nav" aria-label="Primary">
              {menuLinks.map(link => {
                const className = `about__nav-pill${link.path === '/about' ? ' is-active' : ''}`
                return link.path ? (
                  <Link key={link.label} to={link.path} className={className}>
                    {link.label}
                  </Link>
                ) : (
                  <button key={link.label} type="button" className={className}>
                    {link.label}
                  </button>
                )
              })}
            </nav>

            <label className="about__menu-search" aria-label="Search site wide">
              <span aria-hidden="true">&#128269;</span>
              <input type="text" placeholder="Search" readOnly />
            </label>
          </div>
        </div>
      </header>

      <section className="about-hero">
        <div className="about-hero__media">
          <img src={currentSlide.image} alt={currentSlide.alt} />
          <button type="button" className="about-hero__control is-left" onClick={() => goToSlide('prev')}>
            &#10094;
          </button>
          <button type="button" className="about-hero__control is-right" onClick={() => goToSlide('next')}>
            &#10095;
          </button>
        </div>
        <div className="about-hero__overlay">
          <p className="about-hero__eyebrow">01 / {heroSlides.length.toString().padStart(2, '0')}</p>
          <h2>{currentSlide.title}</h2>
          <p className="about-hero__subtitle">{currentSlide.subtitle}</p>
          <div className="about-hero__actions">{currentSlide.actions.map(renderAction)}</div>
          <div className="about-hero__indicators" role="tablist" aria-label="Hero slides">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`about-hero__dot${index === activeSlide ? ' is-active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="about-services">
        <div className="about__container">
          <header className="about-services__header">
            <p>Services</p>
            <h3>Comprehensive support for community safety and law enforcement</h3>
          </header>
          <div className="about-services__grid">
            {serviceHighlights.map(card => (
              <article key={card.title} className="about-services__card">
                <h4>{card.title}</h4>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="history" className="about-depth">
        <div className="about__container">
          <div className="about-depth__intro">
            <div>
              <p className="about__badge">Institutional Profile</p>
              <h3>History, vision, and mission</h3>
              <p>
                A legacy of resilience supported by specialized bureaus, island-wide divisions, and partnerships with
                every community we serve.
              </p>
            </div>
            <div className="about-depth__stats">
              {quickStats.map(stat => (
                <article key={stat.label}>
                  <p className="value">{stat.value}</p>
                  <p className="label">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="about-tabs" role="tablist" aria-label="About Us sub navigation">
            {aboutTabs.map(tab => (
              <button
                key={tab.id}
                id={`about-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                aria-controls={`about-panel-${tab.id}`}
                className={`about-tab${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <small>{tab.description}</small>
              </button>
            ))}
          </div>

          {activeTab === 'history' && (
            <section
              id="about-panel-history"
              role="tabpanel"
              aria-labelledby="about-tab-history"
              className="about-panel"
            >
              <header className="about-panel__header">
                <div>
                  <p className="about-panel__eyebrow">Historical Record</p>
                  <h4>From colonial patrols to a national service</h4>
                </div>
                <div className="about-timeline">
                  {historyTimeline.map(event => (
                    <div key={event.year} className="about-timeline__item">
                      <span>{event.year}</span>
                      <p>{event.detail}</p>
                    </div>
                  ))}
                </div>
              </header>

              <div className="about-history__body">
                <article className="about-history__narrative">
                  {historyParagraphs.map(paragraph => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </article>
                <aside className="about-history__highlight">
                  <h5>Legacy in Numbers</h5>
                  <ul>
                    <li>159 years since the Police Ordinance unified service delivery.</li>
                    <li>Three pioneering stations at Fort North Gate, Fort-Pettah Causeway, and Kayman\'s Gate.</li>
                    <li>Nationwide reach guided by DIG-led ranges and specialized bureaus.</li>
                    <li>Community trust through informant protection and civic reward programs.</li>
                  </ul>
                </aside>
              </div>
            </section>
          )}

          {activeTab === 'vision' && (
            <section
              id="about-panel-vision"
              role="tabpanel"
              aria-labelledby="about-tab-vision"
              className="about-panel"
            >
              <header className="about-panel__header">
                <div>
                  <p className="about-panel__eyebrow">Forward Strategy</p>
                  <h4>Vision, mission, and service promise</h4>
                </div>
              </header>

              <div className="about-vision">
                <article className="about-vision__card">
                  <p className="about-panel__eyebrow">Vision</p>
                  <ul>
                    {visionStatements.map(statement => (
                      <li key={statement}>{statement}</li>
                    ))}
                  </ul>
                </article>

                <article className="about-vision__card">
                  <p className="about-panel__eyebrow">Mission Pillars</p>
                  <div className="about-vision__pillars">
                    {missionPillars.map(pillar => (
                      <div key={pillar.title}>
                        <h5>{pillar.title}</h5>
                        <p>{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="about-vision__card">
                  <p className="about-panel__eyebrow">Core Values</p>
                  <div className="about-vision__tags">
                    {coreValues.map(value => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                </article>

                <article className="about-vision__card">
                  <p className="about-panel__eyebrow">Engagement Priorities</p>
                  <ul>
                    {engagementInitiatives.map(item => (
                      <li key={item.title}>
                        <strong>{item.title}:</strong> {item.detail}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>
          )}
        </div>
      </section>
    </section>
  )
}
