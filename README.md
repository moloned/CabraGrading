# Cabra Grading

Last updated: May 16, 2026

Cabra Grading is a React + Vite grading platform for Cabra Judo Club.

It supports:
Last updated: June 8, 2026
- Coach setup and candidate selection
- Junior and senior grading paths
- Live syllabus loaded from Google Sheets
- XLSX-powered study guide page with EfficientJudo links for each syllabus item
- Separate Adult Kyu study guide sourced from IJA Grading Syllabus PDF (5th Kyu to 1st Kyu)
- Mon study guide page with Kodokan / Kodomo no Kata video links and a Koka Kids PDF resource card
- Separate Adult Kyu study guide sourced from the IJA Grading Syllabus PDF (5th Kyu to 1st Kyu) with a PDF resource card
- Return links on both study guide pages back to the main Cabra Grading page
- Belt previews and belt colour swatches
- Certificate rendering and PDF download
- Session export: A4-landscape IJA summary PDF and CSV report
- CSV-based candidate import

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
## Data Inputs

The app loads candidates from `public/CabraMembers.csv` by default. A different CSV can be uploaded via the UI.

Expected CSV fields:
- First Name / Last Name (or combined Full Name)
The parser is tolerant to header naming variations and normalises keys.

## Grading Logic Overview

- Candidates under 14 are handled as junior candidates.
  - Senior candidates see Senior Kyu options (5th, 4th, 3rd Kyu).
- On recording a Pass or Fail the app auto-advances to the next candidate.
## Syllabus Source

Grading requirements (`TAB_EXAMS_BY_GRADE`) are loaded live from the IJA Grading Syllabus Google Sheet:

  https://docs.google.com/spreadsheets/d/1pVrK7CpIBa8_5oRoMuktUHwXUvgjJtea-ct8gHRzhAg

Each grade tab provides: ukemi, tachiwaza, newaza, performance skills, general behaviour, terminology, additional learning, and free practice requirements.

## Session Exports

Both exports are triggered from the coach page once candidates have been graded.

### CSV Report

Columns: No, Full Name, IJA Licence number, Current Grade Held, New Grade Awarded, Result, Coach, Date grading took place, Fee

- Saved with a UTF-8 BOM so the euro sign in the Fee column displays correctly in Excel.
### PDF Summary (A4 Landscape)

- IJA logo top-left, club logo top-right.
## Belt Mapping

Default belt images are in `public/belts` and are selected by grade for certificates and grading preview.

Coach-page swatches use belt colour arrays:
- Junior swatches are derived from the syllabus grade definitions.
## Certificate Mascot

Certificate mascot defaults are age-path aware:
- Junior certificates use JudoMonkey.
A custom mascot image uploaded in the UI overrides both defaults.

## Utility Scripts

### Remove Image Backgrounds

Script: `scripts/remove-bg.mjs`

Removes edge-connected background pixels from configured source images and writes transparent PNG outputs to `public/clean`.

## Project Structure

- src/App.jsx: Main grading app logic and UI
## How the App Works

### Workflow

1. **Coach Setup** — The coach enters their name, club, grading date, and uploads optional logo overrides. Candidates are loaded from `public/CabraMembers.csv` (or a custom CSV uploaded in the UI).

2. **Candidate Selection** — The coach page lists candidates grouped by target grade. The coach selects who is being graded in this session.

3. **Grading Page** — Each candidate is graded one at a time. The grader works through a checklist of requirements (ukemi, tachiwaza, newaza, performance skills, etc.) grouped into category sub-panels. Requirements are loaded live from the IJA Google Sheets syllabus.

4. **Pass / Fail** — Recording a result auto-advances to the next candidate. After the last candidate, the app returns to the coach page automatically.

5. **Certificate** — A Pass generates a downloadable certificate (rendered via html2canvas).

6. **Session Export** — From the coach page, the session can be exported as a CSV or an A4-landscape PDF.

### Frameworks & Libraries

| Library | Role |
|---|---|
| **React 18** | UI component model, state (useState, useMemo, useEffect, useRef) |
| **Vite** | Dev server and production bundler |
| **pdf-lib** | Generates the IJA session summary PDF entirely in-browser |
| **html2canvas** | Captures the certificate DOM node as a canvas for download |
| **lucide-react** | Icon set (CheckCircle2, ChevronLeft/Right, User, Zap, etc.) |
| **Google Sheets gviz API** | Fetches live syllabus data from the IJA spreadsheet as JSON (no auth required, public sheet) |

The app is entirely client-side — no backend server. All state is in React memory; nothing is persisted between page reloads.

## Deployment

This app can be deployed to GitHub Pages.

- Full instructions: see [DEPLOY.md](DEPLOY.md)

