import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './study-guide.css'
import data from './data/adultKyuStudyGuideData.json'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${String(path || '').replace(/^\/+/, '')}`

const CATEGORY_LABELS = {
  ukemi: 'Ukemi',
  tachiwaza: 'Tachi-waza',
  newaza: 'Ne-waza',
  freePractice: 'Free Practice',
  fundamentalSkills: 'Fundamental Skills',
  performanceSkills: 'Performance Skills',
  generalBehaviour: 'General Behaviour',
  terminology: 'Terminology'
}

const KYU_BELT_COLORS = {
  '5k': ['#facc15'],
  '4k': ['#f97316'],
  '3k': ['#10b981'],
  '2k': ['#2563eb'],
  '1k': ['#78350f']
}

function getKyuBaseId(gradeId) {
  const value = String(gradeId || '').toLowerCase()
  if (value.startsWith('5k')) return '5k'
  if (value.startsWith('4k')) return '4k'
  if (value.startsWith('3k')) return '3k'
  if (value.startsWith('2k')) return '2k'
  if (value.startsWith('1k')) return '1k'
  return ''
}

function KyuStudyGuidePage() {
  const syllabusPdfUrl = 'https://irishjudoassociation.ie/wp-content/uploads/2024/02/IJA-Grading-Syllabus-V8-2024-16.01.2024.pdf'
  const syllabusCover = publicAsset('/ija-grading-info-cover.png')

  return (
    <div className="sg-page">
      <header className="sg-hero">
        <p className="sg-kicker">Cabra Judo Club</p>
        <h1>Adult Kyu Study Guide</h1>
        <a href={publicAsset('/index.html')} className="sg-home-link">
          Back to Cabra Grading
        </a>
        <div className="sg-koka-card">
          <a href={syllabusPdfUrl} target="_blank" rel="noreferrer" className="sg-koka-thumb-link" aria-label="Open IJA Grading Information 2024 PDF">
            <img src={syllabusCover} alt="IJA Grading Information 2024 cover" className="sg-koka-thumb" loading="lazy" />
          </a>
          <a href={syllabusPdfUrl} target="_blank" rel="noreferrer" className="sg-koka-button">
            Open IJA Grading PDF
          </a>
        </div>
      </header>

      <main className="sg-content">
        {data.grades.map((grade) => (
          <section className="sg-grade" key={grade.gradeId}>
            <div className="sg-grade-head">
              <div className="sg-grade-title-row">
                <h2>{grade.gradeName}</h2>
                <div className="sg-belt-swatches" aria-label={`${grade.gradeName} belt colors`}>
                  {(KYU_BELT_COLORS[getKyuBaseId(grade.gradeId)] || []).map((color, idx) => (
                    <span
                      key={`${grade.gradeId}-belt-${idx}`}
                      className="sg-belt-swatch"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <span>{grade.pathway}</span>
            </div>

            <div className="sg-categories">
              {Object.entries(grade.categories)
                .filter(([, items]) => items.length > 0)
                .map(([categoryKey, items]) => (
                  <article className="sg-category" key={`${grade.gradeId}-${categoryKey}`}>
                    <h3>{CATEGORY_LABELS[categoryKey] || categoryKey}</h3>
                    <ul>
                      {items.map((item, index) => (
                        <li key={`${grade.gradeId}-${categoryKey}-${index}`}>
                          <span>{item.name}</span>
                          {item.youtubeUrl ? (
                            <a href={item.youtubeUrl} target="_blank" rel="noreferrer">Watch</a>
                          ) : (
                            <em>No video</em>
                          )}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KyuStudyGuidePage />
  </StrictMode>
)
