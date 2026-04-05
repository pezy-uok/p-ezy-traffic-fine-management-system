import { useMemo, useState } from 'react'
import NavBar from '../components/NavBar'
import policeLogoWatermark from '../assets/divisions/police-logo-watermark.png'
import igpInsignia from '../assets/ranks/igp.png'
import sdigInsignia from '../assets/ranks/sdig.png'
import digInsignia from '../assets/ranks/dig.png'
import sspInsignia from '../assets/ranks/ssp.png'
import spInsignia from '../assets/ranks/sp.png'
import aspInsignia from '../assets/ranks/asp.png'
import chiefInspectorInsignia from '../assets/ranks/ci.png'
import inspectorInsignia from '../assets/ranks/ip.png'
import subInspectorInsignia from '../assets/ranks/si.png'
import sergeantMajorInsignia from '../assets/ranks/sjm.png'
import sergeantClassOneInsignia from '../assets/ranks/ps1.png'
import sergeantClassTwoInsignia from '../assets/ranks/ps.png'
import constableClassOneInsignia from '../assets/ranks/pc-4.png'
import constableClassTwoInsignia from '../assets/ranks/pc-3.png'
import constableClassThreeInsignia from '../assets/ranks/pc-2.png'
import constableClassFourInsignia from '../assets/ranks/pc-1.png'
import './RankStructure.css'

type RankGroupId = 'all' | 'command' | 'gazetted' | 'inspectors' | 'sergeants' | 'constables'

interface RankGroup {
  id: Exclude<RankGroupId, 'all'>
  label: string
  summary: string
}

interface RankCard {
  id: string
  title: string
  group: Exclude<RankGroupId, 'all'>
  image: string
}

const rankGroups: RankGroup[] = [
  {
    id: 'command',
    label: 'Command',
    summary: 'National command and senior strategic leadership ranks.',
  },
  {
    id: 'gazetted',
    label: 'Gazetted Officers',
    summary: 'Senior operational leadership across formations and divisions.',
  },
  {
    id: 'inspectors',
    label: 'Inspectorate',
    summary: 'Front-line supervision and station-level operational command.',
  },
  {
    id: 'sergeants',
    label: 'Sergeants',
    summary: 'Section leadership and disciplined field execution roles.',
  },
  {
    id: 'constables',
    label: 'Constables',
    summary: 'Core policing ranks that anchor public-facing service delivery.',
  },
]

const rankCards: RankCard[] = [
  { id: 'igp', title: 'Inspector General Of Police', group: 'command', image: igpInsignia },
  { id: 'sdig', title: 'Senior Deputy Inspector General Of Police', group: 'command', image: sdigInsignia },
  { id: 'dig', title: 'Deputy Inspector General Of Police', group: 'command', image: digInsignia },
  { id: 'ssp', title: 'Senior Superintendent Of Police', group: 'gazetted', image: sspInsignia },
  { id: 'sp', title: 'Superintendent Of Police', group: 'gazetted', image: spInsignia },
  { id: 'asp', title: 'Assistant Superintendent Of Police', group: 'gazetted', image: aspInsignia },
  { id: 'chief-inspector', title: 'Chief Inspector Of Police', group: 'inspectors', image: chiefInspectorInsignia },
  { id: 'inspector', title: 'Inspector Of Police', group: 'inspectors', image: inspectorInsignia },
  { id: 'sub-inspector', title: 'Sub Inspector Of Police', group: 'inspectors', image: subInspectorInsignia },
  { id: 'sergeant-major', title: 'Sergeant Major', group: 'sergeants', image: sergeantMajorInsignia },
  { id: 'sergeant-class-1', title: 'Police Sergeant Class 1', group: 'sergeants', image: sergeantClassOneInsignia },
  { id: 'sergeant-class-2', title: 'Police Sergeant Class 2', group: 'sergeants', image: sergeantClassTwoInsignia },
  { id: 'constable-class-1', title: 'Police Constable Class 1', group: 'constables', image: constableClassOneInsignia },
  { id: 'constable-class-2', title: 'Police Constable Class 2', group: 'constables', image: constableClassTwoInsignia },
  { id: 'constable-class-3', title: 'Police Constable Class 3', group: 'constables', image: constableClassThreeInsignia },
  { id: 'constable-class-4', title: 'Police Constable Class 4', group: 'constables', image: constableClassFourInsignia },
]

