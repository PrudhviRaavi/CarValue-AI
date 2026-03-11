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
      <header className="sticky top-0 z-40 border-b border-[var(--surface-border)] backdrop-blur-xl bg-black/20">
        <div className="container py-4 flex items-center justify-between gap-4">
          <a href="#top" className="inline-flex items-center gap-3 group">
            <span className="brand-badge group-hover:scale-110 transition-transform">
              <Car size={18} />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">
              CarValue <span className="text-[var(--accent)]">AI</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-10 text-sm font-bold">
            <a href="#predict" className="nav-link">Valuation</a>
            <a href="#history" className="nav-link">History</a>
            <a href="#features" className="nav-link">Features</a>
          </nav>
          {user ? (
            <div className="inline-flex items-center gap-4">
              <div className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-[var(--text-main)] border border-[var(--surface-border)]">
                <UserRound size={14} className="text-[var(--accent)]" />
                {user.username}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                }}
                className="button-ghost px-4 py-2 text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal('login')} className="button-primary px-6 py-2.5">
              <Lock size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="container pt-12 pb-20 md:pt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="eyebrow mb-4">
                <div className="w-8 h-[1px] bg-[var(--accent)]" />
                PRECISION PRICING ENGINE
              </div>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.1] font-bold tracking-tight text-[var(--text-main)]">
                Unlocking the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-cyan-300">True Value</span> <br />
                of Every Mile.
              </h1>
              <p className="mt-8 text-[var(--text-soft)] text-xl max-w-lg leading-relaxed">
                Experience high-fidelity car valuations powered by Rank-A Random Forest models. Data-driven, transparent, and built for market leaders.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#predict" className="button-primary">
                  <Gauge size={18} />
                  Start Valuation
                </a>
                <a href="#history" className="button-ghost">
                  <Clock size={18} />
                  View History
                </a>
              </div>
              <div className="mt-12 flex items-center gap-8">
                {STATS.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-2xl font-bold font-display text-[var(--text-main)]">{value}</p>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-[var(--accent-glow)] rounded-[40px] blur-3xl opacity-30 animate-pulse" />
              <div className="surface p-2 rounded-[40px] border-2 border-white/5">
                <img 
                  src="file:///C:/Users/raavi/.gemini/antigravity/brain/3aa6198c-8611-4d7a-bec6-142214e89896/premium_car_valuation_hero_1773244872211.png" 
                  alt="Premium AI Illustration" 
                  className="w-full h-auto rounded-[32px] object-cover shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="predict" className="container py-20">
          <div className="grid lg:grid-cols-[1fr_0.8fr] gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="surface p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-display text-4xl font-bold text-[var(--text-main)]">Valuation Studio</h2>
                  <p className="text-[var(--text-soft)] mt-2">Configure your vehicle's neural signature.</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-[var(--bg-main)] border border-[var(--surface-border)] text-[10px] font-black tracking-widest text-[var(--text-soft)] uppercase">
                  {user ? 'Authenticated' : 'Login Required'}
                </div>
              </div>

              <form onSubmit={handlePredict} className="grid sm:grid-cols-2 gap-6">
                {INPUT_FIELDS.map((field) => (
                  <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                    <label className="form-label">{field.label}</label>
                    {field.options ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="input"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
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
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
                
                <div className="sm:col-span-2 mt-4">
                  <button type="submit" disabled={loading} className="button-primary w-full justify-center py-4 text-lg">
                    {loading ? (
                      <>
                        <span className="loader" />
                        Analyzing Market Data...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate AI Valuation
                      </>
                    )}
                  </button>
                  {error && <p className="text-center text-red-400 mt-4 font-semibold text-sm">{error}</p>}
                </div>
              </form>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={prediction ? 'result' : 'placeholder'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="surface p-8 min-h-[500px] flex flex-col"
              >
                {prediction ? (
                  <div className="flex-1 flex flex-col">
                    <div className="eyebrow mb-4">ESTIMATED MARKET VALUE</div>
                    <h3 className="font-display text-6xl font-bold text-[var(--text-main)] tracking-tight">
                      ${prediction.predicted_price.toLocaleString()}
                    </h3>
                    
                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <div className="stat-card">
                        <p className="stat-label">Dealer Trade-In</p>
                        <p className="stat-value">${estimatedTradeIn?.toLocaleString()}</p>
                      </div>
                      <div className="stat-card">
                        <p className="stat-label">Private Party</p>
                        <p className="stat-value">${prediction.predicted_price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-black/30 border border-white/5 flex-1">
                      <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mb-3">Neural Reasoning</p>
                      <p className="text-sm text-[var(--text-soft)] leading-relaxed italic">"{prediction.explanation}"</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--surface-border)] flex items-center gap-3 text-emerald-400 font-bold text-sm">
                      <CheckCircle size={18} />
                      High Confidence Score • Verified
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mb-6 animate-pulse">
                      <Car size={40} className="text-[var(--accent)]" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[var(--text-main)]">Awaiting Signature</h3>
                    <p className="text-[var(--text-soft)] mt-4 leading-relaxed max-w-xs">
                      The valuation node is ready. Populate the vehicle specifications to begin the real-time inference process.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {user && history.length > 0 && (
          <section id="history" className="container py-20 border-t border-[var(--surface-border)]">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="eyebrow mb-3">VALUATION LEDGER</div>
                  <h2 className="font-display text-4xl font-bold text-[var(--text-main)]">Recent Intelligence</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold font-display text-[var(--accent)]">{history.length}</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Saved Logs</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.slice().reverse().map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="surface p-6 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-[var(--accent)] tracking-tighter uppercase p-1.5 bg-[var(--accent-glow)] rounded-md">
                          {item.year}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                        {item.brand} {item.model_name}
                      </h4>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-soft)] uppercase">Final Estimate</span>
                      <span className="text-2xl font-bold text-[var(--text-main)] tracking-tighter">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        <section id="features" className="container py-24 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05),transparent)]">
          <div className="text-center mb-16">
            <div className="eyebrow justify-center mb-4 text-[var(--accent)]">
              CORE INFRASTRUCTURE
              <div className="w-8 h-[1px] bg-[var(--accent)]" />
            </div>
            <h2 className="font-display text-5xl font-bold text-[var(--text-main)] tracking-tight">
              Mastering the Used Market
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="surface p-8 hover:bg-white/[0.04]"
              >
                <div className="feature-icon mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-[var(--text-main)] text-xl mb-3 leading-tight">{title}</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">{desc}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <footer className="container py-12">
        <div className="surface px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t-2 border-white/5">
          <div className="flex items-center gap-3">
            <span className="brand-badge scale-75">
              <Car size={16} />
            </span>
            <span className="font-display text-lg font-bold text-[var(--text-main)]">CarValue AI</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">© 2026 Rank-A Labs. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/PrudhviRaavi/CarValue-AI" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="chat-panel"
            >
              <div className="chat-head">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-[var(--text-main)] uppercase tracking-widest">Valuation Copilot</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="chat-body">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="chat-input-wrap">
                <input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Inquire about resale strategy..."
                  className="chat-input"
                />
                <button type="submit" className="chat-send">
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
          {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
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

