import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_JSON = path.resolve(ROOT, 'src/data/adultKyuStudyGuideData.json')
const SOURCE_PDF_URL = 'https://irishjudoassociation.ie/wp-content/uploads/2024/02/IJA-Grading-Syllabus-V8-2024-16.01.2024.pdf'
const CHANNEL_URL = 'https://www.youtube.com/@EfficientJudo'

const ADULT_KYU_GRADES = [
  {
    gradeId: '5k',
    gradeName: '5th Kyu - Senior Yellow Belt',
    pathway: 'Core Technical',
    sourcePages: [70, 86],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['De Ashi Barai', 'Uki Goshi', 'O Soto Gari', 'O Uchi Gari', 'Hiza Guruma', 'Sasae Tsurikomi Ashi', 'Morote Seoi Nage', 'O Goshi', 'Ippon Seoi Nage'],
      newaza: ['Kesa-Gatame', 'Kuzure-Kesa-Gatame', 'Kata-Gatame', 'Tate-Shiho-Gatame', 'Mune Gatame', 'Kuzure Tate Shiho Gatame', 'Yoko-Shiho-Gatame', 'Kuzure Yoko Shiho Gatame'],
      performanceSkills: ['Agura & Seiza', 'Ritsu rei, Za rei', 'Bow into and out of Dojo & Mat Area', 'Any Combination', 'Any Counter', 'Any Turnover to hold', 'Escape from holds'],
      generalBehaviour: ['Hygiene & Safety', 'Fair Play, Friendship', 'Presentation: How to tie your Belt', 'Courtesy: To be polite to others.'],
      terminology: ['REI', 'Hajime', 'Matte', 'Ukemi', 'Judoka', 'Sensei', 'Uke', 'Tori', 'Dojo', 'Tatami', 'Judo GI', 'Obi', 'Zori'],
      freePractice: ['Throw for throw'],
      fundamentalSkills: ['5 Skills']
    }
  },
  {
    gradeId: '4k',
    gradeName: '4th Kyu - Senior Orange Belt',
    pathway: 'Core Technical',
    sourcePages: [71, 87],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Kosoto Gari', 'Ko Uchi Gari', 'Tai O Toshi', 'Harai Goshi', 'Koshi Guruma', 'O Guruma', 'Uchimata', 'Okuri Ashi Barai', 'Tsurikomi Goshi', 'Sode Tsuri Komi Goshi'],
      newaza: ['Kuzure-Kami-Shiho-Gatame', 'Kami-Shiho-Gatame', 'Uki-Gatame', 'Ura-Gatame', 'Ushiro-kesa-gatame', 'Mukura Kesa Gatame', 'Sangaku-Gatame'],
      performanceSkills: ['Any Combination', 'Any Counter', 'Any Turnover to hold', 'Escape from holds'],
      generalBehaviour: ['Courage: To face difficulties with bravery.', 'Honesty: To be sincere with your thoughts and actions.', 'Honour: To do what is right and stand by your principles.', 'Modesty: To be without ego in your actions and thoughts'],
      terminology: ['Uchikomi', 'Randori', 'Shai', 'Sona Mama', 'Yoshi', 'Newaza', 'Tachi Waza', 'Wazari', 'Ippon'],
      freePractice: ['Throw for throw'],
      fundamentalSkills: ['10 Skills']
    }
  },
  {
    gradeId: '3k',
    gradeName: '3rd Kyu - Senior Green Belt',
    pathway: 'Core Technical',
    sourcePages: [72, 88],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Hane Goshi', 'Tsuri Goshi', 'Ashi Guruma', 'Harai Tsurikomi Ashi', 'Yoko O Toshi', 'Ko-Soto-Gake', 'Tomoe Nage'],
      newaza: ['Ude-hishigi-juji-gatame', 'Ude-garami', 'Ude-hishigi-ude-gatame', 'Gyaku Juji-jime', 'Kata-juji-jime', 'Nami-juji-jime'],
      performanceSkills: ['Any Combination', 'Any Counter', 'Any Turnover to hold', 'Escape from holds'],
      generalBehaviour: ['Respect: To appreciate others.', 'Self Control: To be in control of your emotions.', 'Friendship: To be a good companion and friend.', "Explain Judo's moral code"],
      terminology: ['Shido', 'Hansoku Make', 'Score signals', 'Contest etiquette', 'Shime Waza', 'Kansetsu Waza', 'Kata'],
      freePractice: ['Randori'],
      fundamentalSkills: ['12 Skills']
    }
  },
  {
    gradeId: '2k-competition',
    gradeName: '2nd Kyu - Senior Blue Belt (Competition Pathway)',
    pathway: 'Competition',
    sourcePages: [73, 89],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Sumi Gaeshi', 'Uki O Toshi', 'Tani O Toshi', 'Hane Makikomi', 'Soto Makikomi', 'O Guruma', 'Utsuri Goshi'],
      newaza: ['Ude Hishigi Hiza Gatame', 'Ude Hishigi Waki Gatame', 'Ude Hishigi Ashi Gatame', 'Okuri Eri Jime', 'Ude Hishigi Hara Gatame', 'Hadaka Jime', 'Kata Ha Jime'],
      performanceSkills: ['2 Contest Wins (Level 3 or Level 4 Event)', 'Any Combination', 'Any Counter', 'Any turnover or set up to technique', 'Escape from holds'],
      generalBehaviour: ['Explain Seiryoku zenyo (Maximum efficiency)'],
      terminology: ['Read and complete Competition Sheets'],
      freePractice: ['Area Randori / Level 3 Contest'],
      fundamentalSkills: ['18 Skills']
    }
  },
  {
    gradeId: '2k-advanced',
    gradeName: '2nd Kyu - Senior Blue Belt (Advanced Technical Pathway)',
    pathway: 'Advanced Technical',
    sourcePages: [90],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Sumi Gaeshi', 'Uki O Toshi', 'Tani O Toshi', 'Hane Makikomi', 'Soto Makikomi', 'O Guruma', 'Utsuri Goshi', 'Obi O Toshi', 'Osoto Makikomi', 'Osoto O Toshi', 'Uchi Makikomi', 'Ko-Uchi-Makikomi'],
      newaza: ['Ude Hishigi Hiza Gatame', 'Ude Hishigi Waki Gatame', 'Ude Hishigi Ashi Gatame', 'Okuri Eri Jime', 'Ude Hishigi Hara Gatame', 'Hadaka Jime', 'Kata Ha Jime', 'Koshi Jime'],
      performanceSkills: ['Nage No Kata (Sets 1 through 3)', 'Any 5 Combinations', 'Any 5 Counters', 'Any 5 turnovers or set up to technique', 'Escapes from any 5 holds', 'Demonstrate Light Randori'],
      generalBehaviour: ['Explain Seiryoku zenyo (Maximum efficiency)'],
      terminology: ['Read and complete Competition Sheets'],
      freePractice: ['Demonstrate Light Randori'],
      fundamentalSkills: ['20 Skills']
    }
  },
  {
    gradeId: '1k-competition',
    gradeName: '1st Kyu - Senior Brown Belt (Competition Pathway)',
    pathway: 'Competition',
    sourcePages: [74, 91],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Ura Nage', 'Sumi O Toshi', 'Uki Waza', 'Osoto Guruma', 'Yoko Wakare', 'Ushiro Goshi', 'Yoko Guruma', 'Yoko Gake'],
      newaza: ['Ude Hishigi Sankaku Gatame', 'Ude Hishigi Te Tatame', 'Ryo Te Jime', 'Sankaku Jime', 'Kata Te Jime', 'Tsurkomi Jime', 'Sode Guruma Jime', 'Tsukkomi Jime'],
      performanceSkills: ['2 Contest Wins (Level 3 or Level 4 Event)', 'Any Combination', 'Any Counter', 'Any turnover or set up to technique', 'Escape from holds'],
      generalBehaviour: ['Explain Jita-Kyoei (Mutual Benefit)'],
      terminology: ['Understand Competition Time keeping system'],
      freePractice: ['Area Randori / Level 3 Contest'],
      fundamentalSkills: ['20 Skills']
    }
  },
  {
    gradeId: '1k-advanced',
    gradeName: '1st Kyu - Senior Brown Belt (Advanced Technical Pathway)',
    pathway: 'Advanced Technical',
    sourcePages: [92],
    categories: {
      ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll', 'Left side Rolling', 'Right Side Rolling'],
      tachiwaza: ['Ura Nage', 'Sumi O Toshi', 'Uki Waza', 'Osoto Guruma', 'Yoko Wakare', 'Ushiro Goshi', 'Yoko Guruma', 'Yoko Gake', 'Obi-Tori-Gaeshi', 'Tawara Gaeshi', 'Hikikomi Gaeshi'],
      newaza: ['Ude Hishigi Sankaku Gatame', 'Ude Hishigi Te Tatame', 'Ryo Te Jime', 'Sankaku Jime', 'Kata Te Jime', 'Tsurkomi Jime', 'Sode Guruma Jime', 'Tsukkomi Jime'],
      performanceSkills: ['Nage No Kata (Sets 1 through 5)', 'Any 10 Combinations', 'Any 10 Counters', 'Any 10 turnover or set up to techniques', 'Escapes from any 10 holds', 'Demonstrate Light Randori'],
      generalBehaviour: ['Explain Jita-Kyoei (Mutual Benefit)', 'Foundation Coaching Badge', 'Regional referee', 'Timekeeper Certificate', 'Table official Certificate', 'NB: Only one certificate from the above list is required'],
      terminology: [],
      freePractice: ['Demonstrate Light Randori'],
      fundamentalSkills: ['20 Skills']
    }
  }
]

