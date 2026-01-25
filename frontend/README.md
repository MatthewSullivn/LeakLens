# LeakLens Frontend

Next.js 15 + React 19 + TypeScript UI for [LeakLens](https://github.com/MatthewSullivn/LeakLens). Landing page + wallet analysis view.

## Project Description

You enter a Solana address; the app hits the analyze API and renders surveillance score, temporal fingerprint, bot detection, opsec failures, ego network, mempool forensics, and financial context. Dark theme, Tailwind + Radix, responsive.

## Technical Overview

- App Router: `app/page.tsx` (landing), `app/analysis/[wallet]/page.tsx` (analysis).
- `app/api/analyze-wallet/route.ts` proxies POST to the Python backend (`http://127.0.0.1:8000/analyze-wallet` locally) or to Vercel’s Python serverless when deployed. Body: `{ wallet, limit }`.
- Components: `landing/` (hero, features, process), `analysis/` (overview, exposure, opsec, ego, etc.), `ui/` (button, card, badge, …). Navbar in `components/ui/resizable-navbar.tsx`.
- Styling: Tailwind, `globals.css`, PostCSS.

## Features

Landing has the hero, wallet input, feature highlights, and links to Source (GitHub) and Encrypt Trade. Analysis page is a dynamic route by wallet: fetch → loading/error states → exposure overview, why-trackable, ego network, opsec, mempool, financial context, implications. Export (PDF/JSON/CSV) is wired in the UI but still coming-soon. Mobile nav via LeakLensNavbar.

## How to Get Started

Backend has to be up first (see root README). Then:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` and run an analysis from the landing page.

## For developers

- Backend on port 8000. Start it with `python run_server.py` or `START_SERVER.bat` before `npm run dev`. Connection refused / 503 = backend not running.
- API route: `app/api/analyze-wallet/route.ts`. Local → `http://127.0.0.1:8000/analyze-wallet`; Vercel → Python serverless `api/analyze-wallet.py`. Body `{ wallet, limit? }`, 120s timeout.
- Types live in `components/analysis/types.ts`. Use them when adding new API-driven UI or debugging.
- `npm run build` runs a prebuild that copies `leaklens_solana.py` and `backend_api.py` from the repo root into `frontend/`. The Python serverless imports those. The copies are gitignored. Set `HELIUS_API_KEY` on Vercel.
- Connection refused → start backend. 504 / timeout → analysis took too long; lower `limit` or check backend logs.

## Acknowledgments

Next.js, React, Tailwind, Radix, Lucide. LeakLens backend, Solana Privacy Hackathon, [encrypt.trade](https://encrypt.trade) (Track 1 bounty sponsor).
