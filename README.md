# CarValue AI

CarValue AI is a full-stack car valuation platform that predicts used-car prices using a trained machine learning model.

The project includes:
- A FastAPI backend with JWT authentication
- A React + Vite frontend with a redesigned, responsive valuation UI
- A preprocessing and model-training pipeline in `ml/`

## What It Does

- Register and sign in users via JWT (`/register`, `/token`)
- Run protected car value predictions (`/predict`)
- Return valuation + explanation text for decision support
- Provide an in-app AI-style chat assistant (`/chat`)
- Support retraining via `data_pipeline.py` and `train_model.py`

## Current Frontend Experience

The current UI includes:
- Clean responsive layout for desktop and mobile
- Hero + quick stats panel
- Valuation form with 9 model inputs
- Real-time result panel (private sale and trade-in estimate)
- Auth modal (login/register)
- Floating AI assistant chat panel

Note: Prediction requires sign-in because `/predict` is auth-protected.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, SQLite, python-jose, passlib
- Frontend: React, Vite, Tailwind CSS, Framer Motion, Axios, Lucide icons
- ML: pandas, scikit-learn, pickle

## Project Structure

```text
backend/
  auth.py
  database.py
  main.py
  models.py
frontend/
  src/
  package.json
ml/
  data_pipeline.py
  train_model.py
  model.pkl
  encoders.pkl
data/
  car_data.csv
```

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm

## Local Setup

### 1. Clone

```bash
git clone https://github.com/PrudhviRaavi/CarValue-AI.git
cd CarValue-AI
```

### 2. Backend

```bash
cd backend
python -m venv venv
```

Activate venv:

- Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

- macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart pydantic pandas numpy scikit-learn
```

Run API:

```bash
uvicorn main:app --reload --port 8000
```

Docs: `http://localhost:8000/docs`

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

### 4. Optional: Retrain Model

```bash
cd ml
python data_pipeline.py
python train_model.py
```

## API Summary

### Auth

- `POST /register`
- `POST /token`
- `GET /users/me`

### Prediction

- `POST /predict` (Bearer token required)

Example payload:

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

### Assistant

- `POST /chat`

## Notes

- CORS is currently open (`allow_origins=["*"]`) for development.
- SQLite DB is created at `backend/car_value_ai.db`.
- Move the JWT secret from `backend/auth.py` into environment variables for production.

## License

MIT. See `docs/LICENSE`.
