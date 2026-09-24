import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ConfidenceBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const MatchesPage = () => {
  const { showToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      if (res.data.success) {
        setMatches(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRunScanner = async () => {
    try {
      setScanning(true);
      const res = await api.post('/matches/generate', {});
      if (res.data.success) {
        showToast(`Scan complete! ${res.data.count} matches updated.`, 'success');
        fetchMatches();
      }
    } catch (err) {
      showToast('Scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleDismiss = async (matchId) => {
    try {
      await api.put(`/matches/${matchId}/dismiss`);
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
      showToast('Match recommendation dismissed.', 'info');
      if (selectedMatch?._id === matchId) setSelectedMatch(null);
    } catch (err) {
      showToast('Failed to dismiss match.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Smart Matching Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              AI Correlation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmic correlation between your reported lost possessions and newly found items across campus
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleRunScanner}
          loading={scanning}
        >
          <RefreshCw className="w-4 h-4" />
          Run Matching Engine Scan
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Evaluating correlation factors..." />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No potential matches detected yet"
          description="Make sure you have reported your lost items with accurate category, location, and color details."
          actionLabel="Report a Lost Item"
          onAction={() => (window.location.href = '/lost-items/report')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-4">
            {matches.map((m) => {
              const lost = m.lostItemId || {};
              const found = m.foundItemId || {};
              const isSelected = selectedMatch?._id === m._id;

              return (
                <div
                  key={m._id}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-6 rounded-3xl border-2 transition cursor-pointer bg-white shadow-soft ${
                    isSelected
                      ? 'border-indigo-600 ring-4 ring-indigo-50'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {found.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                          Found {formatDate(found.foundDate)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {found.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Correlated with your lost item: <strong>"{lost.title}"</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black font-mono text-sm shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        {m.matchScore}% Match
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1 uppercase font-bold">
                        {m.confidenceTier} Confidence
                      </span>
                    </div>
                  </div>

                  {/* Factor Breakdown Summary Tags */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {m.matchingFactors?.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                          f.matched
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {f.factor}: {f.score}/{f.weight} pts
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(m._id);
                      }}
                      className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition"
                    >
                      Dismiss Match
                    </button>

                    <Link
                      to={`/found-items/${found._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="accent" size="sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify & Claim Item →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Analyzer Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6 sticky top-24">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Factor Analysis Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a match to examine why the algorithm generated correlation
                </p>
              </div>

              {selectedMatch ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                      Overall Match Score
                    </span>
                    <div className="text-3xl font-black text-indigo-950 font-mono mt-1">
                      {selectedMatch.matchScore} / 100
                    </div>
                    <p className="text-[11px] text-indigo-700 mt-1">
                      Weighted multi-factor score across 6 campus telemetry parameters.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Matching Parameter Details:
                    </h4>

                    {selectedMatch.matchingFactors?.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800">{f.factor}</strong>
                          <span
                            className={`font-mono font-bold ${
                              f.matched ? 'text-emerald-600' : 'text-slate-500'
                            }`}
                          >
                            {f.score} / {f.weight} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{f.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link to={`/found-items/${selectedMatch.foundItemId?._id}`}>
                      <Button variant="primary" size="md" className="w-full">
                        Inspect Found Item Page →
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Click on any match card on the left to inspect its detailed factor breakdown.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
