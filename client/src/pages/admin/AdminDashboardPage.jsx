import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Search,
  ClipboardList,
  FileText,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Clock,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatters';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentActivity(res.data.recentActivity || []);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage label="Loading administrative intelligence..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
              Administrative Control Hub
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-rust-100 text-rust-800 text-xs font-bold uppercase tracking-wider border border-rust-200/80 font-display">
              Campus Security
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cocoa-600">
            System governance, dispute resolution workbench, forensic audit trails, and recovery KPIs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/disputes">
            <Button variant="danger" size="sm" className="shadow-warm-sm">
              <AlertOctagon className="w-4 h-4" />
              Disputes ({stats?.disputedItems || 0})
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="secondary" size="sm">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Total Users
          </span>
          <div className="text-2xl font-black text-charcoal-900 font-mono font-display">{stats?.totalUsers || 0}</div>
          <Link to="/admin/users" className="text-[11px] text-terracotta-600 font-bold hover:underline mt-1 block">
            Manage users →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Lost Reports
          </span>
          <div className="text-2xl font-black text-terracotta-600 font-mono font-display">{stats?.totalLostItems || 0}</div>
          <span className="text-[11px] text-cocoa-400 block mt-1">Active cases</span>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Found Items
          </span>
          <div className="text-2xl font-black text-olive-700 font-mono font-display">{stats?.totalFoundItems || 0}</div>
          <span className="text-[11px] text-cocoa-400 block mt-1">Registered</span>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Active Claims
          </span>
          <div className="text-2xl font-black text-amber-700 font-mono font-display">{stats?.activeClaims || 0}</div>
          <span className="text-[11px] text-cocoa-400 block mt-1">Under verification</span>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Disputed Items
          </span>
          <div className="text-2xl font-black text-rust-600 font-mono font-display">{stats?.disputedItems || 0}</div>
          <Link to="/admin/disputes" className="text-[11px] text-rust-600 font-bold hover:underline mt-1 block">
            Resolve now →
          </Link>
        </div>

        <div className="bg-cream-50 p-5 rounded-3xl border border-biscuit-200/80 shadow-warm card-hover-lift">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block mb-1 font-display">
            Recovery Rate
          </span>
          <div className="text-2xl font-black text-olive-700 font-mono font-display">{stats?.recoveryRate || 0}%</div>
          <span className="text-[11px] text-olive-700 font-semibold block mt-1">Success target</span>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/disputes"
          className="p-6 rounded-3xl bg-cream-50 border border-biscuit-200/80 shadow-warm hover:shadow-warm-lg hover:border-rust-300 transition-all flex items-start gap-4 group card-hover-lift"
        >
          <div className="w-12 h-12 rounded-2xl bg-rust-100 text-rust-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-warm-sm">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-rust-700 transition-colors font-display">
              Dispute Workbench
            </h3>
            <p className="text-xs text-cocoa-600 mt-1">
              Compare conflicting claimant answers side-by-side and award rightful ownership.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-cream-50 border border-biscuit-200/80 shadow-warm hover:shadow-warm-lg hover:border-terracotta-300 transition-all flex items-start gap-4 group card-hover-lift"
        >
          <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-warm-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-terracotta-700 transition-colors font-display">
              User Governance
            </h3>
            <p className="text-xs text-cocoa-600 mt-1">
              Manage accounts, student credentials, role permissions, and suspensions.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-6 rounded-3xl bg-cream-50 border border-biscuit-200/80 shadow-warm hover:shadow-warm-lg hover:border-olive-300 transition-all flex items-start gap-4 group card-hover-lift"
        >
          <div className="w-12 h-12 rounded-2xl bg-olive-100 text-olive-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-warm-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-olive-800 transition-colors font-display">
              Forensic Audit Logs
            </h3>
            <p className="text-xs text-cocoa-600 mt-1">
              Review timestamped audit trails of report submissions, claim decisions, and handovers.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="p-6 rounded-3xl bg-cream-50 border border-biscuit-200/80 shadow-warm hover:shadow-warm-lg hover:border-amber-300 transition-all flex items-start gap-4 group card-hover-lift"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-warm-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-amber-800 transition-colors font-display">
              Campus Analytics
            </h3>
            <p className="text-xs text-cocoa-600 mt-1">
              Inspect item loss hotspots, category distributions, and monthly recovery trends.
            </p>
          </div>
        </Link>
      </div>

      {/* Live System Activity Feed */}
      <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
          <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-terracotta-600" />
            Recent Administrative Activity Log
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 font-display">
            View All Logs →
          </Link>
        </div>

        <div className="divide-y divide-biscuit-200/60">
          {recentActivity.map((log) => (
            <div key={log._id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-charcoal-900 font-medium">{log.action}</span>
                <span className="text-biscuit-400 mx-2">•</span>
                <span className="text-cocoa-600">By {log.userEmail}</span>
                <span className="text-biscuit-400 mx-2">•</span>
                <span className="text-cocoa-500 font-mono text-[11px]">Type: {log.entityType}</span>
              </div>
              <span className="text-cocoa-400 text-[11px] font-mono">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
