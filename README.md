<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0f172a&height=180&section=header&text=ACE%20%26%20COMPANY&fontSize=50&fontColor=10b981&desc=Autonomous%20Quantitative%20Asset%20Management%20Monolith&descSize=20&descAlignY=75" width="100%"/>

  <h1>🏛️ ACE & COMPANY (Quantum HQ)</h1>
  <p><b>Institutional-Grade Autonomous Hedge Fund Platform & Multi-Agent Executive Quorum</b></p>

  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-Event_Bus-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://langchain-ai.github.io/langgraph/"><img src="https://img.shields.io/badge/LangGraph-Multi--Agent_Core-FF4B4B?style=for-the-badge" alt="LangGraph" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_3.6_Flash-Agent_LLM-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_/_Next.js-Obsidian_UI-000000?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-Crystal_Daylight_3D-111111?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
</div>

> **ACE & COMPANY** is a fully automated, institutional-grade quantitative hedge fund management platform. The system coordinates specialized AI agents structured across a 5-floor corporate hierarchy using `LangGraph`. Operations are orchestrated by a persistent Python cron daemon (Chief of Staff), streaming sub-millisecond telemetry over a `FastAPI` WebSocket bus into a photorealistic 3D Crystal Daylight Boardroom with human-in-the-loop veto capability.

---

## 🏗️ System Architecture

The firm operates across five functional floors. Trading motions cascade sequentially through strict quantitative, fundamental, and risk checkpoints before reaching the executive voting table.

```text
                     [ Market Feeds // Yahoo Finance & SEC EDGAR ]
                                           │
 🏢 Floor 0: Operations Core               ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  NEXUS-0 (Chief of Staff Daemon via APScheduler)                            │
 │  • Enforces 10-hour shift rotation, scheduled ingestions & cron heartbeats  │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       │ triggers
 🏢 Floor 1: Quant Research Desk       ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  ORACLE-12 & HELIX-8                                                        │
 │  • 30-Day statistical anomaly detection, z-score divergence & spread math   │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       │ passes flagged anomaly (+2.01σ)
 🏢 Floor 2: Fundamental & Macro Desk  ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  LEXICON-5 (SEC Auditor) & ATLAS-4 (Macro Strategist)                       │
 │  • Live SEC EDGAR CIK extraction (10-K/10-Q), Debt/Equity, FCF & margins    │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       │ passes audit dossier (GREEN)
 🏢 Floor 3: Risk & Compliance Desk    ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  SENTINEL-9 (CRO Sentinel) & BASTION-3                                      │
 │  • Enforces 15.0% single-ticker exposure ceiling & Rule 18f-4 VaR limits    │
 │  • Issues formal RISK BREACH / VETO if capital allocation violates mandates │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       │ passes dossier & risk verdict
 🏢 Floor 4: Executive Consensus Arena ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  6-Seat Byzantine Consensus Quorum (AURUM-7, BASTION-3, PRISMA-1, etc.)     │
 │  • Live debate, LP fiduciary audit, voting rounds, and Markdown resolution  │
 └─────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
             [ FastAPI WebSocket Telemetry Bus (`/ws/telemetry`) ]
                                       │
                                       ▼
        [ Next.js + Three.js 3D Crystal Daylight War Room & Matrix HUD ]
```

---

## 🏛️ The 6-Agent Executive Boardroom Quorum

Decisions on Floor 4 are governed by a Byzantine fault-tolerant committee composed of distinct personas and mandates:

| Seat | Agent | Title / Role | Voting Mandate | Key Tools / Guardrails |
|---|---|---|---|---|
| 👑 1 | AURUM-7 | Chief Investment Officer (Chair) | Growth & Alpha Capture | `publish_executive_resolution`, `portfolio_rebalance` |
| 🛡️ 2 | BASTION-3 | Lead Risk Committee Chair | VaR Defense & Risk Veto | Enforces 15% single-ticker exposure ceiling |
| 💼 3 | PRISMA-1 | Shareholder & Investor Proxy | LP Capital Preservation | Audits liquidity, downside volatility & LP covenants |
| 📈 4 | ORACLE-12 | Lead Alpha Quant Analyst | Statistical Edge Defense | Validates z-score mean reversion & pricing spread |
| 📑 5 | LEXICON-5 | SEC Filing Auditor | Regulatory & Solvency Grounding | Queries SEC EDGAR CIK facts (10-K / 10-Q metadata) |
| ⏱️ 6 | NEXUS-0 | Chief of Staff (Operational Daemon) | Non-Voting Moderator | Tracks event bus latency, shift caps & quorum timing |

---

## 💡 Key Engineering Features

### 1. Zero Human Input Autonomous Execution
- **Chief of Staff Cron Loop** (`app/core/clock.py`): Powered by APScheduler, the firm runs on scheduled market shifts:
  - **07:30 EST** — Pre-market quantitative anomaly scan (Floor 1)
  - **12:00 EST** — Midday fundamental re-audit & SEC EDGAR ingestion (Floor 2)
  - **16:00 EST** — Market close boardroom debate, quorum vote & memo archive (Floor 4)
- **Automated Institutional Reports**: Floor 4's CIO agent uses local filesystem tools to output dated Markdown resolutions (`firm_reports/RESOLUTION_<TICKER>_<TIMESTAMP>.md`).

### 2. Live SEC EDGAR & Market Data Extraction
- Direct querying of SEC EDGAR company facts via programmatic CIK resolution (e.g., Apple CIK `0000320193`) with official User-Agent headers.
- Extracts real-time gross margins, operating margins, debt-to-equity ratios, and free cash flows so quantitative signals are fundamentally supported before risk audits begin.

