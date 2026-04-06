import { useEffect, useMemo, useState } from 'react'
import NavBar from '../components/NavBar'
import pLogo from '../assets/plogo.png'
import igp from '../assets/ranks/igp.png'
import sdig from '../assets/ranks/sdig.png'
import dig from '../assets/ranks/dig.png'
import ssp from '../assets/ranks/ssp.png'
import sp from '../assets/ranks/sp.png'
import asp from '../assets/ranks/asp.png'
import ci from '../assets/ranks/ci.png'
import ip from '../assets/ranks/ip.png'
import si from '../assets/ranks/si.png'
import sjm from '../assets/ranks/sjm.png'
import ps1 from '../assets/ranks/ps1.png'
import ps from '../assets/ranks/ps.png'
import pc4 from '../assets/ranks/pc-4.png'
import pc3 from '../assets/ranks/pc-3.png'
import pc2 from '../assets/ranks/pc-2.png'
import pc1 from '../assets/ranks/pc-1.png'
import './PoliceRanks.css'

type RankGroupId = 'senior-command' | 'officer-corps' | 'sergeant-constable'

interface RankGroup {
  id: RankGroupId
  label: string
  summary: string
}

interface RankCard {
  id: string
  title: string
  image: string
  groupId: RankGroupId
  order: number
}

const rankGroups: RankGroup[] = [
  {
    id: 'senior-command',
    label: 'Senior Command',
    summary: 'The top command sequence shown first on the official Sri Lanka Police rank structure page.',
  },
  {
    id: 'officer-corps',
    label: 'Officer Corps',
    summary: 'Officer insignia presented in descending order from Superintendent to Sub Inspector.',
  },
  {
    id: 'sergeant-constable',
    label: 'Sergeant & Constable Ladder',
    summary: 'Sergeant and constable insignia grouped as the final progression block in the official source.',
  },
]

const rankCards: RankCard[] = [
  { id: 'igp', title: 'Inspector General Of Police', image: igp, groupId: 'senior-command', order: 1 },
  { id: 'sdig', title: 'Senior Deputy Inspector General Of Police', image: sdig, groupId: 'senior-command', order: 2 },
  { id: 'dig', title: 'Deputy Inspector General Of Police', image: dig, groupId: 'senior-command', order: 3 },
  { id: 'ssp', title: 'Senior Superintendent Of Police', image: ssp, groupId: 'officer-corps', order: 4 },
  { id: 'sp', title: 'Superintendent Of Police', image: sp, groupId: 'officer-corps', order: 5 },
  { id: 'asp', title: 'Assistant Superintendent Of Police', image: asp, groupId: 'officer-corps', order: 6 },
  { id: 'ci', title: 'Chief Inspector Of Police', image: ci, groupId: 'officer-corps', order: 7 },
  { id: 'ip', title: 'Inspector Of Police', image: ip, groupId: 'officer-corps', order: 8 },
  { id: 'si', title: 'Sub Inspector Of Police', image: si, groupId: 'officer-corps', order: 9 },
  { id: 'sjm', title: 'Sergeant Major', image: sjm, groupId: 'sergeant-constable', order: 10 },
  { id: 'ps1', title: 'Police Sergeant Class 1', image: ps1, groupId: 'sergeant-constable', order: 11 },
  { id: 'ps', title: 'Police Sergeant Class 2', image: ps, groupId: 'sergeant-constable', order: 12 },
  { id: 'pc4', title: 'Police Constable Class 1', image: pc4, groupId: 'sergeant-constable', order: 13 },
  { id: 'pc3', title: 'Police Constable Class 2', image: pc3, groupId: 'sergeant-constable', order: 14 },
  { id: 'pc2', title: 'Police Constable Class 3', image: pc2, groupId: 'sergeant-constable', order: 15 },
  { id: 'pc1', title: 'Police Constable Class 4', image: pc1, groupId: 'sergeant-constable', order: 16 },
]

