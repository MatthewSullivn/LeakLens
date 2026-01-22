# 🔍 LeakLens - See What Your Wallet Leaks

**Blockchain surveillance exposure tool.** Discover how much your wallet reveals about you — timezone, behavior patterns, connections, and more.

    
Built for the [encrypt.trade](https://encrypt.trade) hackathon bounty: **Educate users about mass financial surveillance.**

---

## 🎯 What LeakLens Does

LeakLens answers the question: **"How exposed am I?"**

Public blockchains enable tracking, labeling, and profiling at scale. LeakLens makes this surveillance **visible and intuitive** so you can understand your exposure and take action.

### Surveillance Vectors Detected

| Vector | What It Means | How LeakLens Detects It |
|--------|---------------|------------------------|
| **Temporal Fingerprinting** | Your transaction timing reveals timezone and sleep patterns | Sleep window detection, activity heatmaps |
| **Behavioral Fingerprinting** | Reaction speeds and patterns distinguish bots from humans | Reaction speed analysis (<5s = bot) |
| **Graph Topology Attack** | Your transaction network shape can cluster and identify you | Connection mapping, counterparty analysis |
| **Exchange KYC Correlation** | Deposits/withdrawals to exchanges link activity to identity | Known exchange address detection |
| **Amount Fingerprinting** | Unique transfer amounts act as identifiers across wallets | Transaction pattern analysis |
| **Quasi-Identifier Correlation** | Combining traits (apps + timezone + tokens) uniquely identifies you | Multi-signal behavioral profiling |

### Key Features

✅ **Surveillance Exposure Score** - Overall privacy risk assessment  
✅ **Temporal Analysis** - Detect timezone leaks via sleep patterns  
✅ **Bot Detection** - Reaction speed analysis with 70%+ accuracy  
✅ **Network Mapping** - Find connected wallets & funding sources  
✅ **PDF Export** - Downloadable report with attack explanations  
✅ **Privacy Recommendations** - Direct links to [encrypt.trade](https://encrypt.trade)  
✅ **Multi-Chain** - Solana + EVM (Ethereum, Base, Arbitrum)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up API Keys

Get your API keys:
- **Etherscan**: [etherscan.io/myapikey](https://etherscan.io/myapikey)
- **Helius (Solana)**: [dev.helius.xyz](https://dev.helius.xyz/dashboard/app)

Set environment variables:

```bash
# Mac/Linux
export ETHERSCAN_API_KEY="your_key_here"
export HELIUS_API_KEY="your_key_here"

# Windows (PowerShell)
$env:ETHERSCAN_API_KEY="your_key_here"
$env:HELIUS_API_KEY="your_key_here"
```

### 3. Start the Server

```bash
# Windows
START_SERVER.bat

# Mac/Linux
python run_server.py
```

Open your browser to `http://localhost:8000`

---

## 📊 How It Works

### 1. Temporal Fingerprinting (Timezone Leak)

Analyzes hourly transaction patterns to detect 4-6 hour "sleep windows":

- Gap at 02:00 UTC → **Europe**
- Gap at 08:00 UTC → **USA (East Coast)**
- Gap at 22:00 UTC → **Asia**

Bots show **no sleep pattern** — a major distinguishing signal.

### 2. Behavioral Fingerprinting (Bot Detection)

Measures the time between **receiving tokens** and **taking action**:

- **Instant (<5s)**: Bot with high confidence
- **Fast (5-30s)**: Likely bot  
- **Human (>30s)**: Normal human behavior

### 3. Graph Topology Analysis

Maps wallet connections to reveal:
- Funding sources
- Counterparty relationships
- Cluster membership

### 4. Quasi-Identifier Correlation

Combines multiple "innocent" signals that together uniquely identify you:
- Apps/protocols used (Jupiter, Raydium, Uniswap, etc.)
- Transaction complexity patterns
- Timing + amount + counterparty combinations

---

## 🛡️ Privacy Recommendations

After analyzing your exposure, LeakLens provides actionable recommendations:

| Action | What It Does | Effectiveness |
|--------|--------------|---------------|
| **[encrypt.trade](https://encrypt.trade)** | Break the on-chain link between wallets | ⭐⭐⭐ Full privacy |
| **New Wallet** | Fresh start, but doesn't erase linkability | ⭐⭐ Partial |
| **Time Randomization** | Vary transaction timing | ⭐ Minimal |

**Important**: Creating a new wallet helps, but **doesn't break linkability** from past behavior. Only selective privacy tools like [encrypt.trade](https://encrypt.trade) can truly sever the connection.

---

## 🖥️ Command Line Usage

### Profile a Wallet

```bash
# Solana
python leaklens_solana.py profile 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1 --limit 200

# Ethereum
python leaklens_evm.py profile 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --chain ethereum
```

### Find Connections Between Wallets

```bash
python leaklens_solana.py connect WalletA WalletB WalletC
```

### Network Scan (Solana Only)

```bash
python leaklens_solana.py scan 5Q544fKrFoe... --depth 2
```

---

## 🏗️ Architecture

```
LeakLens/
├── leaklens_solana.py    # Solana analysis engine
├── leaklens_evm.py       # EVM analysis engine
├── backend_api.py        # FastAPI routes
├── run_server.py         # Server startup
├── stalker_service.py    # Real-time monitoring
├── static/
│   └── index.html        # Web dashboard
├── requirements.txt
└── README.md
```

---

## 🔗 External Integrations

LeakLens links to external tools for deeper analysis:

- **[Arkham Intelligence](https://platform.arkhamintelligence.com/)** - Entity labeling and clustering
- **[Jupiter Portfolio](https://jup.ag/portfolio)** - Solana DeFi positions
- **[Solscan](https://solscan.io)** / **[Etherscan](https://etherscan.io)** - Transaction details

---

## 🔒 Privacy & Ethics

- **Only uses public blockchain data**
- **No private keys or encryption breaking**
- **Educational purposes** - helps users understand their exposure

All transaction data is publicly available on-chain. LeakLens aggregates and visualizes behavioral patterns to educate users about surveillance risks.

---

## 📝 License

MIT License - Free for educational and research purposes

---

**Built for the encrypt.trade hackathon | Track 1: Educate users about mass financial surveillance**

*See what your wallet leaks. Then fix it.*
