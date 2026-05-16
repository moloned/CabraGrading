import fs from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const DEFAULT_TEMPLATE = 'IJAGradingforms.pdf'
const DEFAULT_CSV = 'CabraMemberships2026.csv'
const DEFAULT_OUT_DIR = 'dist/ija-grading-forms'
const DEFAULT_CLUB = 'Cabra Judo Club'

const PAGE_BY_GRADE = {
  '1s': 1,
  '2s': 1,
  '3s': 1,
  '2m': 1,
  '3m': 2,
  '4m': 3,
  '5m': 4,
  '6m': 5,
  '7m': 6,
  '8m': 7,
  '9m': 8,
  '10m': 9,
  '11m': 10,
  '12m': 11,
  '5k': 12,
  '4k': 13,
  '3k': 14,
  '2k': 15,
  '1k': 16,
  '1dc': 17,
  '2dc': 18,
  '3dc': 19,
  '4dc': 20,
  '5dc': 21,
  '1dt': 22,
  '2dt': 23,
  '3dt': 24,
  '4dt': 25,
  '5dt': 26
}

function normalizeKey(key) {
  return String(key || '').toLowerCase().replaceAll(/[^a-z0-9]/g, '')
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }

  values.push(current.trim())
  return values
}

function findCsvHeaderIndex(lines) {
  return lines.findIndex((line) => {
    const keys = parseCsvLine(line).map(normalizeKey)
    return keys.includes('firstname') && keys.includes('lastname') && keys.includes('grade')
  })
}

function parseDate(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const simple = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (!simple) return null

  const day = Number(simple[1])
  const month = Number(simple[2])
  const yearRaw = Number(simple[3])
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw
  const dob = new Date(year, month - 1, day)

  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return null
  }

  return dob
}

function calculateAgeYears(dob, referenceDate = new Date()) {
  if (!dob) return null

  let age = referenceDate.getFullYear() - dob.getFullYear()
  const monthDiff = referenceDate.getMonth() - dob.getMonth()
  const dayDiff = referenceDate.getDate() - dob.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age
}

function inferGradeIdFromValue(value) {
  const normalized = normalizeKey(value)
  if (!normalized || normalized === 'none' || normalized === 'na' || normalized === 'n/a') {
    return ''
  }

  const exactGradeId = normalized.match(/^(\d+)([sm])$/)
  if (exactGradeId) {
    return `${exactGradeId[1]}${exactGradeId[2]}`
  }

  const monMatch = normalized.match(/^mon(\d+)$/)
  if (monMatch) {
    return `${monMatch[1]}m`
  }

  const shamrockMatch = normalized.match(/^(\d+)(st|nd|rd)?shamrock$|^shamrock(\d+)$/)
  if (shamrockMatch) {
    const shamrockNumber = shamrockMatch[1] || shamrockMatch[3]
    return shamrockNumber ? `${shamrockNumber}s` : ''
  }

  const kyuMatch = normalized.match(/^kyu(\d+)$/)
  if (kyuMatch) {
    const kyuToClubGrade = {
      6: '2m',
      5: '4m',
      4: '6m',
      3: '8m',
      2: '10m',
      1: '12m'
    }
    return kyuToClubGrade[Number(kyuMatch[1])] || '12m'
  }

  if (/^dan\d+$/.test(normalized)) {
    return '12m'
  }

  return ''
}

function isUngradedValue(value) {
  const normalized = normalizeKey(value)
  return normalized === 'ungraded' || normalized === 'none' || normalized === 'nograde' || normalized === 'na' || normalized === 'n/a'
}

function getLowestRelevantGradeIdForAge(ageYears) {
  if (ageYears == null) return ''
  if (ageYears >= 14) return ''
  return ageYears < 8 ? '1s' : '3m'
}

function getCandidateGroup(ageYears) {
  return ageYears != null && ageYears < 14 ? 'junior' : 'senior'
}

