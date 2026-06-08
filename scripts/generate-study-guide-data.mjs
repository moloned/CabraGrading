import fs from 'node:fs/promises'
import path from 'node:path'
import xlsx from 'xlsx'

const ROOT = process.cwd()
const INPUT_XLSX = path.resolve(ROOT, 'IJA_Grading_Syllabus.xlsx')
const OUTPUT_JSON = path.resolve(ROOT, 'src/data/studyGuideData.json')
const CHANNEL_URL = 'https://www.youtube.com/@EfficientJudo'

const SHEET_META = {
  Shamrock1: { gradeId: '1s', gradeName: '1st Shamrock' },
  Shamrock2: { gradeId: '2s', gradeName: '2nd Shamrock' },
  Shamrock3: { gradeId: '3s', gradeName: '3rd Shamrock' },
  Mon2: { gradeId: '2m', gradeName: '2nd Mon' },
  Mon3: { gradeId: '3m', gradeName: '3rd Mon' },
  Mon4: { gradeId: '4m', gradeName: '4th Mon' },
  Mon5: { gradeId: '5m', gradeName: '5th Mon' },
  Mon6: { gradeId: '6m', gradeName: '6th Mon' },
  Mon7: { gradeId: '7m', gradeName: '7th Mon' },
  Mon8: { gradeId: '8m', gradeName: '8th Mon' },
  Mon9: { gradeId: '9m', gradeName: '9th Mon' },
  Mon10: { gradeId: '10m', gradeName: '10th Mon' },
  Mon11: { gradeId: '11m', gradeName: '11th Mon' },
  Mon12: { gradeId: '12m', gradeName: '12th Mon' }
}

function normalizeHeader(header) {
  const value = String(header || '').trim().toLowerCase()
  if (value === 'tachi-waza') return 'tachiwaza'
  if (value === 'ne-waza') return 'newaza'
  if (value === 'performance skills') return 'performanceSkills'
  if (value === 'general behaviour') return 'generalBehaviour'
  if (value === 'additional learning') return 'additionalLearning'
  if (value === 'fundamental skills') return 'fundamentalSkills'
  if (value === 'free practice') return 'freePractice'
  return value.replaceAll(/[^a-z0-9]+/g, '')
}

function extractCellParts(rawCell) {
  const raw = String(rawCell || '').replaceAll(/\s+/g, ' ').trim()
  if (!raw) return null

  const urlMatch = raw.match(/https?:\/\/\S+/i)
  const sourceUrl = urlMatch ? urlMatch[0].replace(/[),.;]+$/, '') : ''
  const name = (urlMatch ? raw.replace(urlMatch[0], '') : raw).trim()

  if (!name) return null

  return {
    name,
    sourceUrl,
    youtubeUrl: ''
  }
}

function normalizeLookupName(name) {
  return String(name || '')
    .toLowerCase()
    .replaceAll(/\(.*?\)/g, ' ')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isNonVideoTerm(name) {
  const value = normalizeLookupName(name)
  if (!value) return true

  return [
    "coach s choice",
    'any combination',
    'any counter',
    'any turnover to hold',
    'escape from hold',
    'throw for throw',
    'randori',
    'full set from seated',
    'full set from crouching',
    'full set from standing',
    '1 skill',
    '2 skills',
    '3 skills',
    '4 skills',
    '5 skills',
    '6 skills',
    '7 skills',
    '8 skills',
    '9 skills',
    '10 skills',
    '11 skills',
    '12 skills',
    '13 skills'
  ].includes(value)
}

function extractYoutubeVideoId(url) {
  const value = String(url || '').trim()
  const match = value.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : ''
}

async function resolveYoutubeVideoUrl(name, cache) {
  const key = normalizeLookupName(name)
  if (!key || isNonVideoTerm(key)) return ''
  if (cache.has(key)) return cache.get(key)

  const searchUrl = `${CHANNEL_URL}/search?query=${encodeURIComponent(name)}`

  try {
    const response = await fetch(searchUrl)
    if (!response.ok) {
      cache.set(key, '')
      return ''
    }

    const html = await response.text()
    const idMatch = html.match(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/)
    const resolved = idMatch ? `https://www.youtube.com/watch?v=${idMatch[1]}` : ''
    cache.set(key, resolved)
    return resolved
  } catch {
    cache.set(key, '')
    return ''
  }
}

function parseSheet(sheetName, worksheet) {
  const meta = SHEET_META[sheetName]
  if (!meta) return null

  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
  const headers = (rows[0] || []).map(normalizeHeader)

  const categories = headers.reduce((acc, key) => {
    if (key) acc[key] = []
    return acc
  }, {})

  rows.slice(1).forEach((row) => {
    row.forEach((value, index) => {
      const category = headers[index]
      if (!category) return

      const parsed = extractCellParts(value)
      if (!parsed) return

      categories[category].push(parsed)
    })
  })

  return {
    ...meta,
    sheetName,
    categories
  }
}

async function attachVideoLinks(grades) {
  const cache = new Map()

  for (const grade of grades) {
    for (const items of Object.values(grade.categories)) {
      for (const item of items) {
        const sourceId = extractYoutubeVideoId(item.sourceUrl)
        if (sourceId) {
          item.youtubeUrl = `https://www.youtube.com/watch?v=${sourceId}`
          continue
        }

        item.youtubeUrl = await resolveYoutubeVideoUrl(item.name, cache)
      }
    }
  }
}

async function main() {
  const workbook = xlsx.readFile(INPUT_XLSX)
  const grades = workbook.SheetNames
    .map((sheetName) => parseSheet(sheetName, workbook.Sheets[sheetName]))
    .filter(Boolean)

  await attachVideoLinks(grades)

  const payload = {
    source: path.basename(INPUT_XLSX),
    generatedAt: new Date().toISOString(),
    channelUrl: CHANNEL_URL,
    grades
  }

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true })
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${grades.length} grade sheets to ${path.relative(ROOT, OUTPUT_JSON)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
