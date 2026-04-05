import NavBar from '../../components/NavBar'
import './DivisionPlaceholder.css'

interface DivisionPlaceholderProps {
  title: string
}

export default function DivisionPlaceholder({ title }: DivisionPlaceholderProps) {
  return (
    <section className="division-page">
      <NavBar activeLabel="Division" />

      <div className="division-page__hero">
        <p className="division-page__eyebrow">Division</p>
        <h1>{title}</h1>
        <p>This page is intentionally left blank for upcoming content.</p>
      </div>

      <div className="division-page__body">
        <div className="division-page__card">
          <h2>Placeholder</h2>
          <p>Add your section layout, media, and records here in the next step.</p>
        </div>
      </div>
    </section>
  )
}