const VIDEO_CATEGORIES = new Set(['ukemi', 'tachiwaza', 'newaza'])

function normalizeLookupName(name) {
  return String(name || '')
    .toLowerCase()
    .replaceAll(/\(.*?\)/g, ' ')
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function resolveYoutubeVideoUrl(name, cache) {
  const key = normalizeLookupName(name)
  if (!key) return ''
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

async function buildGrades() {
  const cache = new Map()
  const grades = []

  for (const grade of ADULT_KYU_GRADES) {
    const outCategories = {}

    for (const [category, names] of Object.entries(grade.categories)) {
      outCategories[category] = []
      for (const name of names) {
        const videoUrl = VIDEO_CATEGORIES.has(category)
          ? await resolveYoutubeVideoUrl(name, cache)
          : ''

        outCategories[category].push({
          name,
          youtubeUrl: videoUrl
        })
      }
    }

    grades.push({
      gradeId: grade.gradeId,
      gradeName: grade.gradeName,
      pathway: grade.pathway,
      sourcePages: grade.sourcePages,
      categories: outCategories
    })
  }

  return grades
}

async function main() {
  const grades = await buildGrades()

  const payload = {
    source: SOURCE_PDF_URL,
    generatedAt: new Date().toISOString(),
    channelUrl: CHANNEL_URL,
    grades
  }

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true })
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${grades.length} adult kyu grade guides to ${path.relative(ROOT, OUTPUT_JSON)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
