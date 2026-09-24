import React, { useState, useEffect } from 'react';
import { AlertOctagon, Trophy, ShieldCheck, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { DisputeComparisonModal } from '../../components/claims/DisputeComparisonModal';
import { StatusBadge, ConfidenceBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/disputes');
      if (res.data.success) {
        setDisputes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Multi-Claimant Dispute Resolution
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold animate-pulse">
            Priority Review
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Items with multiple competing ownership claims requiring administrative adjudication
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Scanning disputed items queue..." />
      ) : disputes.length === 0 ? (
        <EmptyState
          title="No active disputed claims"
          description="All conflicting found item ownership claims have been successfully resolved."
          icon={ShieldCheck}
        />
      ) : (
        <div className="space-y-6">
          {disputes.map((d) => {
            const item = d.item || {};
            const claims = d.claims || [];

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-soft space-y-6"
              >
                {/* Dispute Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase">
                        {claims.length} Competing Claims
                      </span>
                      <StatusBadge status={item.status} type="item" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Location: {item.location} • Found Date: {formatDate(item.foundDate)}
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setSelectedDispute({ item, claims })}
                  >
                    <Trophy className="w-4 h-4" />
                    Open Side-by-Side Adjudication
                  </Button>
                </div>

                {/* Quick Claims Comparison Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claims.map((c, i) => (
                    <div
                      key={c._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-slate-900 block">{c.claimantId?.name}</strong>
                          <span className="text-[11px] text-slate-400">
                            ID: {c.claimantId?.studentId || 'N/A'} • {c.claimantId?.department}
                          </span>
                        </div>
                        <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Top Identifier Answer:
                        </span>
                        <p className="text-slate-700 font-medium line-clamp-2 mt-0.5">
                          "{c.answers?.[0]?.claimantAnswer || 'No specific answer'}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjudication Workbench Modal */}
      {selectedDispute && (
        <DisputeComparisonModal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          disputeData={selectedDispute}
          onResolved={() => {
            setSelectedDispute(null);
            fetchDisputes();
          }}
        />
      )}
    </div>
  );
};