const heroStats = [
  { value: '16', label: 'Official insignia' },
  { value: '5', label: 'Rank bands' },
  { value: '2025', label: 'Source artwork year' },
]

export default function RankStructure() {
  const [activeGroupId, setActiveGroupId] = useState<RankGroupId>('all')

  const visibleRanks = useMemo(() => {
    if (activeGroupId === 'all') {
      return rankCards
    }

    return rankCards.filter(rank => rank.group === activeGroupId)
  }, [activeGroupId])

  const activeGroupSummary =
    activeGroupId === 'all'
      ? 'Browse the complete official insignia set in the same order used on the Sri Lanka Police rank structure page.'
      : rankGroups.find(group => group.id === activeGroupId)?.summary ?? ''

  const handleScrollToGallery = () => {
    document.querySelector('#rank-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleOpenSource = () => {
    window.open('https://www.police.lk/?page_id=1708', '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="rank-page">
      <NavBar activeLabel="Library" />

      <header className="rank-page__hero">
        <div className="rank-page__hero-copy">
          <p className="rank-page__eyebrow">Library</p>
          <h1>Rank Structure / Insignia</h1>
          <p>
            Recreated from the official Sri Lanka Police rank structure page, but adapted into the same blue-white
            interface language already used across this frontend.
          </p>

          <div className="rank-page__hero-actions">
            <button type="button" className="rank-page__hero-btn is-primary" onClick={handleScrollToGallery}>
              Browse Rank Cards
            </button>
            <button type="button" className="rank-page__hero-btn" onClick={handleOpenSource}>
              Open Official Source
            </button>
          </div>
        </div>

        <div className="rank-page__hero-panel">
          <img src={policeLogoWatermark} alt="" aria-hidden="true" className="rank-page__hero-watermark" />

          <div className="rank-page__hero-stats" role="presentation">
            {heroStats.map(stat => (
              <div key={stat.label} className="rank-page__hero-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="rank-page__container">
        <section className="rank-page__intro">
          <div>
            <p className="rank-page__eyebrow">Reference</p>
            <h2>Official insignia, reorganized for this portal</h2>
            <p>
              The original source page is a plain sequential gallery. This version keeps the same rank titles and official
              insignia artwork, then reorganizes them into clearer groupings so the page fits the rest of the site.
            </p>
          </div>

          <div className="rank-page__intro-card">
            <span>Current view</span>
            <strong>{activeGroupId === 'all' ? 'Full rank ladder' : rankGroups.find(group => group.id === activeGroupId)?.label}</strong>
            <p>{activeGroupSummary}</p>
          </div>
        </section>

        <section className="rank-page__filters">
          <div className="rank-page__section-head">
            <div>
              <p className="rank-page__eyebrow">Navigate</p>
              <h3>Filter by rank band</h3>
            </div>
            <p>{visibleRanks.length} insignia visible</p>
          </div>

          <div className="rank-page__filter-list" role="tablist" aria-label="Rank bands">
            <button
              type="button"
              role="tab"
              aria-selected={activeGroupId === 'all'}
              className={`rank-page__filter${activeGroupId === 'all' ? ' is-active' : ''}`}
              onClick={() => setActiveGroupId('all')}
            >
              <span>All</span>
              <strong>Complete structure</strong>
            </button>

            {rankGroups.map(group => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={activeGroupId === group.id}
                className={`rank-page__filter${activeGroupId === group.id ? ' is-active' : ''}`}
                onClick={() => setActiveGroupId(group.id)}
              >
                <span>{group.label}</span>
                <strong>{group.summary}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="rank-page__gallery-section" id="rank-gallery">
          <div className="rank-page__section-head">
            <div>
              <p className="rank-page__eyebrow">Gallery</p>
              <h3>Insignia Cards</h3>
            </div>
            <p>Each card uses the official insignia image downloaded from the source page you provided.</p>
          </div>

          <div className="rank-page__gallery">
            {visibleRanks.map(rank => (
              <article key={rank.id} className="rank-page__card">
                <span className="rank-page__card-tag">
                  {rankGroups.find(group => group.id === rank.group)?.label}
                </span>
                <div className="rank-page__card-figure">
                  <img src={rank.image} alt={`${rank.title} insignia`} />
                </div>
                <h4>{rank.title}</h4>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
