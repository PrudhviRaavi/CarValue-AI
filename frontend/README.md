# <p align="center">🎨 Frontend | REACT + VITE Workspace</p>

---

## 🌟 Overview
The frontend folder contains the **CarValue AI client application**, a modern Single Page Application (SPA) designed with a focus on immersive aesthetics and fluid user workflows.

---

## 🚀 Key Modules
- **🏠 Landing Page**: Public-facing conversion page with feature highlights and branding.
- **🔐 Auth Gateway**: Secure registration and login portal with JWT session management.
- **📊 Analytics Dashboard**: A personalized command center for tracking valuation trends and history.
- **🚗 Valuation Lab**: Interactive multi-step form for generating real-time car appraisals.
- **💬 Assistant Panel**: Collapsible drawer for interacting with the data-grounded AI copilot.

---

## 🛠️ Technology Stack
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS3 + Modern Design Tokens (Glassmorphism)
- **Animations**: Framer Motion for tactile feedback.
- **Icons**: Lucide React.
- **HTTP Client**: Axios for backend synchronization.

---

## 🔧 Scripts & Development

### **1. Dependencies**
```bash
npm install
```

### **2. Development Mode**
```bash
npm run dev
```
👉 **Preview**: [http://127.0.0.1:5173](http://127.0.0.1:5173)

### **3. Production Deployment**
```bash
# Generate optimized assets
npm run build
# Preview build locally
npm run preview
```

---

## 🔑 Connection Settings
The client connects to the backend using environment variables (`.env.production` or `.env`):
- `VITE_API_BASE_URL`: The URL of your live Render backend (e.g., `https://carvalue-api.onrender.com`).

---

## 📄 License
This module is part of the CarValue AI project and is licensed under the **MIT License**.
