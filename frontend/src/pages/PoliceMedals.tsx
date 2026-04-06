import { useEffect, useMemo, useState } from 'react'
import NavBar from '../components/NavBar'
import pLogo from '../assets/plogo.png'
import swarnaJayanthi from '../assets/medals/Swarna-Jayanthi-Padakkama.webp'
import policeWeeratha from '../assets/medals/Sri-Lanka-Police-Weeratha-Padakkama.webp'
import vishishtaSeva from '../assets/medals/Sri-Lanka-Police-Vishishta-Seva-Padakkama.webp'
import rivirasa from '../assets/medals/Rivirasa-Padakkama.webp'
import prathmadhara from '../assets/medals/Prathmadhara-Padakkama.webp'
import poornaBhoomi from '../assets/medals/Poorna-Bhoomi-Padakkama.webp'
import janaraja from '../assets/medals/Janaraja-Padakkama.webp'
import presidentPoliceWeeratha from '../assets/medals/Janadhipathi-Police-Weeratha-Padakkama.webp'
import doorapraptha from '../assets/medals/Janadhipathi-Doorapraptha-Padakkama.webp'
import deshaPuthra from '../assets/medals/Desha-Puthra-Padakkama.webp'
import deerghaSeva from '../assets/medals/Deergha-Seva-Padakkama.webp'
import anniversary125 from '../assets/medals/125-Sangwathsara-Padakkama.webp'
import './PoliceMedals.css'

type MedalGroupId = 'service' | 'gallantry' | 'campaign'

interface MedalGroup {
  id: MedalGroupId
  label: string
  summary: string
}

interface MedalCard {
  id: string
  title: string
  image: string
  groupId: MedalGroupId
  order: number
}

const medalGroups: MedalGroup[] = [
  {
    id: 'service',
    label: 'Service & Institution',
    summary: 'Long service, distinguished service, and institutional commemorative honours presented in a curated band.',
  },
  {
    id: 'gallantry',
    label: 'Gallantry & Honour',
    summary: 'Bravery and honour-focused police decorations grouped together for quick browsing.',
  },
  {
    id: 'campaign',
    label: 'Campaign & National Service',
    summary: 'Campaign-linked and national service medals arranged in the final gallery band.',
  },
]

const medalCards: MedalCard[] = [
  { id: 'swarna-jayanthi', title: 'Swarna Jayanthi Padakkama', image: swarnaJayanthi, groupId: 'service', order: 1 },
  {
    id: 'police-vishishta-seva',
    title: 'Sri Lanka Police Vishishta Seva Padakkama',
    image: vishishtaSeva,
    groupId: 'service',
    order: 2,
  },
  { id: 'deergha-seva', title: 'Deergha Seva Padakkama', image: deerghaSeva, groupId: 'service', order: 3 },
  { id: '125-sangwathsara', title: '125 Sangwathsara Padakkama', image: anniversary125, groupId: 'service', order: 4 },
  {
    id: 'police-weeratha',
    title: 'Sri Lanka Police Weeratha Padakkama',
    image: policeWeeratha,
    groupId: 'gallantry',
    order: 5,
  },
  {
    id: 'president-police-weeratha',
    title: 'Janadhipathi Police Weeratha Padakkama',
    image: presidentPoliceWeeratha,
    groupId: 'gallantry',
    order: 6,
  },
  { id: 'rivirasa', title: 'Rivirasa Padakkama', image: rivirasa, groupId: 'gallantry', order: 7 },
  { id: 'desha-puthra', title: 'Desha Puthra Padakkama', image: deshaPuthra, groupId: 'gallantry', order: 8 },
  { id: 'prathmadhara', title: 'Prathmadhara Padakkama', image: prathmadhara, groupId: 'campaign', order: 9 },
  { id: 'poorna-bhoomi', title: 'Poorna Bhoomi Padakkama', image: poornaBhoomi, groupId: 'campaign', order: 10 },
  { id: 'janaraja', title: 'Janaraja Padakkama', image: janaraja, groupId: 'campaign', order: 11 },
  {
    id: 'doorapraptha',
    title: 'Janadhipathi Doorapraptha Padakkama',
    image: doorapraptha,
    groupId: 'campaign',
    order: 12,
  },
]

