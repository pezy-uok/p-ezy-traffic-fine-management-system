import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import NavBar from '../components/NavBar'
import pLogo from '../assets/plogo.png'
import './PoliceIGPList.css'

type EraId = 'recent' | 'modern' | 'national' | 'early'

interface EraGroup {
  id: EraId
  label: string
  summary: string
}

interface IGPEntry {
  id: string
  name: string
  period: string
  imageFile: string
  eraId: EraId
}

const portraitModules = import.meta.glob('../assets/igp/*', { eager: true, import: 'default' }) as Record<string, string>

const getPortrait = (imageFile: string) => portraitModules[`../assets/igp/${imageFile}`] ?? pLogo

const currentIGP = {
  name: 'Mr. Priyantha Weerasooriya',
  designation: 'Attorney-at-Law',
  period: 'From 14-08-2025',
  imageFile: 'IGP_Priyantha_weerasooriya.png',
}

const eraGroups: EraGroup[] = [
  {
    id: 'recent',
    label: 'Recent Leadership',
    summary: 'Current and recent IGP appointments from 2020 onward, including the latest transition on August 14, 2025.',
  },
  {
    id: 'modern',
    label: 'Modern Era',
    summary: 'Leadership appointments spanning the late 1990s through the 2010s.',
  },
  {
    id: 'national',
    label: 'National Era',
    summary: 'Post-independence leadership appointments from 1947 through the late 1990s.',
  },
  {
    id: 'early',
    label: 'Early Command',
    summary: 'Foundational and colonial-era police leadership listed from 1866 through 1946.',
  },
]

