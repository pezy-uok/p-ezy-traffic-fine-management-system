import NavBar from '../../components/NavBar'
import coverImage from '../../assets/divisions/child-and-woman-cover.jpg'
import './AbuseChildrenWomenDivision.css'

const complaintReasons = [
  'Not accepting complaints or refraining from conducting proper investigation.',
  'Not conducting proper investigation against cybercrimes by the respective police stations.',
]

export default function AbuseChildrenWomenDivision() {
  return (
    <section className="cwb-page">
      <NavBar activeLabel="Division" />

      <header className="cwb-page__hero" style={{ backgroundImage: `linear-gradient(115deg, rgba(3, 105, 161, 0.85), rgba(15, 23, 42, 0.7)), url(${coverImage})` }}>
        <div className="cwb-page__hero-content">
          <p className="cwb-page__eyebrow">Division</p>
          <h1 className="cwb-page__hero-title">Bureau for the Investigation of Abuse of Children &amp; Women</h1>
          <p>
            Supporting a violence-free society for women and children through prevention, investigation, guidance, and rapid response.
          </p>
        </div>
      </header>

      <div className="cwb-page__container">
        <section className="cwb-page__pillars">
          <article className="cwb-page__card">
            <h2>Vision</h2>
            <p>Violence free society for women and children.</p>
          </article>

          <article className="cwb-page__card">
            <h2>Mission</h2>
            <p>
              To ensure a violence free society without exploitation and discrimination for children and women through enforcement of law,
              provision of directions, prevention of abuse and crimes, and rehabilitation awareness in the community.
            </p>
          </article>
        </section>

        <section className="cwb-page__section">
          <h3>Objective of Introducing Public Complaint Desk</h3>
          <p className="cwb-page__mail">(cwb.online@police.gov.lk)</p>
          <p>
            The Bureau for the Prevention of Abuse of Children and Women investigates and prevents crimes against children and women,
            including sexual violence, domestic violence, child insecurity, child labor, and cruelty to children.
          </p>
          <p>
            The Public Complaint Desk has been established so anyone can directly lodge a complaint through the email address above,
            hotline number 109, or telephone 0112 444 444.
          </p>

          <div className="cwb-page__contacts">
            <a href="mailto:cwb.online@police.gov.lk">cwb.online@police.gov.lk</a>
            <a href="tel:109">Hotline 109</a>
            <a href="tel:+94112444444">0112 444 444</a>
          </div>
        </section>

        <section className="cwb-page__section">
          <h3>When to Use the Complaint Desk</h3>
          <ul>
            {complaintReasons.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="cwb-page__section">
          <h3>Privacy and 24-Hour Response</h3>
          <p>
            Adolescents who are reluctant to visit police stations directly to lodge complaints against lawful guardians or others are
            able to submit complaints through the dedicated email and hotline numbers while protecting their privacy.
          </p>
          <p>
            The Public Complaint Desk functions 24 hours a day under the supervision of the Director, Bureau for the Prevention of Abuse
            of Children and Women, and promptly coordinates action with relevant police stations and institutions.
          </p>
        </section>
      </div>
    </section>
  )
}
