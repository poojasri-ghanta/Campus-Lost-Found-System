import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  MapPin,
  Lock,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, ConfidenceBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { HandoverScheduleModal } from '../components/handovers/HandoverScheduleModal';
import { formatDate, formatDateTime } from '../utils/formatters';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreInfoResponse, setMoreInfoResponse] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/claims/${id}`);
      if (res.data.success) {
        setClaim(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load claim:', err);
      showToast('Claim not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleSendMoreInfo = async (e) => {
    e.preventDefault();
    if (!moreInfoResponse.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await api.post(`/claims/${id}/more-info`, {
        responseText: moreInfoResponse.trim()
      });
      if (res.data.success) {
        showToast('Clarification sent to finder.', 'success');
        setMoreInfoResponse('');
        fetchClaim();
      }
    } catch (err) {
      showToast('Failed to submit clarification.', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading claim verification record..." />;
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Claim record not found.</p>
        <Link to="/claims" className="text-xs text-indigo-600 font-bold mt-2 inline-block">
          ← Back to Claims
        </Link>
      </div>
    );
  }

  const foundItem = claim.foundItemId || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </button>

        {claim.status === 'APPROVED' && (
          <Button variant="accent" size="sm" onClick={() => setShowScheduleModal(true)}>
            Schedule Handover Meeting →
          </Button>
        )}
      </div>

      {/* Main Claim Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={claim.status} type="claim" />
              <ConfidenceBadge rating={claim.confidenceRating} score={claim.verificationScore} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              Claim for: {foundItem.title || 'Found Item'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Found at {foundItem.location} on {formatDate(foundItem.foundDate)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Submitted On</span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {formatDateTime(claim.createdAt)}
            </span>
          </div>
        </div>

        {/* Verification Status Alert */}
        {claim.status === 'APPROVED' && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Ownership Successfully Verified!</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The reporting finder verified your answers. You can now coordinate a meeting on campus
                  to receive your item with a 6-digit verification code.
                </p>
                {claim.reviewerComments && (
                  <p className="text-xs text-emerald-900 font-medium mt-2 bg-white/70 p-2 rounded-lg border border-emerald-200">
                    <strong>Finder Note:</strong> "{claim.reviewerComments}"
                  </p>
                )}
              </div>
            </div>
            <Button variant="accent" size="sm" onClick={() => setShowScheduleModal(true)}>
              Schedule Meetup
            </Button>
          </div>
        )}

        {/* More Information Requested Form */}
        {claim.status === 'MORE_INFORMATION_REQUIRED' && (
          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-3">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Additional Clarification Requested</h4>
                <p className="text-xs text-purple-800 mt-0.5">
                  The finder has asked for additional verification details before approving:
                </p>
                <div className="mt-2 p-3 bg-white rounded-xl border border-purple-200 text-xs font-semibold text-purple-900">
                  "{claim.moreInfoRequestedQuestion}"
                </div>
              </div>
            </div>

            <form onSubmit={handleSendMoreInfo} className="pt-2 space-y-2">
              <textarea
                rows={2}
                required
                placeholder="Type your clarification answer here..."
                value={moreInfoResponse}
                onChange={(e) => setMoreInfoResponse(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" loading={submittingReply}>
                  Submit Response
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Answers List */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Submitted Questionnaire Answers:
          </h3>

          <div className="space-y-3">
            {claim.answers?.map((ans, idx) => (
              <div
                key={ans.questionId || idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Q{idx + 1}: {ans.question}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {ans.matchQuality} ({ans.scoreAwarded}/{ans.maxScore} pts)
                  </span>
                </div>
                <p className="text-xs font-semibold text-indigo-950 bg-white p-2.5 rounded-xl border border-slate-200/60">
                  A: "{ans.claimantAnswer || 'No response provided'}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Log */}
        {claim.timeline && claim.timeline.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Claim Audit Timeline
            </h3>
            <div className="space-y-2">
              {claim.timeline.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{t.note || `Status: ${t.status}`}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(t.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Handover Modal */}
      {showScheduleModal && (
        <HandoverScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          claim={claim}
          onHandoverScheduled={() => {
            fetchClaim();
            navigate('/handovers');
          }}
        />
      )}
    </div>
  );
};
