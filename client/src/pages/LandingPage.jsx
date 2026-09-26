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
  Repeat,
  Compass,
  KeyRound,
  EyeOff
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ItemCard } from '../components/items/ItemCard';
import { Item3DIcon } from '../components/common/Item3DIcon';
import { BrandLogo } from '../components/common/BrandLogo';
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
    matchRate: '94.8%',
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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal-950 via-cocoa-950 to-charcoal-900 text-cream-100 p-8 sm:p-12 lg:p-16 shadow-warm-lg border border-charcoal-800">
        {/* Ambient warm glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-terracotta-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-olive-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-biscuit-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-500/15 border border-terracotta-400/30 text-terracotta-300 text-xs font-bold tracking-wide shadow-warm-sm">
              <Sparkles className="w-4 h-4 text-terracotta-400" />
              <span>Campus Lost & Found Verification Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.12]">
              Lost something on campus? <br />
              <span className="bg-gradient-to-r from-biscuit-200 via-terracotta-300 to-amber-200 bg-clip-text text-transparent">
                Find. Verify. Return.
              </span>
            </h1>

            <p className="text-cream-200/80 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              A trusted university platform where identifying details stay confidential.
              Report lost possessions, discover smart multi-factor matches, and verify ownership through
              progressive screening and 6-digit cryptographic handover codes.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleHeroSearch} className="pt-2">
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-cream-400/70" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search electronics, ID cards, keys, backpacks..."
                    className="w-full pl-11 pr-4 py-3.5 bg-charcoal-900/80 border border-charcoal-700/80 rounded-2xl text-cream-100 placeholder:text-cream-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/40 focus:border-terracotta-400 backdrop-blur-md transition shadow-inner"
                  />
                </div>
                <Button variant="primary" size="lg" type="submit" className="shadow-glow">
                  Search Items
                </Button>
              </div>
            </form>

            {/* Quick Action Links */}
            <div className="pt-2 flex flex-wrap gap-3.5 items-center">
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
              <Link to="/found-items" className="text-xs font-semibold text-biscuit-300 hover:text-cream-100 flex items-center gap-1.5 ml-2 transition">
                Browse all found items <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3D Category Preview Card */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-3.5 p-6 rounded-3xl bg-charcoal-900/60 border border-charcoal-700/70 backdrop-blur-xl shadow-warm">
            <span className="text-xs font-bold text-terracotta-300 uppercase tracking-wider font-display flex items-center gap-2">
              <Compass className="w-4 h-4 text-terracotta-400" />
              Supported Categories
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { category: 'Electronics', label: 'Electronics & Phones' },
                { category: 'ID_Cards', label: 'Student IDs & Cards' },
                { category: 'Bags', label: 'Backpacks & Wallets' },
                { category: 'Keys', label: 'Keys & Fobs' },
              ].map((item) => (
                <div key={item.category} className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/60">
                  <Item3DIcon category={item.category} size="sm" />
                  <span className="text-xs font-medium text-cream-200">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-2xl bg-terracotta-900/30 border border-terracotta-700/40 text-[11px] text-cream-300 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-terracotta-400 shrink-0" />
              <span>Unique marks and serials are protected by progressive disclosure.</span>
            </div>
          </div>
        </div>

        {/* Demo Quick Logins Footer */}
        {!isAuthenticated && (
          <div className="mt-10 pt-6 border-t border-charcoal-800 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa-400 block mb-2.5 font-display">
              ⚡ Instant Demo Profiles (One-Click Login):
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => demoLogin('alex.rivers@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl text-cream-200 border border-charcoal-700 transition flex items-center gap-1.5"
              >
                <span>👤</span> Student (Alex Rivers)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('sam.chen@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl text-cream-200 border border-charcoal-700 transition flex items-center gap-1.5"
              >
                <span>🔍</span> Finder (Sam Chen)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('jessica.taylor@campus.edu')}
                className="px-3 py-1.5 text-xs font-semibold bg-charcoal-800/80 hover:bg-charcoal-700 rounded-xl text-cream-200 border border-charcoal-700 transition flex items-center gap-1.5"
              >
                <span>🎧</span> Claimant (Jessica Taylor)
              </button>
              <button
                type="button"
                onClick={() => demoLogin('admin@campus.edu')}
                className="px-3 py-1.5 text-xs font-bold bg-rust-900/40 hover:bg-rust-900/60 text-rust-200 border border-rust-700/50 rounded-xl transition flex items-center gap-1.5"
              >
                <span>🛡️</span> Admin (Dr. Marcus Vance)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Trust & Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm text-center card-hover-lift">
          <div className="text-3xl font-black text-terracotta-600 font-mono font-display">94.8%</div>
          <p className="text-xs text-cocoa-600 font-semibold mt-1">Verified Recovery Rate</p>
        </div>
        <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm text-center card-hover-lift">
          <div className="text-3xl font-black text-olive-700 font-mono font-display">18 hrs</div>
          <p className="text-xs text-cocoa-600 font-semibold mt-1">Avg Resolution Time</p>
        </div>
        <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm text-center card-hover-lift">
          <div className="text-3xl font-black text-charcoal-900 font-mono font-display">6-Digit</div>
          <p className="text-xs text-cocoa-600 font-semibold mt-1">Cryptographic PIN Handover</p>
        </div>
        <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm text-center card-hover-lift">
          <div className="text-3xl font-black text-cocoa-700 font-mono font-display">100%</div>
          <p className="text-xs text-cocoa-600 font-semibold mt-1">Private Info Concealed</p>
        </div>
      </section>

      {/* How it Works - Progressive Disclosure Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
            The Verified Ownership Workflow
          </h2>
          <p className="text-sm text-cocoa-600">
            Why CampusFind is different from open bulletin boards:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm space-y-3 card-hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-black text-lg font-display shadow-warm-sm">
              1
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <Lock className="w-4 h-4 text-terracotta-600" />
              Progressive Disclosure
            </h3>
            <p className="text-xs text-cocoa-600 leading-relaxed">
              When a finder reports an item, private identifiers (scratches, stickers, wallpaper, serial
              numbers) are kept strictly secret and never displayed in public listings.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm space-y-3 card-hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-olive-100 text-olive-800 flex items-center justify-center font-black text-lg font-display shadow-warm-sm">
              2
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-olive-600" />
              Verification Screening
            </h3>
            <p className="text-xs text-cocoa-600 leading-relaxed">
              Claimants must answer specific questions regarding the item's private marks. The system
              scores the answers against the record to establish confidence (80-100% Strong Match).
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-3xl border border-biscuit-200/80 shadow-warm space-y-3 card-hover-lift">
            <div className="w-12 h-12 rounded-2xl bg-biscuit-200 text-cocoa-800 flex items-center justify-center font-black text-lg font-display shadow-warm-sm">
              3
            </div>
            <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <Repeat className="w-4 h-4 text-cocoa-700" />
              PIN Handover & Closure
            </h3>
            <p className="text-xs text-cocoa-600 leading-relaxed">
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
            <h2 className="text-2xl font-bold text-charcoal-900 font-display">
              Recently Reported Found Items
            </h2>
            <p className="text-xs text-cocoa-600 mt-1">
              Public listings with concealed private details. Click to request ownership verification.
            </p>
          </div>
          <Link
            to="/found-items"
            className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1 font-display"
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
