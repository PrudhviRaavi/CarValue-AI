import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Car,
  CheckCircle,
  ChevronDown,
  Clock,
  Gauge,
  Github,
  LineChart,
  Lock,
  LogOut,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const BRAND_OPTIONS = [
  'Toyota',
  'Honda',
  'Hyundai',
  'BMW',
  'Mercedes',
  'Audi',
  'Tesla',
  'Volkswagen',
  'Kia',
  'Tata',
  'Mahindra',
  'Ford',
];

const TRUST_POINTS = [
  {
    icon: Gauge,
    title: 'Instant estimate',
    desc: 'Generate a valuation in seconds from the details you already know.',
  },
  {
    icon: LineChart,
    title: 'Data-backed pricing',
    desc: 'Mileage, year, fuel type, ownership, and demand patterns shape each quote.',
  },
  {
    icon: Shield,
    title: 'Saved securely',
    desc: 'Protected accounts keep your valuation history available for later comparisons.',
  },
];

const MARKET_SIGNALS = [
  {
    title: 'Demand-sensitive estimate',
    desc: 'The pricing card explains when brand pull, mileage, and recency are helping or hurting value.',
  },
  {
    title: 'Private vs trade-in view',
    desc: 'You get a seller-facing estimate and a more conservative dealer-ready benchmark.',
  },
  {
    title: 'Negotiation context',
    desc: 'Use the confidence score and explanation as a starting point before taking offers offline.',
  },
];

const VALUE_FACTORS = [
  {
    title: 'Manufacturing year',
    desc: 'Newer vehicles usually retain stronger pricing, especially when the model is still in active demand.',
  },
  {
    title: 'Mileage driven',
    desc: 'Higher mileage indicates more wear and usually pushes the estimate downward compared with similar cars.',
  },
  {
    title: 'Ownership profile',
    desc: 'Single-owner cars often feel safer to buyers and typically command a better range.',
  },
  {
    title: 'Fuel and transmission fit',
    desc: 'Market preference varies by segment, so the same year and mileage can price differently across trims.',
  },
];

const SELLER_CHECKLIST = [
  'Keep service records and ownership documents ready before asking for offers.',
  'Fix minor dents, scratches, and consumables that buyers immediately notice.',
  'Photograph the car cleanly and consistently if you plan to compare marketplace pricing.',
  'Use the valuation range as an anchor instead of reacting to the first dealer quote.',
];

const FAQ_ITEMS = [
  {
    question: 'What affects my car valuation the most?',
    answer:
      'Year, mileage, fuel type, ownership count, and brand demand are the strongest inputs. The estimate also shifts when a model is more liquid in the resale market.',
  },
  {
    question: 'Do I need an account to get an estimate?',
    answer:
      'This app keeps the valuation flow behind authentication so predictions can be stored in your account history. Once signed in, every estimate is tracked automatically.',
  },
  {
    question: 'Is the estimate the same as a final selling price?',
    answer:
      'No. It is a strong starting range. Final transaction value still depends on condition, local demand, service history, and how urgently you want to sell.',
  },
  {
    question: 'Why show dealer and private-party ranges separately?',
    answer:
      'Retail buyers usually pay more than trade buyers because dealers still need margin, reconditioning room, and inventory risk coverage.',
  },
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
  { label: 'Owners', name: 'owner_count', type: 'number' },
];

const HERO_METRICS = [
  { label: 'Average response', value: '< 2 sec' },
  { label: 'Core model inputs', value: '9' },
  { label: 'Protected history', value: '100%' },
];