export default function PoliceRanks() {
  const [activeGroupId, setActiveGroupId] = useState<RankGroupId>('senior-command')
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({})

  const activeGroup = useMemo(
    () => rankGroups.find(group => group.id === activeGroupId) ?? rankGroups[0],
    [activeGroupId],
  )

  const visibleRanks = useMemo(
    () => rankCards.filter(rank => rank.groupId === activeGroupId),
    [activeGroupId],
  )

  useEffect(() => {
    setLoadedImageIds({})
  }, [activeGroupId])

  const handleScrollToGallery = () => {
    document.querySelector('#rank-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleImageLoad = (rankId: string) => {
    setLoadedImageIds(previous => ({ ...previous, [rankId]: true }))
  }

  return (
    <section className="ranks">
      <NavBar activeLabel="Library" />

      <header className="ranks__hero">
        <div className="ranks__hero-content">
          <p className="ranks__eyebrow">Library</p>
          <h1>Rank Structure / Insignia</h1>
          <p>
            Recreated from the official Sri Lanka Police rank structure page, using the original insignia images inside the
            current eZy Traffic Fine visual system.
          </p>

          <div className="ranks__hero-actions">
            <button type="button" className="ranks__hero-btn is-primary" onClick={handleScrollToGallery}>
              Browse Insignia
            </button>
            <a
              className="ranks__hero-btn"
              href="https://www.police.lk/?page_id=1708"
              target="_blank"
              rel="noreferrer"
            >
              View Official Source
            </a>
          </div>
        </div>

        <div className="ranks__hero-panel">
          <div className="ranks__hero-stat">
            <span>16</span>
            <p>Official insignia cards</p>
          </div>
          <div className="ranks__hero-stat">
            <span>3</span>
            <p>Presentation groups</p>
          </div>
          <div className="ranks__hero-note">
            <div className="ranks__hero-note-emblem" aria-hidden="true">
              <img src={pLogo} alt="" />
            </div>
            <div className="ranks__hero-note-copy">
              <span className="ranks__hero-note-tag">Official sequence</span>
              <strong>Display order preserved</strong>
              <p>The official display order is preserved from top command through constable grades.</p>
            </div>
            <div className="ranks__hero-note-side" aria-hidden="true">
              <span />
              <small>16-step progression</small>
            </div>
          </div>
        </div>
      </header>

      <div className="ranks__container">
        <section className="ranks__intro">
          <div>
            <h2>Official Rank Order, Adapted To Your Current UI</h2>
            <p>
              The original page is a simple vertical list of insignia and titles. This version keeps the same rank names and
              image assets, but reorganizes them into responsive cards and grouped navigation so it feels consistent with the
              rest of your frontend.
            </p>
          </div>

          <div className="ranks__source-card">
            <span>Source</span>
            <strong>Sri Lanka Police official website</strong>
            <p>Retrieved from the live rank structure page and stored locally in the frontend for stable rendering.</p>
          </div>
        </section>

        <section className="ranks__gallery" id="rank-gallery">
          <div className="ranks__section-heading">
            <div>
              <p className="ranks__eyebrow">Insignia Gallery</p>
              <h3>Browse By Rank Band</h3>
            </div>
            <p>{activeGroup.summary}</p>
          </div>

          <div className="ranks__group-tabs" role="tablist" aria-label="Rank groups">
            {rankGroups.map(group => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={group.id === activeGroupId}
                className={`ranks__group-tab${group.id === activeGroupId ? ' is-active' : ''}`}
                onClick={() => setActiveGroupId(group.id)}
              >
                <strong>{group.label}</strong>
                <span>{rankCards.filter(rank => rank.groupId === group.id).length} ranks</span>
              </button>
            ))}
          </div>

          <div className="ranks__card-grid" role="tabpanel" aria-label={activeGroup.label}>
            {visibleRanks.map((rank, index) => (
              <article
                key={rank.id}
                className={`ranks__card${loadedImageIds[rank.id] ? ' is-loaded' : ''}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="ranks__card-top">
                  <span>Rank {String(rank.order).padStart(2, '0')}</span>
                </div>

                <div className={`ranks__image-frame${loadedImageIds[rank.id] ? ' is-loaded' : ''}`}>
                  <div className="ranks__image-skeleton" aria-hidden="true" />
                  <img
                    src={rank.image}
                    alt={rank.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(rank.id)}
                  />
                </div>

                <h4>{rank.title}</h4>
              </article>
            ))}
          </div>
        </section>

        <section className="ranks__progression">
          <div className="ranks__section-heading">
            <div>
              <p className="ranks__eyebrow">Full Progression</p>
              <h3>Official Display Sequence</h3>
            </div>
            <p>A compact ladder view of the same order shown on the official page.</p>
          </div>

          <div className="ranks__progression-list">
            {rankCards.map(rank => (
              <div key={rank.id} className="ranks__progression-item">
                <span>{String(rank.order).padStart(2, '0')}</span>
                <p>{rank.title}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
