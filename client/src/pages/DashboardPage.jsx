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
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-800/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              {user?.role} Portal
            </span>
            <span className="text-xs text-slate-400">Dept: {user?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Manage your reported possessions, review smart algorithmic matches, and verify ownership
            through secure protocols.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link to="/lost-items/report">
            <Button variant="primary" size="md">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lost Reports</span>
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{lostItems.length}</div>
          <Link to="/lost-items" className="text-[11px] text-indigo-600 font-semibold hover:underline mt-1 block">
            View all reports →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Found Reports</span>
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{foundItems.length}</div>
          <Link to="/found-items" className="text-[11px] text-emerald-600 font-semibold hover:underline mt-1 block">
            View found items →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Smart Matches</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{matches.length}</div>
          <Link to="/matches" className="text-[11px] text-amber-600 font-semibold hover:underline mt-1 block">
            Inspect matches →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Claims</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">{activeClaimsCount}</div>
          <Link to="/claims" className="text-[11px] text-purple-600 font-semibold hover:underline mt-1 block">
            Track claims →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Returned Items</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-600 font-mono">{completedReturns}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Verified Returns</span>
        </div>
      </div>

      {/* Handover Alert Card (if scheduled) */}
      {handovers.some((h) => h.status === 'SCHEDULED') && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-500/40 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base font-bold">Upcoming Handover Verification Scheduled</h3>
            </div>
            <Link to="/handovers">
              <Button variant="accent" size="sm">
                View PIN & Meetup Info →
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-300">
            You have an active scheduled handover meeting. Ensure you bring your student ID and have your 6-digit PIN ready.
          </p>
        </div>
      )}

      {/* Two Column Layout: Potential Matches & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Top Potential Matches */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Potential Item Matches
              </h3>
            </div>
            <Link to="/matches" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All ({matches.length}) →
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching items detected yet. As new items are found, our algorithm will notify you.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 3).map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-300 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {m.foundItemId?.title || 'Found Item'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black font-mono">
                        {m.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Matched with your lost: "{m.lostItemId?.title}"
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>📍 {m.foundItemId?.location}</span>
                      <span>📅 {formatDate(m.foundItemId?.foundDate)}</span>
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                My Ownership Claims
              </h3>
            </div>
            <Link to="/claims" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View Claims ({claims.length}) →
            </Link>
          </div>

          {claims.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You haven't submitted any ownership claims yet. Browse found items to request ownership.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.slice(0, 3).map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.foundItemId?.title || 'Found Item'}
                      </span>
                      <StatusBadge status={c.status} type="claim" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(c.createdAt)}
                      </span>
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
