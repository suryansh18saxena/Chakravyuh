# 🕸️ Chakravyuh — Intelligent Honeypot Cyber Defense System

> *"Enter. Never Escape."*

Chakravyuh is an advanced, AI-powered honeypot and cyber defense platform that traps, tarpits, fingerprints, and analyzes malicious actors in real time. Built with a cinematic dark-mode SOC dashboard, it transforms every intrusion attempt into actionable threat intelligence.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET / ATTACKER                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │    🪤 HONEYPOT SERVER (:8080)   │
              │                                │
              │  Exposed Surfaces:             │
              │   /login   → Fake Login Portal │
              │   /admin   → Fake Admin Panel  │
              │   /files   → Fake File Listing │
              │   /api/v1  → Fake REST API     │
              │                                │
              │  ┌──────────────────────────┐   │
              │  │   Detection Engine       │   │
              │  │  • Regex Signature Match │   │
              │  │  • Entropy Analysis      │   │
              │  │  • Payload Decoding      │   │
              │  └────────────┬─────────────┘   │
              └───────────────┼────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
    ┌─────────────────┐ ┌──────────┐ ┌──────────────────┐
    │ 🧠 ML Service   │ │ 🗄️ SQLite │ │ 🤖 Gemini AI     │
    │   (:5000)       │ │ (Prisma) │ │  (Google API)    │
    │                 │ │          │ │                  │
    │ IsolationForest │ │ Payloads │ │ Threat Analysis  │
    │ Anomaly Scoring │ │ Sessions │ │ Chat Assistant   │
    │ Flask + sklearn │ │ Profiles │ │ Attack Insights  │
    └─────────────────┘ │ Insights │ └──────────────────┘
                        └────┬─────┘
                             │
              ┌──────────────┴──────────────┐
              │  📡 DASHBOARD API (:3001)    │
              │                             │
              │  REST Endpoints:            │
              │   GET  /api/stats           │
              │   GET  /api/attacks         │
              │   GET  /api/attacks/login   │
              │   GET  /api/sessions        │
              │   POST /api/chat            │
              │                             │
              │  WebSocket (Socket.IO):     │
              │   • new_attack              │
              │   • stats_update            │
              │   • session_update          │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  🖥️ FRONTEND DASHBOARD (:3000)│
              │                              │
              │  React + Vite + TailwindCSS  │
              │                              │
              │  Pages:                      │
              │   • Landing Page             │
              │   • Live Command Center      │
              │   • Payload Analyzer         │
              │   • Attack Stories (Cinema)  │
              │   • Login Attempts Tracker   │
              │   • Settings                 │
              │                              │
              │  Components:                 │
              │   • 3D Globe (Three.js)      │
              │   • Live Alerts Feed         │
              │   • Threat Charts            │
              │   • AI Chat Widget (Gemini)  │
              │   • Real-time Toast Alerts   │
              └──────────────────────────────┘
```

---

## ✨ Features

### 🪤 Honeypot Engine
- **Multi-surface traps**: Fake login portals, admin panels, file directories, and REST APIs
- **Tarpit mechanism**: Dynamically slows attacker connections with chunked HTTP responses
- **Adaptive escalation**: Tarpit intensity increases with threat severity (2s → 30s)

### 🔍 Detection & Analysis
- **Signature-based detection**: SQLi, XSS, Command Injection, Path Traversal, SSRF
- **Multi-layer payload decoding**: URL encoding, Base64, HTML entities, hex
- **Shannon entropy analysis**: Detects obfuscated/encrypted payloads
- **ML anomaly scoring**: IsolationForest model via Python microservice

### 🤖 AI-Powered Intelligence
- **Gemini AI integration**: Automatic threat analysis for high-severity payloads
- **AI Chat Assistant**: Interactive cybersecurity assistant on every page
- **Attack narratives**: AI-generated explanations of attacker intent and risk

### 📊 Real-Time Dashboard
- **Live 3D Globe**: Visualizes attack origins with Three.js/Globe.GL
- **WebSocket-driven updates**: Instant metric refresh via Socket.IO
- **Cinematic Attack Stories**: 6-chapter visual playback of attack sequences
- **Toast notifications**: Real-time alerts for every intrusion attempt

### 🔐 Attacker Profiling
- **Fingerprinting**: SHA-256 hash of IP + User-Agent
- **Geolocation**: Country, city, ISP, proxy detection via ip-api
- **Behavioral tagging**: Explorer, Script Kiddie, Dangerous, VPN Rotation
- **Session tracking**: Multi-request attack sessions with timeline

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion, Three.js, Globe.GL, Chart.js |
| **Backend** | Node.js, Express 5, Socket.IO, Prisma ORM |
| **Database** | SQLite |
| **ML Service** | Python, Flask, scikit-learn (IsolationForest) |
| **AI** | Google Gemini 2.0 Flash (via @google/generative-ai SDK) |
| **Real-time** | WebSocket (Socket.IO) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Nischal-S143/Chakravyuh.git
cd Chakravyuh
```

### 2. Start the ML Service
```bash
cd ml-service
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# Linux/Mac
source venv/bin/activate

pip install flask scikit-learn numpy
python app.py
# Runs on http://localhost:5000
```

### 3. Start the Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node seed.js          # Seed demo data (optional)
node index.js
# Dashboard API on http://localhost:3001
# Honeypot on http://localhost:8080
```

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### 5. Test the Honeypot
```bash
# Simple probe
curl http://localhost:8080/login

# SQL Injection attempt
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "' OR 1=1 --"}'

# Command injection
curl http://localhost:8080/api/v1?cmd=cat+/etc/passwd
```

Watch the dashboard light up in real time! 🔴

---

## 📁 Project Structure

```
Chakravyuh/
├── backend/
│   ├── index.js           # Express servers (Dashboard + Honeypot)
│   ├── ai.js              # Gemini AI integration
│   ├── detector.js         # Threat detection engine
│   ├── decoder.js          # Multi-layer payload decoder
│   ├── geolocate.js        # IP geolocation service
│   ├── seed.js             # Database seeder
│   └── prisma/
│       └── schema.prisma   # Database schema
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── AIChatWidget.jsx
│       │   ├── GlobeMap.jsx
│       │   ├── AlertsFeed.jsx
│       │   ├── Charts.jsx
│       │   └── ...
│       ├── pages/          # Route pages
│       │   ├── Dashboard.jsx
│       │   ├── LoginAttempts.jsx
│       │   ├── AttackStories.jsx
│       │   ├── PayloadAnalyzer.jsx
│       │   └── ...
│       ├── context/        # Global state (WebSocket, Stats)
│       └── layout/         # Navigation layout
└── ml-service/
    └── app.py              # Flask ML anomaly detection
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Aggregated dashboard statistics |
| `GET` | `/api/attacks` | Recent 50 attack payloads |
| `GET` | `/api/attacks/login` | Login-specific attack attempts |
| `GET` | `/api/sessions` | Active attacker sessions |
| `GET` | `/api/sessions/:id` | Session detail with payloads |
| `POST` | `/api/chat` | AI chat (Gemini) |

---

## 👤 Author

**Nischal S** — [@Nischal-S143](https://github.com/Nischal-S143)

---

## 📜 License

This project is for educational and research purposes only. Do not deploy honeypots without proper authorization.
