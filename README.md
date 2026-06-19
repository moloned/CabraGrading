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

1. Install dependencies

   npm install

2. Run the app

   npm run dev

3. Build production assets

   npm run build

4. Preview production build

   npm run preview

## Available Scripts

- npm run dev: Start Vite development server
- npm run build: Build production assets
- npm run preview: Preview production build locally

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