const igpEntries: IGPEntry[] = [
  { id: 'tmwd-thennakoon', name: 'T.M.W.D. Thennakoon', period: '29.02.2024 - 07.08.2025', imageFile: 'deshabandu-thennakon.png', eraId: 'recent' },
  { id: 'cd-wickramarathne', name: 'C.D. Wickramarathne', period: '27.11.2020 - 23.11.2023', imageFile: '01-199x249x0x0x199x249x1701340295.jpg', eraId: 'recent' },
  { id: 'pujith-jayasundara', name: 'Pujith Jayasundara', period: '20.04.2016 - 14.03.2020', imageFile: '02-199x249x0x0x199x248x1701340296.jpg', eraId: 'modern' },
  { id: 'nk-illangakoon', name: 'N.K. Illangakoon', period: '16.07.2011 - 12.04.2016', imageFile: '03-199x249x0x1x199x247x1701340296.jpg', eraId: 'modern' },
  { id: 'mahinda-balasooriya', name: 'Dr. Mahinda Balasooriya', period: '03.11.2009 - 17.06.2011', imageFile: '04-199x249x0x0x199x249x1701340297.jpg', eraId: 'modern' },
  { id: 'hajsk-wickramaratne', name: 'H.A.J.S.K. Wickramaratne', period: '01.07.2008 - 02.11.2009', imageFile: '06-199x249x0x0x199x249x1701340298.jpg', eraId: 'modern' },
  { id: 'victor-perera', name: 'Y.P. Victor Perera', period: '12.10.2006 - 31.06.2008', imageFile: '05-198x248x0x0x198x248x1701340297.jpg', eraId: 'modern' },
  { id: 'chandra-fernando', name: 'Chandra Fernando', period: '01.10.2004 - 11.10.2006', imageFile: '07-198x248x0x0x198x248x1701340298.jpg', eraId: 'modern' },
  { id: 'indra-de-silva', name: 'T. Indra De Silva', period: '19.12.2003 - 30.09.2004', imageFile: '08-198x248x0x0x198x248x1701340299.jpg', eraId: 'modern' },
  { id: 'anandarajah', name: 'T.E. Anandarajah', period: '28.08.2002 - 14.10.2003', imageFile: '09-198x248x0x0x198x248x1701340299.jpg', eraId: 'modern' },
  { id: 'kodituwakku', name: 'B.L.V. De S. Kodituwakku', period: '01.09.1998 - 27.08.2002', imageFile: '10-198x248x0x0x198x248x1701340300.jpg', eraId: 'modern' },
  { id: 'rajaguru', name: 'W.B. Rajaguru', period: '31.07.1995 - 31.08.1998', imageFile: '11-198x248x0x0x198x248x1701340300.jpg', eraId: 'national' },
  { id: 'tpf-de-silva', name: 'Dr. T.P.F. De Silva', period: '29.11.1993 - 31.07.1995', imageFile: '12-198x248x0x0x198x248x1701340301.jpg', eraId: 'national' },
  { id: 'eeb-perera', name: 'E.E.B. Perera', period: '01.08.1988 - 29.11.1993', imageFile: '13-198x248x0x0x198x248x1701340301.jpg', eraId: 'national' },
  { id: 'ldc-herath', name: 'L.D.C. Herath', period: '06.12.1985 - 31.07.1988', imageFile: '14-198x248x0x0x198x248x1701340302.jpg', eraId: 'national' },
  { id: 'whw-weerasinghe', name: 'H.W.H. Weerasinghe', period: '21.04.1985 - 05.12.1985', imageFile: '15-198x248x0x0x198x248x1701340303.jpg', eraId: 'national' },
  { id: 'rudra-rajasingham', name: 'Rudra Rajasingham', period: '20.04.1982 - 20.04.1985', imageFile: '16-198x248x0x0x198x248x1701340303.jpg', eraId: 'national' },
  { id: 'senaviratne', name: 'G.A.D.E.A. Senaviratne', period: '24.08.1978 - 14.03.1982', imageFile: '17-198x248x0x0x198x248x1701340305.jpg', eraId: 'national' },
  { id: 'senanayake', name: 'D.S.E.P.R. Senanayake', period: '14.09.1970 - 23.08.1978', imageFile: '18-198x248x0x0x198x248x1701340306.jpg', eraId: 'national' },
  { id: 'abeygoonawardene', name: 'E.L. Abeygoonawardene', period: '08.07.1967 - 13.09.1970', imageFile: '19-198x248x0x0x198x248x1701340307.jpg', eraId: 'national' },
  { id: 'john-atygalla', name: 'John Atygalla', period: '04.06.1966 - 07.07.1967', imageFile: '20-198x248x0x0x198x248x1701340308.jpg', eraId: 'national' },
  { id: 'sa-dissanayake', name: 'S.A. Dissanayake', period: '03.06.1963 - 03.06.1966', imageFile: '21-198x248x0x0x198x248x1701340309.jpg', eraId: 'national' },
  { id: 'mwf-abeykoon', name: 'M.W.F. Abeykoon', period: '26.04.1959 - 29.04.1963', imageFile: '22-198x248x0x0x198x248x1701340310.jpg', eraId: 'national' },
  { id: 'swo-de-silva', name: 'S.W. O De Silva', period: '1955 - 1959', imageFile: '23-198x248x0x0x198x248x1701340311.jpg', eraId: 'national' },
  { id: 'sir-richard-aluvihare', name: 'Sir Richard Aluvihare', period: '1947 - 1955', imageFile: '24-198x248x0x0x198x248x1701340312.jpg', eraId: 'national' },
  { id: 'bacon', name: 'Lt. Col. R.R.M. Bacon', period: '1944 - 1946', imageFile: '25-198x248x0x0x198x248x1701340313.jpg', eraId: 'early' },
  { id: 'haland', name: 'Col. G.H.R. Haland', period: '1942 - 1944', imageFile: '26-198x248x0x0x198x248x1701340314.jpg', eraId: 'early' },
  { id: 'pn-banks', name: 'P.N. Banks', period: '1937 - 1942', imageFile: '27-198x248x0x0x198x248x1701340315.jpg', eraId: 'early' },
  { id: 'dowbiggin', name: 'Sir H.L. Dowbiggin', period: '1913 - 1937', imageFile: '28-198x248x0x0x198x248x1701340316.jpg', eraId: 'early' },
  { id: 'ivor-edward-david', name: 'Ivor Edward David', period: '1910 - 1913', imageFile: '29-198x248x0x0x198x248x1701340318.jpg', eraId: 'early' },
  { id: 'cc-longdon', name: 'C.C. Longdon', period: '1905 - 1910', imageFile: '30-198x248x0x0x198x248x1701340319.jpg', eraId: 'early' },
  { id: 'de-witton', name: 'Major A.W. De Witton', period: '1902 - 1905', imageFile: '31-198x248x0x0x198x248x1701340320.jpg', eraId: 'early' },
  { id: 'knolis', name: 'Major L.F. Knolis', period: '1891 - 1902', imageFile: '32-198x248x0x0x198x248x1701340321.jpg', eraId: 'early' },
  { id: 'fr-sanders', name: 'F.R. Sanders', period: '1872 - 1873', imageFile: '34-198x248x0x0x198x248x1701767107.jpg', eraId: 'early' },
  { id: 'gwr-campbell', name: 'Sir G.W.R. Campbell', period: '1873 - 1891 / 1866 - 1872', imageFile: '33-198x248x0x0x198x248x1701340322.jpg', eraId: 'early' },
]

