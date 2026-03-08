# CarValue AI

CarValue AI is a full-stack web application that predicts used car prices using machine learning.
It includes:
- A FastAPI backend with JWT authentication
- A React + Vite frontend with a modern animated UI
- An ML pipeline for preprocessing data and training a Random Forest model

## Features

- User registration and login (JWT token based)
- Auth-protected car price prediction endpoint
- AI-style value explanation with each prediction
- Interactive frontend with 3D visuals and chat assistant
- Re-trainable ML pipeline from CSV data

## Tech Stack

- Backend: FastAPI, SQLAlchemy, SQLite, python-jose, passlib
- Frontend: React, Vite, Tailwind CSS, Framer Motion, GSAP, Three.js
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

## Setup and Run

### 1. Clone repository

```bash
git clone https://github.com/PrudhviRaavi/CarValue-AI.git
cd CarValue-AI
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

- Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source venv/bin/activate
```

Install backend and ML dependencies:

```bash
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart pydantic pandas numpy scikit-learn
```

### 3. Optional: Rebuild ML artifacts

If `ml/model.pkl` and `ml/encoders.pkl` are missing or you want to retrain:

```bash
cd ../ml
python data_pipeline.py
python train_model.py
```

### 4. Run backend API

From the `backend` directory:

```bash
uvicorn main:app --reload --port 8000
```

API docs:
- Swagger UI: `http://localhost:8000/docs`

### 5. Run frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Overview

### Auth

- `POST /register`
- `POST /token`
- `GET /users/me`

### Prediction

- `POST /predict` (requires Bearer token)

Sample request body:

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

- Backend currently uses `allow_origins=["*"]` for development CORS.
- SQLite database file is created at `backend/car_value_ai.db`.
- JWT secret in `backend/auth.py` is development-only and should be moved to environment variables for production.

## License

MIT. See `docs/LICENSE`.
