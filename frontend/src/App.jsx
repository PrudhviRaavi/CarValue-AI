import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Car, Search, TrendingUp, Info, CheckCircle, Gauge, Fuel, User,
  MessageCircle, X, Send, Shield, Zap, ArrowRight, BarChart3,
  MapPin, Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CarScene from './components/CarScene';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';

gsap.registerPlugin(ScrollTrigger);
const API_BASE = 'http://localhost:8000';

const FEATURES = [
  { icon: BarChart3, title: 'AI Market Prediction', desc: 'Advanced ML models analyze real-time market data' },
  { icon: Zap, title: 'Instant Valuation', desc: 'Get your car value in seconds, not days' },
  { icon: Shield, title: 'Secure Data', desc: 'Your data is encrypted and never shared' },
  { icon: TrendingUp, title: 'Real Transaction Insights', desc: 'Based on 10,000+ actual sales' },
  { icon: BarChart3, title: 'Smart Price Trends', desc: 'See how market trends affect your car' },
  { icon: Car, title: 'Dealer Comparison', desc: 'Compare trade-in vs private sale values' },
];

const STEPS = [
  { num: '01', title: 'Enter Vehicle Details', desc: 'Add your car make, model, year, mileage and more' },
  { num: '02', title: 'AI Analyzes Market Data', desc: 'Our AI processes thousands of real transactions' },
  { num: '03', title: 'Get Instant Valuation', desc: 'Receive your accurate market value instantly' },
];

const MAP_REGIONS = [
  { name: 'North', value: '$28,500', color: 'from-cyan-500/20 to-cyan-500/5' },
  { name: 'South', value: '$32,100', color: 'from-purple-500/20 to-purple-500/5' },
  { name: 'East', value: '$29,800', color: 'from-cyan-500/20 to-cyan-500/5' },
  { name: 'West', value: '$31,200', color: 'from-purple-500/20 to-purple-500/5' },
];