### 3. Strict Deterministic Risk Ceilings
- Quantitative trade signals are stopped if they violate predefined risk parameters.
- Proposed trade sizes (e.g., +$12M allocation) are dynamically calculated against total fund AUM. If a position breaches the 15.0% single-ticker limit, Floor 3 halts the pipeline with an authoritative 🛑 `RISK BREACH: REJECTED` verdict.

### 4. Photorealistic 3D Crystal Daylight War Room
- **Daylight Aesthetic**: Built with `@react-three/fiber` and `@react-three/drei`, shifting away from traditional dark wireframes to a bright, sunlit executive suite featuring an obsidian floor, dark walnut conference table, and chrome finishes.
- **Dynamic Floating HUDs**: Each of the 6 seats features an anchored HTML status card rendering live thought chains, internal reasoning logs, and voting stances synced directly to the WebSocket stream.
- **Dual View**: Toggle between the interactive 3D Photorealistic War Room and the 2D Live Debate Transcript.

### 5. "The Matrix" Telemetry Drawer & Human Supervision
- Slide-up low-latency console displaying raw JSON telemetry frames streaming from `/ws/telemetry`.
- **Supervised Human-in-the-Loop**: Interactive controls allow human operators to inject authoritative `VETO_COMMAND` packets across the WebSocket to pause agents, force cash buffers, or halt trade allocations.

---

## 📂 Repository Structure

```text
quantum-hq/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── clock.py                  # APScheduler Chief of Staff heartbeat
│   │   ├── departments/
│   │   │   ├── f1_quant/agent.py         # Floor 1: Quant Research Desk
│   │   │   ├── f2_fundamental/agent.py   # Floor 2: SEC Auditor (LEXICON-5)
│   │   │   ├── f3_risk/agent.py          # Floor 3: CRO Sentinel Risk Desk
│   │   │   └── f4_boardroom/agent.py     # Floor 4: Executive Boardroom Quorum
│   │   ├── tools/
│   │   │   ├── market_data.py            # Yahoo Finance statistical tools
│   │   │   └── sec_tools.py              # SEC EDGAR CIK & 10-K/10-Q extraction
│   │   └── main.py                       # FastAPI WebSocket server & event bus
│   ├── firm_reports/                     # Auto-generated board resolutions (.md)
│   ├── run_autopilot.py                  # End-to-end multi-floor autonomous loop
│   ├── test_f1.py / test_f2.py / etc.    # Departmental verification runners
│   └── requirements.txt
│
└── frontend/ace-&-company/
    ├── src/
    │   ├── components/
    │   │   ├── ThreeBoardroom3D.tsx      # 3D Crystal Daylight 6-agent boardroom
    │   │   ├── BoardroomWarRoom.tsx      # 2D Live debate transcript & quorum view
    │   │   └── TelemetryDrawer.tsx       # "The Matrix" WebSocket log console
    │   ├── data/
    │   │   └── mockData.ts               # Institutional agent roster & baseline states
    │   ├── hooks/
    │   │   └── useWebSocket.ts           # WebSocket connection manager & veto sender
    │   └── App.tsx                       # Master command dashboard
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ or Bun
- A Google Gemini API Key (`GOOGLE_API_KEY`)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
```

Run the FastAPI WebSocket server:

```bash
uvicorn app.main:app --reload --port 8000
```

- HTTP Health Check: `http://127.0.0.1:8000/health`
- WebSocket Telemetry Bus: `ws://127.0.0.1:8000/ws/telemetry`

Run the Autonomous Loop (Chief of Staff) in a separate terminal:

```bash
cd backend
source venv/bin/activate
python3 run_autopilot.py
```

Or trigger a single live firm loop manually:

```bash
curl -X POST http://127.0.0.1:8000/api/trigger-loop
```

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend/ace-&-company

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## 🧪 Verification & Telemetry Testing

1. **Verify Live WebSocket Link** — Check the header indicator in the web UI. It should display `SECURE WS: 🟢 CONNECTED`.
2. **Open The Matrix Drawer** — Click the floating pill button on the bottom right (`THE MATRIX // TELEMETRY BUS`) to inspect raw JSON packets arriving from the backend.
3. **Trigger Manual Quorum Cascade**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/trigger-loop
   ```
   Observe the 3D Daylight Boardroom in real time:
   - LEXICON-5 transitions to GREEN upon SEC CIK confirmation.
   - BASTION-3 switches to DISSENTING upon detecting the exposure ceiling breach.
   - AURUM-7 ratifies the rejection and saves a report to `backend/firm_reports/`.
4. **Test Human Supervisory Veto** — Click the red VETO button in the Boardroom interface. Check your FastAPI terminal to confirm receipt of the `VETO_COMMAND` packet and watch the immediate broadcast response.

---

## 🗺️ Future Roadmap: Argus-Kratos Edge ML Integration

The next major architectural milestone is integrating the proprietary Argus-Kratos engine directly into the firm's lower floors:

- [ ] **Deterministic AST Sandboxing** (`calculator.py`) — Migrate isolated Abstract Syntax Tree evaluation into Floor 2 to evaluate complex SEC financial statements with zero arithmetic hallucinations.
- [ ] **On-Device Edge ML Inference** (`unsloth.Q4_K_M.gguf`) — Deploy a fine-tuned 4-bit Llama-3.2-1B Small Language Model locally on Apple Silicon Metal Performance Shaders (MPS), providing offline news and sentiment scoring at ~45 tokens/sec with zero cloud API overhead.
- [ ] **ChromaDB Semantic Ingestion** — Enable vector search over historical 10-K risk disclosures and FOMC minutes.

---

## 📜 License & Acknowledgments

- **Architecture & Engineering**: Designed by Ankith
- **License**: Distributed under the MIT License.
