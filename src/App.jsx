import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Download,
  X,
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import './App.css'
import adultKyuStudyGuideData from './data/adultKyuStudyGuideData.json'
const publicAsset = (path) => `${import.meta.env.BASE_URL}${String(path || '').replace(/^\/+/, '')}`

const CLUB_LOGO = publicAsset('/clean/CabraLogo-nobg.png')
const IJA_LOGO = publicAsset('/clean/IJA-logo-nobg.png')
const MASCOT_IMAGE = publicAsset('/clean/JudoMonkey-nobg.png')
const SENIOR_MASCOT_IMAGE = publicAsset('/CabraGOATS.png')
const DEFAULT_COACH_CSV = publicAsset('/GradingList.csv')
const DEFAULT_COACH_PHOTO = publicAsset('/alonzo.jpg')
const extractYoutubeId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

const getTodayDateString = () => new Date().toLocaleDateString('en-GB')
const DEFAULT_LAST_GRADING_DATE = getTodayDateString()
const DEFAULT_COACH_DETAILS = {
  name: 'Alonzo Henderson',
  title: '6th Dan OLY',
  licenseNumber: '17-0622',
  club: 'Cabra Judo Club'
}
const DEFAULT_COACH_LABEL = [DEFAULT_COACH_DETAILS.name, DEFAULT_COACH_DETAILS.title].filter(Boolean).join(' - ')

const SENIOR_BELT_COLORS = {
  '5k': ['#facc15'],
  '4k': ['#f97316'],
  '3k': ['#10b981']
}

const SENIOR_KYU_GRADE_ORDER = ['5k', '4k', '3k']

const SENIOR_KYU_GRADE_META = {
  '5k': { name: '5th Kyu', belt: 'Yellow Belt' },
  '4k': { name: '4th Kyu', belt: 'Orange Belt' },
  '3k': { name: '3rd Kyu', belt: 'Green Belt' }
}

const ADULT_KYU_GRADE_BY_ID = (adultKyuStudyGuideData?.grades || []).reduce((acc, grade) => {
  if (grade?.gradeId) acc[grade.gradeId] = grade
  return acc
}, {})

const getAdultKyuCategoryNames = (gradeId, categoryKey) => {
  const items = ADULT_KYU_GRADE_BY_ID?.[gradeId]?.categories?.[categoryKey]
  if (!Array.isArray(items)) return []
  return items.map((item) => item?.name).filter(Boolean)
}

const SENIOR_SYLLABUS = SENIOR_KYU_GRADE_ORDER.map((gradeId) => {
  const meta = SENIOR_KYU_GRADE_META[gradeId]
  const freePractice = getAdultKyuCategoryNames(gradeId, 'freePractice')[0]
  const fundamentalSkillsLabel = getAdultKyuCategoryNames(gradeId, 'fundamentalSkills')[0]

  return {
    id: gradeId,
    name: meta.name,
    belt: meta.belt,
    beltColors: SENIOR_BELT_COLORS[gradeId],
    ukemi: getAdultKyuCategoryNames(gradeId, 'ukemi'),
    tachiwaza: getAdultKyuCategoryNames(gradeId, 'tachiwaza'),
    newaza: getAdultKyuCategoryNames(gradeId, 'newaza'),
    performanceSkills: getAdultKyuCategoryNames(gradeId, 'performanceSkills'),
    behaviour: getAdultKyuCategoryNames(gradeId, 'generalBehaviour'),
    terminology: getAdultKyuCategoryNames(gradeId, 'terminology'),
    additionalLearning: getAdultKyuCategoryNames(gradeId, 'additionalLearning'),
    freePractice: freePractice || 'Throw for throw',
    fundamentalSkillsLabel: fundamentalSkillsLabel || 'Fundamental skills completed'
  }
})

const SHAMROCK_REPORT_ROWS = [
  {
    gradeId: '1s',
    gradeName: '1st Shamrock',
    ukemi: ['Full set from seated'],
    performanceSkills: ['agura & seiza'],
    generalBehaviour: ['Listening & paying attentention']
  },
  {
    gradeId: '2s',
    gradeName: '2nd Shamrock',
    ukemi: ['Full set from crouching'],
    performanceSkills: ['Ritsurei', 'Za rei'],
    generalBehaviour: ['Hygiene', 'Safety']
  },
  {
    gradeId: '3s',
    gradeName: '3rd Shamrock',
    ukemi: ['Full set from standing'],
    performanceSkills: ['Bow onto mat', 'Bow off mat'],
    generalBehaviour: ['Fair Play', 'Friendship']
  }
]

const MIN_MONTHS_IN_GRADE = {
  '1s': 1,
  '2s': 1,
  '3s': 1,
  '2m': 1,
  '3m': 3,
  '4m': 3,
  '5m': 3,
  '6m': 4,
  '7m': 4,
  '8m': 5,
  '9m': 5,
  '10m': 6,
  '11m': 6,
  '12m': 6,
  '5k': 6,
  '4k': 6,
  '3k': 6
}

const TAB_EXAMS_BY_GRADE = {
  '1s': {
    ukemi: ['full set from seated'],
    tachiwaza: ['de ashi barai'],
    newaza: ['kuzure kesa-gatame'],
    performanceSkills: ['agura & seiza'],
    generalBehaviour: ['listening & paying attentention'],
    terminology: ['rei, hajime, matte'],
    additionalLearning: ["coach's choice"],
    freePractice: "coach's choice",
    fundamentalSkillsLabel: '1 skill'
  },
  '2s': {
    ukemi: ['full set from crouching'],
    tachiwaza: ['Uki-goshi'],
    newaza: ['Kata-gatame', 'Tate-shiho-gatame'],
    performanceSkills: ['ritsurei', 'za rei'],
    generalBehaviour: ['hygiene', 'safety'],
    terminology: ['ukemi (breakfall)', 'judoka (judo player)', 'sensei (coach)'],
    additionalLearning: ["coach's choice"],
    freePractice: "coach's choice",
    fundamentalSkillsLabel: '2 skills'
  },
  '3s': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Osoto-gari'],
    newaza: ['mune gatame', 'kuzure tate-shiho-gatame'],
    performanceSkills: ['bow onto mat', 'bow off mat'],
    generalBehaviour: ['fair play', 'friendship'],
    terminology: ['uke (receiver)', 'tori (attacker)', 'dojo (judo hall)', 'tatami (judo mat)'],
    additionalLearning: ["coach's choice"],
    freePractice: "coach's choice",
    fundamentalSkillsLabel: '3 skills'
  },
  '2m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['de ashi barai', 'Uki-goshi', 'Osoto-gari'],
    newaza: ['Kesa-gatame', 'kuzure kesa-gatame', 'Kata-gatame', 'Tate-shiho-gatame', 'mune gatame', 'kuzure tate-shiho-gatame'],
    performanceSkills: ['agura', 'seiza', 'ritsurei', 'za rei', 'bow onto mat', 'bow off mat'],
    generalBehaviour: ['listening & paying attention', 'hygiene', 'safety', 'fair play', 'friendship'],
    terminology: ['rei (bow)', 'hajime (begin)', 'matte (stop)', 'ukemi (breakfall)', 'judoka (judo player)', 'sensei (coach)', 'uke (receiver)', 'tori (attacker)', 'dojo (judo hall)', 'tatami (judo mat)'],
    additionalLearning: ["coach's choice"],
    freePractice: "coach's choice",
    fundamentalSkillsLabel: '3 skills'
  },
  '3m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['O-uchi-gari', 'hiza guruma', 'sasae tsurikomi ashi'],
    newaza: ['Yoko-shiho-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['tie your belt'],
    terminology: ['judogi (judo suit)', 'obi (belt)', 'zori (sandals/crocs)'],
    additionalLearning: ['o-uchi-gaeshi', 'tsubame-gaeshi'],
    freePractice: "coach's choice",
    fundamentalSkillsLabel: '4 skills'
  },
  '4m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['morote seoi nage', 'O-goshi', 'Ippon Seoi-nage'],
    newaza: ['Yoko-shiho-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['courtesy'],
    terminology: ['judogi (judo suit)', 'obi (belt)', 'zori (sandals/crocs)'],
    additionalLearning: ['ippon seoi-toshi', 'morote-seoi-toshi'],
    freePractice: 'throw for throw',
    fundamentalSkillsLabel: '5 skills'
  },
  '5m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['kosoto gari', 'Ko-uchi-gari', 'Tai-otoshi'],
    newaza: ['kuzure kami-shiho gatame', 'Kami-shiho-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['courage'],
    terminology: ['uchikomi (repetition)', 'randori (free practice)', 'shiai (competition)'],
    additionalLearning: ['kouchi-gaeshi'],
    freePractice: 'throw for throw',
    fundamentalSkillsLabel: '6 skills'
  },
  '6m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Harai-goshi', 'Koshi-guruma', 'o-guruma'],
    newaza: ['Uki-gatame', 'Ura-Gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['honesty'],
    terminology: ['sono mama (freeze)', 'yoshi (unfreeze)'],
    additionalLearning: ['harai-goshi-gaeshi'],
    freePractice: 'throw for throw',
    fundamentalSkillsLabel: '6 skills'
  },
  '7m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Uchi-mata', 'Okuri-ashi barai'],
    newaza: ['Ushiro-kesa-gatame', 'Mukura-kesa-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['honour'],
    terminology: ['ne-waza', 'tachi-waza'],
    additionalLearning: ['uchi-mata gaeshi', 'uchi-mata sukashi'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '8 skills'
  },
  '8m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Tsurikomi-goshi', 'Sode Tsurikomi-goshi'],
    newaza: ['Sangaku-Gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['modesty'],
    terminology: ['wazari (half point)', 'ippon (full point)'],
    additionalLearning: ['uchi-mata makikomi', 'harai makikomi'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '9 skills'
  },
  '9m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Hane-goshi', 'Tsuri-goshi'],
    newaza: ['Ude-hishigi-juji-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['respect'],
    terminology: ['shido (penalty)', 'hansoku-make (disqualification)'],
    additionalLearning: ['hane-goshi gaeshi'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '10 skills'
  },
  '10m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Ashi-guruma', 'Harai-Tsurikomi-Ashi'],
    newaza: ['Ude Garami'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['self-control'],
    terminology: ['Contest signals & etiquette'],
    additionalLearning: ['yama-arashi'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '11 skills'
  },
  '11m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Yoko-otoshi', 'Ko-soto-gake'],
    newaza: ['Ude-hishigi-ude-gatame'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['friendship'],
    terminology: ['shime-waza (strangles)', 'kansetsu-waza (armlocks)'],
    additionalLearning: ['daki-wakare'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '12 skills'
  },
  '12m': {
    ukemi: ['full set from standing'],
    tachiwaza: ['Tomoe-nage'],
    newaza: ['Gyaku Juji-Jime', 'Kata Juji-Jime', 'Nami Juji-Jime'],
    performanceSkills: ['any combination', 'any counter', 'any turnover to hold', 'escape from hold'],
    generalBehaviour: ['explain judo moral code'],
    terminology: ['kata (set pattern)'],
    additionalLearning: ['set 2 nage-no-kata'],
    freePractice: 'randori',
    fundamentalSkillsLabel: '13 skills'
  }
}

const SENIOR_KYU_GRADE_ID_SET = new Set(SENIOR_KYU_GRADE_ORDER)

const ADULT_KYU_TAB_EXAMS_BY_GRADE = (adultKyuStudyGuideData?.grades || [])
  .filter((grade) => SENIOR_KYU_GRADE_ID_SET.has(grade?.gradeId))
  .reduce((acc, grade) => {
    const categories = grade?.categories || {}
    const toNames = (items) => (Array.isArray(items)
      ? items.map((item) => item?.name).filter(Boolean)
      : [])

    acc[grade.gradeId] = {
      ukemi: toNames(categories.ukemi),
      tachiwaza: toNames(categories.tachiwaza),
      newaza: toNames(categories.newaza),
      performanceSkills: toNames(categories.performanceSkills),
      generalBehaviour: toNames(categories.generalBehaviour),
      terminology: toNames(categories.terminology),
      additionalLearning: toNames(categories.additionalLearning),
      freePractice: toNames(categories.freePractice)[0] || 'Throw for throw',
      fundamentalSkillsLabel: toNames(categories.fundamentalSkills)[0] || 'Fundamental skills completed'
    }

    return acc
  }, {})

