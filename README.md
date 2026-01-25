# LeakLens - See What Your Wallet Leaks

Blockchain surveillance exposure tool for Solana. Built for the [encrypt.trade](https://encrypt.trade) hackathon bounty: educate users about mass financial surveillance.

Live app: [leak-lens.vercel.app](https://leak-lens.vercel.app) | Repo: [github.com/MatthewSullivn/LeakLens](https://github.com/MatthewSullivn/LeakLens)

<div align="center">
  <a href="YOUTUBE_DEMO_LINK_PLACEHOLDER">
    <p>LeakLens - Watch Demo</p>
  </a>
  <a href="YOUTUBE_DEMO_LINK_PLACEHOLDER">
    <img style="max-width:300px;" src="YOUTUBE_THUMBNAIL_PLACEHOLDER" alt="Demo thumbnail">
  </a>
</div>

*(Replace YOUTUBE_DEMO_LINK_PLACEHOLDER with your YouTube video URL and YOUTUBE_THUMBNAIL_PLACEHOLDER with your thumbnail URL, e.g. https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)*

## Project Description

LeakLens answers the question: "How exposed am I?" Public blockchains enable tracking, labeling, and profiling at scale. LeakLens makes this surveillance visible and intuitive for Solana wallets so you can understand your exposure and take action.

The tool detects multiple surveillance vectors: temporal fingerprinting (timezone and sleep patterns from transaction timing), behavioral fingerprinting (reaction speeds that distinguish bots from humans), graph topology (transaction network shape and counterparty connections), exchange KYC correlation, amount fingerprinting, and quasi-identifier correlation. After analysis, LeakLens provides a surveillance exposure score, privacy recommendations, and links to tools like [encrypt.trade](https://encrypt.trade) to reduce exposure.

## Technical Overview

- **Backend API**: FastAPI server (`backend_api.py`, `run_server.py`) that orchestrates Solana wallet analysis. Deployable as Vercel serverless via `api/index.py`.
- **Analysis Engine**: `leaklens_solana.py` fetches chain data via Helius, detects temporal/behavioral patterns, maps connections, and computes exposure metrics.
- **Frontend**: Next.js app in `frontend/` with analysis dashboard, exposure breakdown, and PDF export. Proxies analyze requests to the Python backend in local dev.
- **External APIs**: Helius (transactions, balances). Jupiter and CoinGecko for token/SOL prices. Optional links to Arkham, Jupiter, and Solscan for deeper context.

## Features

1. **Surveillance Exposure Score**: Overall privacy risk assessment.
2. **Temporal Analysis**: Detect timezone leaks via sleep-window and activity-pattern analysis.
3. **Bot Detection**: Reaction-speed analysis (e.g. under 5 seconds suggests automated behavior).
4. **Network Mapping**: Connected wallets, funding sources, and counterparty analysis.
5. **PDF Export**: Downloadable report with attack explanations.
6. **Privacy Recommendations**: Direct links to [encrypt.trade](https://encrypt.trade) and guidance on reducing exposure.
7. **Solana Only**: Supports Solana mainnet wallets.

## How to Get Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MatthewSullivn/LeakLens.git
   cd LeakLens
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up a Helius API key from [dev.helius.xyz](https://dev.helius.xyz/dashboard/app), then:
   ```bash
   # Windows (PowerShell)
   $env:HELIUS_API_KEY="your_key_here"

   # Mac/Linux
   export HELIUS_API_KEY="your_key_here"
   ```

4. Start the backend server:
   ```bash
   # Windows
   START_SERVER.bat

   # Mac/Linux
   python run_server.py
   ```
   The API runs at `http://localhost:8000`.

5. Run the Next.js frontend (optional for local use):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app runs at `http://localhost:3000`. It proxies analyze requests to the local Python backend.

6. Use the web UI to analyze a Solana wallet, or use the CLI:
   ```bash
   python leaklens_solana.py profile 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1 --limit 200
   python leaklens_solana.py connect <addr1> <addr2> ...
   python leaklens_solana.py scan <address> --depth 2
   ```

## Acknowledgments

- **encrypt.trade** for the hackathon bounty and focus on mass financial surveillance education.
- **Helius** for Solana transaction and balance APIs.
- **Jupiter** and **CoinGecko** for price data.
- **Arkham Intelligence**, **Jupiter**, and **Solscan** for external context and explorer links.
