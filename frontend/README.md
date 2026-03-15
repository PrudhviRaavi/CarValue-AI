# Frontend (React + Vite)

This folder contains the CarValue AI client application.

## What is in this app

- Public landing experience for new users
- Dedicated auth screen for sign up and sign in
- Logged-in dashboard with valuation history and key metrics
- Valuation workspace form and result cards
- In-app assistant panel connected to backend `/chat`

## Tech Stack

- React 19
- Vite 7
- Framer Motion
- Axios
- Lucide React icons

## Scripts

From `frontend/`:

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview built bundle:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## API Connection

The app uses Vite env config for backend API URL.

Create `frontend/.env` (or copy from `.env.example`) and set:

`VITE_API_BASE_URL=http://127.0.0.1:8000`

If this value is not set, the app falls back to `http://localhost:8000`.

## Key Files

- `src/App.jsx`: primary UI flow and API integration logic
- `src/index.css`: visual system and responsive layout styling
- `src/components/`: reusable visual components

## Troubleshooting

- If login or signup fails in browser, ensure backend is running on port `8000`.
- If CORS issues appear, verify backend includes local origin regex support.
- If the UI appears blank, run `npm run build` to catch compile-time errors.
