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
  BarChart3
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Administrative Control Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Campus Security
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System governance, dispute resolution workbench, forensic audit trails, and recovery KPIs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/disputes">
            <Button variant="danger" size="sm">
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Users
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats?.totalUsers || 0}</div>
          <Link to="/admin/users" className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 block">
            Manage users →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Lost Reports
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">{stats?.totalLostItems || 0}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Active cases</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Found Items
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{stats?.totalFoundItems || 0}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Registered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Claims
          </span>
          <div className="text-2xl font-black text-purple-600 font-mono">{stats?.activeClaims || 0}</div>
          <span className="text-[11px] text-slate-400 block mt-1">Under verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Disputed Items
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono">{stats?.disputedItems || 0}</div>
          <Link to="/admin/disputes" className="text-[11px] text-rose-600 font-bold hover:underline mt-1 block">
            Resolve now →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Recovery Rate
          </span>
          <div className="text-2xl font-black text-teal-600 font-mono">{stats?.recoveryRate || 0}%</div>
          <span className="text-[11px] text-teal-600 font-semibold block mt-1">Success target</span>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/disputes"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-rose-300 transition flex items-start gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Dispute Workbench
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare conflicting claimant answers side-by-side and award rightful ownership.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-indigo-300 transition flex items-start gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              User Governance
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage accounts, student credentials, role permissions, and suspensions.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-emerald-300 transition flex items-start gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Forensic Audit Logs
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review timestamped audit trails of report submissions, claim decisions, and handovers.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-purple-300 transition flex items-start gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Campus Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect item loss hotspots, category distributions, and monthly recovery trends.
            </p>
          </div>
        </Link>
      </div>

      {/* Live System Activity Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Recent Administrative Activity Log
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View All Logs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((log) => (
            <div key={log._id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">{log.action}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-500">By {log.userEmail}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-400 font-mono">Type: {log.entityType}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-mono">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