const WORKBOOK_MON_ORDER = ['2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '10m', '11m', '12m']

const WORKBOOK_STANDING_EXAMS = [
  { label: 'De Ashi Barai', page: 12, startGrade: '2m' },
  { label: 'Uki Goshi', page: 16, startGrade: '2m' },
  { label: 'O Soto Gari', page: 20, startGrade: '2m' },
  { label: 'O Uchi Gari', page: 26, startGrade: '3m' },
  { label: 'Hiza Guruma', page: 28, startGrade: '3m' },
  { label: 'Sasae Tsurikomi Ashi', page: 30, startGrade: '3m' },
  { label: 'Morote Seoi Nage', page: 34, startGrade: '4m' },
  { label: 'O Goshi', page: 36, startGrade: '4m' },
  { label: 'Ippon Seoi Nage', page: 38, startGrade: '4m' },
  { label: 'Kosoto Gari', page: 42, startGrade: '5m' },
  { label: 'Ko Uchi Gari', page: 44, startGrade: '5m' },
  { label: 'Tai O Toshi', page: 46, startGrade: '5m' },
  { label: 'Harai Goshi', page: 50, startGrade: '6m' },
  { label: 'Koshi Garuma', page: 52, startGrade: '6m' },
  { label: 'O Garuma', page: 54, startGrade: '6m' },
  { label: 'Uchimata', page: 58, startGrade: '7m' },
  { label: 'Okuri Ashi Barai', page: 60, startGrade: '7m' },
  { label: 'Tsurikomi Goshi', page: 64, startGrade: '8m' },
  { label: 'Sode Tsuri Komi Goshi', page: 66, startGrade: '8m' },
  { label: 'Hane Goshi', page: 70, startGrade: '9m' },
  { label: 'Tsuri Goshi', page: 72, startGrade: '9m' },
  { label: 'Ashi Guruma', page: 76, startGrade: '10m' },
  { label: 'Harai Tsurikomi Ashi', page: 78, startGrade: '10m' },
  { label: 'Yoko O Toshi', page: 82, startGrade: '11m' },
  { label: 'Ko-Soto-Gake', page: 84, startGrade: '11m' },
  { label: 'Tomoe Nage', page: 88, startGrade: '12m' }
]

const WORKBOOK_NEWAZA_EXAMS = [
  { label: 'Kesa-Gatame', page: 24, startGrade: '2m' },
  { label: 'Kuzure-Kesa-Gatame', page: 14, startGrade: '2m' },
  { label: 'Kata-Gatame', page: 18, startGrade: '2m' },
  { label: 'Tate-Shiho-Gatame', page: 18, startGrade: '2m' },
  { label: 'Mune Gatame', page: 22, startGrade: '2m' },
  { label: 'Kuzure Tate Shiho Gatame', page: 22, startGrade: '2m' },
  { label: 'Yoko-Shiho-Gatame', page: 32, startGrade: '3m' },
  { label: 'Kuzure Yoko Shiho Gatame', page: 40, startGrade: '4m' },
  { label: 'Kuzure-Kami-Shiho-Gatame', page: 48, startGrade: '5m' },
  { label: 'Kami-Shiho-Gatame', page: 48, startGrade: '6m' },
  { label: 'Uki-Gatame', page: 56, startGrade: '7m' },
  { label: 'Ura-Gatame', page: 56, startGrade: '7m' },
  { label: 'Ushiro-kesa-gatame', page: 62, startGrade: '8m' },
  { label: 'Mukura Kesa Gatame', page: 62, startGrade: '8m' },
  { label: 'Sangaku-Gatame', page: 68, startGrade: '9m' },
  { label: 'Ude-hishigi-juji-gatame', page: 74, startGrade: '9m' },
  { label: 'Ude-garami', page: 80, startGrade: '10m' },
  { label: 'Ude-hishigi-ude-gatame', page: 74, startGrade: '11m' },
  { label: 'Gyaku Juji-jime', page: 90, startGrade: '12m' },
  { label: 'Kata-juji-jime', page: 90, startGrade: '12m' },
  { label: 'Nami-juji-jime', page: 90, startGrade: '12m' }
]

const WORKBOOK_TERMINOLOGY_EXAMS = [
  { label: 'Rei', description: 'Bow' },
  { label: 'Randori', description: 'Free practice' },
  { label: 'Hajime', description: 'Begin' },
  { label: 'Shiai', description: 'Competition' },
  { label: 'Matte', description: 'Stop' },
  { label: 'Sono Mama', description: 'Freeze' },
  { label: 'Ukemi', description: 'Breakfall' },
  { label: 'Yoshi', description: 'Un-freeze' },
  { label: 'Judoka', description: 'Judo player' },
  { label: 'Ne-waza', description: 'Groundwork' },
  { label: 'Sensei', description: 'Coach' },
  { label: 'Tachi-Waza', description: 'Standing work' },
  { label: 'Ukemi', description: 'Receiver' },
  { label: 'Waza-ari', description: 'Half point' },
  { label: 'Tori', description: 'Attacker' },
  { label: 'Ippon', description: 'Full point' },
  { label: 'Dojo', description: 'Judo hall' },
  { label: 'Shido', description: 'Penalty' },
  { label: 'Tatami', description: 'Judo mat' },
  { label: 'Hansoku-make', description: 'Disqualification' },
  { label: 'Judogi', description: 'Judo suit' },
  { label: 'Shime-waza', description: 'Strangles' },
  { label: 'Obi', description: 'Belt' },
  { label: 'Kansetsu-waza', description: 'Arm-locks' },
  { label: 'Zori', description: 'Footwear' },
  { label: 'Kata', description: 'set pattern' },
  { label: 'Uchikomi', description: 'Repetition' },
  { label: 'Judo', description: 'Gentle way' }
]

const WORKBOOK_PERFORMANCE_EXAMS = [
  {
    label: 'Combinations',
    href: 'https://www.youtube.com/watch?v=4wD0HtO_OsE&list=PLkAuE3AonQnx6ulTwrQhAxynmFtkpCEkx&index=1'
  },
  {
    label: 'Counters',
    href: 'https://www.youtube.com/watch?v=JOAJrxSQBwk&list=PLkAuE3AonQnx6ulTwrQhAxynmFtkpCEkx&index=2'
  },
  {
    label: 'Turnovers / Escapes',
    href: 'https://www.youtube.com/watch?v=g1rydrlW7Lg&list=PLkAuE3AonQnx6ulTwrQhAxynmFtkpCEkx&index=3'
  },
  {
    label: 'Additional Learning',
    href: 'https://www.youtube.com/watch?v=63niFwJG8LU&list=PLkAuE3AonQnx6ulTwrQhAxynmFtkpCEkx&index=4'
  }
]

function getWorkbookMonRank(gradeId) {
  return WORKBOOK_MON_ORDER.indexOf(gradeId)
}

function buildWorkbookItems(items, gradeId) {
  const currentRank = getWorkbookMonRank(gradeId)
  if (currentRank < 0) return []

  return items
    .filter((item) => getWorkbookMonRank(item.startGrade) <= currentRank)
    .map((item) => ({
      label: item.label,
      description: item.description || (item.page ? `p${item.page}` : ''),
      href: item.href || ''
    }))
}

function getExamItemLabel(item) {
  if (typeof item === 'string') return item
  if (!item) return ''
  return item.description ? `${item.label} — ${item.description}` : item.label
}

function getExamItemId(category, item) {
  return `${category}:${getExamItemLabel(item)}`
}

function getWorkbookExamSections(gradeId, activeGrade) {
  if (!WORKBOOK_MON_ORDER.includes(gradeId)) return null

  const workbookTechniqueItems = buildWorkbookItems(WORKBOOK_STANDING_EXAMS, gradeId)
  const workbookNewazaItems = buildWorkbookItems(WORKBOOK_NEWAZA_EXAMS, gradeId)
  const workbookTerminologyItems = WORKBOOK_TERMINOLOGY_EXAMS.map((item) => ({
    label: item.label,
    description: item.description,
    href: ''
  }))
  const workbookPerformanceItems = WORKBOOK_PERFORMANCE_EXAMS.map((item) => ({
    label: item.label,
    description: '',
    href: item.href
  }))

  return {
    ukemi: activeGrade?.ukemi || [],
    tachiwaza: workbookTechniqueItems,
    newaza: workbookNewazaItems,
    performanceSkills: getWorkbookMonRank(gradeId) >= getWorkbookMonRank('4m') ? workbookPerformanceItems.slice(0, 3) : [],
    generalBehaviour: activeGrade?.behaviour || [],
    terminology: workbookTerminologyItems,
    additionalLearning: getWorkbookMonRank(gradeId) >= getWorkbookMonRank('4m') ? workbookPerformanceItems.slice(3) : []
  }
}

const BG_TOLERANCE = 30

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
}

function isNearBackground(data, idx, bgR, bgG, bgB) {
  const alpha = data[idx + 3]
  if (alpha === 0) return false
  return colorDistance(data[idx], data[idx + 1], data[idx + 2], bgR, bgG, bgB) <= BG_TOLERANCE
}

function stripEdgeBackground(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(imageSrc)
        return
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const width = canvas.width
      const height = canvas.height

      const corners = [
        0,
        (width - 1) * 4,
        ((height - 1) * width) * 4,
        ((height * width) - 1) * 4
      ]

      let bgR = 0
      let bgG = 0
      let bgB = 0

      corners.forEach((idx) => {
        bgR += data[idx]
        bgG += data[idx + 1]
        bgB += data[idx + 2]
      })

      bgR = Math.round(bgR / corners.length)
      bgG = Math.round(bgG / corners.length)
      bgB = Math.round(bgB / corners.length)

      const visited = new Uint8Array(width * height)
      const queue = []

      const enqueue = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return
        const pos = y * width + x
        if (visited[pos]) return

        const idx = pos * 4
        if (!isNearBackground(data, idx, bgR, bgG, bgB)) return

        visited[pos] = 1
        queue.push([x, y])
      }

      for (let x = 0; x < width; x += 1) {
        enqueue(x, 0)
        enqueue(x, height - 1)
      }
      for (let y = 0; y < height; y += 1) {
        enqueue(0, y)
        enqueue(width - 1, y)
      }

      while (queue.length) {
        const [x, y] = queue.shift()
        const pos = y * width + x
        const idx = pos * 4
        data[idx + 3] = 0

        enqueue(x + 1, y)
        enqueue(x - 1, y)
        enqueue(x, y + 1)
        enqueue(x, y - 1)
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => resolve(imageSrc)
    img.src = imageSrc
  })
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

function getSeniorTargetGradeId(value) {
  const normalized = normalizeKey(value)

  if (!normalized || normalized === 'none' || normalized === 'na' || normalized === 'n/a' || normalized === 'ungraded') {
    return '5k'
  }

  const kyuMatch = normalized.match(/^kyu(\d+)$/)
  if (!kyuMatch) {
    return ''
  }

  const currentKyu = Number(kyuMatch[1])
  if (currentKyu === 6) return '5k'
  if (currentKyu === 5) return '4k'
  if (currentKyu === 4) return '3k'
  return ''
}

function getCandidateGroup(record) {
  if (record?.ageYears != null && record.ageYears < 14) {
    return 'junior'
  }
  return 'senior'
}

function parseDateOfBirth(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

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

function parseDateValue(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  const simple = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (simple) {
    const day = Number(simple[1])
    const month = Number(simple[2])
    const yearRaw = Number(simple[3])
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw
    const parsed = new Date(year, month - 1, day)
    if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) {
      return parsed
    }
  }

  const fallback = new Date(raw)
  if (!Number.isNaN(fallback.getTime())) return fallback
  return null
}

