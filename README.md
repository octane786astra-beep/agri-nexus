# 🌱 Agri-Nexus: AI-Integrated Digital Twin Platform

> **The Ultimate Precision Farming Platform** - Combining Real-Time Sensor Simulation, AI-Powered Geo-Intelligence, and a Stunning "Anti-Gravity" UI

![Digital Twin Concept](https://img.shields.io/badge/Concept-Digital%20Twin-green)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![AI](https://img.shields.io/badge/AI-OpenAI%20Powered-purple)

---

## 🎯 What is a Digital Twin?

A **Digital Twin** is a virtual replica of a physical system that:
- **Mirrors** real-world conditions in real-time
- **Simulates** environmental physics (temperature, humidity, soil moisture)
- **Predicts** future states using AI/ML models
- **Enables** decision-making without physical interaction

In **Agri-Nexus**, we create a Digital Twin of a farm that:
1. Simulates weather patterns with realistic physics
2. Provides AI-powered crop recommendations
3. Alerts farmers to potential challenges (drought, disease)
4. Visualizes everything in an immersive "Anti-Gravity" UI

---

## 🏗️ Architecture Overview

```
agri-nexus-monorepo/
├── backend/                 # Python FastAPI (AI & Simulation)
│   ├── app/
│   │   ├── core/           # Config, Security, WebSocket Manager
│   │   ├── routers/        # API Endpoints
│   │   ├── services/       # Simulation Engine, AI Engine
│   │   ├── models/         # Pydantic Schemas
│   │   └── utils/          # Helper Functions
│   ├── tests/
│   └── requirements.txt
│
├── frontend/                # Next.js 14 (Anti-Gravity UI)
│   ├── app/                # App Router Pages
│   ├── components/
│   │   ├── ui/            # Atomic Components
│   │   ├── dashboard/     # Widget Components
│   │   └── maps/          # Leaflet Wrappers
│   ├── hooks/             # Custom Hooks (WebSocket, etc.)
│   ├── store/             # Zustand State Management
│   └── lib/               # Utils, API Clients
│
├── supabase/               # SQL Migration Scripts
└── docker-compose.yml
```

---

## 🚀 Key Features

### 🔬 Physics Simulation Engine
- **Diurnal Temperature Cycles** - Realistic sine-wave based day/night temps
- **Soil Hydrology Model** - Exponential decay for moisture, rain events
- **Weather Probability Engine** - Dynamic rain based on humidity/pressure

### 🤖 AI Geo-Intelligence Agent
- **Deep Research Mode** - SWOT analysis for any farm location
- **Crop Feasibility Scoring** - AI-matched crops to conditions
- **Risk Prediction** - Disease and weather challenge alerts

### ✨ Anti-Gravity UI
- **Glassmorphism Design** - Frosted glass cards with blur effects
- **Floating Components** - Framer Motion powered animations
- **Real-Time Dashboards** - WebSocket-driven live updates
- **Immersive Weather Effects** - CSS rain, heat haze overlays

---

## 🛠️ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Account
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd agri-nexus-monorepo

# Install root dependencies
npm install

# Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
```

### Running the Development Servers

```bash
# From root directory
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/ws/sensors/{farm_id}` | WS | Real-time sensor stream |
| `/api/research/full-scan` | POST | AI farm analysis |
| `/api/sim/rain` | POST | Trigger rain event |
| `/api/sim/drought` | POST | Simulate drought |

---

## 🎨 Design Philosophy

The "Anti-Gravity" aesthetic creates an immersive, futuristic farming dashboard:
- **Dark Mode First** - Deep greens to black gradients
- **Floating Elements** - Cards that bob and are draggable
- **Glassmorphism** - Frosted glass effect throughout
- **Micro-Animations** - Smooth, fluid transitions

---

## 📜 License

MIT License - Build the future of farming! 🌾

---

<p align="center">
  <strong>Agri-Nexus</strong> - Where Agriculture Meets Artificial Intelligence
</p>
