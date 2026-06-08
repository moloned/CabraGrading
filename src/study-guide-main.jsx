import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './study-guide.css'
import data from './data/studyGuideData.json'

const CATEGORY_LABELS = {
  ukemi: 'Ukemi',
  tachiwaza: 'Tachi-waza',
  newaza: 'Ne-waza',
  freePractice: 'Free Practice',
  fundamentalSkills: 'Fundamental Skills',
  performanceSkills: 'Performance Skills',
  generalBehaviour: 'General Behaviour',
  terminology: 'Terminology',
  additionalLearning: 'Additional Learning'
}

function StudyGuidePage() {
  return (
    <div className="sg-page">
      <header className="sg-hero">
        <p className="sg-kicker">Cabra Judo Club</p>
        <h1>IJA Grading Study Guide</h1>
        <p>
          Built from <strong>{data.source}</strong> with links to the{' '}
          <a href={data.channelUrl} target="_blank" rel="noreferrer">EfficientJudo channel</a> for every listed item.
        </p>
      </header>

      <main className="sg-content">
        {data.grades.map((grade) => (
          <section className="sg-grade" key={grade.gradeId}>
            <div className="sg-grade-head">
              <h2>{grade.gradeName}</h2>
              <span>{grade.gradeId.toUpperCase()}</span>
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
    <StudyGuidePage />
  </StrictMode>
)