function AnimatedCounter({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => setCount(Math.round(obj.val)),
      });
    }, el);
    return () => ctx.revert();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Toyota', model_name: 'Camry', year: 2020, engine_size: 2.5,
    fuel_type: 'Petrol', transmission: 'Automatic', mileage: 30000,
    doors: 4, owner_count: 1
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m your CarValue AI assistant. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data)).catch(() => localStorage.removeItem('token'));
    }
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    gsap.fromTo(heroRef.current?.querySelectorAll('[data-animate]') || [], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
    gsap.fromTo(featuresRef.current?.querySelectorAll('.feature-card') || [], { y: 60, opacity: 0 }, { scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' }, y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
    gsap.fromTo(stepsRef.current?.querySelectorAll('.step-item') || [], { x: -30, opacity: 0 }, { scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' }, x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' });
  }, [loaded]);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const headers = user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {};
      const res = await axios.post(`${API_BASE}/predict`, formData, { headers });
      setPrediction(res.data);
      gsap.fromTo('#result-card', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' });
    } catch (err) {
      setError('Unable to reach AI engine. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'mileage', 'doors', 'owner_count'].includes(name) ? parseInt(value) || 0 : name === 'engine_size' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = showAuthModal === 'login' ? '/token' : '/register';
      const payload = showAuthModal === 'login' ? new URLSearchParams({ username: authData.username, password: authData.password }) : authData;
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.access_token);
      const userRes = await axios.get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${res.data.access_token}` } });
      setUser(userRes.data);
      setShowAuthModal(null);
    } catch (err) {
      alert('Authentication failed. Please check your credentials.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    const newMsgs = [...chatMessages, { role: 'user', text: currentMessage }];
    setChatMessages(newMsgs);
    setCurrentMessage('');
    try {
      const res = await axios.post(`${API_BASE}/chat`, { message: currentMessage });
      setChatMessages([...newMsgs, { role: 'ai', text: res.data.reply }]);
    } catch {
      setChatMessages([...newMsgs, { role: 'ai', text: "Sorry, I'm having trouble connecting." }]);
    }
  };

  const AuthModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#E2E8F0]">{showAuthModal === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <button onClick={() => setShowAuthModal(null)} className="p-2 text-slate-400 hover:text-white rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Username</label>
            <input required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30 outline-none" value={authData.username} onChange={e => setAuthData({ ...authData, username: e.target.value })} />
          </div>
          {showAuthModal === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30 outline-none" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <input type="password" required className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30 outline-none" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-[#020617] font-semibold hover:opacity-90 transition-opacity">
            {showAuthModal === 'login' ? 'Sign In' : 'Register'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          {showAuthModal === 'login' ? "Don't have an account?" : 'Already a member?'}
          <button className="text-[#00E5FF] hover:underline ml-1 font-medium" onClick={() => setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login')}>
            {showAuthModal === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );

  return (
    <>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}</AnimatePresence>

      <div className="min-h-screen bg-[#020617] text-[#E2E8F0]">
        <CustomCursor />

        {/* Navbar */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'glass py-3' : 'py-5 bg-transparent'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">CarValue AI</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              {['Home', 'Get Value', 'How It Works', 'Dashboard'].map((link, i) => (
                <a key={link} href={link === 'Get Value' ? '#form' : link === 'How It Works' ? '#how' : '#'} className="relative group hover:text-[#00E5FF] transition-colors">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00E5FF] group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{user.username}</span>
                <button onClick={() => { localStorage.removeItem('token'); setUser(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors">Sign Out</button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal('login')} className="px-4 py-2 text-sm font-semibold text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors">
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Hero */}
        <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
              <Suspense fallback={null}><CarScene /></Suspense>
            </Canvas>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/50 to-[#020617]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.08)_0%,_transparent_70%)]" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.p data-animate className="text-sm font-semibold text-[#00E5FF] uppercase tracking-widest mb-4">AI-Powered Car Valuation</motion.p>
              <motion.h1 data-animate className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Know the true market value of your car
                <br />
                <span className="gradient-text">instantly using AI</span>
              </motion.h1>
              <motion.p data-animate className="text-lg text-slate-400 max-w-lg mb-10">
                Real market data. 10,000+ transactions. Get your accurate valuation in seconds.
              </motion.p>
              <motion.div data-animate className="flex flex-wrap gap-4">
                <a href="#form" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-[#020617] font-semibold shadow-lg shadow-[#00E5FF]/30 hover:shadow-[#00E5FF]/50 transition-all">
                  Get My Car Value <ArrowRight size={20} />
                </a>
                <a href="#how" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-[#E2E8F0] font-semibold hover:border-[#00E5FF]/50 transition-all">
                  See How It Works
                </a>
              </motion.div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] hidden lg:block">
              <div className="absolute inset-0 rounded-2xl overflow-hidden glass border border-white/10">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                  <Suspense fallback={null}><CarScene /></Suspense>
                </Canvas>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-16">Why CarValue AI</motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  className="feature-card glass-card rounded-2xl p-6 hover:border-[#00E5FF]/30 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#7C3AED]/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#00E5FF]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section ref={stepsRef} id="how" className="py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-16">How It Works</motion.h2>
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <div key={step.num} className="step-item flex gap-6 items-start relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] flex items-center justify-center font-bold text-[#020617] shrink-0">{step.num}</div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{step.title}</h3>
                    <p className="text-slate-400">{step.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-7 top-14 w-0.5 h-16 bg-gradient-to-b from-[#00E5FF] to-[#7C3AED]/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Result */}
        <section id="form" className="py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-white/5">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Search className="text-[#00E5FF]" size={20} />
                      Vehicle Details
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">Get your estimate in under a minute</p>
                  </div>
                  <form onSubmit={handlePredict} className="p-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Brand', name: 'brand' },
                        { label: 'Model', name: 'model_name' },
                        { label: 'Year', name: 'year', type: 'number' },
                        { label: 'Mileage (mi)', name: 'mileage', type: 'number' },
                        { label: 'Engine (L)', name: 'engine_size', type: 'number', step: '0.1' },
                        { label: 'Fuel', name: 'fuel_type', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
                        { label: 'Transmission', name: 'transmission', options: ['Manual', 'Automatic', 'Semi-Automatic'] },
                        { label: 'Doors', name: 'doors', type: 'number' },
                        { label: 'Owners', name: 'owner_count', type: 'number' }
                      ].map(field => (
                        <div key={field.name} className="space-y-1.5">
                          <label className="block text-sm font-medium text-slate-400">{field.label}</label>
                          {field.options ? (
                            <select name={field.name} value={formData[field.name]} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30 outline-none">
                              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input name={field.name} type={field.type || 'text'} step={field.step} value={formData[field.name]} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/30 outline-none" placeholder={field.label} />
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="submit" disabled={loading} className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-[#020617] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity">
                      {loading ? <><div className="w-5 h-5 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin" /> Analyzing...</> : <><Gauge size={20} /> Get My Car Value</>}
                    </button>
                    {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {prediction ? (
                    <motion.div id="result-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card rounded-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] px-6 py-5">
                        <p className="text-white/80 text-sm font-medium">Estimated Value</p>
                        <p className="text-3xl font-bold text-white mt-1">${prediction.predicted_price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2 text-white/90 text-sm"><CheckCircle size={16} /> 95% Confidence</div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Trade-in</p>
                            <p className="text-lg font-bold">${(prediction.predicted_price * 0.92).toLocaleString()}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Private</p>
                            <p className="text-lg font-bold">${prediction.predicted_price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex gap-3">
                            <Info className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-300 leading-relaxed">{prediction.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl border-2 border-dashed border-white/10 p-12 flex flex-col items-center justify-center text-center min-h-[320px]">
                      <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
                      <h3 className="font-semibold mb-1">Your valuation awaits</h3>
                      <p className="text-sm text-slate-500">Enter your vehicle details above</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Trust stats */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="glass-card rounded-2xl p-8">
                <p className="text-4xl font-bold gradient-text mb-2"><AnimatedCounter end={10000} />+</p>
                <p className="text-slate-400">Real transactions</p>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <p className="text-4xl font-bold gradient-text mb-2">95%</p>
                <p className="text-slate-400">Accuracy</p>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <p className="text-4xl font-bold gradient-text mb-2"><AnimatedCounter end={5000} />+</p>
                <p className="text-slate-400">Users</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-4">Prices by Region</motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-slate-400 text-center mb-12">Average car values across regions</motion.p>
            <div className="grid grid-cols-2 gap-4">
              {MAP_REGIONS.map((r, i) => (
                <motion.div key={r.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${r.color} border border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#00E5FF]" />
                    <span className="font-semibold">{r.name}</span>
                  </div>
                  <span className="text-[#00E5FF] font-bold">{r.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#00E5FF]" />
                <span className="font-bold">CarValue AI</span>
              </div>
              <div className="flex gap-8 text-sm text-slate-400">
                <a href="#" className="hover:text-[#00E5FF] transition-colors">About</a>
                <a href="#" className="hover:text-[#00E5FF] transition-colors">Contact</a>
                <a href="#" className="hover:text-[#00E5FF] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[#00E5FF] transition-colors flex items-center gap-1"><Github size={16} /> Github</a>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">© 2026 CarValue AI</p>
          </div>
        </footer>

        {/* Chat */}
        <div className="fixed bottom-6 right-6 z-40">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-14 right-0 w-[340px] max-w-[calc(100vw-3rem)] h-[420px] glass-card rounded-2xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] flex items-center justify-between">
                  <span className="font-semibold text-[#020617]">AI Assistant</span>
                  <button onClick={() => setIsChatOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#020617]/50">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-[#020617]' : 'bg-white/5 border border-white/10'}`}>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} placeholder="Ask about car values..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-[#00E5FF]" />
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#00E5FF] text-[#020617]"><Send size={18} /></button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] text-[#020617] shadow-lg shadow-[#00E5FF]/30 flex items-center justify-center">
            {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </button>
        </div>

        {showAuthModal && <AuthModal />}
      </div>
    </>
  );
};

export default App;
