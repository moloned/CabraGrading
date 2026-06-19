import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_CSV = path.resolve(ROOT, 'IJA Grading System - Syllabus.csv')
const INPUT_JSON = path.resolve(ROOT, 'src/data/studyGuideData.json')
const OUTPUT_JSON = path.resolve(ROOT, 'src/data/monSyllabusGrid.json')

// Extra manual overrides to ensure high-quality video links for Mon techniques
const VIDEO_OVERRIDES = {
  'deashibarai': 'https://www.youtube.com/watch?v=2-5at8cWc0E&t=171s',
  'ukigoshi': 'https://www.youtube.com/watch?v=2-5at8cWc0E&t=213s',
  'osotogari': 'https://www.youtube.com/watch?v=c-A_nP7mKAc',
  'ouchigari': 'https://www.youtube.com/watch?v=0itJFhV9pDQ',
  'hizaguruma': 'https://www.youtube.com/watch?v=JPJx9-oAVns',
  'sasaetsurikomiashi': 'https://www.youtube.com/watch?v=699i--pvYmE',
  'moroteseoinage': 'https://www.youtube.com/watch?v=zIq0xI0ogxk',
  'ogoshi': 'https://www.youtube.com/watch?v=yhu1mfy2vJ4',
  'ipponseoinage': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=175s',
  'kosotogari': 'https://www.youtube.com/watch?v=jeQ541ScLB4',
  'kouchigari': 'https://www.youtube.com/watch?v=3Jb3tZvr9Ng',
  'taiotoshi': 'https://www.youtube.com/watch?v=4x6S3Q-Ktv8',
  'haraigoshi': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=116s',
  'koshiguruma': 'https://www.youtube.com/watch?v=e_049C_x3x8',
  'koshigaruma': 'https://www.youtube.com/watch?v=e_049C_x3x8',
  'koshiguruma': 'https://www.youtube.com/watch?v=e_049C_x3x8',
  'ogaruma': 'https://www.youtube.com/watch?v=1F7vH1YwTss',
  'uchimata': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=72s',
  'okuriashibarai': 'https://www.youtube.com/watch?v=60d_U04F6kY',
  'tsurikomigoshi': 'https://www.youtube.com/watch?v=R9X2H55R3O0',
  'sodetsurikomigoshi': 'https://www.youtube.com/watch?v=yN3dG2c-c8M',
  'hanegoshi': 'https://www.youtube.com/watch?v=R71E7mC_w6Q',
  'tsurigoshi': 'https://www.youtube.com/watch?v=WqjIib9VnL8',
  'ashiguruma': 'https://www.youtube.com/watch?v=VpG9N6zR708',
  'haraitsurikomiashi': 'https://www.youtube.com/watch?v=H723gYyBmgI',
  'yokootoshi': 'https://www.youtube.com/watch?v=T_8UqWwLg8o',
  'kosotogake': 'https://www.youtube.com/watch?v=f93i4Y-HhQA',
  'tomoenage': 'https://www.youtube.com/watch?v=M99b24l22L8',

  'kesagatame': 'https://www.youtube.com/watch?v=NDaQuJOFBYk',
  'kuzurekesagatame': 'https://www.youtube.com/watch?v=Q2fb9jaoUFQ',
  'katagatame': 'https://www.youtube.com/watch?v=zQR3IOXxO_Q',
  'tateshihogatame': 'https://www.youtube.com/watch?v=55-rFmBx53g',
  'munegatame': 'https://www.youtube.com/watch?v=zQR3IOXxO_Q',
  'kuzuretateshihogatame': 'https://www.youtube.com/watch?v=YUrogQWdwiY',
  'yokoshihogatame': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=199s',
  'kuzureyokoshihogatame': 'https://www.youtube.com/watch?v=Tq_rXw2uXfA',
  'kuzurekamishihogatame': 'https://www.youtube.com/watch?v=YUrogQWdwiY',
  'kamishihogatame': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=203s',
  'ukigatame': 'https://www.youtube.com/watch?v=x7d5eE3z56Y',
  'uragatame': 'https://www.youtube.com/watch?v=eLwW7eJq7eI',
  'ushirokesagatame': 'https://www.youtube.com/watch?v=-wZKFsubC04&t=195s',
  'mukurakesagatame': 'https://www.youtube.com/watch?v=e5HrhANfDcU',
  'makurakesagatame': 'https://www.youtube.com/watch?v=e5HrhANfDcU',
  'sangakugatame': 'https://www.youtube.com/watch?v=Hpy2uT_xRss',
  'udehishigijujigatame': 'https://www.youtube.com/watch?v=veM5RFdjo0U&t=5m',
  'udegarami': 'https://www.youtube.com/watch?v=0k5G9k9G3Jg',
  'udehishigiudegatame': 'https://www.youtube.com/watch?v=tT8j2uS8wA4',
  'gyakujujijime': 'https://www.youtube.com/watch?v=t3tQriIPdlI',
  'gyakujūjijime': 'https://www.youtube.com/watch?v=t3tQriIPdlI',
  'gyakujijime': 'https://www.youtube.com/watch?v=t3tQriIPdlI',
  'gyakujjijime': 'https://www.youtube.com/watch?v=t3tQriIPdlI',
  'katajujijime': 'https://www.youtube.com/watch?v=y2s4wYyRntc',
  'namijujijime': 'https://www.youtube.com/watch?v=y2s4wYyRntc'
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '')
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

async function main() {
  const [csvText, studyGuideText] = await Promise.all([
    fs.readFile(INPUT_CSV, 'utf8'),
    fs.readFile(INPUT_JSON, 'utf8')
  ])

  const studyGuideData = JSON.parse(studyGuideText)

  // Map normalized technique name to its youtubeUrl from existing study guide data
  const videoMap = {}
  for (const grade of studyGuideData.grades) {
    for (const [cat, items] of Object.entries(grade.categories)) {
      for (const item of items) {
        if (item.youtubeUrl) {
          const norm = normalizeName(item.name)
          videoMap[norm] = item.youtubeUrl
        }
      }
    }
  }

  // Parse CSV lines
  const lines = csvText.split(/\r?\n/).filter(Boolean)
  
  // The technique rows start from line index 3 (4th line)
  const rows = lines.slice(3).map(parseCsvLine)

  const tachiwaza = []
  const newaza = []

  for (const row of rows) {
    // Row might have less columns than expected
    const tachiwazaName = row[1] ? row[1].trim() : ''
    const newazaName = row[14] ? row[14].trim() : ''

    if (tachiwazaName) {
      const normName = normalizeName(tachiwazaName)
      const requirements = {}
      for (let m = 2; m <= 12; m++) {
        const val = row[m] ? row[m].trim() : ''
        if (val) {
          requirements[m] = val
        }
      }

      const videoUrl = VIDEO_OVERRIDES[normName] || videoMap[normName] || ''
      tachiwaza.push({
        name: tachiwazaName,
        videoUrl,
        requirements
      })
    }

    if (newazaName) {
      const normName = normalizeName(newazaName)
      const requirements = {}
      for (let m = 2; m <= 12; m++) {
        const val = row[m + 13] ? row[m + 13].trim() : ''
        if (val) {
          requirements[m] = val
        }
      }

      const videoUrl = VIDEO_OVERRIDES[normName] || videoMap[normName] || ''
      newaza.push({
        name: newazaName,
        videoUrl,
        requirements
      })
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    tachiwaza,
    newaza
  }

  await fs.writeFile(OUTPUT_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`Generated Mon Syllabus Grid JSON at ${path.relative(ROOT, OUTPUT_JSON)}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
