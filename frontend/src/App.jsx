import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, Search, TrendingUp, Info, AlertTriangle, CheckCircle, 
  ChevronRight, Gauge, Fuel, User, Settings, LogIn, UserPlus, 
  MessageCircle, X, Send, LogOut, LayoutDashboard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const App = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    brand: 'Toyota',
    model_name: 'Camry',
    year: 2020,
    engine_size: 2.5,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    mileage: 30000,
    doors: 4,
    owner_count: 1
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login' or 'register'
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your CarValue AI assistant. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- HANDLERS ---
  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {};
      const response = await axios.post(`${API_BASE}/predict`, formData, { headers });
      setPrediction(response.data);
    } catch (err) {
      setError("Unable to reach AI engine. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'mileage', 'doors', 'owner_count'].includes(name) 
        ? parseInt(value) || 0 
        : name === 'engine_size' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = showAuthModal === 'login' ? '/token' : '/register';
      let payload;
      
      if (showAuthModal === 'login') {
        const params = new URLSearchParams();
        params.append('username', authData.username);
        params.append('password', authData.password);
        payload = params;
      } else {
        payload = authData;
      }

      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.access_token);
      
      const userRes = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      setUser(userRes.data);
      setShowAuthModal(null);
    } catch (err) {
      alert("Authentication failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
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
      setChatMessages([...newMsgs, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

  // --- RENDER HELPERS ---
  const AuthModal = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative"
      >
        <button onClick={() => setShowAuthModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {showAuthModal === 'login' ? <LogIn className="text-premium-accent" /> : <UserPlus className="text-premium-accent" />}
          {showAuthModal === 'login' ? 'Welcome Back' : 'Create Premium Account'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest">Username</label>
            <input 
              required className="input-field w-full mt-1" 
              value={authData.username} 
              onChange={e => setAuthData({...authData, username: e.target.value})} 
            />
          </div>
          {showAuthModal === 'register' && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest">Email</label>
              <input 
                type="email" required className="input-field w-full mt-1" 
                value={authData.email} 
                onChange={e => setAuthData({...authData, email: e.target.value})} 
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest">Password</label>
            <input 
              type="password" required className="input-field w-full mt-1" 
              value={authData.password} 
              onChange={e => setAuthData({...authData, password: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-6">
            {showAuthModal === 'login' ? 'Sign In' : 'Register Now'}
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-400">
          {showAuthModal === 'login' ? "Don't have an account?" : "Already a member?"}
          <button 
            className="text-premium-accent ml-2 hover:underline"
            onClick={() => setShowAuthModal(showAuthModal === 'login' ? 'register' : 'login')}
          >
            {showAuthModal === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-premium-accent p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Car className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            CarValue AI
          </h1>
        </div>
        
        <nav className="hidden lg:flex gap-10 text-sm font-semibold text-gray-400">
          <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><LayoutDashboard size={16}/> Dashboard</a>
          <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><TrendingUp size={16}/> Trends</a>
          <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><Settings size={16}/> Settings</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold">{user.username}</p>
                <p className="text-[10px] text-premium-accent uppercase">Pro Member</p>
              </div>
              <button onClick={handleLogout} className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-all">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal('login')}
              className="px-6 py-2 bg-premium-accent/10 hover:bg-premium-accent text-premium-accent hover:text-white border border-premium-accent/20 rounded-lg font-bold transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Form Section */}
        <section className="lg:col-span-7">
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="glass-card p-8">
            <div className="flex items-center gap-2 mb-8 text-premium-accent">
              <Search size={22} />
              <h2 className="text-2xl font-bold">Predict Valuation</h2>
            </div>
            
            <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Brand', name: 'brand' },
                { label: 'Model', name: 'model_name' },
                { label: 'Year', name: 'year', type: 'number' },
                { label: 'Mileage (mi)', name: 'mileage', type: 'number' },
                { label: 'Engine Size (L)', name: 'engine_size', type: 'number', step: '0.1' },
                { label: 'Fuel', name: 'fuel_type', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric'] },
                { label: 'Transmission', name: 'transmission', options: ['Manual', 'Automatic', 'Semi-Automatic'] },
                { label: 'Prev. Owners', name: 'owner_count', type: 'number' }
              ].map(field => (
                <div key={field.name} className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{field.label}</label>
                  {field.options ? (
                    <select name={field.name} value={formData[field.name]} onChange={handleChange} className="input-field w-full bg-premium-dark/50 appearance-none">
                      {field.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      name={field.name} type={field.type || 'text'} step={field.step}
                      value={formData[field.name]} onChange={handleChange} 
                      className="input-field w-full" placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 pt-6">
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5 shadow-blue-500/40">
                  {loading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div> : <><Gauge size={22}/> Calculate Now</>}
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Prediction Display Section */}
        <section className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="glass-card p-8 border-premium-accent/40 border bg-gradient-to-br from-blue-500/10 via-transparent to-transparent">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Value</h3>
                <div className="text-6xl font-black mb-1 flex items-baseline leading-none">
                  <span className="text-premium-accent text-3xl mr-1 font-bold">$</span>
                  {prediction.predicted_price.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-bold mb-8">
                  <CheckCircle size={14} /> AI VALIDATED • 97.6% PRECISION
                </div>
                
                <div className="bg-white/5 rounded-xl p-5 mb-8 border border-white/5">
                   <div className="flex items-start gap-3">
                      <Info className="text-premium-accent shrink-0 mt-1" size={18} />
                      <p className="text-sm leading-relaxed text-gray-200">
                        {prediction.explanation}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Buy Price</p>
                    <p className="text-xl font-bold">${(prediction.predicted_price * 1.05).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Sell Price</p>
                    <p className="text-xl font-bold">${(prediction.predicted_price * 0.95).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card h-[400px] flex flex-col items-center justify-center text-center p-12 opacity-50 border-dashed border-2 border-white/10">
                <TrendingUp size={48} className="text-gray-600 mb-6" />
                <h3 className="text-xl font-bold mb-2">Awaiting Parameters</h3>
                <p className="text-sm text-gray-500">Configure your vehicle specs to generate a high-precision market valuation.</p>
              </div>
            )}
          </AnimatePresence>

          {/* Marketing/Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card p-5 flex items-center gap-4 group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10">
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform"><Fuel size={24}/></div>
              <div>
                <h4 className="font-bold">Fuel Efficiency Impact</h4>
                <p className="text-xs text-gray-500">How {formData.brand}'s {formData.fuel_type} choice affects resale.</p>
              </div>
            </div>
            <div className="glass-card p-5 flex items-center gap-4 group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform"><User size={24}/></div>
              <div>
                <h4 className="font-bold">Owner History analysis</h4>
                <p className="text-xs text-gray-500">Impact of {formData.owner_count} owners on long-term value.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-8 right-8 z-40">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 100 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="absolute bottom-20 right-0 w-[400px] h-[500px] glass-card flex flex-col shadow-2xl border-premium-accent/30 border overflow-hidden"
            >
              <div className="p-4 bg-premium-accent flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-lg"><MessageCircle size={20} /></div>
                   <h3 className="font-bold">AI Support Agent</h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-black/10 rounded p-1"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-premium-dark/30 scrollbar-hide">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' ? 'bg-premium-accent text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                <input 
                  value={currentMessage} onChange={e => setCurrentMessage(e.target.value)}
                  placeholder="Ask anything about car values..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex-1 outline-none focus:border-premium-accent transition-all text-sm"
                />
                <button type="submit" className="bg-premium-accent p-2 rounded-xl hover:scale-105 active:scale-95 transition-all">
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-premium-accent p-5 rounded-full shadow-lg shadow-blue-500/40 hover:scale-110 active:scale-90 transition-all group"
        >
          <motion.div animate={{ rotate: isChatOpen ? 90 : 0 }}>
            {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
          </motion.div>
          {!isChatOpen && (
             <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-premium-card text-xs font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               Chat with AI Assistant
             </span>
          )}
        </button>
      </div>

      {showAuthModal && <AuthModal />}

      <footer className="mt-20 py-12 border-t border-white/5 text-center text-gray-500 max-w-7xl mx-auto">
        <p className="text-sm font-medium">© 2026 CarValue AI Engine • High-Precision Market Analytics</p>
        <div className="flex justify-center gap-6 mt-4 text-[10px] uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-premium-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-premium-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-premium-accent transition-colors">API Status</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
