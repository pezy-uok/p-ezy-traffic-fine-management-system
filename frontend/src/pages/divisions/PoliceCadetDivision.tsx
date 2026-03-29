import NavBar from '../../components/NavBar'
import coverImage from '../../assets/divisions/cadet-cover.jpg'
import './PoliceCadetDivision.css'

const trainingRegions = [
  'Galle',
  'Kandy',
  'Colombo Central',
  'Kurunegala',
  'Anuradhapura',
  'Badulla',
  'Gampaha',
  'Ratnapura',
  'Kegalle',
  'Tangalle',
  'Polonnaruwa',
  'Kalutara',
  'Matale',
  'Kuliyapitiya',
  'Monaragala',
  'Matara',
  'Ampara',
  'Nuwara Eliya',
]

const dutySummary = [
  'Through R.T.M. 214 dated 7th September 2010, issued by Dr. Mahinda Balasooriya (then Inspector General of Police), and on orders of the then President, all officers in charge of provinces and divisions were instructed to initiate police cadet activities focusing on 18 NCC platoons established across the island.',
  'Training programs are initiated by police officers appointed to train cadet corps at National Cadet Corps platoons and divisional levels under direct supervision of officers in charge of the relevant divisions.',
]

export default function PoliceCadetDivision() {
  return (
    <section className="cadet-page">
      <NavBar activeLabel="Division" />

      <header
        className="cadet-page__hero"
        style={{ backgroundImage: `linear-gradient(115deg, rgba(2, 132, 199, 0.76), rgba(15, 23, 42, 0.74)), url(${coverImage})` }}
      >
        <div className="cadet-page__hero-content">
          <p className="cadet-page__eyebrow">Division</p>
          <h1>Police Cadet Division</h1>
          <p>
            Building a disciplined, law-abiding, energetic future generation with positive attitudes, leadership qualities, and
            strong public service values.
          </p>
        </div>
      </header>

      <div className="cadet-page__container">
        <section className="cadet-page__intro-grid">
          <article className="cadet-page__card">
            <h2>Vision</h2>
            <p>
              To witness all people living safely within the country by bringing about a disciplined, law-abiding, energetic
              future generation with positive attitudes.
            </p>
          </article>

          <article className="cadet-page__card">
            <h2>Mission</h2>
            <p>
              To contribute to sustainable development in the country through a talented young generation capable of facing future
              challenges, by molding school students into disciplined individuals with positive attitudes, dynamic personalities,
              and effective leadership qualities.
            </p>
          </article>
        </section>

        <section className="cadet-page__history">
          <div className="cadet-page__section-head">
            <p className="cadet-page__eyebrow">History</p>
            <h3>Foundation of the Service</h3>
          </div>

          <p>
            After Sri Lanka became a Republic in 1972, and under instructions of the then Prime Minister with the special
            initiative of Mr. Stanley Senanayake, who held the post of Inspector General of Police, the Sri Lanka Police Cadet
            Service was established on 4th July 1972 at Special Police Reserve Headquarters, London Place, Colombo.
          </p>
          <p>
            The purpose was to create a well-disciplined, upright, and healthy younger generation while building a close
            relationship between the police and the public, following the Police Cadet Service model in Malaysia in collaboration
            with the Ministry of Education.
          </p>
        </section>

        <section className="cadet-page__duties">
          <div className="cadet-page__section-head">
            <p className="cadet-page__eyebrow">Cadet Programs</p>
            <h3>Summary of Duties and Initiatives</h3>
          </div>

          <ul>
            {dutySummary.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="cadet-page__regions">
          <div className="cadet-page__section-head">
            <p className="cadet-page__eyebrow">Training Network</p>
            <h3>Divisions under Direct Supervision</h3>
          </div>

          <div className="cadet-page__chips">
            {trainingRegions.map(region => (
              <span key={region}>{region}</span>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
