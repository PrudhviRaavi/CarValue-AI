# Backend (FastAPI)

This folder contains the CarValue AI API server.

## Responsibilities

- User registration and login using JWT tokens
- Protected valuation endpoint (`/predict`)
- User-specific prediction history (`/predictions`)
- Data-backed chat endpoint (`/chat`) using dataset stats and optional user history
- SQLite persistence using SQLAlchemy models

## Files

- `main.py`: FastAPI app, routes, model loading, CORS config
- `auth.py`: JWT, password hashing, current-user dependency
- `database.py`: SQLAlchemy engine/session setup
- `models.py`: `User` and `Prediction` ORM models
- `requirements.txt`: Python dependencies
- `car_value_ai.db`: SQLite database file

## Setup

From `backend/`:

```bash
python -m venv .venv
```

Activate environment:

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run server:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs:

`http://127.0.0.1:8000/docs`

## Auth flow

1. `POST /register` creates a user and returns a bearer token.
2. `POST /token` accepts username or email via form fields and returns a bearer token.
3. Protected endpoints require `Authorization: Bearer <token>`.

## Environment variables

`auth.py` reads these values from environment variables (with dev defaults):

- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `DATABASE_URL` (optional; defaults to local `backend/car_value_ai.db`)
- `LLM_API_KEY` (optional; enables external Gemini rewrite for `/chat`)
- `GEMINI_API_URL` (optional; Gemini endpoint override)
- `LLM_MODEL` (optional; defaults to `gemini-1.5-flash`)
- `LLM_TIMEOUT_SECONDS` (optional)
- `GEMINI_MAX_RETRIES` (optional; retry count for transient Gemini errors like 429/503)

Create a local `.env` in `backend/` if needed.

Example for storing the SQLite file outside the repo:

`DATABASE_URL=sqlite:///C:/Users/your-user/AppData/Local/CarValueAI/car_value_ai.db`

## Notes

- CORS is configured for `localhost` and `127.0.0.1` development origins across ports.
- ML artifacts are loaded from `../ml/model.pkl` and `../ml/encoders.pkl`.
- Password hashing uses `pbkdf2_sha256` by default with legacy bcrypt verification support.

## Chat Endpoint Behavior

- `POST /chat` returns responses grounded in real data from `data/car_data.csv`.
- If a valid bearer token is included, the endpoint also uses that user's saved predictions for personalized answers.
- Response includes a `reply` plus `data_points` for key numeric facts shown in the assistant UI.
- If `LLM_API_KEY` is configured, the backend can rewrite the same factual answer through an LLM for better conversational quality.
- Source-of-truth remains local data and user history, and the endpoint automatically falls back to local responses if the LLM call fails.

Provider notes:

- Gemini is used for external chat enhancement through the Google Generative Language API.
- Key variable aliases are supported for Gemini:
	- `LLM_API_KEY`
	- `GEMINI_API_KEY`
	- `GOOGLE_API_KEY`
