import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Clock, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Item3DIcon } from '../components/common/Item3DIcon';
import { formatDate } from '../utils/formatters';
import api from '../services/api';

export const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/claims/my');
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
          Ownership Claims & Verification
        </h1>
        <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
          Track the status of your submitted ownership verification questionnaires
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading your claims..." />
      ) : claims.length === 0 ? (
        <EmptyState
          title="No claims submitted yet"
          description="If you see your misplaced item in the Found Items registry, click 'Request Ownership' to start the verification quiz."
          actionLabel="Browse Found Items"
          onAction={() => (window.location.href = '/found-items')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => {
            const found = claim.foundItemId || {};
            const reporter = found.reportedBy || {};

            return (
              <div
                key={claim._id}
                className="bg-cream-50 rounded-3xl border border-biscuit-200/80 p-6 shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between space-y-4 card-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <StatusBadge status={claim.status} type="claim" />
                    <ConfidenceBadge
                      rating={claim.confidenceRating}
                      score={claim.verificationScore}
                    />
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Item3DIcon category={found.category} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-charcoal-900 line-clamp-1 font-display">
                        {found.title || 'Found Item'}
                      </h3>
                      <p className="text-xs text-cocoa-500 mt-0.5">
                        Found at {found.location} • {formatDate(found.foundDate)}
                      </p>
                    </div>
                  </div>

                  {/* Clarification alert if more info needed */}
                  {claim.status === 'MORE_INFORMATION_REQUIRED' && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold font-display text-amber-900">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        Action Required
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {claim.moreInfoRequestedQuestion || 'Finder requested additional details.'}
                      </p>
                    </div>
                  )}

                  {/* Approved alert */}
                  {claim.status === 'APPROVED' && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-olive-50 border border-olive-200/80 text-xs text-olive-950 space-y-1 shadow-warm-sm">
                      <div className="flex items-center gap-1.5 font-bold font-display text-olive-900">
                        <ShieldCheck className="w-4 h-4 text-olive-600" />
                        Ownership Verified!
                      </div>
                      <p className="text-[11px] text-olive-800">
                        Proceed to schedule your campus handover meetup.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-biscuit-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-cocoa-400">
                    Submitted {formatDate(claim.createdAt)}
                  </span>
                  <Link to={`/claims/${claim._id}`}>
                    <Button variant="secondary" size="sm">
                      View Claim Details →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
