import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './study-guide.css'
import data from './data/adultKyuStudyGuideData.json'

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

function KyuStudyGuidePage() {
  return (
    <div className="sg-page">
      <header className="sg-hero">
        <p className="sg-kicker">Cabra Judo Club</p>
        <h1>Adult Kyu Study Guide</h1>
        <p>
          Based on the IJA PDF syllabus for adult Kyu grades ({' '}
          <a href={data.source} target="_blank" rel="noreferrer">source PDF</a> ) with EfficientJudo links where relevant.
        </p>
      </header>

      <main className="sg-content">
        {data.grades.map((grade) => (
          <section className="sg-grade" key={grade.gradeId}>
            <div className="sg-grade-head">
              <h2>{grade.gradeName}</h2>
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
