# Cabra Grading

Last updated: June 18, 2026

Cabra Grading is a React + Vite grading platform for Cabra Judo Club.

## Features

- Coach setup and candidate selection workflow
- Junior and senior grading paths
- CSV candidate import with tolerant header parsing
- State reset on new CSV upload to avoid carrying over prior session data
- Checklist-based grading with category grouping
- Pass/Fail auto-advance to the next candidate
- Certificate preview and PDF generation
- Batch certificate export: all passing candidates into one PDF
- Session export as CSV and A4-landscape PDF summary
- Mon study guide page with Kodokan / Kodomo no Kata references
- Adult Kyu study guide page sourced from IJA syllabus data

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/moloned/CabraGrading.git
cd CabraGrading

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open at **http://localhost:5173/CabraGrading/**.

### Build & Preview

```bash
npm run build      # Build production assets
npm run preview    # Preview the production build locally
```

## Usage — Coach Setup

When the app starts you land on the **Coach Setup** page. This is where you configure your session before grading begins.

### 1. Upload a Grading List

- Click **Grading List (CSV/JSON)** and select your file.
- The default list ships as `public/GradingList.csv`. You can download the current list with the **Download** button, edit it in a spreadsheet, and re-upload it.
- The CSV parser is tolerant of common header variants for names, licence numbers, grades, dates, and coach-related fields.

### 2. Upload Club & IJA Logos (optional)

- **Club Logo** — Click the *Club Logo (optional upload)* file picker and choose your club crest or badge image (PNG/JPG). If no file is uploaded the default `public/CabraLogo.png` is used.
- **IJA Logo** — Click the *IJA Logo (optional upload)* file picker to replace the default IJA crest (`public/clean/IJA-logo-nobg.png`).
- Both logos appear on certificates and the session summary PDF.

### 3. Upload a Coach Photo (optional)

- Click **Coach Photo (optional upload)** and choose a headshot. If nothing is uploaded the default photo (`public/alonzo.jpg`) is used.
- A preview thumbnail is shown below the upload field.

### 4. Enter Coach Details

| Field | Description |
|---|---|
| **Coach Name** | Full name of the grading officer (appears on certificates and report) |
| **Coach License Number** | IJA licence number, e.g. `19-0010` |
| **Last Grading Date** | Date in `DD/MM/YYYY` format |

### 5. Customising Default Assets

To permanently replace the shipped defaults, swap the files in the `public/` folder:

| Default file | Purpose |
|---|---|
| `public/CabraLogo.png` | Club logo |
| `public/IJA-logo.png` | IJA logo (raw; a background-removed version is auto-generated in `public/clean/`) |
| `public/alonzo.jpg` | Default coach photo |
| `public/GradingList.csv` | Default grading list loaded on startup |

After changing any of these files, restart the dev server or rebuild for the changes to take effect.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview production build locally |

## Data Inputs

Default candidate source: public/CabraMembers.csv

A different CSV can be uploaded in the UI. The parser accepts common header variants for names, licence numbers, grades, dates, and coach-related fields.

## Grading Behavior

- Candidates under 14 are handled as juniors.
- Senior candidates are graded on 5th Kyu, 4th Kyu, and 3rd Kyu pathways.
- Pressing Pass or Fail immediately advances to the next candidate.
- On Pass, the certificate is captured before navigation so the exported PDF always reflects the correct candidate.

## Syllabus Sources

- Junior / Mon grading requirements are defined in TAB_EXAMS_BY_GRADE.
- Senior Kyu (5k/4k/3k) grading requirements are populated from src/data/adultKyuStudyGuideData.json.
- The report page includes adaptive compact/dense typography so high-detail grades fit correctly in preview and exported PDFs.

## Exports

### Certificate PDF

- Individual certificate PDF export from the grading page
- Batch certificate export (all passing candidates) as a single PDF
- IJA logo rendering is hardened for PDF output (fallback handling + direct overlay on report page capture)

### Session CSV

Columns include candidate identity, current/awarded grade, result, and fee.

### Session PDF (A4 Landscape)

Coach-page summary report with session rows and logos.

## Belt Mapping

Belt styles are dynamically rendered via CSS based on the `beltColors` array configured for each grade. This fallback ensures accurate rendering of solid and split belt colors directly on the screen and within generated certificates, replacing the need for static belt images.

## Utility Scripts

### Remove Image Backgrounds

Script: scripts/remove-bg.mjs

Removes edge-connected background pixels from configured source images and writes transparent PNGs to public/clean.

## Core Files

- src/App.jsx: Main grading app logic and UI
- src/App.css: Styling for grading, certificate, and report layouts
- src/data/adultKyuStudyGuideData.json: Senior Kyu syllabus source data
- scripts/generate-adult-kyu-study-guide-data.mjs: Adult Kyu data generation script

## Tech Stack

| Library | Role |
|---|---|
| React 18 | UI component model and state |
| Vite | Dev server and bundler |
| pdf-lib | In-browser PDF creation |
| html2canvas | DOM-to-canvas capture for certificate/report rendering |
| lucide-react | UI icon set |

## Deployment

- Deployment notes: DEPLOY.md
- Typical target: GitHub Pages