function calculateMonthDiff(startDate, endDate) {
  if (!startDate || !endDate) return null
  if (endDate < startDate) return 0

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12
  months += endDate.getMonth() - startDate.getMonth()
  if (endDate.getDate() < startDate.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

function extractGradingRecord(raw, index) {
  const mapped = Object.entries(raw).reduce((acc, [key, value]) => {
    acc[normalizeKey(key)] = String(value ?? '').trim()
    return acc
  }, {})

  const firstName = mapped.firstname || mapped.givenname || ''
  const lastName = mapped.lastname || mapped.surname || ''
  const combinedName = `${firstName} ${lastName}`.trim()

  const name =
    mapped.studentname ||
    mapped.fullname ||
    mapped.judokaname ||
    combinedName ||
    mapped.name ||
    ''

  const ijaNumber =
    mapped.ijalicence ||
    mapped.ijalicense ||
    mapped.ijanumber ||
    mapped.licencenumber ||
    mapped.licensenumber ||
    mapped.license ||
    mapped.licence ||
    ''

  const lastGradingDate =
    mapped.lastgradingdate ||
    mapped.dateoflastgrading ||
    mapped.previousgradingdate ||
    mapped.lastgrade ||
    mapped.lastgraded ||
    ''

  const csvGrade =
    mapped.grade ||
    mapped.currentgrade ||
    mapped.currentbelt ||
    ''

  const dobRaw =
    mapped.dateofbirth ||
    mapped.dob ||
    mapped.birthdate ||
    ''

  const dob = parseDateOfBirth(dobRaw)
  const ageYears = calculateAgeYears(dob)

  if (!name && !ijaNumber && !lastGradingDate && !csvGrade && ageYears == null) {
    return null
  }

  if (ageYears == null) {
    return null
  }

  const isJunior = ageYears < 14
  const currentGradeId = isJunior ? inferGradeIdFromValue(csvGrade) : ''
  const targetGradeId = isJunior
    ? (isUngradedValue(csvGrade) ? getLowestRelevantGradeIdForAge(ageYears) : '')
    : getSeniorTargetGradeId(csvGrade)

  if (isJunior && !targetGradeId && !currentGradeId) {
    return null
  }

  if (!isJunior && !targetGradeId) {
    return null
  }

  return {
    id: String(index),
    name,
    ijaNumber,
    lastGradingDate,
    currentGradeId,
    targetGradeId,
    isPreviouslyUngraded: isUngradedValue(csvGrade) || normalizeKey(csvGrade) === '',
    ageYears
  }
}

function parseGradingListText(text, sourceName = '') {
  const name = sourceName.toLowerCase()

  if (name.endsWith('.json')) {
    const json = JSON.parse(text)
    const list = Array.isArray(json) ? json : [json]
    return list
      .map((row, index) => extractGradingRecord(row, index))
      .filter(Boolean)
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return []
  }

  const headerIndex = findCsvHeaderIndex(lines)
  const headers = parseCsvLine(lines[headerIndex >= 0 ? headerIndex : 0])
  const rows = lines.slice((headerIndex >= 0 ? headerIndex : 0) + 1).map((line) => parseCsvLine(line))

  return rows
    .map((cols, index) => {
      const row = {}
      headers.forEach((header, idx) => {
        row[header] = cols[idx] ?? ''
      })
      return extractGradingRecord(row, index)
    })
    .filter(Boolean)
}

async function parseGradingListFile(file) {
  const text = await file.text()
  return parseGradingListText(text, file.name)
}

function clipText(text, maxLength = 48) {
  const value = String(text || '').trim()
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1))}...`
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = String(dataUrl || '').split(',')[1] || ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function embedPdfImageFromSource(pdfDoc, imageSrc) {
  if (!imageSrc) return null

  try {
    let bytes
    const source = String(imageSrc)

    if (source.startsWith('data:')) {
      bytes = dataUrlToUint8Array(source)
    } else {
      const response = await fetch(source)
      if (!response.ok) return null
      bytes = new Uint8Array(await response.arrayBuffer())
    }

    if (source.startsWith('data:image/jpeg') || source.startsWith('data:image/jpg')) {
      try {
        return await pdfDoc.embedJpg(bytes)
      } catch {
        return await pdfDoc.embedPng(bytes)
      }
    }

    try {
      return await pdfDoc.embedPng(bytes)
    } catch {
      return await pdfDoc.embedJpg(bytes)
    }
  } catch {
    return null
  }
}

async function waitForElementImages(element) {
  if (!element) return

  const images = Array.from(element.querySelectorAll('img'))
  if (!images.length) return

  await Promise.all(images.map((img) => {
    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const done = () => {
        img.removeEventListener('load', done)
        img.removeEventListener('error', done)
        resolve()
      }

      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })
  }))
}

async function rasterizeImageToPngDataUrl(imageSrc, scaleFactor = 1) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const width = Math.max(1, Math.round((img.naturalWidth || img.width || 1) * Math.max(1, scaleFactor)))
      const height = Math.max(1, Math.round((img.naturalHeight || img.height || 1) * Math.max(1, scaleFactor)))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not rasterize image.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => reject(new Error('Image load failed for rasterization.'))
    img.src = imageSrc
  })
}

function hexToRgb(hex) {
  const value = String(hex || '').replace('#', '').trim()
  if (!value) return null

  const normalized = value.length === 3
    ? value.split('').map((part) => `${part}${part}`).join('')
    : value

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  }
}

function getReadableTextColor(backgroundColor, dark = '#0f172a', light = '#ffffff') {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return dark

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.62 ? dark : light
}

function App() {
  const certificateRef = useRef(null)
  const certificateReportRef = useRef(null)

  const SYLLABUS = useMemo(
    () => ({
      shamrock: [
        {
          id: '1s',
          name: '1st Shamrock',
          belt: 'Red Belt (+ Cert)',
          beltColors: ['#dc2626'],
          ukemi: ['Full set from seated'],
          tachiwaza: ['De Ashi Barai'],
          newaza: ['Kuzure-Kesa-Gatame'],
          terminology: ['REI', 'Hajime', 'Matte'],
          behaviour: ['Listening & paying attentention'],
          performanceSkills: ['agura & seiza'],
          additionalLearning: ["Coach's choice"],
          freePractice: "Coach's choice",
          fundamentalSkillsLabel: '1 skill',
          skills: 1
        },
        {
          id: '2s',
          name: '2nd Shamrock',
          belt: 'Red Belt (+ Cert)',
          beltColors: ['#dc2626'],
          ukemi: ['Full set from crouching'],
          tachiwaza: ['Uki Goshi'],
          newaza: ['Kata-Gatame', 'Tate-Shiho-Gatame'],
          terminology: ['Ukemi (Breakfall)', 'Judoka (Judo player)', 'Sensei (Coach)'],
          behaviour: ['Hygiene', 'Safety'],
          performanceSkills: ['Ritsurei', 'Za rei'],
          additionalLearning: ["Coach's choice"],
          freePractice: "Coach's choice",
          fundamentalSkillsLabel: '2 skills',
          skills: 2
        },
        {
          id: '3s',
          name: '3rd Shamrock',
          belt: 'Red Belt (+ Cert)',
          beltColors: ['#dc2626'],
          ukemi: ['Full set from standing'],
          tachiwaza: ['O Soto Gari'],
          newaza: ['Mune Gatame', 'Kuzure Tate Shiho Gatame'],
          terminology: ['Uke (Receiver)', 'Tori (Attacker)', 'Dojo (Judo hall)', 'Tatami (Judo mat)'],
          behaviour: ['Fair Play', 'Friendship'],
          performanceSkills: ['Bow onto mat', 'Bow off mat'],
          additionalLearning: ["Coach's choice"],
          freePractice: "Coach's choice",
          fundamentalSkillsLabel: '3 skills',
          skills: 3
        }
      ],
      mon: [
        { id: '1m', name: '1st Mon', belt: 'White Belt', beltColors: ['#f8fafc'] },
        {
          id: '2m',
          name: '2nd Mon',
          belt: 'Red Belt',
          beltColors: ['#dc2626'],
          ukemi: ['From Standing'],
          tachiwaza: ['De Ashi Barai', 'Uki Goshi', 'O Soto Gari'],
          newaza: ['Kesa-Gatame', 'Kuzure-Kesa-Gatame', 'Kata-Gatame', 'Tate-Shiho-Gatame', 'Mune Gatame', 'Kuzure Tate Shiho Gatame'],
          terminology: ['REI', 'Hajime', 'Matte', 'Ukemi', 'Judoka', 'Sensei', 'Uke', 'Tori', 'Dojo', 'Tatami'],
          behaviour: ['Agura & Seiza', 'Ritsu rei', 'Za rei', 'Hygiene & Safety', 'Fair Play', 'Friendship'],
          skills: 3
        },
        {
          id: '3m',
          name: '3rd Mon',
          belt: 'White/Yellow Belt',
          beltColors: ['#f8fafc', '#facc15'],
          ukemi: ['Full Set', 'Forward Roll', 'Backward Roll'],
          tachiwaza: ['O Uchi Gari', 'Hiza Guruma', 'Sasae Tsurikomi Ashi'],
          newaza: ['Yoko-Shiho-Gatame', 'Escape from holds', 'Any Turnover to hold'],
          terminology: ['Judo Gi', 'Obi', 'Zori'],
          behaviour: ['Presentation: Tie Belt'],
          skills: 4
        },
        {
          id: '4m',
          name: '4th Mon',
          belt: 'Yellow Belt',
          beltColors: ['#facc15'],
          ukemi: ['Back', 'Front', 'Left Side', 'Right Side', 'Forward roll', 'Backward roll'],
          tachiwaza: ['Morote Seoi Nage', 'O Goshi', 'Ippon Seoi Nage'],
          newaza: ['Kuzure Yoko Shiho Gatame'],
          performanceSkills: ['Any Combination', 'Any Counter', 'Any Turnover to hold', 'Escape from holds'],
          behaviour: ['Courtesy: To be polite to others.'],
          terminology: ['Judo GI', 'Obi', 'Zori'],
          additionalLearning: ['Ippon Seoi Toshi', 'Morote Seoi Toshi'],
          freePractice: 'THROW FOR THROW',
          fundamentalSkillsLabel: '5 Skills',
          skills: 5
        },
        {
          id: '5m',
          name: '5th Mon',
          belt: 'Yellow/Orange Belt',
          beltColors: ['#facc15', '#f97316'],
          tachiwaza: ['Kosoto Gari', 'Ko Uchi Gari', 'Tai O Toshi'],
          newaza: ['Kuzure-Kami-Shiho-Gatame', 'Kami-Shiho-Gatame'],
          terminology: ['Uchikomi', 'Randori', 'Shai'],
          behaviour: ['Courage: Face difficulties'],
          skills: 6
        },
        {
          id: '6m',
          name: '6th Mon',
          belt: 'Orange Belt',
          beltColors: ['#f97316'],
          tachiwaza: ['Harai Goshi', 'Koshi Guruma', 'O Guruma'],
          newaza: ['Uki-Gatame', 'Ura-Gatame'],
          terminology: ['Sona Mama', 'Yoshi'],
          behaviour: ['Honesty: Sincere actions'],
          skills: 7
        },
        {
          id: '7m',
          name: '7th Mon',
          belt: 'Orange/Green Belt',
          beltColors: ['#f97316', '#10b981'],
          tachiwaza: ['Uchimata', 'Okuri Ashi Barai'],
          newaza: ['Ushiro-kesa-gatame', 'Mukura Kesa Gatame'],
          behaviour: ['Honour: Stand by principles'],
          skills: 8
        },
        {
          id: '8m',
          name: '8th Mon',
          belt: 'Green Belt',
          beltColors: ['#10b981'],
          tachiwaza: ['Tsurikomi Goshi', 'Sode Tsuri Komi Goshi'],
          newaza: ['Sangaku-Gatame'],
          behaviour: ['Modesty: Without ego'],
          skills: 9
        },
        {
          id: '9m',
          name: '9th Mon',
          belt: 'Green/Blue Belt',
          beltColors: ['#10b981', '#2563eb'],
          tachiwaza: ['Hane Goshi', 'Tsuri Goshi'],
          newaza: ['Ude-hishigi-juji-gatame'],
          behaviour: ['Respect: Appreciate others'],
          skills: 10
        },
        {
          id: '10m',
          name: '10th Mon',
          belt: 'Blue Belt',
          beltColors: ['#2563eb'],
          tachiwaza: ['Ashi Guruma', 'Harai Tsurikomi Ashi'],
          newaza: ['Ude-garami'],
          behaviour: ['Self Control: Control emotions'],
          skills: 11
        },
        {
          id: '11m',
          name: '11th Mon',
          belt: 'Blue/Brown Belt',
          beltColors: ['#2563eb', '#78350f'],
          tachiwaza: ['Yoko O Toshi', 'Ko-Soto-Gake'],
          newaza: ['Ude-hishigi-ude-gatame'],
          behaviour: ['Friendship: Be a good companion'],
          skills: 12
        },
        {
          id: '12m',
          name: '12th Mon',
          belt: 'Brown Belt',
          beltColors: ['#78350f'],
          tachiwaza: ['Tomoe Nage'],
          newaza: ['Gyaku Juji-jime', 'Kata-juji-jime', 'Nami-juji-jime'],
          behaviour: ['Explain Judo Moral Code'],
          skills: 13
        }
      ]
    }),
    []
  )

  const [playerData, setPlayerData] = useState({
    name: 'Jane Bloggs',
    licenseNumber: '',
    lastCoachingDate: DEFAULT_LAST_GRADING_DATE,
    club: 'Cabra Judo Club',
    coach: DEFAULT_COACH_LABEL,
    gradingOfficerLicense: DEFAULT_COACH_DETAILS.licenseNumber,
    gradingDate: getTodayDateString()
  })

  const [selectedGradeId, setSelectedGradeId] = useState('1s')
  const [completedItems, setCompletedItems] = useState({})
  const [viewMode, setViewMode] = useState('coach')
  const [clubLogoUpload, setClubLogoUpload] = useState('')
  const [ijaLogoUpload, setIjaLogoUpload] = useState('')
  const [coachPhotoUpload, setCoachPhotoUpload] = useState(DEFAULT_COACH_PHOTO)
  const [beltImageUpload, setBeltImageUpload] = useState('')
  const [mascotUpload, setMascotUpload] = useState('')
  const [clubLogoProcessedSrc, setClubLogoProcessedSrc] = useState('')
  const [ijaLogoProcessedSrc, setIjaLogoProcessedSrc] = useState('')
  const [mascotProcessedSrc, setMascotProcessedSrc] = useState('')
  const [beltImageError, setBeltImageError] = useState(false)
  const [gradingListRecords, setGradingListRecords] = useState([])
  const [selectedGradingRecordId, setSelectedGradingRecordId] = useState('')
  const [gradingListMessage, setGradingListMessage] = useState('')
  const [coachSelection, setCoachSelection] = useState({})
  const [gradingSessionRecordIds, setGradingSessionRecordIds] = useState([])
  const [gradingResults, setGradingResults] = useState({})
  const [defaultCoachCsvLoaded, setDefaultCoachCsvLoaded] = useState(false)
  const [coachGroupFilter, setCoachGroupFilter] = useState('junior')
  const [batchCertExport, setBatchCertExport] = useState(null)

  const allGrades = useMemo(
    () => [...SYLLABUS.shamrock, ...SYLLABUS.mon, ...SENIOR_SYLLABUS],
    [SYLLABUS]
  )

  const activeGrade = useMemo(
    () => allGrades.find((g) => g.id === selectedGradeId),
    [selectedGradeId, allGrades]
  )

  const gradeOrder = useMemo(
    () => [
      ...SYLLABUS.shamrock.map((grade) => grade.id),
      ...SYLLABUS.mon.filter((grade) => Number.parseInt(grade.id, 10) >= 2).map((grade) => grade.id)
    ],
    [SYLLABUS]
  )

  const seniorGradeOrder = useMemo(() => SENIOR_KYU_GRADE_ORDER, [])

  const gradeNameById = useMemo(() => {
    return allGrades.reduce((acc, grade) => {
      acc[grade.id] = grade.name
      return acc
    }, {})
  }, [allGrades])

  const beltColorsById = useMemo(() => {
    return allGrades.reduce((acc, grade) => {
      acc[grade.id] = grade.beltColors || []
      return acc
    }, {})
  }, [allGrades])

  const getNextGradeId = (gradeId) => {
    if (gradeId === '1m' || gradeId === '2m') {
      return '3m'
    }

    const currentIndex = gradeOrder.indexOf(gradeId)
    if (currentIndex < 0) return ''
    return gradeOrder[Math.min(currentIndex + 1, gradeOrder.length - 1)]
  }

  const getTargetGradeIdForRecord = (record) => {
    if (record?.targetGradeId) return record.targetGradeId
    if (record?.currentGradeId) return getNextGradeId(record.currentGradeId)
    return ''
  }

  const getPreviousGradeId = (gradeId) => {
    if (gradeId === '5k') return ''
    if (gradeId === '4k') return '5k'
    if (gradeId === '3k') return '4k'
    if (gradeId === '2m') return '1m'
    if (gradeId === '3m') return '2m'
    const currentIndex = gradeOrder.indexOf(gradeId)
    if (currentIndex <= 0) return ''
    return gradeOrder[currentIndex - 1]
  }

  const getGradeLabel = (gradeId) => {
    if (!gradeId) return 'Ungraded'
    if (gradeId === '5k') return '5th Kyu'
    if (gradeId === '4k') return '4th Kyu'
    if (gradeId === '3k') return '3rd Kyu'
    return gradeNameById[gradeId] || gradeId.toUpperCase()
  }

  const getCompactGradeLabel = (gradeId) => {
    if (!gradeId) return 'ungraded'
    const monMatch = gradeId.match(/^(\d+)m$/)
    if (monMatch) return `mon${monMatch[1]}`
    const shamrockMatch = gradeId.match(/^(\d+)s$/)
    if (shamrockMatch) return `shamrock${shamrockMatch[1]}`
    const kyuMatch = gradeId.match(/^(\d+)k$/)
    if (kyuMatch) return `${kyuMatch[1]}th kyu`
    return gradeId
  }

  const coachGradeOrder = useMemo(
    () => (coachGroupFilter === 'senior' ? seniorGradeOrder : gradeOrder),
    [coachGroupFilter, seniorGradeOrder, gradeOrder]
  )

  const recordById = useMemo(() => {
    return gradingListRecords.reduce((acc, record) => {
      acc[record.id] = record
      return acc
    }, {})
  }, [gradingListRecords])

  const coachGroupCounts = useMemo(() => {
    return gradingListRecords.reduce(
      (acc, record) => {
        const targetGradeId = getTargetGradeIdForRecord(record)
        if (!targetGradeId) return acc

        const allowedGrades = getCandidateGroup(record) === 'senior' ? seniorGradeOrder : gradeOrder
        if (!allowedGrades.includes(targetGradeId)) return acc

        const group = getCandidateGroup(record)
        acc[group] += 1
        return acc
      },
      { junior: 0, senior: 0 }
    )
  }, [gradingListRecords, seniorGradeOrder, gradeOrder])

  const coachCandidatesByGrade = useMemo(() => {
    const grouped = coachGradeOrder.reduce((acc, gradeId) => {
      acc[gradeId] = []
      return acc
    }, {})

    gradingListRecords
      .filter((record) => getCandidateGroup(record) === coachGroupFilter)
      .forEach((record) => {
      const targetGradeId = getTargetGradeIdForRecord(record)
      if (!targetGradeId || !grouped[targetGradeId]) return
      grouped[targetGradeId].push(record)
      })

    return coachGradeOrder
      .map((gradeId) => ({
        gradeId,
        gradeName: gradeNameById[gradeId] || ({ '5k': '5th Kyu', '4k': '4th Kyu', '3k': '3rd Kyu' }[gradeId]) || gradeId,
        records: grouped[gradeId].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
      }))
      .filter((group) => group.records.length > 0)
  }, [gradingListRecords, coachGradeOrder, coachGroupFilter, gradeNameById])

  const selectedCoachCount = useMemo(
    () => Object.values(coachSelection).filter(Boolean).length,
    [coachSelection]
  )

  const coachCandidateRecordIds = useMemo(
    () => coachCandidatesByGrade.flatMap((group) => group.records.map((record) => record.id)),
    [coachCandidatesByGrade]
  )

  const areAllCoachCandidatesSelected = useMemo(
    () => coachCandidateRecordIds.length > 0 && coachCandidateRecordIds.every((recordId) => Boolean(coachSelection[recordId])),
    [coachCandidateRecordIds, coachSelection]
  )

  const rankRecordForSelectedGrade = (record) => {
    const targetGradeId = getTargetGradeIdForRecord(record)
    const rankingOrder = getCandidateGroup(record) === 'senior' ? seniorGradeOrder : gradeOrder
    const selectedIndex = rankingOrder.indexOf(selectedGradeId)
    const targetIndex = rankingOrder.indexOf(targetGradeId)

    if (targetIndex < 0 || selectedIndex < 0) {
      return Number.MAX_SAFE_INTEGER
    }

    return Math.abs(targetIndex - selectedIndex)
  }

  const sortedGradingListRecords = useMemo(() => {
    return [...gradingListRecords].sort((a, b) => {
      const aRank = rankRecordForSelectedGrade(a)
      const bRank = rankRecordForSelectedGrade(b)
      if (aRank !== bRank) return aRank - bRank

      return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    })
  }, [gradingListRecords, selectedGradeId, seniorGradeOrder])

  const gradingRecordsForSession = useMemo(() => {
    if (gradingSessionRecordIds.length === 0) {
      return sortedGradingListRecords
    }

    return gradingSessionRecordIds
      .map((id) => recordById[id])
      .filter(Boolean)
  }, [gradingSessionRecordIds, recordById, sortedGradingListRecords])

  const activeSessionRecord = useMemo(() => {
    if (selectedGradingRecordId) {
      const selected = gradingRecordsForSession.find((record) => record.id === selectedGradingRecordId)
      if (selected) return selected
    }

    return gradingRecordsForSession[0] || null
  }, [selectedGradingRecordId, gradingRecordsForSession])

  const isFinalSessionRecord = useMemo(() => {
    if (gradingRecordsForSession.length === 0 || !activeSessionRecord?.id) return false
    return gradingRecordsForSession[gradingRecordsForSession.length - 1]?.id === activeSessionRecord.id
  }, [activeSessionRecord, gradingRecordsForSession])

  const activeGradingResultKey = useMemo(() => {
    if (activeSessionRecord?.id) return `record:${activeSessionRecord.id}`
    return `manual:${selectedGradeId}`
  }, [activeSessionRecord, selectedGradeId])

  const activeGradingResult = gradingResults[activeGradingResultKey] || ''

  const requiredMonthsInGrade = MIN_MONTHS_IN_GRADE[selectedGradeId] || 0
  const gradingDateParsed = parseDateValue(playerData.gradingDate)
  const lastGradingDateParsed = parseDateValue(playerData.lastCoachingDate)
  const effectiveMonthsInGrade = calculateMonthDiff(lastGradingDateParsed, gradingDateParsed)
  const hasEffectiveMonthsInGrade = Number.isFinite(effectiveMonthsInGrade)
  const isMonthsInGradeSufficient =
    requiredMonthsInGrade === 0 ||
    (hasEffectiveMonthsInGrade && effectiveMonthsInGrade >= requiredMonthsInGrade)
  const timeInGradeDisplay = hasEffectiveMonthsInGrade
    ? `${effectiveMonthsInGrade} month${effectiveMonthsInGrade === 1 ? '' : 's'}`
    : (playerData.lastCoachingDate || '')

  const isSeniorGrading = useMemo(() => {
    if (activeSessionRecord) {
      return getCandidateGroup(activeSessionRecord) === 'senior'
    }

    return seniorGradeOrder.includes(selectedGradeId)
  }, [activeSessionRecord, seniorGradeOrder, selectedGradeId])

  const defaultMascotImage = isSeniorGrading ? SENIOR_MASCOT_IMAGE : MASCOT_IMAGE

  const gradingOrder = useMemo(
    () => (isSeniorGrading ? seniorGradeOrder : gradeOrder),
    [isSeniorGrading, seniorGradeOrder, gradeOrder]
  )

  const activeReportRow = useMemo(() => {
    if (!activeGrade) return null

    const tabSections = TAB_EXAMS_BY_GRADE[selectedGradeId] || ADULT_KYU_TAB_EXAMS_BY_GRADE[selectedGradeId]
    if (tabSections) {
      return {
        gradeId: selectedGradeId,
        gradeName: activeGrade.name,
        ...tabSections
      }
    }

    return {
      gradeId: selectedGradeId,
      gradeName: activeGrade.name,
      ukemi: activeGrade.ukemi || [],
      tachiwaza: activeGrade.tachiwaza || [],
      newaza: activeGrade.newaza || [],
      performanceSkills: activeGrade.performanceSkills || [],
      generalBehaviour: activeGrade.behaviour || [],
      terminology: activeGrade.terminology || [],
      additionalLearning: activeGrade.additionalLearning || [],
      freePractice: activeGrade.freePractice || 'Coaches choice',
      fundamentalSkillsLabel: activeGrade.fundamentalSkillsLabel || (activeGrade?.skills ? `${activeGrade.skills} Skills` : 'Fundamental skills completed')
    }
  }, [activeGrade, selectedGradeId])

  const reportFreePractice = activeReportRow?.freePractice || activeGrade?.freePractice || 'Coaches choice'
  const reportFundamentalSkills = activeReportRow?.fundamentalSkillsLabel || activeGrade?.fundamentalSkillsLabel || (activeGrade?.skills ? `${activeGrade.skills} Skills` : 'Fundamental skills completed')

  const reportChecklistItemCount = useMemo(() => {
    if (!activeReportRow) return 0

    return [
      activeReportRow.ukemi,
      activeReportRow.tachiwaza,
      activeReportRow.newaza,
      activeReportRow.performanceSkills,
      activeReportRow.generalBehaviour,
      activeReportRow.terminology,
      activeReportRow.additionalLearning
    ].reduce((count, sectionItems) => count + (Array.isArray(sectionItems) ? sectionItems.length : 0), 2)
  }, [activeReportRow])

  const reportDensityClassName = reportChecklistItemCount >= 38
    ? 'report-page-dense'
    : (reportChecklistItemCount >= 30 ? 'report-page-compact' : '')

  const gradingChecklistItems = useMemo(() => {
    if (!activeGrade) return []

    const items = []
    const pushUnique = (category, entry) => {
      const label = getExamItemLabel(entry)
      if (!label) return
      if (items.some((item) => item.id === getExamItemId(category, entry))) return
      items.push({
        id: getExamItemId(category, entry),
        category,
        label,
        description: typeof entry === 'string' ? '' : (entry.description || ''),
        href: typeof entry === 'string' ? '' : (entry.href || '')
      })
    }

    activeReportRow?.ukemi?.forEach((entry) => pushUnique('Ukemi', entry))
    activeReportRow?.tachiwaza?.forEach((entry) => pushUnique('Tachiwaza', entry))
    activeReportRow?.newaza?.forEach((entry) => pushUnique('Newaza', entry))
    activeReportRow?.performanceSkills?.forEach((entry) => pushUnique('Performance skills', entry))
    activeReportRow?.generalBehaviour?.forEach((entry) => pushUnique('General behaviour', entry))
    activeReportRow?.terminology?.forEach((entry) => pushUnique('Terminology', entry))
    activeReportRow?.additionalLearning?.forEach((entry) => pushUnique('Additional learning', entry))

    pushUnique('Free practice', reportFreePractice)
    pushUnique('Fundamental skills', reportFundamentalSkills)

    return items
  }, [activeGrade, activeReportRow, reportFreePractice, reportFundamentalSkills])

  const groupedChecklistSections = useMemo(() => {
    const sectionMap = new Map()

    gradingChecklistItems.forEach((item) => {
      if (!sectionMap.has(item.category)) {
        sectionMap.set(item.category, [])
      }
      sectionMap.get(item.category).push(item)
    })

    return Array.from(sectionMap.entries()).map(([category, items]) => ({
      category,
      items
    }))
  }, [gradingChecklistItems])

  const progress = useMemo(() => {
    if (gradingChecklistItems.length === 0) return 0
    const completedCount = gradingChecklistItems.filter((item) => completedItems[selectedGradeId]?.[item.id]).length
    return Math.round((completedCount / gradingChecklistItems.length) * 100)
  }, [gradingChecklistItems, completedItems, selectedGradeId])

  const toggleItem = (itemId) => {
    setCompletedItems((prev) => ({
      ...prev,
      [selectedGradeId]: {
        ...(prev[selectedGradeId] || {}),
        [itemId]: !prev[selectedGradeId]?.[itemId]
      }
    }))
  }

  const onFileChange = (event, setter) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  const applyGradingRecord = (record) => {
    if (!record) return
    setPlayerData((prev) => ({
      ...prev,
      name: record.name || prev.name,
      licenseNumber: record.ijaNumber || prev.licenseNumber,
      // Keep coach-set session date, but backfill from CSV when it hasn't been set.
      lastCoachingDate: prev.lastCoachingDate || record.lastGradingDate || ''
    }))

    const targetGradeId = getTargetGradeIdForRecord(record)
    const validTargetGrades = getCandidateGroup(record) === 'senior' ? seniorGradeOrder : gradeOrder
    if (targetGradeId && validTargetGrades.includes(targetGradeId)) {
      setSelectedGradeId(targetGradeId)
    }
  }

  const onGradingListUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const records = await parseGradingListFile(file)
      setGradingListRecords(records)
      setGradingSessionRecordIds([])
      setCoachSelection({})
      setGradingResults({})
      setCompletedItems({})
      setPlayerData({
        name: 'Jane Bloggs',
        licenseNumber: '',
        lastCoachingDate: DEFAULT_LAST_GRADING_DATE,
        club: 'Cabra Judo Club',
        coach: DEFAULT_COACH_LABEL,
        gradingOfficerLicense: DEFAULT_COACH_DETAILS.licenseNumber,
        gradingDate: getTodayDateString()
      })
      setSelectedGradeId('1s')
      setDefaultCoachCsvLoaded(true)
      if (records.length > 0) {
        setGradingListMessage(`Loaded ${records.length} records from ${file.name}`)
        setSelectedGradingRecordId(records[0].id)
        setViewMode('coach')
      } else {
        setSelectedGradingRecordId('')
        setGradingListMessage('No usable rows found. Include columns like First Name, Last Name, IJA Licence, Grade.')
      }
    } catch {
      setSelectedGradingRecordId('')
      setGradingListMessage('Could not parse file. Use CSV or JSON with fields like First Name, Last Name, IJA Licence, Grade.')
      setCoachSelection({})
      setGradingSessionRecordIds([])
    }
  }

  const onGradingRecordChange = (event) => {
    const selectedId = event.target.value
    setSelectedGradingRecordId(selectedId)
    const record = gradingListRecords.find((item) => item.id === selectedId)
    applyGradingRecord(record)
  }

  const moveGradingRecord = (direction) => {
    if (gradingRecordsForSession.length === 0) return

    const currentIndex = gradingRecordsForSession.findIndex((record) => record.id === selectedGradingRecordId)
    const safeIndex = currentIndex >= 0 ? currentIndex : 0
    const offset = direction === 'next' ? 1 : -1
    const nextIndex = (safeIndex + offset + gradingRecordsForSession.length) % gradingRecordsForSession.length

    const nextRecord = gradingRecordsForSession[nextIndex]
    if (!nextRecord || nextRecord.id === selectedGradingRecordId) return

    setSelectedGradingRecordId(nextRecord.id)
    applyGradingRecord(nextRecord)
  }

  const toggleCoachCandidate = (recordId) => {
    setCoachSelection((prev) => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  const selectAllCoachCandidates = () => {
    if (coachCandidateRecordIds.length === 0) return

    setCoachSelection((prev) => {
      const next = { ...prev }
      coachCandidateRecordIds.forEach((recordId) => {
        next[recordId] = !areAllCoachCandidatesSelected
      })
      return next
    })
  }

  const startCoachGrading = () => {
    const selectedRecords = coachCandidatesByGrade
      .flatMap((group) => group.records)
      .filter((record) => coachSelection[record.id])

    if (selectedRecords.length === 0) {
      setGradingListMessage('Select at least one candidate before starting grading.')
      return
    }

    const sessionIds = selectedRecords.map((record) => record.id)
    const firstCandidate = selectedRecords[0]

    setGradingSessionRecordIds(sessionIds)
    setSelectedGradingRecordId(firstCandidate.id)
    applyGradingRecord(firstCandidate)
    setGradingListMessage(`Started grading for ${sessionIds.length} selected candidate${sessionIds.length === 1 ? '' : 's'}.`)
    setViewMode('grading')
  }

  const gradingSessionExportRecords = useMemo(() => {
    if (gradingSessionRecordIds.length > 0) {
      return gradingSessionRecordIds
        .map((id) => recordById[id])
        .filter(Boolean)
    }

    const selectedCandidateIds = Object.entries(coachSelection)
      .filter(([, selected]) => Boolean(selected))
      .map(([recordId]) => recordId)

    if (selectedCandidateIds.length > 0) {
      return selectedCandidateIds
        .map((id) => recordById[id])
        .filter(Boolean)
    }

    return sortedGradingListRecords
  }, [gradingSessionRecordIds, recordById, coachSelection, sortedGradingListRecords])

  const getFeeForGrade = (gradeId) => {
    if (!gradeId) return ''
    if (gradeId.endsWith('s')) return '€2.50'
    if (gradeId.endsWith('m')) return '€5.00'
    if (gradeId.endsWith('k')) return '€10.00'
    return ''
  }

  const getGradeWithBeltLabel = (gradeId) => {
    if (!gradeId) return 'Ungraded'

    const grade = allGrades.find((item) => item.id === gradeId)
    if (!grade) return getGradeLabel(gradeId)
    return `${grade.name} ${grade.belt || ''}`.trim()
  }

  const getSessionExportRows = () => {
    return gradingSessionExportRecords.map((record, index) => {
      const result = gradingResults[`record:${record.id}`] || ''
      const targetGradeId = getTargetGradeIdForRecord(record)
      const currentGradeHeld = getGradeWithBeltLabel(record.currentGradeId)
      const newGradeAwarded = result === 'Pass' ? getGradeWithBeltLabel(targetGradeId) : ''

      return {
        no: index + 1,
        fullName: record.name || '',
        licenseNumber: record.ijaNumber || '',
        currentGradeHeld,
        newGradeAwarded,
        result: result || 'Pending',
        fee: getFeeForGrade(targetGradeId)
      }
    })
  }

  const escapeCsvValue = (value) => {
    const text = String(value ?? '')
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replaceAll('"', '""')}"`
    }
    return text
  }

  const downloadGradingList = async () => {
    try {
      const response = await fetch(publicAsset('/GradingList.csv'))
      if (!response.ok) {
        setGradingListMessage('Could not download grading list.')
        return
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'GradingList.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      setGradingListMessage('Downloaded GradingList.csv for local editing.')
    } catch (error) {
      setGradingListMessage('Error downloading grading list.')
    }
  }

  const downloadSessionCsv = () => {
    const rows = getSessionExportRows()
    if (rows.length === 0) {
      setGradingListMessage('No grading records available to export.')
      return
    }

    const headers = [
      'No',
      'Full Name',
      'IJA Licence number',
      'Current Grade Held',
      'New Grade Awarded',
      'Result',
      'Coach',
      'Date grading took place',
      'Fee'
    ]

    const csvLines = [headers.join(',')]
    rows.forEach((row) => {
      const values = [
        row.no,
        row.fullName,
        row.licenseNumber,
        row.currentGradeHeld,
        row.newGradeAwarded,
        row.result,
        playerData.coach || '',
        playerData.gradingDate || '',
        row.fee
      ]
      csvLines.push(values.map(escapeCsvValue).join(','))
    })

    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `cabra-grading-session-${(playerData.gradingDate || getTodayDateString()).replaceAll('/', '-')}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const downloadSessionSummaryPdf = async () => {
    const rows = getSessionExportRows()
    if (rows.length === 0) {
      setGradingListMessage('No grading records available to export.')
      return
    }

    const pdf = await PDFDocument.create()
    const page = pdf.addPage([841.89, 595.28])
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const black = rgb(0, 0, 0)

    const ijaLogoSrc = ijaLogoProcessedSrc || ijaLogoUpload || IJA_LOGO
    const clubLogoSrc = clubLogoProcessedSrc || clubLogoUpload || CLUB_LOGO

    const [ijaLogoImage, clubLogoImage] = await Promise.all([
      embedPdfImageFromSource(pdf, ijaLogoSrc),
      embedPdfImageFromSource(pdf, clubLogoSrc)
    ])

    const drawHeaderLogo = (image, x, y, maxWidth = 58, maxHeight = 58) => {
      if (!image) return
      const dims = image.scale(1)
      const scale = Math.min(maxWidth / dims.width, maxHeight / dims.height)
      page.drawImage(image, {
        x,
        y,
        width: dims.width * scale,
        height: dims.height * scale
      })
    }

    const logoMaxWidth = 58
    const logoMargin = 40
    drawHeaderLogo(ijaLogoImage, logoMargin, 520, logoMaxWidth, 58)
    drawHeaderLogo(clubLogoImage, 841.89 - logoMargin - logoMaxWidth, 520, logoMaxWidth, 58)

    page.drawText('Irish Judo Association - Club Grading Form', {
      x: 190,
      y: 548,
      size: 16,
      font: fontBold,
      color: black
    })

    const left = 40
    const top = 510
    const rowHeight = 18
    const cols = [
      { key: 'no', title: 'No', width: 35 },
      { key: 'fullName', title: 'Full Name', width: 200 },
      { key: 'licenseNumber', title: 'IJA Licence number', width: 120 },
      { key: 'currentGradeHeld', title: 'Current Grade Held', width: 130 },
      { key: 'newGradeAwarded', title: 'New Grade Awarded', width: 130 },
      { key: 'result', title: 'Result', width: 65 },
      { key: 'fee', title: 'Fee', width: 55 }
    ]

    let x = left
    cols.forEach((col) => {
      page.drawRectangle({ x, y: top - rowHeight, width: col.width, height: rowHeight, borderColor: black, borderWidth: 1 })
      page.drawText(clipText(col.title, 24), { x: x + 4, y: top - 13, size: 9, font: fontBold, color: black })
      x += col.width
    })

    const maxRows = Math.min(rows.length, 20)
    for (let idx = 0; idx < maxRows; idx += 1) {
      const y = top - rowHeight * (idx + 2)
      const row = rows[idx]
      let cellX = left

      cols.forEach((col) => {
        page.drawRectangle({ x: cellX, y, width: col.width, height: rowHeight, borderColor: black, borderWidth: 1 })
        page.drawText(clipText(row[col.key], col.key === 'fullName' ? 36 : 26), {
          x: cellX + 4,
          y: y + 5,
          size: 9,
          font,
          color: black
        })
        cellX += col.width
      })
    }

    page.drawText(`Signed by the Grader: ${playerData.coach || ''}`, {
      x: 40,
      y: 90,
      size: 12,
      font: fontBold,
      color: black
    })
    page.drawText(`Name of the IJA Club: ${playerData.club || 'Cabra Judo Club'}`, {
      x: 390,
      y: 90,
      size: 12,
      font: fontBold,
      color: black
    })
    page.drawText(`Date grading took place: ${playerData.gradingDate || ''}`, {
      x: 40,
      y: 62,
      size: 12,
      font: fontBold,
      color: black
    })
    page.drawText('Fees: €2.50 Shamrock  €5 Mon  €10 Kyu', {
      x: 390,
      y: 62,
      size: 11,
      font,
      color: black
    })

    const bytes = await pdf.save()
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `cabra-grading-session-${(playerData.gradingDate || getTodayDateString()).replaceAll('/', '-')}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const source = clubLogoUpload || CLUB_LOGO
    let cancelled = false

    stripEdgeBackground(source).then((processed) => {
      if (!cancelled) {
        setClubLogoProcessedSrc(processed)
      }
    })

    return () => {
      cancelled = true
    }
  }, [clubLogoUpload])

  useEffect(() => {
    const source = ijaLogoUpload || IJA_LOGO
    let cancelled = false

    stripEdgeBackground(source).then((processed) => {
      if (!cancelled) {
        setIjaLogoProcessedSrc(processed)
      }
    })

    return () => {
      cancelled = true
    }
  }, [ijaLogoUpload])

  useEffect(() => {
    const source = mascotUpload || defaultMascotImage
    let cancelled = false

    stripEdgeBackground(source).then((processed) => {
      if (!cancelled) {
        setMascotProcessedSrc(processed)
      }
    })

    return () => {
      cancelled = true
    }
  }, [mascotUpload, defaultMascotImage])

  useEffect(() => {
    if (defaultCoachCsvLoaded || gradingListRecords.length > 0) return

    let cancelled = false

    const loadDefaultCoachCsv = async () => {
      try {
        const response = await fetch(DEFAULT_COACH_CSV)
        if (!response.ok) return

        const text = await response.text()
        const records = parseGradingListText(text, DEFAULT_COACH_CSV)
        if (cancelled || records.length === 0) return

        setGradingListRecords(records)
        setSelectedGradingRecordId(records[0].id)
        setGradingListMessage(`Loaded ${records.length} records from default coach list.`)
        setDefaultCoachCsvLoaded(true)
      } catch {
        // Manual upload remains available if default file is unavailable.
      }
    }

    loadDefaultCoachCsv()

    return () => {
      cancelled = true
    }
  }, [defaultCoachCsvLoaded, gradingListRecords.length])

  useEffect(() => {
    setCoachSelection({})
  }, [coachGroupFilter])

  // Capture the current certificate DOM nodes to canvas data before any state changes.
  const captureCertCanvases = async () => {
    if (!certificateRef.current) return null

    await waitForElementImages(certificateRef.current)

    const certRect = certificateRef.current.getBoundingClientRect()
    const beltElement = certificateRef.current.querySelector('.belt-image')
    let beltOverlayRect = null
    let previousBeltVisibility = ''

    if (beltElement && certRect.width > 0 && certRect.height > 0) {
      const beltRect = beltElement.getBoundingClientRect()
      const beltSrc = beltElement.currentSrc || beltElement.getAttribute('src') || ''

      if (beltSrc && beltRect.width > 0 && beltRect.height > 0) {
        beltOverlayRect = {
          src: beltSrc,
          x: (beltRect.left - certRect.left) / certRect.width,
          y: (beltRect.top - certRect.top) / certRect.height,
          width: beltRect.width / certRect.width,
          height: beltRect.height / certRect.height
        }

        // Hide DOM belt before html2canvas capture to prevent double rendering blur.
        previousBeltVisibility = beltElement.style.visibility
        beltElement.style.visibility = 'hidden'
      }
    }

    let coverCanvas
    try {
      coverCanvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        imageTimeout: 0,
        backgroundColor: '#f4f5f4'
      })
    } finally {
      if (beltElement) {
        beltElement.style.visibility = previousBeltVisibility
      }
    }

    let reportCanvas = null
    let reportLogoOverlayRect = null
    let previousReportLogoVisibility = ''
    if (certificateReportRef.current) {
      const reportRect = certificateReportRef.current.getBoundingClientRect()
      const reportLogoElement = certificateReportRef.current.querySelector('.report-ija-logo')

      if (reportLogoElement && reportRect.width > 0 && reportRect.height > 0) {
        const reportLogoRect = reportLogoElement.getBoundingClientRect()
        const reportLogoSrc = reportLogoElement.currentSrc || reportLogoElement.getAttribute('src') || ''

        if (reportLogoSrc && reportLogoRect.width > 0 && reportLogoRect.height > 0) {
          reportLogoOverlayRect = {
            src: reportLogoSrc,
            x: (reportLogoRect.left - reportRect.left) / reportRect.width,
            y: (reportLogoRect.top - reportRect.top) / reportRect.height,
            width: reportLogoRect.width / reportRect.width,
            height: reportLogoRect.height / reportRect.height
          }

          // Hide DOM logo before html2canvas to avoid distorted raster output.
          previousReportLogoVisibility = reportLogoElement.style.visibility
          reportLogoElement.style.visibility = 'hidden'
        }
      }

      await waitForElementImages(certificateReportRef.current)
      try {
        reportCanvas = await html2canvas(certificateReportRef.current, {
          scale: 2,
          useCORS: true,
          imageTimeout: 0,
          backgroundColor: '#f4f5f4'
        })
      } finally {
        if (reportLogoElement) {
          reportLogoElement.style.visibility = previousReportLogoVisibility
        }
      }
    }

    return { coverCanvas, beltOverlayRect, reportCanvas, reportLogoOverlayRect }
  }

  const addCertPagesToPdf = async (pdfDoc) => {
    const captured = await captureCertCanvases()
    if (!captured) return
    await addCapturedPagesToPdf(pdfDoc, captured)
  }

  const addCapturedPagesToPdf = async (pdfDoc, { coverCanvas, beltOverlayRect, reportCanvas, reportLogoOverlayRect }) => {
    const coverPage = pdfDoc.addPage([841.89, 595.28])
    const coverImage = await pdfDoc.embedPng(dataUrlToUint8Array(coverCanvas.toDataURL('image/png')))
    const coverDims = coverImage.scale(1)
    const coverScale = Math.min(coverPage.getWidth() / coverDims.width, coverPage.getHeight() / coverDims.height)
    const coverWidth = coverDims.width * coverScale
    const coverHeight = coverDims.height * coverScale
    coverPage.drawImage(coverImage, {
      x: (coverPage.getWidth() - coverWidth) / 2,
      y: (coverPage.getHeight() - coverHeight) / 2,
      width: coverWidth,
      height: coverHeight
    })

    if (beltOverlayRect) {
      try {
        const beltPngDataUrl = await rasterizeImageToPngDataUrl(beltOverlayRect.src, 3)
        const beltPng = await pdfDoc.embedPng(dataUrlToUint8Array(beltPngDataUrl))
        const coverX = (coverPage.getWidth() - coverWidth) / 2
        const coverY = (coverPage.getHeight() - coverHeight) / 2

        coverPage.drawImage(beltPng, {
          x: coverX + (beltOverlayRect.x * coverWidth),
          y: coverY + ((1 - beltOverlayRect.y - beltOverlayRect.height) * coverHeight),
          width: beltOverlayRect.width * coverWidth,
          height: beltOverlayRect.height * coverHeight
        })
      } catch {
        // If belt overlay fails, keep original captured cover page.
      }
    }

    if (reportCanvas) {
      const reportPage = pdfDoc.addPage([841.89, 595.28])
      const reportImage = await pdfDoc.embedPng(dataUrlToUint8Array(reportCanvas.toDataURL('image/png')))
      const reportDims = reportImage.scale(1)
      const reportScale = Math.min(reportPage.getWidth() / reportDims.width, reportPage.getHeight() / reportDims.height)
      const reportWidth = reportDims.width * reportScale
      const reportHeight = reportDims.height * reportScale
      reportPage.drawImage(reportImage, {
        x: (reportPage.getWidth() - reportWidth) / 2,
        y: (reportPage.getHeight() - reportHeight) / 2,
        width: reportWidth,
        height: reportHeight
      })

      if (reportLogoOverlayRect) {
        try {
          const reportLogoImage = await embedPdfImageFromSource(pdfDoc, reportLogoOverlayRect.src)
          if (reportLogoImage) {
            const reportX = (reportPage.getWidth() - reportWidth) / 2
            const reportY = (reportPage.getHeight() - reportHeight) / 2
            const boxWidth = reportLogoOverlayRect.width * reportWidth
            const boxHeight = reportLogoOverlayRect.height * reportHeight
            const boxX = reportX + (reportLogoOverlayRect.x * reportWidth)
            const boxY = reportY + ((1 - reportLogoOverlayRect.y - reportLogoOverlayRect.height) * reportHeight)

            const logoDims = reportLogoImage.scale(1)
            const logoScale = Math.min(boxWidth / logoDims.width, boxHeight / logoDims.height)
            const logoWidth = logoDims.width * logoScale
            const logoHeight = logoDims.height * logoScale

            reportPage.drawImage(reportLogoImage, {
              x: boxX + ((boxWidth - logoWidth) / 2),
              y: boxY + ((boxHeight - logoHeight) / 2),
              width: logoWidth,
              height: logoHeight
            })
          }
        } catch {
          // If logo overlay fails, keep captured report page.
        }
      }
    }
  }

  const downloadCertificate = async () => {
    const captured = await captureCertCanvases()
    if (!captured) return

    const out = await PDFDocument.create()
    await addCapturedPagesToPdf(out, captured)

    const bytes = await out.save()
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    const safeName = (playerData.name || 'student').toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
    anchor.download = `cabra-certificate-${safeName}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!batchCertExport) return

    const { records, index, pdfDoc } = batchCertExport

    if (index >= records.length) {
      pdfDoc.save().then((bytes) => {
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = 'cabra-certificates-all.pdf'
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(url)
      })
      setBatchCertExport(null)
      return
    }

    addCertPagesToPdf(pdfDoc).then(() => {
      const nextIndex = index + 1
      if (nextIndex < records.length) {
        const nextRecord = records[nextIndex]
        setSelectedGradingRecordId(nextRecord.id)
        setPlayerData((prev) => ({
          ...prev,
          name: nextRecord.name || prev.name,
          licenseNumber: nextRecord.ijaNumber || prev.licenseNumber,
          lastCoachingDate: nextRecord.lastGradingDate || prev.lastCoachingDate
        }))
        const nextTargetGradeId = getTargetGradeIdForRecord(nextRecord)
        if (nextTargetGradeId) setSelectedGradeId(nextTargetGradeId)
      }
      setBatchCertExport({ records, index: nextIndex, pdfDoc })
    })
  }, [batchCertExport])

  const downloadAllCertificates = async () => {
    const passedRecords = gradingSessionExportRecords.filter(
      (record) => gradingResults[`record:${record.id}`] === 'Pass'
    )
    if (passedRecords.length === 0) return

    const pdfDoc = await PDFDocument.create()
    const firstRecord = passedRecords[0]
    setViewMode('grading')
    setSelectedGradingRecordId(firstRecord.id)
    setPlayerData((prev) => ({
      ...prev,
      name: firstRecord.name || prev.name,
      licenseNumber: firstRecord.ijaNumber || prev.licenseNumber,
      lastCoachingDate: firstRecord.lastGradingDate || prev.lastCoachingDate
    }))
    const firstTargetGradeId = getTargetGradeIdForRecord(firstRecord)
    if (firstTargetGradeId) setSelectedGradeId(firstTargetGradeId)
    setBatchCertExport({ records: passedRecords, index: 0, pdfDoc })
  }

  const resetAll = () => {
    setPlayerData({
      name: 'Jane Bloggs',
      licenseNumber: '',
      lastCoachingDate: DEFAULT_LAST_GRADING_DATE,
      club: 'Cabra Judo Club',
      coach: DEFAULT_COACH_LABEL,
      gradingOfficerLicense: DEFAULT_COACH_DETAILS.licenseNumber,
      gradingDate: getTodayDateString()
    })
    setCompletedItems({})
    setSelectedGradeId('1s')
    setClubLogoUpload('')
    setIjaLogoUpload('')
    setCoachPhotoUpload(DEFAULT_COACH_PHOTO)
    setBeltImageUpload('')
    setMascotUpload('')
    setSelectedGradingRecordId('')
    setGradingListRecords([])
    setGradingListMessage('')
    setCoachSelection({})
    setGradingSessionRecordIds([])
    setGradingResults({})
    setCoachGroupFilter('junior')
    setViewMode('coach')
  }

  const setCurrentGradingResult = (result) => {
    const nextResult = activeGradingResult === result ? '' : result

    setGradingResults((prev) => ({
      ...prev,
      [activeGradingResultKey]: nextResult
    }))

    if (nextResult) {
      if (isFinalSessionRecord) {
        setPlayerData((prev) => ({
          ...prev,
          lastCoachingDate: getTodayDateString()
        }))
        setViewMode('coach')
      } else {
        moveGradingRecord('next')
      }
    }
  }

  const markAllChecklistItemsComplete = () => {
    const labels = gradingChecklistItems.map((item) => item.id).filter(Boolean)
    if (!labels.length) return

    setCompletedItems((prev) => ({
      ...prev,
      [selectedGradeId]: labels.reduce((acc, itemId) => {
        acc[itemId] = true
        return acc
      }, { ...(prev[selectedGradeId] || {}) })
    }))
  }

  const handlePassAndDownload = async () => {
    // Capture DOM before any state changes so the cert reflects the current candidate.
    const captured = await captureCertCanvases()

    markAllChecklistItemsComplete()

    setGradingResults((prev) => ({
      ...prev,
      [activeGradingResultKey]: 'Pass'
    }))

    if (isFinalSessionRecord) {
      setPlayerData((prev) => ({
        ...prev,
        lastCoachingDate: getTodayDateString()
      }))
      setViewMode('coach')
    } else {
      moveGradingRecord('next')
    }

    // Build and download PDF in the background after advancing.
    if (captured) {
      const safeName = (playerData.name || 'student').toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
      PDFDocument.create().then(async (out) => {
        await addCapturedPagesToPdf(out, captured)
        const bytes = await out.save()
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `cabra-certificate-${safeName}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(url)
      })
    }
  }

  const beltFallbackStyle = {
    background:
      activeGrade?.beltColors?.length > 1
        ? `linear-gradient(90deg, ${activeGrade.beltColors[0]} 0%, ${activeGrade.beltColors[0]} 50%, ${activeGrade.beltColors[1]} 50%, ${activeGrade.beltColors[1]} 100%)`
        : activeGrade?.beltColors?.[0] || '#f8fafc'
  }

  const ijaLogoDisplaySrc = ijaLogoProcessedSrc || ijaLogoUpload || IJA_LOGO
  const ijaLogoFallbackSrc = ijaLogoUpload || IJA_LOGO

  const handleIjaLogoError = (event) => {
    const img = event.currentTarget
    if (!img.dataset.ijaFallbackApplied && ijaLogoFallbackSrc) {
      img.dataset.ijaFallbackApplied = 'true'
      img.src = ijaLogoFallbackSrc
      return
    }

    img.style.display = 'none'
  }

  const reportTheme = useMemo(() => {
    const colors = activeGrade?.beltColors?.length ? activeGrade.beltColors : ['#dc2626']
    const primary = colors[0]
    const secondary = colors[1] || primary
    const titleBackground = colors.length > 1
      ? `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`
      : primary
    const barBackground = colors.length > 1
      ? `linear-gradient(90deg, ${primary} 0%, ${primary} 48%, ${secondary} 52%, ${secondary} 100%)`
      : primary

    const titleColor = getReadableTextColor(primary)
    const columnsColor = getReadableTextColor(secondary)
    const barTextColor = getReadableTextColor(primary)
    const borderColor = secondary
    const borderSoft = `${borderColor}99`

    return {
      titleBackground,
      titleColor,
      columnsBackground: secondary,
      columnsColor,
      barBackground,
      barTextColor,
      barHeadingColor: barTextColor,
      borderColor,
      borderSoft,
      pageAccent: primary
    }
  }, [activeGrade])

  const currentBeltSrc = beltImageUpload || ''

  useEffect(() => {
    setBeltImageError(false)
  }, [currentBeltSrc, selectedGradeId])

  const moveGrade = (direction) => {
    setSelectedGradeId((currentId) => {
      const currentIndex = gradingOrder.indexOf(currentId)
      if (currentIndex === -1) return currentId

      const nextIndex = direction === 'next'
        ? Math.min(currentIndex + 1, gradingOrder.length - 1)
        : Math.max(currentIndex - 1, 0)

      return gradingOrder[nextIndex]
    })
  }

  const onBeltPreviewClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickedRightSide = event.clientX > rect.left + rect.width / 2
    moveGrade(clickedRightSide ? 'next' : 'prev')
  }

  const isRequirementChecked = (label) => activeGradingResult === 'Pass' || Boolean(completedItems[selectedGradeId]?.[label])

  const renderExamText = (item) => {
    const label = getExamItemLabel(item)
    const description = typeof item === 'string' ? '' : (item.description || '')
    const href = typeof item === 'string' ? '' : (item.href || '')

    const text = (
      <>
        <span>{label}</span>
        {description ? <small>{description}</small> : null}
      </>
    )

    if (!href) return text

    const handleLinkClick = (e) => {
      e.stopPropagation()
    }

    return (
      <a href={href} onClick={handleLinkClick}>
        {text}
      </a>
    )
  }

  const renderCertificate = (inlinePreview = false) => (
    <div className="certificate-pages" id="certificate-container">
      <div
        className={`certificate ${inlinePreview ? 'inline-preview-surface' : ''}`}
        ref={certificateRef}
      >
        <div className="frame top-horizontal" />
        <div className="frame top-vertical" />
        <div className="frame bottom-horizontal" />
        <div className="frame bottom-vertical" />

        <div className="cert-header">
          <div className="club-logo-wrap">
            <img
              src={clubLogoProcessedSrc || clubLogoUpload || CLUB_LOGO}
              alt="Cabra Logo"
              className="club-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>

        <div className="cert-main">
          <h2>CONGRATULATIONS</h2>
          <p className="student-name">{playerData.name || 'Judoka Name'}</p>
          <p className="grade-line">ON SUCCESSFULLY GRADING TO {activeGrade?.name?.toUpperCase() || 'GRADE'}</p>

          <div className="belt-artwork">
            {currentBeltSrc && !beltImageError ? (
              <img
                src={currentBeltSrc}
                alt="Graded Belt"
                className="belt-image"
                onError={() => {
                  setBeltImageError(true)
                }}
              />
            ) : null}
            <div className={`belt-fallback ${!currentBeltSrc || beltImageError ? 'visible' : ''}`} style={beltFallbackStyle}>
              <span />
            </div>
          </div>
        </div>

        <div className="cert-footer">
          <div className="ija-logo-wrap">
            <img
              src={ijaLogoDisplaySrc}
              alt="IJA Logo"
              className="ija-logo"
              onError={handleIjaLogoError}
            />
          </div>

          <div className="signature-area">
            <div className="signature-block">
              <span className="signature-script">{playerData.coach}</span>
              <div className="sig-line" />
              <span className="sig-label">Coach</span>
            </div>

            <div className="signature-block">
              <span className="signature-script">{playerData.gradingDate}</span>
              <div className="sig-line" />
              <span className="sig-label">Date</span>
            </div>
          </div>

          <div className="mascot-wrap">
            <img
              src={mascotProcessedSrc || mascotUpload || defaultMascotImage}
              alt="Mascot"
              className="mascot-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <div className="mascot">🐵</div>
          </div>
        </div>
      </div>

      <div
        className={`certificate report-page ${inlinePreview ? 'inline-preview-surface' : ''} ${reportDensityClassName}`.trim()}
        ref={certificateReportRef}
        style={{
          borderTop: `4px solid ${reportTheme.pageAccent}`
        }}
      >
        <div className="report-header">
          <div>
            <h3>Irish Judo - Grading Forms</h3>
            <p className="report-subtitle">Player Details</p>
          </div>
          <img
            src={ijaLogoDisplaySrc}
            alt="IJA Logo"
            className="report-ija-logo"
            onError={handleIjaLogoError}
          />
        </div>

        <div className="report-player-details" style={{ borderBottomColor: reportTheme.borderColor }}>
          <p><strong>Name:</strong> {playerData.name || ''}</p>
          <p><strong>License Number:</strong> {playerData.licenseNumber || ''}</p>
          <p><strong>Time in Grade:</strong> {timeInGradeDisplay}</p>
          <p><strong>Result of Grading:</strong> {activeGradingResult}</p>
        </div>

        <div className="report-grade-title" style={{ background: reportTheme.titleBackground, color: reportTheme.titleColor }}>
          {activeGrade?.name || 'Grading Report'}
        </div>
        <div className="report-columns-head" style={{ background: reportTheme.columnsBackground, color: reportTheme.columnsColor }}>
          <span>Ukemi:</span>
          <span>Tachiwaza</span>
          <span>Newaza</span>
          <span>Performance skills:</span>
          <span>General behaviour:</span>
          <span>Terminology:</span>
        </div>

        {activeReportRow ? (
          <div key={activeReportRow.gradeId} className="report-row" style={{ borderLeftColor: reportTheme.borderSoft, borderRightColor: reportTheme.borderSoft, borderBottomColor: reportTheme.borderSoft }}>
            <h4>{activeReportRow.gradeName}</h4>
            <div className="report-grid">
              <div className="report-column">
                {activeReportRow.ukemi.map((item) => (
                  <label key={getExamItemId('Ukemi', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('Ukemi', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('Ukemi', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
              <div className="report-column">
                {activeReportRow.tachiwaza.map((item) => (
                  <label key={getExamItemId('Tachiwaza', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('Tachiwaza', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('Tachiwaza', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
              <div className="report-column">
                {activeReportRow.newaza.map((item) => (
                  <label key={getExamItemId('Newaza', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('Newaza', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('Newaza', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
              <div className="report-column">
                {activeReportRow.performanceSkills.map((item) => (
                  <label key={getExamItemId('Performance skills', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('Performance skills', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('Performance skills', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
              <div className="report-column">
                {activeReportRow.generalBehaviour.map((item) => (
                  <label key={getExamItemId('General behaviour', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('General behaviour', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('General behaviour', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
              <div className="report-column">
                {activeReportRow.terminology.map((item) => (
                  <label key={getExamItemId('Terminology', item)} className="report-check-item">
                    <span className={`report-box ${isRequirementChecked(getExamItemId('Terminology', item)) ? 'checked' : ''}`}>
                      {isRequirementChecked(getExamItemId('Terminology', item)) ? 'x' : ''}
                    </span>
                    <span>{renderExamText(item)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeReportRow?.additionalLearning?.length ? (
          <div className="report-additional-learning" style={{ borderColor: reportTheme.borderSoft }}>
            <strong style={{ color: reportTheme.barHeadingColor }}>Additional Learning</strong>
            <div className="report-additional-learning-grid">
              {activeReportRow.additionalLearning.map((item) => (
                <label key={getExamItemId('Additional learning', item)} className="report-check-item report-single-line" style={{ color: reportTheme.barTextColor }}>
                  <span className={`report-box ${isRequirementChecked(getExamItemId('Additional learning', item)) ? 'checked' : ''}`}>
                    {isRequirementChecked(getExamItemId('Additional learning', item)) ? 'x' : ''}
                  </span>
                  <span>{renderExamText(item)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="report-bottom-bar" style={{ background: reportTheme.barBackground, color: reportTheme.barTextColor, borderColor: reportTheme.borderSoft }}>
          <div>
            <strong style={{ color: reportTheme.barHeadingColor }}>Free practice:</strong>
            <label className="report-check-item report-single-line" style={{ color: reportTheme.barTextColor }}>
              <span className={`report-box ${isRequirementChecked(getExamItemId('Free practice', reportFreePractice)) ? 'checked' : ''}`}>
                {isRequirementChecked(getExamItemId('Free practice', reportFreePractice)) ? 'x' : ''}
              </span>
              <span>{reportFreePractice}</span>
            </label>
          </div>
          <div>
            <strong style={{ color: reportTheme.barHeadingColor }}>Fundamental skills:</strong>
            <label className="report-check-item report-single-line" style={{ color: reportTheme.barTextColor }}>
              <span className={`report-box ${isRequirementChecked(getExamItemId('Fundamental skills', reportFundamentalSkills)) ? 'checked' : ''}`}>
                {isRequirementChecked(getExamItemId('Fundamental skills', reportFundamentalSkills)) ? 'x' : ''}
              </span>
              <span>{reportFundamentalSkills}</span>
            </label>
          </div>
        </div>

        <div className="report-footer" style={{ borderColor: reportTheme.borderSoft }}>
          <div>
            <strong>Grading Officer</strong>
            <p><strong>Name:</strong> {playerData.coach || ''}</p>
            <p><strong>License Number:</strong> {playerData.gradingOfficerLicense || ''}</p>
          </div>
          <div>
            <strong>Grading Details</strong>
            <p><strong>Date:</strong> {playerData.gradingDate || ''}</p>
            <p><strong>Club:</strong> {playerData.club || 'Cabra Judo Club'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCoachPage = () => (
    <div className="coach-layout print-hide">
      <section className="panel coach-setup">
        <div className="panel-title">
          <User size={16} /> Coach Setup
        </div>

        <label>Grading List (CSV/JSON)</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <input type="file" accept=".csv,.json,application/json,text/csv" onChange={onGradingListUpload} style={{ flex: 1 }} />
          <button
            type="button"
            className="btn btn-dark"
            onClick={downloadGradingList}
            title="Download current grading list for local editing"
            style={{ marginTop: '0px', whiteSpace: 'nowrap' }}
          >
            <Download size={16} /> Download
          </button>
        </div>
        {gradingListMessage ? <p className="upload-note">{gradingListMessage}</p> : null}

        <label>Club Logo (optional upload)</label>
        <input type="file" accept="image/*" onChange={(e) => onFileChange(e, setClubLogoUpload)} />

        <label>IJA Logo (optional upload)</label>
        <input type="file" accept="image/*" onChange={(e) => onFileChange(e, setIjaLogoUpload)} />

        <label>Coach Photo (optional upload)</label>
        <input type="file" accept="image/*" onChange={(e) => onFileChange(e, setCoachPhotoUpload)} />

        <div className="coach-logo-preview">
          <div className="coach-logo-item">
            <img src={clubLogoProcessedSrc || clubLogoUpload || CLUB_LOGO} alt="Cabra logo preview" />
            <span>Cabra Logo</span>
          </div>
          <div className="coach-logo-item">
            <img src={ijaLogoProcessedSrc || ijaLogoUpload || IJA_LOGO} alt="IJA logo preview" />
            <span>IJA Logo</span>
          </div>
        </div>

        <div className="coach-photo-preview">
          <img src={coachPhotoUpload || DEFAULT_COACH_PHOTO} alt="Coach preview" />
          <span>Coach Photo</span>
        </div>

        <label>Coach Name</label>
        <input
          type="text"
          value={playerData.coach}
          onChange={(e) => setPlayerData({ ...playerData, coach: e.target.value })}
        />

        <label>Coach License Number</label>
        <input
          type="text"
          placeholder="e.g. 19-0010"
          value={playerData.gradingOfficerLicense}
          onChange={(e) => setPlayerData({ ...playerData, gradingOfficerLicense: e.target.value })}
        />

        <label>Last Grading Date</label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          value={playerData.lastCoachingDate}
          onChange={(e) => setPlayerData({ ...playerData, lastCoachingDate: e.target.value })}
        />
      </section>

      <section className="panel coach-candidates">
        <div className="coach-candidates-head">
          <div className="panel-title">
            <CheckCircle2 size={16} /> Candidate Selection
          </div>
          <button
            type="button"
            className="btn btn-dark coach-select-all"
            onClick={selectAllCoachCandidates}
            disabled={coachCandidatesByGrade.length === 0}
          >
            {areAllCoachCandidatesSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {coachCandidatesByGrade.length === 0 ? (
          <p className="upload-note">
            {gradingListRecords.length === 0
              ? 'Upload a grading CSV to view candidates by grade.'
              : `No ${coachGroupFilter} candidates available in this list.`}
          </p>
        ) : (
          <div className="coach-grade-groups">
            {coachCandidatesByGrade.map((group) => (
              <div key={group.gradeId} className="coach-grade-group">
                <div className="coach-grade-head">
                  <h3>{group.gradeName}</h3>
                  <div className="coach-grade-path" aria-label="Grade path">
                    <div className="coach-path-segment">
                      <span>{getCompactGradeLabel(getPreviousGradeId(group.gradeId))}</span>
                      <div className="coach-belt-colors" aria-label="Current belt colors">
                        {(beltColorsById[getPreviousGradeId(group.gradeId)]?.length
                          ? beltColorsById[getPreviousGradeId(group.gradeId)]
                          : ['#f8fafc']).map((color, idx) => (
                          <span
                            key={`${group.gradeId}-from-${idx}`}
                            className="coach-belt-swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="coach-path-arrow">-&gt;</span>
                    <div className="coach-path-segment">
                      <span>{getCompactGradeLabel(group.gradeId)}</span>
                      <div className="coach-belt-colors" aria-label="Target belt colors">
                        {(beltColorsById[group.gradeId]?.length ? beltColorsById[group.gradeId] : ['#f8fafc']).map((color, idx) => (
                          <span
                            key={`${group.gradeId}-to-${idx}`}
                            className="coach-belt-swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {group.records.map((record) => (
                  <label key={record.id} className="coach-candidate-row">
                    <input
                      type="checkbox"
                      checked={Boolean(coachSelection[record.id])}
                      onChange={() => toggleCoachCandidate(record.id)}
                    />
                    <span>{record.name || `Record ${record.id}`}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="coach-candidates-controls">
          <div className="coach-group-toggle" role="group" aria-label="Candidate age group">
            <button
              type="button"
              className={`btn ${coachGroupFilter === 'junior' ? 'btn-primary' : 'btn-dark'}`}
              onClick={() => setCoachGroupFilter('junior')}
            >
              Junior ({coachGroupCounts.junior})
            </button>
            <button
              type="button"
              className={`btn ${coachGroupFilter === 'senior' ? 'btn-primary' : 'btn-dark'}`}
              onClick={() => setCoachGroupFilter('senior')}
            >
              Senior ({coachGroupCounts.senior})
            </button>
          </div>
        </div>

        <div className="coach-candidates-footer">
          <button className="btn btn-primary coach-start" onClick={startCoachGrading}>
            <Zap size={18} /> Start {coachGroupFilter === 'senior' ? 'Senior' : 'Junior'} Grading ({selectedCoachCount})
          </button>

          <div className="coach-export-actions" role="group" aria-label="Export grading session records">
            <button
              type="button"
              className="btn btn-dark"
              onClick={downloadSessionCsv}
              disabled={gradingSessionExportRecords.length === 0}
            >
              Export Session CSV
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={downloadSessionSummaryPdf}
              disabled={gradingSessionExportRecords.length === 0}
            >
              Export Session PDF
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={downloadAllCertificates}
              disabled={!gradingSessionExportRecords.some((r) => gradingResults[`record:${r.id}`] === 'Pass') || Boolean(batchCertExport)}
            >
              {batchCertExport
                ? `Exporting… (${batchCertExport.index}/${batchCertExport.records.length})`
                : 'Export All Certs'}
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={downloadGradingList}
            >
              <Download size={16} /> Grading List
            </button>
          </div>
        </div>
      </section>
    </div>
  )

  return (
    <div className="page">
      <header className="topbar print-hide">
        <div className="brand">
          <img
            src={clubLogoProcessedSrc || clubLogoUpload || CLUB_LOGO}
            alt="Cabra Logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <h1>Cabra Judo Club</h1>
            <p>IJA Club Grading Platform</p>
          </div>
        </div>

        <div className="top-actions">
          <a
            className="btn topbar-study-link topbar-study-link-mon"
            href={publicAsset('/study-guide.html')}
          >
            Mon Study Guide
          </a>
          <a
            className="btn topbar-study-link topbar-study-link-kyu"
            href={publicAsset('/kyu-study-guide.html')}
          >
            Kyu Study Guide
          </a>
        </div>

      </header>

      <main className="main-wrap">
        {viewMode === 'coach' ? renderCoachPage() : null}
        {viewMode === 'grading' ? (
          <div className="grading-layout print-hide">
            <aside className="left-col">
              <section className="panel">
                <div className="panel-title">
                  <Zap size={16} /> Grade Selection
                </div>
                <div className="field select-wrap">
                  <select value={selectedGradeId} onChange={(e) => setSelectedGradeId(e.target.value)}>
                    {isSeniorGrading ? (
                      <optgroup label="Senior Kyu (14+)">
                        {SENIOR_SYLLABUS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      <>
                        <optgroup label="Shamrock (Under 8s)">
                          {SYLLABUS.shamrock.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Mon (Under 14s)">
                          {SYLLABUS.mon.filter((g) => Number.parseInt(g.id, 10) >= 2).map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                  <ChevronDown size={18} className="chev" />
                </div>
                <div
                  className="belt-preview-wrap"
                  onClick={onBeltPreviewClick}
                  role="button"
                  tabIndex={0}
                  aria-label={`Current belt preview for ${activeGrade?.name || 'selected grade'}. Click left or right side to change grade.`}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault()
                      moveGrade('prev')
                    }
                    if (event.key === 'ArrowRight') {
                      event.preventDefault()
                      moveGrade('next')
                    }
                  }}
                >
                  <button
                    type="button"
                    className="belt-nav belt-nav-left"
                    onClick={(event) => {
                      event.stopPropagation()
                      moveGrade('prev')
                    }}
                    aria-label="Previous grade"
                    title="Previous grade"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {currentBeltSrc && !beltImageError ? (
                    <img
                      src={currentBeltSrc}
                      alt={`${activeGrade?.belt || activeGrade?.name || 'Selected'} belt preview`}
                      className="belt-preview"
                      onError={() => {
                        setBeltImageError(true)
                      }}
                    />
                  ) : null}
                  <div className={`belt-preview-fallback ${!currentBeltSrc || beltImageError ? 'visible' : ''}`} style={beltFallbackStyle} />
                  <button
                    type="button"
                    className="belt-nav belt-nav-right"
                    onClick={(event) => {
                      event.stopPropagation()
                      moveGrade('next')
                    }}
                    aria-label="Next grade"
                    title="Next grade"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <User size={16} /> Judoka Information
                </div>

                {gradingListRecords.length > 0 ? (
                  <>
                    <label>Select Student From List</label>
                    <div className="student-select-nav" role="group" aria-label="Student selection navigation">
                      <button
                        type="button"
                        className="student-select-step student-select-step-prev"
                        onClick={() => moveGradingRecord('prev')}
                        aria-label="Previous student"
                        title="Previous student"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <select value={selectedGradingRecordId} onChange={onGradingRecordChange}>
                        {gradingRecordsForSession.map((record) => (
                          <option key={record.id} value={record.id}>
                            {record.name || `Record ${record.id}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="student-select-step student-select-step-next"
                        onClick={() => moveGradingRecord('next')}
                        aria-label="Next student"
                        title="Next student"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                ) : null}

                <div className="grid-2">
                  <div>
                    <label>IJA License</label>
                    <input
                      type="text"
                      placeholder="IJA-XXXX"
                      value={playerData.licenseNumber}
                      onChange={(e) => setPlayerData({ ...playerData, licenseNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Last Grading Date</label>
                    <input
                      type="text"
                      placeholder="From coach setup"
                      value={playerData.lastCoachingDate}
                      onChange={(e) => setPlayerData({ ...playerData, lastCoachingDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label>Grading Date</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={playerData.gradingDate}
                      onChange={(e) => setPlayerData({ ...playerData, gradingDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Months in Grade</label>
                    <input
                      type="text"
                      value={hasEffectiveMonthsInGrade ? String(effectiveMonthsInGrade) : ''}
                      placeholder="Auto-calculated"
                      readOnly
                    />
                    <p className={`months-hint ${isMonthsInGradeSufficient ? 'ok' : 'warn'}`}>
                      Minimum for {activeGrade?.name || 'this grade'}: {requiredMonthsInGrade} month{requiredMonthsInGrade === 1 ? '' : 's'}.
                      {hasEffectiveMonthsInGrade
                        ? ` Calculated: ${effectiveMonthsInGrade} month${effectiveMonthsInGrade === 1 ? '' : 's'} from Grading Date - Last Grading Date.`
                        : ' Provide valid Last Grading Date and Grading Date to calculate months.'}
                      {isMonthsInGradeSufficient ? ' Sufficient.' : ' Not sufficient yet.'}
                    </p>
                  </div>
                </div>

              </section>

              <button type="button" className="btn btn-dark coach-start coach-page-nav" onClick={() => setViewMode('coach')}>
                <User size={18} /> Coach Page
              </button>

            </aside>

            <section className="right-col">
              <div className="panel progress-panel">
                <div>
                  <span className="sub">Technical Requirement</span>
                  <h3>{activeGrade?.name} Syllabus</h3>
                </div>
                <span className="progress-num">{progress}%</span>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="checklist-grid">
                {groupedChecklistSections.map((section) => (
                  <section key={section.category} className="checklist-section">
                    <h4>{section.category}</h4>
                    <div className="checklist-items">
                      {section.items.map((item, idx) => {
                        const checked = Boolean(completedItems[selectedGradeId]?.[item.id])
                        return (
                          <button key={`${section.category}-${idx}`} onClick={() => toggleItem(item.id)} className={`check-card ${checked ? 'done' : ''}`}>
                            <div className="icon-wrap">
                              {checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>
                            <div>
                              <p>{item.label}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="grading-result-panel">
                <label>Grading Result</label>
                <div className="result-toggle" role="group" aria-label="Set grading result">
                  <button
                    type="button"
                    className={`btn result-btn result-pass ${activeGradingResult === 'Pass' ? 'selected' : 'unselected'}`}
                    onClick={handlePassAndDownload}
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    className={`btn result-btn result-fail ${activeGradingResult === 'Fail' ? 'selected' : 'unselected'}`}
                    onClick={() => setCurrentGradingResult('Fail')}
                  >
                    Fail
                  </button>
                </div>
              </div>

              <div className="grading-certificate-preview">
                {renderCertificate(true)}
              </div>
            </section>
          </div>
        ) : null}
        {viewMode === 'certificate' ? (
          renderCertificate(false)
        ) : null}
      </main>
    </div>
  )
}

export default App
