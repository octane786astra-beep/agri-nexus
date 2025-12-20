# Agri-Nexus Handover Documentation

## Project Overview
**Agri-Nexus** is an AI-Integrated Digital Twin Platform for precision farming combining:
- Real-time weather/sensor simulation
- AI-powered crop recommendations  
- Geo-intelligence analysis
- Anti-Gravity UI design

---

## Quick Start

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/v1/test` | GET | Connection test |
| `/ws/sensors/{farm_id}` | WS | Real-time sensor stream |
| `/api/research/full-scan` | POST | AI farm analysis |
| `/api/research/crops` | GET | Crop recommendations |
| `/api/analysis/roi` | POST | ROI calculator |
| `/api/geo/lookup` | GET | Geo location info |
| `/api/sim/state` | GET | Simulation state |
| `/api/sim/rain` | POST | Trigger rain |
| `/api/sim/drought` | POST | Trigger drought |
| `/api/sim/reset` | POST | Reset simulation |
| `/api/sim/time-jump` | POST | Skip hours |

---

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
OPENAI_API_KEY=your_key
WEATHER_API_KEY=your_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## Simulation Logic

### Temperature Cycle
- Uses sine wave based on time of day
- Peak at 14:00 (2 PM), lowest at 04:00 (4 AM)
- Formula: `T = base ± amplitude × sin(phase)`

### Soil Moisture
- Exponential decay: `M_new = M_old × 0.995`
- Rain recharges to ~95%

### Rain Probability
- Increases when humidity > 85% AND pressure < 1005 hPa

---

## Demo User
- Farm ID: `demo-farm-001`
- Use "God Mode" panel (bottom right) to trigger events

---

## Docker
```bash
docker-compose up -d
```

## Deployment
- **Backend**: Render, Railway, or any Docker host
- **Frontend**: Vercel (auto-deploys from GitHub)
