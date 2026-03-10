import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Brain,
  Car,
  CheckCircle,
  Clock,
  Gauge,
  Github,
  LineChart,
  Lock,
  LogOut,
  MessageCircle,
  Search,
  Send,
  Shield,
  Sparkles,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
const API_BASE = 'http://localhost:8000';
const FEATURES = [
  {
    icon: Brain,
    title: 'Learning-Based Pricing',
    desc: 'Random Forest models trained on real listings estimate market-aligned values.',
  },
  {
    icon: Zap,
    title: 'Fast Estimate Flow',
    desc: 'Get a valuation in seconds with no manual spreadsheet work.',
  },
  {
    icon: Shield,
    title: 'Secure Account Access',
    desc: 'JWT-based authentication protects predictions and user data endpoints.',
  },
  {
    icon: LineChart,
    title: 'Market-Aware Logic',
    desc: 'Mileage, model year, fuel, and ownership patterns all influence estimates.',
  },
];
const STEPS = [
  {
    num: '01',
    title: 'Add Vehicle Profile',
    desc: 'Enter key specifications like model year, engine size, mileage, and fuel type.',
  },
  {
    num: '02',
    title: 'Run AI Valuation',
    desc: 'CarValue AI transforms features to model-ready format and predicts instantly.',
  },
  {
    num: '03',
    title: 'Use Pricing Insight',
    desc: 'Compare private-sale and trade-in targets before negotiation.',
  },
];
const STATS = [
  { label: 'Model Inputs', value: '9', icon: Search },
  { label: 'Typical Response', value: '< 2 sec', icon: Clock },
  { label: 'Auth Protected', value: '100%', icon: Lock },
];
const INPUT_FIELDS = [
  { label: 'Brand', name: 'brand', type: 'text' },
  { label: 'Model', name: 'model_name', type: 'text' },
  { label: 'Year', name: 'year', type: 'number' },
  { label: 'Mileage (mi)', name: 'mileage', type: 'number' },
  { label: 'Engine (L)', name: 'engine_size', type: 'number', step: '0.1' },
  { label: 'Fuel Type', name: 'fuel_type', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
  { label: 'Transmission', name: 'transmission', options: ['Manual', 'Automatic', 'Semi-Automatic'] },
  { label: 'Doors', name: 'doors', type: 'number' },
  { label: 'Owners', name: 'owner_count', type: 'number', full: true },
];
function AuthModal({ mode, authData, setAuthData, onClose, onSubmit, onSwitch }) {
  const isLogin = mode === 'login';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1b1a1a]/65 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface w-full max-w-md rounded-[24px] p-7"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-[var(--text-main)]">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-black/5">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="form-label">Username</label>
            <input
              required
              className="input"
              value={authData.username}
              onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
            />
          </div>
          {!isLogin && (
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={authData.password}
              onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="button-primary w-full justify-center">
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-[var(--text-muted)] mt-5">
          {isLogin ? 'No account yet?' : 'Already have an account?'}{' '}
          <button type="button" className="font-semibold text-[var(--accent)] hover:underline" onClick={onSwitch}>
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
function App() {
  const [formData, setFormData] = useState({
    brand: 'Toyota',
    model_name: 'Camry',
    year: 2020,
    engine_size: 2.5,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    mileage: 30000,
    doors: 4,
    owner_count: 1,
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'Hi, I am your CarValue AI copilot. Ask me about valuation, mileage impact, or selling strategy.',
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef(null);
  const estimatedTradeIn = useMemo(() => {
    if (!prediction?.predicted_price) return null;
    return Math.round(prediction.predicted_price * 0.92);
  }, [prediction]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data);
          fetchHistory(token);
        })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const fetchHistory = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/predictions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  const handlePredict = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('Sign in to run protected predictions.');
      setShowAuthModal('login');
      return;
    }
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_BASE}/predict`, formData, { headers });
      setPrediction(response.data);
      fetchHistory(token);
    } catch {
      setError('Prediction failed. Verify backend is running and your token is valid.');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'mileage', 'doors', 'owner_count'].includes(name)
        ? parseInt(value, 10) || 0
        : name === 'engine_size'
          ? parseFloat(value) || 0
          : value,
    }));
  };
  const handleAuth = async (event) => {
    event.preventDefault();
    try {
      const endpoint = showAuthModal === 'login' ? '/token' : '/register';
      const payload =
        showAuthModal === 'login'
          ? new URLSearchParams({ username: authData.username, password: authData.password })
          : authData;
      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', response.data.access_token);
      const userResponse = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      setUser(userResponse.data);
      setAuthData({ username: '', email: '', password: '' });
      setShowAuthModal(null);
    } catch {
      alert('Authentication failed. Please check your credentials and backend status.');
    }
  };
  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!currentMessage.trim()) return;
    const nextMessages = [...chatMessages, { role: 'user', text: currentMessage }];
    setChatMessages(nextMessages);
    setCurrentMessage('');
    try {
      const response = await axios.post(`${API_BASE}/chat`, { message: currentMessage });
      setChatMessages([...nextMessages, { role: 'ai', text: response.data.reply }]);
    } catch {
      setChatMessages([...nextMessages, { role: 'ai', text: "Sorry, I'm having trouble connecting." }]);
    }
  };
  return (
    <div className="app-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <header className="sticky top-0 z-40 border-b border-black/5 backdrop-blur-md bg-[var(--bg-soft)]/70">
        <div className="container py-4 flex items-center justify-between gap-4">
          <a href="#top" className="inline-flex items-center gap-3">
            <span className="brand-badge">
              <Car size={16} />
            </span>
            <span className="font-display text-xl text-[var(--text-main)]">CarValue AI</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-muted)] font-semibold">
            <a href="#predict" className="nav-link">Valuation</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#flow" className="nav-link">Process</a>
          </nav>
          {user ? (
            <div className="inline-flex items-center gap-3">
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-[var(--text-main)] border border-black/10">
                <UserRound size={14} />
                {user.username}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                }}
                className="button-ghost"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal('login')} className="button-primary">
              <Lock size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>
      <main id="top">
        <section className="container pt-14 pb-12 md:pt-20">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="surface hero-panel"
            >
              <p className="eyebrow">AI CAR PRICING WORKBENCH</p>
              <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-[var(--text-main)] mt-2">
                Confident pricing,
                <br />
                without guesswork.
              </h1>
              <p className="mt-5 text-[var(--text-soft)] text-lg max-w-xl">
                A cleaner way to value used cars with model-backed insight, quick market context,
                and a protected prediction API.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#predict" className="button-primary">
                  <Gauge size={17} />
                  Start Valuation
                </a>
                {!user && (
                  <button onClick={() => setShowAuthModal('register')} className="button-ghost">
                    <Sparkles size={17} />
                    Create Free Account
                  </button>
                )}
              </div>
            </motion.div>
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="surface p-6"
            >
              <h2 className="font-display text-2xl text-[var(--text-main)] mb-4">At A Glance</h2>
              <div className="space-y-3">
                {STATS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="metric-row">
                    <span className="metric-icon"><Icon size={16} /></span>
                    <span className="metric-label">{label}</span>
                    <span className="metric-value">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
                <p className="text-sm text-[var(--text-muted)]">Best for</p>
                <p className="mt-1 text-[var(--text-main)] font-semibold">
                  Owners preparing to sell, buy-side comparison, and initial dealer negotiation.
                </p>
              </div>
            </motion.aside>
          </div>
        </section>
        <section id="predict" className="container pb-14 md:pb-18">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="surface p-6 md:p-8"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display text-3xl text-[var(--text-main)]">Valuation Studio</h2>
                  <p className="text-[var(--text-muted)] mt-1">
                    Add your vehicle profile and run a protected prediction.
                  </p>
                </div>
                <span className="hidden sm:inline-flex rounded-full px-3 py-1.5 bg-[var(--paper)] border border-black/10 text-xs font-bold tracking-wide text-[var(--text-soft)]">
                  {user ? 'SIGNED IN' : 'AUTH REQUIRED'}
                </span>
              </div>
              <form onSubmit={handlePredict} className="grid sm:grid-cols-2 gap-4">
                {INPUT_FIELDS.map((field) => (
                  <label key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                    <span className="form-label">{field.label}</span>
                    {field.options ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="input"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type || 'text'}
                        step={field.step}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="input"
                      />
                    )}
                  </label>
                ))}
                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 mt-1">
                  <button type="submit" disabled={loading} className="button-primary justify-center sm:min-w-[220px]">
                    {loading ? (
                      <>
                        <span className="loader" />
                        Running Model...
                      </>
                    ) : (
                      <>
                        <Search size={17} />
                        Predict Price
                      </>
                    )}
                  </button>
                  {!user && (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal('login')}
                      className="button-ghost justify-center"
                    >
                      <Lock size={16} />
                      Sign In To Unlock
                    </button>
                  )}
                </div>
                {error && <p className="sm:col-span-2 text-sm text-red-600 mt-1">{error}</p>}
              </form>
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={prediction ? 'result' : 'placeholder'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
                className="surface p-6 md:p-7"
              >
                {prediction ? (
                  <>
                    <p className="eyebrow">PREDICTION RESULT</p>
                    <h3 className="font-display text-4xl md:text-5xl text-[var(--text-main)] mt-2">
                      ${prediction.predicted_price.toLocaleString()}
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="stat-card">
                        <p className="stat-label">Trade-In</p>
                        <p className="stat-value">${estimatedTradeIn?.toLocaleString()}</p>
                      </div>
                      <div className="stat-card">
                        <p className="stat-label">Private Sale</p>
                        <p className="stat-value">${prediction.predicted_price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
                      <p className="text-sm uppercase tracking-wide text-[var(--text-muted)] font-semibold">
                        Explanation
                      </p>
                      <p className="text-[var(--text-soft)] mt-2 leading-relaxed">{prediction.explanation}</p>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--ok)] font-semibold">
                      <CheckCircle size={16} />
                      AI estimate generated successfully
                    </div>
                  </>
                ) : (
                  <div className="min-h-[270px] flex flex-col justify-center">
                    <p className="eyebrow">WAITING FOR INPUT</p>
                    <h3 className="font-display text-3xl text-[var(--text-main)] mt-2">Ready to price your car</h3>
                    <p className="text-[var(--text-muted)] mt-3 leading-relaxed">
                      Enter details on the left and run prediction. This panel will show your final
                      estimate with valuation context.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 text-[var(--accent)] font-semibold">
                      <ArrowRight size={16} />
                      Fill the form to continue
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {user && history.length > 0 && (
          <section id="history" className="container pb-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="surface p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-3xl text-[var(--text-main)]">Recent Valuations</h2>
                  <p className="text-[var(--text-muted)] mt-1">Your previous AI car value estimates.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                  <Clock size={16} />
                  {history.length} Saved
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.slice().reverse().map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="stat-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          {item.year} {item.brand}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-main)] mt-1">{item.model_name}</h4>
                    </div>
                    <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Estimate</span>
                      <span className="text-xl font-bold text-[var(--text-main)]">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}
        <section id="features" className="container pb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-8"
          >
            <p className="eyebrow">PLATFORM BENEFITS</p>
            <h2 className="font-display text-3xl md:text-4xl text-[var(--text-main)] mt-2">
              Built for practical decisions
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.07 }}
                className="surface p-5"
              >
                <span className="feature-icon">
                  <Icon size={18} />
                </span>
                <h3 className="font-semibold text-[var(--text-main)] text-lg mt-4">{title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{desc}</p>
              </motion.article>
            ))}
          </div>
        </section>
        <section id="flow" className="container pb-16">
          <div className="surface p-6 md:p-8">
            <p className="eyebrow">VALUATION FLOW</p>
            <h2 className="font-display text-3xl md:text-4xl text-[var(--text-main)] mt-2 mb-6">
              How pricing happens
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="step-card"
                >
                  <span className="step-number">{step.num}</span>
                  <h3 className="text-[var(--text-main)] font-semibold text-lg mt-3">{step.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="container pb-10 pt-4">
        <div className="surface px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-muted)]"> 2026 CarValue AI</p>
          <a
            href="https://github.com/PrudhviRaavi/CarValue-AI"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-soft)] hover:text-[var(--text-main)]"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} />
            View Repository
          </a>
        </div>
      </footer>
      <div className="fixed bottom-5 right-5 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="chat-panel"
            >
              <div className="chat-head">
                <div className="inline-flex items-center gap-2 font-semibold text-[var(--text-main)]">
                  <Bot size={16} />
                  AI Assistant
                </div>
                <button onClick={() => setIsChatOpen(false)} className="rounded-lg p-1.5 hover:bg-black/5">
                  <X size={16} />
                </button>
              </div>
              <div className="chat-body">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <p className={`chat-bubble ${message.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                      {message.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="chat-input-wrap">
                <input
                  value={currentMessage}
                  onChange={(event) => setCurrentMessage(event.target.value)}
                  placeholder="Ask about resale strategy..."
                  className="chat-input"
                />
                <button type="submit" className="chat-send">
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="chat-fab" onClick={() => setIsChatOpen((open) => !open)}>
          {isChatOpen ? <X size={20} /> : <MessageCircle size={20} />}
        </button>
      </div>
      {showAuthModal && (
        <AuthModal
          mode={showAuthModal}
          authData={authData}
          setAuthData={setAuthData}
          onClose={() => setShowAuthModal(null)}
          onSubmit={handleAuth}
          onSwitch={() => setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login')}
        />
      )}
    </div>
  );
}
export default App;