export default function PoliceMedals() {
  const [activeGroupId, setActiveGroupId] = useState<MedalGroupId>('service')
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({})

  const activeGroup = useMemo(
    () => medalGroups.find(group => group.id === activeGroupId) ?? medalGroups[0],
    [activeGroupId],
  )

  const visibleMedals = useMemo(
    () => medalCards.filter(medal => medal.groupId === activeGroupId),
    [activeGroupId],
  )

  useEffect(() => {
    setLoadedImageIds({})
  }, [activeGroupId])

  const handleImageLoad = (medalId: string) => {
    setLoadedImageIds(previous => ({ ...previous, [medalId]: true }))
  }

  const handleScrollToGallery = () => {
    document.querySelector('#medal-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="medals">
      <NavBar activeLabel="Library" />

      <header className="medals__hero">
        <div className="medals__hero-content">
          <p className="medals__eyebrow">Library</p>
          <h1>Police Medals</h1>
          <p>
            Recreated from the official Sri Lanka Police medals page with the original medal artwork hosted locally inside
            your current frontend UI system.
          </p>

          <div className="medals__hero-actions">
            <button type="button" className="medals__hero-btn is-primary" onClick={handleScrollToGallery}>
              Browse Medals
            </button>
            <a
              className="medals__hero-btn"
              href="https://www.police.lk/?page_id=1779"
              target="_blank"
              rel="noreferrer"
            >
              View Official Source
            </a>
          </div>
        </div>

        <div className="medals__hero-panel">
          <div className="medals__hero-spotlight">
            <div className="medals__hero-spotlight-frame">
              <img src={swarnaJayanthi} alt="Swarna Jayanthi Padakkama" />
            </div>
            <div>
              <span className="medals__hero-tag">Featured honour</span>
              <strong>Swarna Jayanthi Padakkama</strong>
              <p>The official medal gallery begins with this commemorative decoration.</p>
            </div>
          </div>

          <div className="medals__hero-stats">
            <div className="medals__hero-stat">
              <span>12</span>
              <p>Official medals</p>
            </div>
            <div className="medals__hero-stat">
              <span>3</span>
              <p>Curated groups</p>
            </div>
          </div>

          <div className="medals__hero-note">
            <div className="medals__hero-note-emblem" aria-hidden="true">
              <img src={pLogo} alt="" />
            </div>
            <div className="medals__hero-note-copy">
              <span className="medals__hero-note-tag">Official gallery</span>
              <strong>Original titles preserved</strong>
              <p>All medal names on this page follow the official Sri Lanka Police medals listing.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="medals__container">
        <section className="medals__intro">
          <div>
            <h2>Official Medal Collection, Adapted To Your Current UI</h2>
            <p>
              The source page presents a straightforward medal grid. This version keeps the same medal names and source images,
              but upgrades the presentation with grouped navigation, stronger layout structure, and responsive card design.
            </p>
          </div>

          <div className="medals__source-card">
            <span>Source</span>
            <strong>Sri Lanka Police official website</strong>
            <p>Retrieved from the live medals page and stored locally in the frontend for stable rendering.</p>
          </div>
        </section>

        <section className="medals__gallery" id="medal-gallery">
          <div className="medals__section-heading">
            <div>
              <p className="medals__eyebrow">Medal Gallery</p>
              <h3>Browse By Medal Band</h3>
            </div>
            <p>{activeGroup.summary}</p>
          </div>

          <div className="medals__group-tabs" role="tablist" aria-label="Medal groups">
            {medalGroups.map(group => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={group.id === activeGroupId}
                className={`medals__group-tab${group.id === activeGroupId ? ' is-active' : ''}`}
                onClick={() => setActiveGroupId(group.id)}
              >
                <strong>{group.label}</strong>
                <span>{medalCards.filter(medal => medal.groupId === group.id).length} medals</span>
              </button>
            ))}
          </div>

          <div className="medals__card-grid" role="tabpanel" aria-label={activeGroup.label}>
            {visibleMedals.map((medal, index) => (
              <article
                key={medal.id}
                className="medals__card"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="medals__card-top">
                  <span>Medal {String(medal.order).padStart(2, '0')}</span>
                </div>

                <div className={`medals__image-frame${loadedImageIds[medal.id] ? ' is-loaded' : ''}`}>
                  <div className="medals__image-skeleton" aria-hidden="true" />
                  <img
                    src={medal.image}
                    alt={medal.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(medal.id)}
                  />
                </div>

                <h4>{medal.title}</h4>
              </article>
            ))}
          </div>
        </section>

        <section className="medals__registry">
          <div className="medals__section-heading">
            <div>
              <p className="medals__eyebrow">Complete Registry</p>
              <h3>Official Display Sequence</h3>
            </div>
            <p>A compact index of the full medal list shown on the official source page.</p>
          </div>

          <div className="medals__registry-list">
            {medalCards.map(medal => (
              <div key={medal.id} className="medals__registry-item">
                <span>{String(medal.order).padStart(2, '0')}</span>
                <p>{medal.title}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