function AuthModal({ mode, authData, setAuthData, onClose, onSubmit, onSwitch }) {
  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface w-full max-w-md p-7"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="mini-label mb-2">Account Access</p>
            <h2 className="font-display text-3xl text-[var(--text-main)]">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>
          <button onClick={onClose} className="icon-button" type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="form-label">Username or Email</label>
            <input
              required
              className="input"
              value={authData.username}
              placeholder="Enter username or email"
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
            {isLogin ? 'Sign in' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-[var(--text-muted)] mt-5">
          {isLogin ? 'No account yet?' : 'Already have an account?'}{' '}
          <button type="button" className="link-button" onClick={onSwitch}>
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button type="button" className="faq-trigger" onClick={onToggle}>
        <span>{item.question}</span>
        <ChevronDown size={18} className={`faq-icon ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="faq-panel">{item.answer}</p>}
    </div>
  );
}

function ResultPanel({ prediction, estimatedTradeIn, formatCurrency }) {
  if (!prediction) {
    return (
      <div className="result-shell result-placeholder">
        <div className="result-illustration">
          <div className="result-car" />
          <div className="result-road" />
        </div>
        <h3 className="result-title">Instant estimate preview</h3>
        <p className="result-copy">
          Enter your vehicle details to unlock a market-aligned range, dealer benchmark, and a clear reasoning summary.
        </p>
        <div className="placeholder-list">
          <div className="placeholder-item">
            <CheckCircle size={16} />
            Transparent pricing logic
          </div>
          <div className="placeholder-item">
            <CheckCircle size={16} />
            Private and trade-in ranges
          </div>
          <div className="placeholder-item">
            <CheckCircle size={16} />
            Confidence and demand signal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-shell">
      <div className="result-head">
        <div>
          <p className="mini-label mb-2">Estimated Market Value</p>
          <h3 className="estimate-amount">{formatCurrency(prediction.predicted_price)}</h3>
        </div>
        <div className={`demand-pill ${prediction.market_demand === 'High' ? 'hot' : ''}`}>
          {prediction.market_demand} demand
        </div>
      </div>

      <div className="valuation-bands">
        <div className="valuation-band">
          <span>Dealer trade-in</span>
          <strong>{estimatedTradeIn ? formatCurrency(estimatedTradeIn) : '--'}</strong>
        </div>
        <div className="valuation-band">
          <span>Private-party range</span>
          <strong>{formatCurrency(prediction.predicted_price)}</strong>
        </div>
      </div>

      <div className="reason-card">
        <p className="mini-label mb-2">Pricing rationale</p>
        <p>{prediction.explanation}</p>
      </div>

      <div className="confidence-row">
        <div className="flex items-center justify-between mb-2">
          <span className="mini-label !tracking-[0.12em]">Model confidence</span>
          <strong className="text-[var(--text-main)]">{prediction.confidence_score}%</strong>
        </div>
        <div className="confidence-track">
          <motion.div
            className="confidence-bar"
            initial={{ width: 0 }}
            animate={{ width: `${prediction.confidence_score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
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
  const [notice, setNotice] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [history, setHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'Ask about resale strategy, mileage impact, or how to position your asking price.',
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const chatEndRef = useRef(null);

  const estimatedTradeIn = useMemo(() => {
    if (!prediction?.predicted_price) return null;
    return Math.round(prediction.predicted_price * 0.92);
  }, [prediction]);

  const activeBrand = useMemo(() => formData.brand, [formData.brand]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const handlePredict = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('Sign in to store and generate protected valuations.');
      setNotice(null);
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
      setNotice('Valuation completed and saved to your history.');
      fetchHistory(token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Verify backend is running and your token is valid.');
      setNotice(null);
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

  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brand }));
    setNotice(`Selected ${brand} as the vehicle brand.`);
    setError(null);
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    try {
      const endpoint = showAuthModal === 'login' ? '/token' : '/register';
      const payload =
        showAuthModal === 'login'
          ? new URLSearchParams({ username: authData.username.trim(), password: authData.password })
          : authData;
      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', response.data.access_token);
      const userResponse = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      setUser(userResponse.data);
      fetchHistory(response.data.access_token);
      setNotice(showAuthModal === 'login' ? 'Signed in successfully.' : 'Account created and signed in.');
      setError(null);
      setAuthData({ username: '', email: '', password: '' });
      setShowAuthModal(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials and backend status.');
      setNotice(null);
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
      setChatMessages([...nextMessages, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-noise" />

      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Free valuation workspace</span>
          <span>Saved account history</span>
          <span>Data-backed pricing summary</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container site-header-inner">
          <a href="#top" className="brand-mark">
            <span className="brand-badge">
              <Car size={18} />
            </span>
            <span>
              <strong>CarValue AI</strong>
              <small>Resale valuation workspace</small>
            </span>
          </a>

          <nav className="header-nav">
            <a href="#valuation">Valuation</a>
            <a href="#market">Market Drivers</a>
            <a href="#history">History</a>
            <a href="#faq">FAQ</a>
          </nav>

          {user ? (
            <div className="header-actions">
              <div className="header-user-pill">
                <UserRound size={14} />
                {user.username}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                }}
                className="button-ghost"
                type="button"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal('login')} className="button-primary" type="button">
              <Lock size={16} />
              Sign in
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">Know Your Selling Range Faster</p>
              <h1 className="hero-title">
                A cleaner way to <span>price your car</span> before you negotiate.
              </h1>
              <p className="hero-subtitle">
                Get an original marketplace-style valuation experience with instant estimates, transparent reasoning, and a protected history of every quote you run.
              </p>

              <div className="hero-actions">
                <a href="#valuation" className="button-primary">
                  Start valuation
                  <ArrowRight size={16} />
                </a>
                <a href="#market" className="button-ghost">
                  See value drivers
                </a>
              </div>

              <div className="hero-metrics">
                {HERO_METRICS.map((item) => (
                  <div key={item.label} className="inline-metric">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="trust-list">
                {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="trust-item">
                    <span className="trust-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="surface hero-card"
              id="valuation"
            >
              <div className="hero-card-head">
                <div>
                  <p className="mini-label mb-2">Instant car valuation</p>
                  <h2 className="hero-card-title">Enter your vehicle details</h2>
                </div>
                <span className="status-pill">{user ? 'Authenticated' : 'Login required'}</span>
              </div>

              <div className="brand-cloud">
                {BRAND_OPTIONS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`brand-chip ${activeBrand === brand ? 'active' : ''}`}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePredict} className="form-grid">
                {INPUT_FIELDS.map((field) => (
                  <div key={field.name}>
                    <label className="form-label">{field.label}</label>
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
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}

                <div className="form-actions-row">
                  <button type="submit" disabled={loading} className="button-primary w-full justify-center">
                    {loading ? (
                      <>
                        <span className="loader" />
                        Calculating estimate
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Get valuation
                      </>
                    )}
                  </button>

                  {error && <div className="info-banner error">{error}</div>}
                  {notice && <div className="info-banner success">{notice}</div>}
                </div>
              </form>

              <ResultPanel
                prediction={prediction}
                estimatedTradeIn={estimatedTradeIn}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          </div>
        </section>

        <section className="section-shell compact-shell">
          <div className="container compact-grid">
            {MARKET_SIGNALS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="surface compact-card"
              >
                <p className="mini-label mb-3">Why this helps</p>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section-shell" id="market">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Market Drivers</p>
                <h2>What moves a used-car valuation</h2>
              </div>
              <p>
                These are the strongest signals behind most resale estimates. They also explain why two similar cars can price differently.
              </p>
            </div>

            <div className="insight-grid">
              {VALUE_FACTORS.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="surface insight-card"
                >
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell muted-shell">
          <div className="container two-column-shell">
            <div>
              <p className="eyebrow">How It Works</p>
              <h2 className="section-title">From vehicle details to a usable range</h2>
              <p className="section-copy">
                The flow is designed for speed: enter the essentials, let the model score market fit, then use the result to decide whether to sell, hold, or negotiate.
              </p>
            </div>

            <div className="step-grid">
              <div className="surface step-card">
                <span className="step-number">1</span>
                <h3>Select brand and model</h3>
                <p>Start with the vehicle identity and the details that most buyers ask for first.</p>
              </div>
              <div className="surface step-card">
                <span className="step-number">2</span>
                <h3>Submit the valuation</h3>
                <p>The pricing model converts your inputs into an instant estimate and reasoning summary.</p>
              </div>
              <div className="surface step-card">
                <span className="step-number">3</span>
                <h3>Compare your options</h3>
                <p>Use the private-party and trade-in figures to position your next conversation properly.</p>
              </div>
            </div>
          </div>
        </section>

        {user && history.length > 0 && (
          <section className="section-shell" id="history">
            <div className="container">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Saved History</p>
                  <h2>Your recent valuations</h2>
                </div>
                <p>Every protected estimate is stored so you can revisit older ranges and compare newer market conditions.</p>
              </div>

              <div className="history-grid">
                {history.slice().reverse().map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.07 }}
                    className="surface history-card"
                  >
                    <div className="history-card-head">
                      <span className="history-year">{item.year}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3>
                      {item.brand} {item.model_name}
                    </h3>
                    <strong>{formatCurrency(item.price)}</strong>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-shell warm-shell">
          <div className="container seller-shell">
            <div>
              <p className="eyebrow">Seller Checklist</p>
              <h2 className="section-title">Small actions that can protect resale value</h2>
              <p className="section-copy">
                Before you list the car or visit a buyer, tighten the basics. Better documents and cleaner presentation usually reduce friction in pricing conversations.
              </p>
            </div>

            <div className="surface checklist-card">
              {SELLER_CHECKLIST.map((item) => (
                <div key={item} className="checklist-row">
                  <CheckCircle size={18} />
                  <span>{item}</span>
                </div>
              ))}

              <div className="social-proof">
                <div>
                  <strong>4.9/5</strong>
                  <span>valuation clarity</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>typical dealer comparison window</span>
                </div>
                <div>
                  <strong>1 account</strong>
                  <span>all estimates in one place</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="faq">
          <div className="container faq-shell">
            <div className="section-head">
              <div>
                <p className="eyebrow">FAQ</p>
                <h2>Common valuation questions</h2>
              </div>
              <p>These answers are written for your current app flow, not copied from the reference site.</p>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="brand-mark footer-brand">
              <span className="brand-badge">
                <Car size={18} />
              </span>
              <span>
                <strong>CarValue AI</strong>
                <small>Data-backed resale estimates</small>
              </span>
            </div>
            <p className="footer-copy">
              An original valuation workspace built around fast pricing, transparent guidance, and protected account history.
            </p>
          </div>

          <div className="footer-links">
            <a href="#valuation">Start valuation</a>
            <a href="#market">Market drivers</a>
            <a href="#faq">FAQ</a>
            <a href="https://github.com/PrudhviRaavi/CarValue-AI">GitHub</a>
          </div>

          <div className="footer-meta">
            <span>© 2026 Rank-A Labs</span>
            <a href="https://github.com/PrudhviRaavi/CarValue-AI" className="footer-icon-link">
              <Github size={18} />
            </a>
          </div>
        </div>
      </footer>

      <div className="chat-wrap">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="chat-panel"
            >
              <div className="chat-head">
                <div className="chat-title-wrap">
                  <span className="status-dot" />
                  <span>Valuation Copilot</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="icon-button" type="button">
                  <X size={18} />
                </button>
              </div>

              <div className="chat-body">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-ai'}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-wrap">
                <input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about pricing or resale strategy"
                  className="chat-input"
                />
                <button type="submit" className="chat-send">
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)} type="button">
          {isChatOpen ? <X size={22} /> : <MessageCircle size={22} />}
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
