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
  Lock,
  Layers,
  Check
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ConfidenceBadge } from '../components/common/Badge';
import { Item3DIcon } from '../components/common/Item3DIcon';
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
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
              Smart Matching Engine
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-300/80 font-display">
              Algorithmic Correlation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
            Correlation between your reported lost possessions and newly found items across campus
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleRunScanner}
          loading={scanning}
          className="shadow-warm"
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
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer bg-cream-50 shadow-warm card-hover-lift ${
                    isSelected
                      ? 'border-terracotta-600 ring-4 ring-terracotta-600/15 bg-cream-100/70'
                      : 'border-biscuit-200/80 hover:border-terracotta-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Item3DIcon category={found.category} size="md" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-cocoa-500 uppercase tracking-wider font-display">
                            {found.category}
                          </span>
                          <span className="text-biscuit-400">•</span>
                          <span className="text-xs text-cocoa-500">
                            Found {formatDate(found.foundDate)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-charcoal-900 font-display">
                          {found.title}
                        </h3>
                        <p className="text-xs text-cocoa-600 mt-1">
                          Correlated with your lost: <strong className="text-charcoal-800">"{lost.title}"</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-600 to-terracotta-600 text-white font-black font-mono text-sm shadow-warm-sm">
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        {m.matchScore}% Match
                      </div>
                      <span className="text-[10px] text-cocoa-500 block mt-1 uppercase font-bold tracking-wider">
                        {m.confidenceTier} Confidence
                      </span>
                    </div>
                  </div>

                  {/* Factor Breakdown Summary Tags */}
                  <div className="mt-4 pt-4 border-t border-biscuit-200/70 flex flex-wrap gap-2">
                    {m.matchingFactors?.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                          f.matched
                            ? 'bg-olive-50 text-olive-800 border-olive-200/80'
                            : 'bg-cream-100 text-cocoa-600 border-biscuit-200'
                        }`}
                      >
                        {f.matched && <Check className="w-3 h-3 text-olive-600" />}
                        {f.factor}: {f.score}/{f.weight} pts
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-biscuit-200/70 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(m._id);
                      }}
                      className="text-xs text-cocoa-400 hover:text-rust-600 font-semibold transition"
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
            <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm space-y-6 sticky top-24">
              <div className="pb-3 border-b border-biscuit-200/70">
                <h3 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-terracotta-600" />
                  Factor Analysis Breakdown
                </h3>
                <p className="text-xs text-cocoa-500 mt-0.5">
                  Select a match to examine why the algorithm generated correlation
                </p>
              </div>

              {selectedMatch ? (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-terracotta-50/70 border border-terracotta-200/80 shadow-warm-sm">
                    <span className="text-[10px] font-bold text-terracotta-700 uppercase tracking-wider block font-display">
                      Overall Match Score
                    </span>
                    <div className="text-3xl font-black text-terracotta-900 font-mono mt-1 font-display">
                      {selectedMatch.matchScore} / 100
                    </div>
                    <p className="text-[11px] text-cocoa-700 mt-1">
                      Weighted multi-factor score across campus telemetry parameters.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-charcoal-800 uppercase tracking-wider text-[10px] font-display">
                      Matching Parameter Details:
                    </h4>

                    {selectedMatch.matchingFactors?.map((f, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-cream-100/60 border border-biscuit-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-charcoal-900 font-medium">{f.factor}</strong>
                          <span
                            className={`font-mono font-bold ${
                              f.matched ? 'text-olive-700' : 'text-cocoa-500'
                            }`}
                          >
                            {f.score} / {f.weight} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-cocoa-600">{f.detail}</p>
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
                <div className="text-center py-8 text-xs text-cocoa-400">
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
