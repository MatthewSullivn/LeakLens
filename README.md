# LeakLens - See What Your Wallet Leaks

Solana wallet surveillance exposure tool. Built for the Solana Privacy Hackathon and submitted for the [encrypt.trade](https://encrypt.trade) Track 1 bounty (Educate users about mass financial surveillance, $500).

<div align="center">
  <a href="https://www.youtube.com/watch?v=PLACEHOLDER">
    <p>LeakLens - Watch Demo</p>
  </a>
  <a href="https://www.youtube.com/watch?v=PLACEHOLDER">
    <img src="https://img.youtube.com/vi/PLACEHOLDER/hqdefault.jpg" alt="LeakLens Demo" style="max-width:300px;">
  </a>
</div>

## Project Description

Most people assume crypto wallets are anonymous. They’re not—on-chain activity gets tracked, clustered, and labeled. A single public tx can permanently tie you to a pattern. LeakLens shows you how exposed your wallet already is using real behavior: funding sources, cashout targets, linked addresses, memecoin trading, net worth, income sources. We also look at things like reaction speed between receives and sends; if you move tokens almost instantly, that can signal bot-like behavior or sloppy use of privacy tools (e.g. no time delays). The idea is to make surveillance visible so users get why tools like [encrypt.trade](https://encrypt.trade) exist—selective privacy that cuts exposure without killing usability.

## Technical Overview

We use Helius for Solana data (RPC + Enhanced Transactions). On Vercel, the main tx list comes from Enhanced only (avoids rate limits); execution profiles still hit RPC for a 50-tx subset. Backend is FastAPI + `leaklens_solana.py` (fetch, reaction-speed, opsec, ego network, mempool forensics, swaps, PnL). Frontend is Next.js in `frontend/`, with a wallet analysis UI and linked-wallet graph. Local dev: FastAPI + Next dev. Production: Vercel runs Next.js and Python serverless for `/api/analyze-wallet`.

## Features

- Enter any Solana address and run a full exposure analysis.
- Surveillance score + risk level from timing, counterparties, execution style, swap patterns.
- Inferred timezone / sleep window from tx timing.
- Bot-style detection via reaction speed (receive → action).
- OpSec failures: funding sources, withdrawal targets, memo usage.
- Ego network: linked wallets and why they’re connected.
- Mempool forensics: execution profiles (RETAIL, PRO_TRADER, MEV-style) from compute units and priority fees.
- Financial context: trading PnL and income from swaps/transfers.

## How to Get Started

Clone, then run backend and frontend:

```bash
git clone https://github.com/MatthewSullivn/LeakLens.git
cd LeakLens
```

Backend:

```bash
pip install -r requirements.txt
export HELIUS_API_KEY="your_helius_api_key"
python run_server.py
```

API is at `http://localhost:8000`; docs at `/docs`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:3000`. Paste a Solana address on the landing page to analyze. On Windows you can use `START_DEV.bat` to run both.

## Acknowledgments

Solana Privacy Hackathon, [encrypt.trade](https://encrypt.trade) (Track 1 sponsor), Helius, Jupiter.
