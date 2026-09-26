import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Sparkles,
  ClipboardList,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  FileText,
  Compass,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Item3DIcon } from '../components/common/Item3DIcon';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import api from '../services/api';

export const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [handovers, setHandovers] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes, matchRes, claimRes, handRes] = await Promise.all([
          api.get('/lost-items/my'),
          api.get('/found-items/my'),
          api.get('/matches'),
          api.get('/claims/my'),
          api.get('/handovers')
        ]);

        if (lostRes.data.success) setLostItems(lostRes.data.data);
        if (foundRes.data.success) setFoundItems(foundRes.data.data);
        if (matchRes.data.success) setMatches(matchRes.data.data);
        if (claimRes.data.success) setClaims(claimRes.data.data);
        if (handRes.data.success) setHandovers(handRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading campus recovery dashboard..." />;
  }

  const activeClaimsCount = claims.filter(
    (c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW' || c.status === 'APPROVED'
  ).length;

  const completedReturns = [
    ...lostItems.filter((i) => i.status === 'RETURNED' || i.status === 'CLOSED'),
    ...foundItems.filter((i) => i.status === 'RETURNED' || i.status === 'CLOSED')
  ].length;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-cocoa-950 text-cream-100 rounded-3xl p-6 sm:p-8 shadow-warm-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-charcoal-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-olive-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-terracotta-500/20 text-terracotta-300 text-xs font-bold uppercase tracking-wider border border-terracotta-500/30 font-display">
              {user?.role} Portal
            </span>
            <span className="text-xs text-cocoa-300 font-medium">Dept: {user?.department || 'General Campus'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-cream-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-cocoa-300 mt-1 max-w-xl leading-relaxed">
            Manage your reported possessions, review smart algorithmic matches, and verify ownership
            through secure protocols.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
          <Link to="/lost-items/report">
            <Button variant="primary" size="md" className="shadow-warm">
              <PlusCircle className="w-4 h-4" />
              Report Lost
            </Button>
          </Link>
          <Link to="/found-items/report">
            <Button variant="accent" size="md">
              <PlusCircle className="w-4 h-4" />
              Report Found
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin/dashboard">
              <Button variant="danger" size="md">
                <ShieldCheck className="w-4 h-4" />
                Admin Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <div className="flex items-center justify-between text-cocoa-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-display">Lost Reports</span>
            <Search className="w-4 h-4 text-terracotta-600" />
          </div>
          <div className="text-2xl font-black text-charcoal-900 font-mono font-display">{lostItems.length}</div>
          <Link to="/lost-items" className="text-[11px] text-terracotta-600 font-semibold hover:underline mt-1 block">
            View all reports →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <div className="flex items-center justify-between text-cocoa-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-display">Found Reports</span>
            <ClipboardList className="w-4 h-4 text-olive-700" />
          </div>
          <div className="text-2xl font-black text-charcoal-900 font-mono font-display">{foundItems.length}</div>
          <Link to="/found-items" className="text-[11px] text-olive-700 font-semibold hover:underline mt-1 block">
            View found items →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <div className="flex items-center justify-between text-cocoa-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-display">Smart Matches</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono font-display">{matches.length}</div>
          <Link to="/matches" className="text-[11px] text-amber-700 font-semibold hover:underline mt-1 block">
            Inspect matches →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <div className="flex items-center justify-between text-cocoa-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-display">Active Claims</span>
            <FileText className="w-4 h-4 text-cocoa-700" />
          </div>
          <div className="text-2xl font-black text-cocoa-800 font-mono font-display">{activeClaimsCount}</div>
          <Link to="/claims" className="text-[11px] text-cocoa-700 font-semibold hover:underline mt-1 block">
            Track claims →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm col-span-2 sm:col-span-1 card-hover-lift">
          <div className="flex items-center justify-between text-cocoa-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-display">Returned Items</span>
            <CheckCircle2 className="w-4 h-4 text-olive-600" />
          </div>
          <div className="text-2xl font-black text-olive-700 font-mono font-display">{completedReturns}</div>
          <span className="text-[11px] text-cocoa-500 block mt-1">Verified Returns</span>
        </div>
      </div>

      {/* Handover Alert Card (if scheduled) */}
      {handovers.some((h) => h.status === 'SCHEDULED') && (
        <div className="bg-gradient-to-r from-olive-950 via-charcoal-900 to-olive-900 text-cream-100 p-6 rounded-3xl border border-olive-600/40 shadow-warm-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-olive-400 animate-ping" />
              <h3 className="text-base font-bold font-display text-cream-100">Upcoming Handover Verification Scheduled</h3>
            </div>
            <Link to="/handovers">
              <Button variant="accent" size="sm">
                View PIN & Meetup Info →
              </Button>
            </Link>
          </div>
          <p className="text-xs text-cream-200/80">
            You have an active scheduled handover meeting. Ensure you bring your student ID and have your 6-digit PIN ready.
          </p>
        </div>
      )}

      {/* Two Column Layout: Potential Matches & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Top Potential Matches */}
        <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-charcoal-900 font-display">
                Potential Item Matches
              </h3>
            </div>
            <Link to="/matches" className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 font-display">
              View All ({matches.length}) →
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="py-8 text-center text-xs text-cocoa-400">
              No matching items detected yet. As new items are found, our algorithm will notify you.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 3).map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-2xl bg-cream-100/60 border border-biscuit-200/80 hover:border-terracotta-300 hover:bg-cream-100 transition-all flex items-center justify-between gap-4 card-hover-lift"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Item3DIcon category={m.foundItemId?.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-charcoal-900 truncate font-display">
                          {m.foundItemId?.title || 'Found Item'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black font-mono">
                          {m.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-cocoa-600 truncate">
                        Matched with lost: "{m.lostItemId?.title}"
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-cocoa-400 mt-1 font-medium">
                        <span>📍 {m.foundItemId?.location}</span>
                        <span>📅 {formatDate(m.foundItemId?.foundDate)}</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/matches/${m._id}`}>
                    <Button variant="secondary" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Ownership Claims */}
        <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-terracotta-600" />
              <h3 className="text-base font-bold text-charcoal-900 font-display">
                My Ownership Claims
              </h3>
            </div>
            <Link to="/claims" className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 font-display">
              View Claims ({claims.length}) →
            </Link>
          </div>

          {claims.length === 0 ? (
            <div className="py-8 text-center text-xs text-cocoa-400">
              You haven't submitted any ownership claims yet. Browse found items to request ownership.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.slice(0, 3).map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-cream-100/60 border border-biscuit-200/80 flex items-center justify-between gap-4 card-hover-lift"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Item3DIcon category={c.foundItemId?.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-charcoal-900 truncate font-display">
                          {c.foundItemId?.title || 'Found Item'}
                        </span>
                        <StatusBadge status={c.status} type="claim" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                        <span className="text-[10px] text-cocoa-400 font-medium">
                          {formatRelativeTime(c.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/claims/${c._id}`}>
                    <Button variant="ghost" size="sm">
                      Details →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