export default function PoliceIGPList() {
  const [activeEraId, setActiveEraId] = useState<EraId>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, boolean>>({})

  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase())

  const activeEra = useMemo(
    () => eraGroups.find(group => group.id === activeEraId) ?? eraGroups[0],
    [activeEraId],
  )

  const visibleEntries = useMemo(
    () =>
      igpEntries.filter(entry => {
        const matchesEra = entry.eraId === activeEraId
        const matchesQuery =
          deferredQuery.length === 0 ||
          entry.name.toLowerCase().includes(deferredQuery) ||
          entry.period.toLowerCase().includes(deferredQuery)

        return matchesEra && matchesQuery
      }),
    [activeEraId, deferredQuery],
  )

  useEffect(() => {
    setLoadedImageIds({})
  }, [activeEraId, deferredQuery])

  const handleImageLoad = (entryId: string) => {
    setLoadedImageIds(previous => ({ ...previous, [entryId]: true }))
  }

  const handleScrollToRoster = () => {
    document.querySelector('#igp-roster')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="igp-list">
      <NavBar activeLabel="Library" />

      <header className="igp-list__hero">
        <div className="igp-list__hero-content">
          <p className="igp-list__eyebrow">Library</p>
          <h1>Inspector Generals Of Police</h1>
          <p>
            Recreated from the official Sri Lanka Police IGP page, preserving the listed names, service periods, and portrait
            sequence inside your current frontend design system.
          </p>

          <div className="igp-list__hero-actions">
            <button type="button" className="igp-list__hero-btn is-primary" onClick={handleScrollToRoster}>
              Browse Leadership
            </button>
            <a
              className="igp-list__hero-btn"
              href="https://www.police.lk/?page_id=1130"
              target="_blank"
              rel="noreferrer"
            >
              View Official Source
            </a>
          </div>
        </div>

        <div className="igp-list__hero-panel">
          <div className="igp-list__current-card">
            <div className="igp-list__current-portrait">
              <img src={getPortrait(currentIGP.imageFile)} alt={currentIGP.name} />
            </div>

            <div className="igp-list__current-copy">
              <span className="igp-list__current-tag">Current officeholder</span>
              <strong>{currentIGP.name}</strong>
              <p>{currentIGP.designation}</p>
              <small>{currentIGP.period}</small>
            </div>
          </div>

          <div className="igp-list__hero-stats">
            <div className="igp-list__hero-stat">
              <span>36</span>
              <p>Leaders listed</p>
            </div>
            <div className="igp-list__hero-stat">
              <span>1866</span>
              <p>Earliest tenure shown</p>
            </div>
            <div className="igp-list__hero-stat">
              <span>4</span>
              <p>Historical eras</p>
            </div>
          </div>
        </div>
      </header>

      <div className="igp-list__container">
        <section className="igp-list__featured">
          <div className="igp-list__featured-portrait">
            <div className="igp-list__featured-portrait-frame">
              <img src={getPortrait(currentIGP.imageFile)} alt={currentIGP.name} />
            </div>
          </div>

          <div className="igp-list__featured-body">
            <div className="igp-list__featured-emblem" aria-hidden="true">
              <img src={pLogo} alt="" />
            </div>

            <div className="igp-list__featured-copy">
              <p className="igp-list__eyebrow">Current Inspector General</p>
              <h2>{currentIGP.name}</h2>
              <strong>{currentIGP.designation}</strong>
              <p>{currentIGP.period}</p>
            </div>

            <div className="igp-list__featured-stats">
              <div className="igp-list__featured-stat">
                <span>36</span>
                <p>Leaders listed</p>
              </div>
              <div className="igp-list__featured-stat">
                <span>1866</span>
                <p>Historical start</p>
              </div>
              <div className="igp-list__featured-stat">
                <span>4</span>
                <p>Era groups</p>
              </div>
            </div>
          </div>
        </section>

        <section className="igp-list__intro">
          <div>
            <h2>Official IGP Roster, Adapted To Your Current UI</h2>
            <p>
              The source page is a long portrait archive. This version keeps the official names and periods intact while
              reorganizing them into era filters, searchable leadership cards, and a clearer historical browsing experience.
            </p>
          </div>

          <div className="igp-list__source-card">
            <span>Source</span>
            <strong>Sri Lanka Police official website</strong>
            <p>Retrieved from the live IGP page and stored locally in the frontend for stable rendering.</p>
          </div>
        </section>

        <section className="igp-list__roster" id="igp-roster">
          <div className="igp-list__section-heading">
            <div>
              <p className="igp-list__eyebrow">Leadership Archive</p>
              <h3>Browse By Era</h3>
            </div>
            <p>{activeEra.summary}</p>
          </div>

          <div className="igp-list__controls">
            <div className="igp-list__era-tabs" role="tablist" aria-label="IGP eras">
              {eraGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={group.id === activeEraId}
                  className={`igp-list__era-tab${group.id === activeEraId ? ' is-active' : ''}`}
                  onClick={() => setActiveEraId(group.id)}
                >
                  <strong>{group.label}</strong>
                  <span>{igpEntries.filter(entry => entry.eraId === group.id).length} records</span>
                </button>
              ))}
            </div>

            <label className="igp-list__search">
              <span>Search</span>
              <input
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search by name or period"
                aria-label="Search IGP records"
              />
            </label>
          </div>

          <div className="igp-list__card-grid" role="tabpanel" aria-label={activeEra.label}>
            {visibleEntries.map((entry, index) => (
              <article key={entry.id} className="igp-list__card" style={{ animationDelay: `${index * 45}ms` }}>
                <div className="igp-list__card-top">
                  <span>{entry.period}</span>
                </div>

                <div className={`igp-list__portrait-frame${loadedImageIds[entry.id] ? ' is-loaded' : ''}`}>
                  <div className="igp-list__portrait-skeleton" aria-hidden="true" />
                  <img
                    src={getPortrait(entry.imageFile)}
                    alt={entry.name}
                    loading="lazy"
                    onLoad={() => handleImageLoad(entry.id)}
                  />
                </div>

                <h4>{entry.name}</h4>
                <p>{entry.period}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