function getNextSeniorTarget(gradeRaw, danPath) {
  const normalized = normalizeKey(gradeRaw)

  if (!normalized || normalized === 'none' || normalized === 'na' || normalized === 'n/a' || normalized === 'ungraded') {
    return '5k'
  }

  const kyuMatch = normalized.match(/^kyu(\d+)$/)
  if (kyuMatch) {
    const currentKyu = Number(kyuMatch[1])
    if (currentKyu >= 4 && currentKyu <= 6) {
      return `${currentKyu - 1}k`
    }
    return ''
  }

  return ''
}

function getNextGradeId(currentGradeId) {
  if (currentGradeId === '1m' || currentGradeId === '2m') return '3m'
  const order = ['1s', '2s', '3s', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m']
  const idx = order.indexOf(currentGradeId)
  if (idx < 0) return ''
  return order[Math.min(idx + 1, order.length - 1)]
}

function formatDateDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function safeFileStem(value) {
  return String(value || '')
    .normalize('NFKD')
    .replaceAll(/[^\w\-\s]+/g, '')
    .trim()
    .replaceAll(/\s+/g, '-')
    .toLowerCase()
}

function clipText(text, maxLength = 48) {
  const value = String(text || '').trim()
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}

function parseArgs(argv) {
  const args = {
    template: DEFAULT_TEMPLATE,
    csv: DEFAULT_CSV,
    outDir: DEFAULT_OUT_DIR,
    club: DEFAULT_CLUB,
    date: formatDateDDMMYYYY(new Date()),
    venue: DEFAULT_CLUB,
    group: 'all',
    danPath: 'competition'
  }

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) continue

    if (token === '--template') args.template = next
    if (token === '--csv') args.csv = next
    if (token === '--out-dir') args.outDir = next
    if (token === '--club') args.club = next
    if (token === '--date') args.date = next
    if (token === '--venue') args.venue = next
    if (token === '--group') args.group = next.toLowerCase()
    if (token === '--dan-path') args.danPath = next.toLowerCase()
  }

  if (!['all', 'junior', 'senior'].includes(args.group)) {
    throw new Error("Invalid --group value. Use 'all', 'junior', or 'senior'.")
  }

  if (!['competition', 'technical'].includes(args.danPath)) {
    throw new Error("Invalid --dan-path value. Use 'competition' or 'technical'.")
  }

  return args
}

function parseCandidates(csvText, options) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headerIndex = findCsvHeaderIndex(lines)
  const headers = parseCsvLine(lines[headerIndex >= 0 ? headerIndex : 0])
  const rows = lines.slice((headerIndex >= 0 ? headerIndex : 0) + 1).map((line) => parseCsvLine(line))

  return rows
    .map((cols) => {
      const row = {}
      headers.forEach((header, idx) => {
        row[normalizeKey(header)] = String(cols[idx] ?? '').trim()
      })

      const firstName = row.firstname || ''
      const lastName = row.lastname || ''
      const name = `${firstName} ${lastName}`.trim()
      const license = row.ijalicence || row.ijalicense || row.ijanumber || ''
      const gradeRaw = row.grade || row.currentgrade || ''
      const dob = parseDate(row.dateofbirth || row.dob || '')
      const age = calculateAgeYears(dob)
      const group = getCandidateGroup(age)

      if (!name || !license || age == null) return null
      if (options.group !== 'all' && options.group !== group) return null

      const targetGradeId = group === 'junior'
        ? (() => {
            const currentGradeId = inferGradeIdFromValue(gradeRaw)
            if (isUngradedValue(gradeRaw)) {
              return getLowestRelevantGradeIdForAge(age)
            }
            return getNextGradeId(currentGradeId)
          })()
        : getNextSeniorTarget(gradeRaw, options.danPath)

      const templatePage = PAGE_BY_GRADE[targetGradeId]
      if (!targetGradeId || !templatePage) return null

      return {
        name,
        license,
        age,
        group,
        targetGradeId,
        templatePage
      }
    })
    .filter(Boolean)
}

