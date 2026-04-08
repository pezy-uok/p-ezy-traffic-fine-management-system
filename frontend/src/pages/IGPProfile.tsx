import igpImage from '../assets/igp.png'
import NavBar from '../components/NavBar'
import './IGPProfile.css'

export default function IGPProfile() {
  return (
    <section className="igp-profile">
      <NavBar />

      {/* Hero Section */}
      <div className="igp-profile__hero">
        <h1 className="igp-profile__hero-title">37th Inspector General of Police</h1>
      </div>

      {/* Main Content Container */}
      <div className="igp-profile__container">
        {/* Profile Image */}
        <div className="igp-profile__image-section">
          <img src={igpImage} alt="Inspector General of Police" className="igp-profile__image" />
          <h2 className="igp-profile__name">Attorney-at-Law Mr. Priyantha Weerasooriya</h2>
        </div>

        {/* Content */}
        <article className="igp-profile__article">
          <p>
            Attorney-at-Law Mr. Priyantha Weerasooriya assumed duties as the 37th Inspector General of Police at
            Police Headquarters on the morning of 14th August 2025.
          </p>

          <p>
            Weerasooriya Liyana Arachchige Saman Priyantha who was born on 09th of February, 1969, received his basic
            education at Nehinna Kanishta Vidyalaya, Dodangoda, and then he completed his secondary education at
            Gnanodaya Maha Vidyalaya, Kalutara.
          </p>

          <p>
            Having passionately chosen Sri Lanka Police as his career path, while pursuing his studies, he joined the
            Police hierarchy through a junior rank on 20. 05. 1988.
          </p>

          <p>
            He then excelled at the G.C.E. Advanced Level Examination in 1990 and was selected to the Faculty of Law of
            the University of Colombo. Thereafter, he was recruited as a probationary Sub Inspector of Police in 1992
            under the direct recruitment to the rank of Sub Inspector of Police. While discharging duties in the police
            service, he successfully completed his Bachelor of Laws Degree from the Faculty of Law of the University of
            Colombo from 1993 to 1998. Subsequently, considering his degree as a basic entry qualification, he was
            directly recruited as a probationary Assistant Superintendent of Police in 1999. When he was receiving his
            basic training in the new post, he took oath as a Notary Public, Commissioner for Oaths, and an Attorney at
            Law from the Supreme Court in 1999.In addition to that, he has obtained a Master of Business Administration
            in Human Resource Management from the University of Colombo.
          </p>

          <p>
            He was promoted to the rank of Superintendent of Police in 2007, to the rank of Senior Superintendent of
            Police in 2012, to the rank of Deputy Inspector General of Police in 2016, and to the rank of Senior Deputy
            Inspector General of Police in 2020.
          </p>

          <p>
            Mr. Priyantha Weerasooriya was appointed by the Hon. President subject to the approval of the Constitutional
            Council to act in the office of the Inspector General of Police with effect from 27.09.2024, as he was an
            efficient and experienced officer in administrative and field duties, who has performed duties as a Director,
            Officer in charge of several Police Divisions, a Deputy Inspector General of Police in charge of Ranges, and
            a Senior Deputy Inspector General of Police in charge of Provinces, during his service period of 37 years.
          </p>

          <p>
            Several projects have also been actively implemented by conducting various surveys on the diverse duties and
            necessary infrastructure of the police service.
          </p>

          <p>
            As a result, giving greater attention to the welfare of police officers, the issuance of uniforms,
            sportswear sets, sports shoes, and bed sheets to be used in special duties of police officers was also
            introduced by Mr.Priyantha Weerasooriya.
          </p>

          <p>
            While performing duties as the Acting Inspector General of Police, he has worked in cooperation with
            International Police, for the arrest and extradition of criminals from foreign countries, fostering strong
            relations at the diplomatic level. Moreover, new recruitments in the Junior and Inspectors' Grades were
            expedited. Work has been initiated to approve the Schemes of Recruitment of the Junior and Inspectors'
            Grades and the Executive Grade as well as to resolve issues related to promotions.
          </p>

          <p>
            Functioning of IG's Public Assistance Chamber, holding public assistance days, introducing WhatsApp groups
            for lodging public complaints and providing information at any time, initiating pilot projects such as
            'Govpay' at the level of Headquarters Station, establishing provincial Crime Investigation Divisions and
            improving the quality of the police service are such significant tasks carried out during his tenor as the
            Acting IGP.
          </p>

          <p>
            Positive initiatives, such as effectively monitoring the duties of police officers, identifying
            underperforming officers, and terminating the service of officers convicted of corruption, are long-term
            plans established to achieve excellence in the Sri Lanka Police Service. For this, rather than opting for
            simple fixes, finding more complex and long-term solutions by obtaining proper guidelines from the Ministry
            of Public Security and Parliamentary Affairs, such as making plans to acquire new housing complexes to
            increase the number of official quarters for married officers, is an effective task.
          </p>

          <p>
            Mr. Priyantha Weerasooriya, has successfully completed many foreign and local courses, including the Life
            Saving Training Course for Officers in the United States of America, the Long Course on Security in
            Bangladesh, the Law Enforcement and Management Course in Vietnam, and Australia, the Course on Management and
            Administration in Thailand, the Course on Implementation and Evaluation in Malaysia, the Security Technology
            Course in Russia, the Course on White Collar Crimes in the United States of America, and the Course on
            Artificial Intelligence and Leadership by the Royal Malaysia Police.
          </p>

          <p>
            Further, he has also made a direct contribution to the United Nations Operations carried out in East Timor
            and Haiti from 2008 to 2011.
          </p>

          <p>
            With this new appointment, the Sri Lanka Police anticipates a continued commitment to upholding justice,
            strengthening law and order, and ensuring public trust under the guidance of IGP Attorney at Law Mr.
            Priyantha Weerasooriya.
          </p>
        </article>
      </div>
    </section>
  )
}
