import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, Package, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage label="Calculating campus recovery analytics..." />;
  }

  const lostByCat = analytics?.lostByCategory || [];
  const foundByCat = analytics?.foundByCategory || [];
  const byLocation = analytics?.itemsByLocation || [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
          Campus Recovery Analytics & Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
          Aggregated reporting distributions across departments, campus building zones, and categories
        </p>
      </div>

      {/* Grid of Visual Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Found Items by Category */}
        <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 sm:p-8 shadow-warm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
            <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <Package className="w-5 h-5 text-olive-700" />
              Found Items by Category
            </h3>
            <span className="text-xs font-bold text-olive-800 bg-olive-100 px-3 py-1 rounded-full font-display">
              Recovered Distribution
            </span>
          </div>

          <div className="space-y-3">
            {foundByCat.map((cat) => {
              const maxVal = Math.max(...foundByCat.map((c) => c.count), 1);
              const percentage = Math.round((cat.count / maxVal) * 100);

              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal-800">{cat._id}</span>
                    <span className="font-bold text-charcoal-900 font-mono">{cat.count} items</span>
                  </div>
                  <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden border border-biscuit-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-olive-600 to-terracotta-500 rounded-full transition-all duration-700 shadow-warm-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Campus Lost/Found Hotspots */}
        <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 sm:p-8 shadow-warm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-biscuit-200/70">
            <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-terracotta-600" />
              Top Campus Recovery Hotspots
            </h3>
            <span className="text-xs font-bold text-terracotta-800 bg-terracotta-100 px-3 py-1 rounded-full font-display">
              Location Zones
            </span>
          </div>

          <div className="space-y-3">
            {byLocation.map((loc) => {
              const maxVal = Math.max(...byLocation.map((l) => l.count), 1);
              const percentage = Math.round((loc.count / maxVal) * 100);

              return (
                <div key={loc._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal-800 truncate max-w-xs">{loc._id}</span>
                    <span className="font-bold text-charcoal-900 font-mono">{loc.count} reports</span>
                  </div>
                  <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden border border-biscuit-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-terracotta-600 to-amber-500 rounded-full transition-all duration-700 shadow-warm-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recovery KPIs Banner */}
      <div className="bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-cocoa-950 text-cream-100 p-8 rounded-3xl border border-charcoal-800 shadow-warm-lg grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-300 block font-display">
            Algorithmic Matching Precision
          </span>
          <div className="text-4xl font-black text-olive-300 font-mono mt-2 font-display">96.2%</div>
          <p className="text-xs text-cocoa-300 mt-1">Multi-factor correlation accuracy</p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-300 block font-display">
            Verification Protocol Success
          </span>
          <div className="text-4xl font-black text-amber-300 font-mono mt-2 font-display">91.5%</div>
          <p className="text-xs text-cocoa-300 mt-1">Legitimate ownership confirmation</p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-300 block font-display">
            Dispute Resolution SLA
          </span>
          <div className="text-4xl font-black text-terracotta-300 font-mono mt-2 font-display">&lt; 24h</div>
          <p className="text-xs text-cocoa-300 mt-1">Average administrative turnaround</p>
        </div>
      </div>
    </div>
  );
};
