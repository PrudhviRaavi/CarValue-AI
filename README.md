# CarValue AI

CarValue AI is a full-stack used-car valuation app.

It combines:
- A FastAPI backend with JWT auth and prediction history
- A React + Vite frontend with guest, auth, and logged-in dashboard experiences
- A machine learning pipeline for preprocessing and model training

## Features

- User registration and login (`/register`, `/login`, `/token`)
- Protected valuation endpoint (`/predict`) that stores user history
- Dashboard metrics for recent valuation activity
- Ultra-mobile responsive UI with premium micro-animations
- AI-style helper endpoint for robust valuation guidance (`/chat`)
- Retraining scripts for dataset preprocessing and model generation

## Project Layout

```text
backend/          FastAPI API, auth, DB models, SQLite file
data/             Source dataset used for training
docs/             License and project docs index
frontend/         React app (Vite)
ml/               Data pipeline, training scripts, model artifacts
README.md         Project-level setup and quick start
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/PrudhviRaavi/CarValue-AI.git
cd CarValue-AI
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate virtual environment:

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run API:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Swagger docs: `http://127.0.0.1:8000/docs`

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open: `http://127.0.0.1:5173`

## API Endpoints

Authentication:
- `POST /register`
- `POST /login` (JSON payload)
- `POST /token` (OAuth2 form format)
- `GET /users/me`

Valuation:
- `POST /predict` (Bearer token required)
- `GET /predictions` (Bearer token required)

Assistant:
- `POST /chat`

Sample `/predict` payload:

```json
{
  "brand": "Toyota",
  "model_name": "Camry",
  "year": 2020,
  "engine_size": 2.5,
  "fuel_type": "Petrol",
  "transmission": "Automatic",
  "mileage": 30000,
  "doors": 4,
  "owner_count": 1
}
```

## ML Workflow

From `ml/`:

```bash
python data_pipeline.py
python train_model.py
```

This regenerates:
- `ml/encoders.pkl`
- `ml/model.pkl`
- `ml/X_train.csv`, `ml/X_test.csv`, `ml/y_train.csv`, `ml/y_test.csv`

## Additional Module Docs

- Backend details: `backend/README.md`
- Frontend details: `frontend/README.md`
- ML details: `ml/README.md`
- Dataset notes: `data/README.md`
- Docs index: `docs/README.md`

## Notes

- Backend CORS allows local development origins on `localhost` and `127.0.0.1` across ports.
- SQLite DB is stored at `backend/car_value_ai.db`.
- Configure `SECRET_KEY` in backend environment variables for non-dev usage.

## License

MIT. See `docs/LICENSE`.
