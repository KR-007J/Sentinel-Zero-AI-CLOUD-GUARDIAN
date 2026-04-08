# 🛡️ Sentinel-Zero — AI Cloud Guardian

<div align="center">
  <img src="https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vertex%20AI-Gemini-FF6F00?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Solution%20Challenge-2026-blueviolet?style=for-the-badge"/>
</div>

<br/>

> **Autonomous AI-powered cloud security that reduces MTTR from hours to milliseconds.**
> Built entirely on Google Cloud for Google Solution Challenge 2026.

---

## 🎯 Executive Summary

Sentinel-Zero is an autonomous AI-powered cloud security system that **eliminates alert fatigue** and **instantly responds to threats** using Gemini-based reasoning and real-time remediation. It monitors your entire GCP infrastructure, detects anomalies, and automatically applies fixes — all in a stunning cyberpunk War Room UI.

---

## 🏗️ System Architecture

```
Cloud Logs ──► Pub/Sub ──► Cloud Run Dispatcher ──► Vertex AI (Gemini)
                                                              │
                                                              ▼
React War Room Dashboard ◄── Firestore ◄── Remediation Engine
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI Framework |
| **Styling** | Tailwind CSS + Custom CSS | Cyberpunk Design System |
| **Animations** | Framer Motion | Micro-interactions & transitions |
| **3D Visualization** | Three.js + Force Graph | 3D Cloud Network Graph |
| **AI Engine** | Vertex AI (Gemini 1.5 Pro) | Threat reasoning & decision making |
| **Backend** | Cloud Run + Node.js | Event processing & orchestration |
| **Messaging** | Cloud Pub/Sub | Real-time log streaming |
| **Database** | Cloud Firestore | Real-time threat state sync |
| **Hosting (FE)** | Firebase Hosting | Frontend deployment |
| **Hosting (BE)** | Cloud Run | Backend deployment |
| **Auth** | Firebase Auth + IAM | Identity management |
| **Monitoring** | Cloud Logging + Monitoring | Observability |

---

## 📁 Project Structure

```
sentinel-zero/
├── frontend/                # React War Room Dashboard
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   ├── ThreatGraph/ # Three.js 3D Network
│   │   │   ├── ThreatFeed/  # Live threat feed
│   │   │   ├── Terminal/    # Live terminal output
│   │   │   ├── MetricCards/ # KPI cards
│   │   │   └── AlertPanel/  # Sliding alert panels
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Firestore & API services
│   │   └── App.jsx          # Main app
│   ├── Dockerfile           # Container for Firebase Hosting
│   └── package.json
│
├── backend/                 # Cloud Run Service
│   ├── src/
│   │   ├── dispatcher.js    # Pub/Sub message handler
│   │   ├── gemini.js        # Vertex AI integration
│   │   ├── firestore.js     # DB operations
│   │   └── remediation.js   # Auto-remediation actions
│   ├── Dockerfile           # Cloud Run container
│   └── package.json
│
├── ai/                      # AI Layer
│   ├── prompts/             # Gemini system prompts
│   │   ├── threat_analysis.md
│   │   └── remediation.md
│   ├── schemas/             # JSON output schemas
│   └── examples/            # Prompt examples & tests
│
├── infra/                   # GCP Infrastructure
│   ├── terraform/           # Terraform IaC (optional)
│   └── cloudbuild.yaml      # CI/CD pipeline
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Google Cloud Project with billing enabled
- `gcloud` CLI installed and authenticated
- Node.js 20+
- Firebase CLI: `npm install -g firebase-tools`

### 1. Clone the Repository
```bash
git clone https://github.com/KR-007J/Sentinel-Zero-AI-CLOUD-GUARDIAN.git
cd Sentinel-Zero-AI-CLOUD-GUARDIAN
```

### 2. Set Up GCP Project
```bash
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  logging.googleapis.com
```

### 3. Deploy Backend (Cloud Run)
```bash
cd backend
gcloud run deploy sentinel-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=$PROJECT_ID
```

### 4. Deploy Frontend (Firebase Hosting)
```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

### 5. Configure Pub/Sub
```bash
gcloud pubsub topics create sentinel-threats
gcloud pubsub subscriptions create sentinel-sub \
  --topic=sentinel-threats \
  --push-endpoint=https://sentinel-backend-<hash>-uc.a.run.app/webhook
```

---

## 🤖 Gemini AI System Prompt

```
You are an autonomous cloud defense agent for Google Cloud Platform.
Your mission: Detect anomalies, assess impact, and output structured remediation plans.

Input: Cloud log entries, metric anomalies, or security events.
Output: Strict JSON with the following schema:

{
  "threat_id": "unique-id",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "threat_type": "string describing the threat class",
  "affected_resources": ["list of GCP resource IDs"],
  "confidence": 0.0-1.0,
  "summary": "Human-readable threat summary",
  "remediation_actions": [
    {
      "action": "action-name",
      "resource": "resource-id",
      "params": {}
    }
  ],
  "estimated_impact": "string",
  "auto_remediate": true|false
}
```

---

## 🎨 UI Design — The War Room

The dashboard is designed as a **cyberpunk security operations center**:

- 🌐 **3D Rotating Cloud Network** — Three.js force graph showing GCP resource topology
- 🔴 **Color-coded Threat Levels** — CRITICAL (red pulse) → HIGH (orange) → MEDIUM (yellow) → LOW (green)
- 📋 **Sliding Alert Panels** — Framer Motion animated threat detail panels
- 💻 **Live Terminal Output** — Real-time remediation action log
- 💡 **Glowing Neon Theme** — Dark cyberpunk aesthetic with cyan/violet accents
- 📊 **Live Metrics** — Threats blocked, MTTR, confidence scores

---

## 🔁 Data Flow

```
1. GCP services generate logs (Cloud Logging)
2. Log sink pushes to Cloud Pub/Sub topic
3. Cloud Run backend receives Pub/Sub push events
4. Backend enriches data and calls Vertex AI (Gemini)
5. Gemini analyzes threat and returns structured JSON
6. Cloud Run writes result to Firestore
7. React dashboard real-time syncs via Firestore listeners
8. If auto_remediate=true, Cloud Run calls GCP APIs to fix the issue
9. Remediation log displayed in War Room terminal
```

---

## 🧪 Demo Script

1. **Show** the clean War Room dashboard with 3D network graph
2. **Trigger** a simulated attack (brute force SSH / unusual IAM activity)
3. **Watch** the threat appear on the 3D graph with red pulsing node
4. **Display** Gemini analysis in the sliding panel
5. **Observe** automatic remediation in the live terminal
6. **Highlight** sub-second MTTR and AI confidence score

---

## 🌍 Google Solution Challenge 2026 — UN SDG Alignment

| SDG | Relevance |
|-----|---------|
| **SDG 9** — Industry, Innovation & Infrastructure | AI-powered cloud security innovation |
| **SDG 16** — Peace, Justice & Strong Institutions | Protecting digital infrastructure |
| **SDG 17** — Partnerships for the Goals | Open-source security tooling for all |

---

## 🏆 Why Sentinel-Zero Wins

| Factor | Sentinel-Zero Advantage |
|--------|------------------------|
| **UI WOW Factor** | Three.js 3D graph + cyberpunk War Room |
| **Real AI Reasoning** | Gemini 1.5 Pro with structured JSON output |
| **Speed** | Sub-second detection + auto-remediation |
| **Google-Native** | 100% Google Cloud services |
| **Scale** | Pub/Sub handles millions of events/sec |

---

## 👥 Team

Built with ❤️ for Google Solution Challenge 2026

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