function drawEntryFields(page, font, data, options = {}) {
  const black = rgb(0, 0, 0)
  const nameX = 126
  const licenceX = 410
  const topDateLikeX = 620
  const bottomDateLikeX = 620
  const resultX = 900
  const bottomRightX = 830

  const yTop = options.yTop ?? 724
  const yBottom = options.yBottom ?? 158
  const bottomRightLabel = options.bottomRightLabel ?? 'club'
  const bottomRightValue = bottomRightLabel === 'venue' ? data.venue : data.club

  page.drawText(clipText(data.name, 42), { x: nameX, y: yTop, size: 11, font, color: black })
  page.drawText(clipText(data.license, 28), { x: licenceX, y: yTop, size: 11, font, color: black })
  page.drawText(clipText(data.timeInGrade || '', 28), { x: topDateLikeX, y: yTop, size: 11, font, color: black })
  page.drawText(clipText(data.result || '', 34), { x: resultX, y: yTop, size: 11, font, color: black })

  page.drawText(clipText(data.name, 42), { x: nameX, y: yBottom, size: 11, font, color: black })
  page.drawText(clipText(data.license, 28), { x: licenceX, y: yBottom, size: 11, font, color: black })
  page.drawText(clipText(data.date, 24), { x: bottomDateLikeX, y: yBottom, size: 11, font, color: black })
  page.drawText(clipText(bottomRightValue, 38), { x: bottomRightX, y: yBottom, size: 11, font, color: black })
}

async function buildCandidatePdf(templateBytes, candidate, options) {
  const source = await PDFDocument.load(templateBytes)
  const out = await PDFDocument.create()

  const pageIndex = candidate.templatePage - 1
  const [copied] = await out.copyPages(source, [pageIndex])
  out.addPage(copied)

  const font = await out.embedFont(StandardFonts.Helvetica)
  const page = out.getPages()[0]

  const pageStyle = pageIndex >= 16
    ? { yTop: 704, yBottom: 118, bottomRightLabel: 'venue' }
    : { yTop: pageIndex >= 11 ? 753 : 724, yBottom: pageIndex >= 11 ? 178 : 158, bottomRightLabel: 'club' }

  drawEntryFields(page, font, {
    name: candidate.name,
    license: candidate.license,
    date: options.date,
    club: options.club,
    venue: options.venue,
    timeInGrade: '',
    result: ''
  }, pageStyle)

  return out.save()
}

async function main() {
  const args = parseArgs(process.argv)

  const root = process.cwd()
  const templatePath = path.resolve(root, args.template)
  const csvPath = path.resolve(root, args.csv)
  const outDir = path.resolve(root, args.outDir)

  const [templateBytes, csvText] = await Promise.all([
    fs.readFile(templatePath),
    fs.readFile(csvPath, 'utf8')
  ])

  const candidates = parseCandidates(csvText, {
    group: args.group,
    danPath: args.danPath
  })
  if (candidates.length === 0) {
    console.log('No eligible candidates found for the selected filters.')
    return
  }

  await fs.mkdir(outDir, { recursive: true })

  let created = 0
  for (const candidate of candidates) {
    const bytes = await buildCandidatePdf(templateBytes, candidate, {
      date: args.date,
      club: args.club,
      venue: args.venue
    })

    const stem = safeFileStem(`${candidate.name}-${candidate.targetGradeId}`) || `candidate-${created + 1}`
    const outPath = path.join(outDir, `${stem}.pdf`)
    await fs.writeFile(outPath, bytes)
    created += 1
  }

  const summaryPath = path.join(outDir, 'index.csv')
  const summary = ['name,license,age,group,targetGradeId,templatePage,file']
  for (const candidate of candidates) {
    const stem = safeFileStem(`${candidate.name}-${candidate.targetGradeId}`)
    summary.push(
      `"${candidate.name.replaceAll('"', '""')}","${candidate.license}",${candidate.age},"${candidate.group}","${candidate.targetGradeId}",${candidate.templatePage},"${stem}.pdf"`
    )
  }
  await fs.writeFile(summaryPath, `${summary.join('\n')}\n`, 'utf8')

  console.log(`Generated ${created} grading forms in ${path.relative(root, outDir)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
