import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './study-guide.css'
import data from './data/studyGuideData.json'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${String(path || '').replace(/^\/+/, '')}`

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

const MON_BELT_COLORS = {
  '1s': ['#dc2626'],
  '2s': ['#dc2626'],
  '3s': ['#dc2626'],
  '2m': ['#dc2626'],
  '3m': ['#ffffff', '#facc15'],
  '4m': ['#facc15'],
  '5m': ['#facc15', '#f97316'],
  '6m': ['#f97316'],
  '7m': ['#f97316', '#10b981'],
  '8m': ['#10b981'],
  '9m': ['#10b981', '#2563eb'],
  '10m': ['#2563eb'],
  '11m': ['#2563eb', '#78350f'],
  '12m': ['#78350f']
}

function StudyGuidePage() {
  const kokaKidsUrl = 'https://indd.adobe.com/view/ad37a511-225a-41c1-8d3c-0ac13b2ec723'
  const kokaKidsCover = publicAsset('/koka-kids-cover.png')

  return (
    <div className="sg-page">
      <header className="sg-hero">
        <p className="sg-kicker">Cabra Judo Club</p>
        <h1>Mon Study Guide</h1>
        <a href={publicAsset('/index.html')} className="sg-home-link">
          Back to Cabra Grading
        </a>
        <div className="sg-koka-card">
          <a href={kokaKidsUrl} target="_blank" rel="noreferrer" className="sg-koka-thumb-link" aria-label="Open Koka Kids PDF">
            <img src={kokaKidsCover} alt="Koka Kids PDF cover" className="sg-koka-thumb" loading="lazy" />
          </a>
          <a href={kokaKidsUrl} target="_blank" rel="noreferrer" className="sg-koka-button">
            Open Koka Kids PDF
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
                  {(MON_BELT_COLORS[grade.gradeId] || []).map((color, idx) => (
                    <span
                      key={`${grade.gradeId}-belt-${idx}`}
                      className="sg-belt-swatch"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
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
