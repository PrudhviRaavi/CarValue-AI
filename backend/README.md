# Backend (FastAPI)

This folder contains the CarValue AI API server.

## Responsibilities

- User registration and login using JWT tokens
- Protected valuation endpoint (`/predict`)
- User-specific prediction history (`/predictions`)
- Lightweight chat helper endpoint (`/chat`)
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

Create a local `.env` in `backend/` if needed.

## Notes

- CORS is configured for `localhost` and `127.0.0.1` development origins across ports.
- ML artifacts are loaded from `../ml/model.pkl` and `../ml/encoders.pkl`.
- Password hashing uses `pbkdf2_sha256` by default with legacy bcrypt verification support.
