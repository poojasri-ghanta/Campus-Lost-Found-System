import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
  Users,
  Repeat
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ItemCard } from '../components/items/ItemCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [recentFound, setRecentFound] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    activeItems: 24,
    recoveredItems: 142,
    matchRate: '94%',
    avgRecoveryHours: '18h'
  });

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await api.get('/found-items?limit=6');
        if (res.data.success) {
          setRecentFound(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recent found items:', err);
      }
    };
    loadRecent();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/found-items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/found-items');
    }
  };

  const demoLogin = async (email) => {
    const res = await login(email, 'Password123!');
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Verified Campus Recovery System
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
            Lost something on campus? <br />
            <span className="bg-gradient-to-r from-indigo-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Recover with verified proof.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            A secure university platform where identifying details stay confidential.
            Report lost possessions, discover multi-factor matches, and verify ownership through
            progressive questionnaire screening and 6-digit handover codes.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleHeroSearch} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search laptops, phones, backpacks, ID cards..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 backdrop-blur-md transition"
                />
              </div>
              <Button variant="accent" size="lg" type="submit">
                Search Items
              </Button>
            </div>
          </form>

          {/* Quick Action Links */}
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link to="/lost-items/report">
              <Button variant="primary" size="md">
                Report a Lost Item
              </Button>
            </Link>
            <Link to="/found-items/report">
              <Button variant="secondary" size="md">
                Report a Found Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Quick Logins Footer */}
        {!isAuthenticated && (
          <div className="mt-12 pt-6 border-t border-white/10 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Instant Demo Profiles (One-Click Login):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => demoLogin('alex.rivers@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 border border-white/10 transition"
              >
                👤 Student (Alex Rivers)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('sam.chen@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 border border-white/10 transition"
              >
                🔍 Finder (Sam Chen)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('jessica.taylor@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 border border-white/10 transition"
              >
                🎧 Claimant (Jessica Taylor)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('admin@campus.edu')}
                className="px-3 py-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition"
              >
                🛡️ Admin (Dr. Marcus Vance)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Trust & Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
          <div className="text-3xl font-black text-indigo-600 font-mono">94.8%</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Verified Recovery Rate</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
          <div className="text-3xl font-black text-emerald-600 font-mono">18 hrs</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Avg Resolution Time</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
          <div className="text-3xl font-black text-slate-900 font-mono">6-Digit</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Cryptographic Handover PIN</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft text-center">
          <div className="text-3xl font-black text-purple-600 font-mono">100%</div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Private Info Concealed</p>
        </div>
      </section>

      {/* How it Works - Progressive Disclosure Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            The Verified Ownership Workflow
          </h2>
          <p className="text-sm text-slate-500">
            Why Campus Recovery is different from generic bulletin boards:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              Progressive Disclosure
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When a finder reports an item, private identifiers (scratches, stickers, wallpaper, serial
              numbers) are kept strictly secret and never displayed in public listings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Verification Questionnaire
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Claimants must answer specific questions regarding the item's private marks. The system
              scores the answers against the record to establish confidence (80-100% Strong Match).
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-purple-600" />
              PIN Handover & Closure
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once approved, a unique 6-digit verification code is generated. After physical exchange at
              a designated campus spot, both parties confirm to close the case.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Found Items Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Recently Reported Found Items
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Public listings with concealed private details. Click to request ownership verification.
            </p>
          </div>
          <Link
            to="/found-items"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Browse All ({recentFound.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentFound.map((item) => (
            <ItemCard key={item._id} item={item} type="found" />
          ))}
        </div>
      </section>
    </div>
  );
};
