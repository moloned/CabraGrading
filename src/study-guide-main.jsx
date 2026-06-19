import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Play, Grid, List, ExternalLink, X } from 'lucide-react'
import './study-guide.css'
import data from './data/studyGuideData.json'
import monGridData from './data/monSyllabusGrid.json'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${String(path || '').replace(/^\/+/, '')}`

const extractYoutubeId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

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

const GRADES_LIST = [
  { id: '2', label: '2nd Mon' },
  { id: '3', label: '3rd Mon' },
  { id: '4', label: '4th Mon' },
  { id: '5', label: '5th Mon' },
  { id: '6', label: '6th Mon' },
  { id: '7', label: '7th Mon' },
  { id: '8', label: '8th Mon' },
  { id: '9', label: '9th Mon' },
  { id: '10', label: '10th Mon' },
  { id: '11', label: '11th Mon' },
  { id: '12', label: '12th Mon' }
]

const getPageForCell = (requirements, cellValue) => {
  if (cellValue && cellValue.startsWith('p')) {
    return cellValue.slice(1)
  }
  for (const val of Object.values(requirements)) {
    if (val && val.startsWith('p')) {
      return val.slice(1)
    }
  }
  return null
}

function StudyGuidePage() {
  const kodomoNoKataUrl = 'https://www.youtube.com/watch?v=FhwV1BjPYJQ'
  const kodomoNoKataThumb = 'https://img.youtube.com/vi/FhwV1BjPYJQ/hqdefault.jpg'
  const kokaKidsUrl = 'https://indd.adobe.com/view/ad37a511-225a-41c1-8d3c-0ac13b2ec723'
  const kokaKidsCover = publicAsset('/koka-kids-cover.png')

  const getInitialParam = (key, defaultVal) => {
    const params = new URLSearchParams(window.location.search)
    return params.get(key) || defaultVal
  }

  const [activeView, setActiveView] = useState(() => getInitialParam('view', 'cards'))
  const [searchQuery, setSearchQuery] = useState(() => getInitialParam('q', ''))
  const [selectedGrade, setSelectedGrade] = useState(() => getInitialParam('grade', 'all'))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (activeView === 'cards') {
      params.delete('view')
    } else {
      params.set('view', activeView)
    }

    if (!searchQuery) {
      params.delete('q')
    } else {
      params.set('q', searchQuery)
    }

    if (selectedGrade === 'all') {
      params.delete('grade')
    } else {
      params.set('grade', selectedGrade)
    }

    const newQuery = params.toString()
    const newRelativePathQuery = window.location.pathname + (newQuery ? '?' + newQuery : '')
    window.history.replaceState(null, '', newRelativePathQuery)
  }, [activeView, searchQuery, selectedGrade])

  const filteredTachiwaza = monGridData.tachiwaza.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || !!tech.requirements[selectedGrade]
    return matchesSearch && matchesGrade
  })

  const filteredNewaza = monGridData.newaza.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || !!tech.requirements[selectedGrade]
    return matchesSearch && matchesGrade
  })

  return (
    <div className="sg-page">
      <header className="sg-hero">
        <p className="sg-kicker">Cabra Judo Club</p>
        <h1>Kids Mon Study Guide</h1>
        <div className="sg-hero-media-actions">
          <a href={kodomoNoKataUrl} className="sg-koka-thumb-link sg-hero-thumb-kodomo" aria-label="Open Kodomo no Kata video">
            <img src={kodomoNoKataThumb} alt="Kodomo no Kata video thumbnail" className="sg-koka-thumb" loading="lazy" />
          </a>
          <a href={kokaKidsUrl} className="sg-koka-thumb-link sg-hero-thumb-koka" aria-label="Open Koka Kids PDF">
            <img src={kokaKidsCover} alt="Koka Kids PDF cover" className="sg-koka-thumb" loading="lazy" />
          </a>
          <a href={kodomoNoKataUrl} className="sg-koka-button sg-hero-btn-kodomo">
            Watch Kodomo no Kata
          </a>
          <a href={kokaKidsUrl} className="sg-koka-button sg-hero-btn-koka">
            Open Koka Kids PDF
          </a>
          <a href={publicAsset('/index.html')} className="sg-home-link sg-home-link-inline sg-hero-btn-home">
            Back to Cabra Grading
          </a>
        </div>
      </header>

      <nav className="sg-view-tabs" aria-label="Study Guide Views">
        <button
          className={`sg-tab-btn ${activeView === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveView('cards')}
        >
          <List size={18} />
          <span>Grades List View</span>
        </button>
        <button
          className={`sg-tab-btn ${activeView === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveView('grid')}
        >
          <Grid size={18} />
          <span>Syllabus Grid Matrix</span>
        </button>
      </nav>

      <main className="sg-content">
        {activeView === 'cards' ? (
          data.grades.map((grade) => (
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
                              <a href={item.youtubeUrl}>Watch</a>
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
          ))
        ) : (
          <div className="sg-matrix-panel">
            <div className="sg-matrix-controls">
              <div className="sg-search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search techniques (e.g., seoi)..."
                  className="sg-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sg-grade-filter">
                <label htmlFor="grade-select">Filter by Grade:</label>
                <select
                  id="grade-select"
                  className="sg-filter-select"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="all">All Mon Grades</option>
                  {GRADES_LIST.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="sg-matrix-title">Tachi-waza (Standing Techniques)</h2>
            <div className="sg-table-responsive">
              <table className="sg-matrix-table">
                <thead>
                  <tr>
                    <th>Technique Name</th>
                    <th>Video</th>
                    {GRADES_LIST.map((grade) => (
                      <th
                        key={grade.id}
                        className={selectedGrade === grade.id ? 'col-highlight' : ''}
                      >
                        Mon {grade.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTachiwaza.length > 0 ? (
                    filteredTachiwaza.map((tech) => (
                      <tr key={tech.name}>
                        <td className="tech-name">{tech.name}</td>
                        <td className="tech-video">
                          {tech.videoUrl ? (
                            <a
                              href={tech.videoUrl}
                              className="sg-video-btn"
                              title={`Watch video for ${tech.name}`}
                            >
                              <Play size={10} fill="currentColor" />
                              <span>Watch</span>
                            </a>
                          ) : (
                            <span className="sg-no-video">No video</span>
                          )}
                        </td>
                        {GRADES_LIST.map((grade) => {
                          const req = tech.requirements[grade.id]
                          const isReq = !!req
                          const pageNum = getPageForCell(tech.requirements, req)
                          const link = pageNum
                            ? `https://indd.adobe.com/view/ad37a511-225a-41c1-8d3c-0ac13b2ec723?startpage=${pageNum}`
                            : kokaKidsUrl
                          
                          return (
                            <td
                              key={grade.id}
                              className={`${selectedGrade === grade.id ? 'col-highlight' : ''} ${isReq ? 'cell-required' : ''}`}
                            >
                              {isReq ? (
                                <a
                                  href={link}
                                  className={`sg-page-link-badge ${req.startsWith('p') ? 'badge-page' : 'badge-check'}`}
                                  title={req.startsWith('p') ? `Open Koka Kids PDF to page ${pageNum}` : `Required for Mon ${grade.id}`}
                                >
                                  <span>{req}</span>
                                  <ExternalLink size={10} style={{ marginLeft: '2px' }} />
                                </a>
                              ) : (
                                <span className="cell-empty"></span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--sg-muted)' }}>
                        No standing techniques match your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h2 className="sg-matrix-title">Ne-waza (Ground Techniques)</h2>
            <div className="sg-table-responsive">
              <table className="sg-matrix-table">
                <thead>
                  <tr>
                    <th>Technique Name</th>
                    <th>Video</th>
                    {GRADES_LIST.map((grade) => (
                      <th
                        key={grade.id}
                        className={selectedGrade === grade.id ? 'col-highlight' : ''}
                      >
                        Mon {grade.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredNewaza.length > 0 ? (
                    filteredNewaza.map((tech) => (
                      <tr key={tech.name}>
                        <td className="tech-name">{tech.name}</td>
                        <td className="tech-video">
                          {tech.videoUrl ? (
                            <a
                              href={tech.videoUrl}
                              className="sg-video-btn"
                              title={`Watch video for ${tech.name}`}
                            >
                              <Play size={10} fill="currentColor" />
                              <span>Watch</span>
                            </a>
                          ) : (
                            <span className="sg-no-video">No video</span>
                          )}
                        </td>
                        {GRADES_LIST.map((grade) => {
                          const req = tech.requirements[grade.id]
                          const isReq = !!req
                          const pageNum = getPageForCell(tech.requirements, req)
                          const link = pageNum
                            ? `https://indd.adobe.com/view/ad37a511-225a-41c1-8d3c-0ac13b2ec723?startpage=${pageNum}`
                            : kokaKidsUrl

                          return (
                            <td
                              key={grade.id}
                              className={`${selectedGrade === grade.id ? 'col-highlight' : ''} ${isReq ? 'cell-required' : ''}`}
                            >
                              {isReq ? (
                                <a
                                  href={link}
                                  className={`sg-page-link-badge ${req.startsWith('p') ? 'badge-page' : 'badge-check'}`}
                                  title={req.startsWith('p') ? `Open Koka Kids PDF to page ${pageNum}` : `Required for Mon ${grade.id}`}
                                >
                                  <span>{req}</span>
                                  <ExternalLink size={10} style={{ marginLeft: '2px' }} />
                                </a>
                              ) : (
                                <span className="cell-empty"></span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--sg-muted)' }}>
                        No ground techniques match your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StudyGuidePage />
  </StrictMode>
)
