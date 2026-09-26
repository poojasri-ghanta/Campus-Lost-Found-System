import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Calendar,
  Lock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { ConfidenceBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ClaimReviewDrawer = ({
  claim,
  foundItem,
  onClose,
  onStatusUpdated,
  onScheduleHandover
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(null); // 'APPROVE' | 'REJECT' | 'MORE_INFO'
  const [comments, setComments] = useState('');
  const [moreInfoQuestion, setMoreInfoQuestion] = useState('');

  if (!claim || !foundItem) return null;

  const privateDetails = foundItem.privateDetails || {};
  const claimant = claim.claimantId || {};

  const handleAction = async (newStatus) => {
    try {
      setLoading(true);
      const res = await api.put(`/claims/${claim._id}/review`, {
        status: newStatus,
        reviewerComments: comments,
        moreInfoQuestion: newStatus === 'MORE_INFORMATION_REQUIRED' ? moreInfoQuestion : undefined
      });

      if (res.data.success) {
        showToast(`Claim status updated to ${newStatus}.`, 'success');
        if (onStatusUpdated) onStatusUpdated(res.data.data);
        if (newStatus === 'APPROVED' && onScheduleHandover) {
          onScheduleHandover(res.data.data);
        }
        setReviewMode(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update claim review.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-cocoa-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-biscuit-300 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-biscuit-100 bg-cream-50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={claim.status} type="claim" />
                <ConfidenceBadge rating={claim.confidenceRating} score={claim.verificationScore} />
              </div>
              <h3 className="text-lg font-bold text-cocoa-950 font-heading">
                Claim Verification Review
              </h3>
              <p className="text-xs text-cocoa-500 mt-0.5">
                Submitted by {claimant.name} ({claimant.department}) on {formatDate(claim.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-cocoa-400 hover:bg-cream-200 text-cocoa-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Claimant Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-cream-100 border border-biscuit-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    claimant.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      claimant.name || 'User'
                    )}&background=CD5C38&color=fff`
                  }
                  alt={claimant.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-biscuit-300 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-cocoa-950">{claimant.name}</h4>
                  <p className="text-xs text-cocoa-600">{claimant.email}</p>
                  <p className="text-[11px] text-cocoa-400 mt-0.5">
                    ID: {claimant.studentId || 'N/A'} • Dept: {claimant.department}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-cocoa-400 block uppercase tracking-wider">Match Score</span>
                <span className="text-2xl font-black text-terracotta-600 font-mono">
                  {claim.verificationScore}%
                </span>
              </div>
            </div>

            {/* Verification Answers Side-by-Side Comparison */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-cocoa-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-terracotta-600" />
                  Verification Questionnaire Answers
                </h4>
                <span className="text-[10px] text-olive-700 font-bold">
                  Olive indicates strong automated similarity
                </span>
              </div>

              {claim.answers && claim.answers.length > 0 ? (
                claim.answers.map((ans, idx) => (
                  <div
                    key={ans.questionId || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-biscuit-200 bg-white space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-cocoa-900">
                        {idx + 1}. {ans.question}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          ans.matchQuality === 'EXACT'
                            ? 'bg-olive-100 text-olive-800'
                            : ans.matchQuality === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cream-200 text-cocoa-700'
                        }`}
                      >
                        {ans.matchQuality} ({ans.scoreAwarded || 0}/{ans.maxScore || 20} pts)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-terracotta-50/50 border border-terracotta-100 text-xs">
                      <span className="text-[10px] font-bold text-terracotta-700 uppercase block mb-0.5">
                        Claimant Answer:
                      </span>
                      <p className="text-cocoa-950 font-semibold">{ans.claimantAnswer || 'No response'}</p>
                    </div>

                    {/* Private truth reference if available to reviewer */}
                    {privateDetails[ans.fieldKey] && (
                      <div className="p-3 rounded-xl bg-olive-50/50 border border-olive-200 text-xs">
                        <span className="text-[10px] font-bold text-olive-800 uppercase block mb-0.5">
                          Registered Private Detail (Ground Truth):
                        </span>
                        <p className="text-olive-950 font-medium">{privateDetails[ans.fieldKey]}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-cocoa-400 italic">No structured answers available.</p>
              )}
            </div>

            {/* Additional Evidence */}
            {claim.additionalEvidence && (
              <div className="p-4 rounded-2xl bg-cream-100 border border-biscuit-200">
                <h5 className="text-xs font-bold text-cocoa-800 mb-1">Additional Evidence Provided:</h5>
                <p className="text-xs text-cocoa-600 leading-relaxed">{claim.additionalEvidence}</p>
              </div>
            )}

            {/* Clarification Response if any */}
            {claim.moreInfoResponse && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h5 className="text-xs font-bold text-amber-900 mb-1">
                  Claimant Clarification Response:
                </h5>
                <p className="text-xs text-amber-800">{claim.moreInfoResponse}</p>
              </div>
            )}

            {/* Action Selection Forms */}
            {reviewMode === 'APPROVE' && (
              <div className="p-5 rounded-2xl bg-olive-50 border border-olive-200 space-y-3">
                <h5 className="text-xs font-bold text-olive-950">
                  Approve Ownership & Proceed to Handover
                </h5>
                <p className="text-xs text-olive-800">
                  Approving this claim will verify {claimant.name} as the legitimate owner and allow
                  scheduling a physical handover with a 6-digit verification code.
                </p>
                <textarea
                  rows={2}
                  placeholder="Optional approval note to claimant..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-olive-300 rounded-xl text-cocoa-900 focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    loading={loading}
                    onClick={() => handleAction('APPROVED')}
                  >
                    Confirm Approval
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReviewMode(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {reviewMode === 'REJECT' && (
              <div className="p-5 rounded-2xl bg-rust-50 border border-rust-200 space-y-3">
                <h5 className="text-xs font-bold text-rust-950">Decline Ownership Claim</h5>
                <p className="text-xs text-rust-800">
                  Provide a clear and respectful reason to the claimant explaining why the answers did not match.
                </p>
                <textarea
                  rows={2}
                  required
                  placeholder="Reason for rejection (e.g. Device color/identifiers did not match item)..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-rust-300 rounded-xl text-cocoa-900 focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={loading}
                    onClick={() => handleAction('REJECTED')}
                  >
                    Decline Claim
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReviewMode(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {reviewMode === 'MORE_INFO' && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <h5 className="text-xs font-bold text-amber-950">Request More Verification Info</h5>
                <p className="text-xs text-amber-800">
                  Ask the claimant a specific follow-up question regarding the item's identifiers.
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. Please describe the stickers on the back cover or device passcode wallpaper..."
                  value={moreInfoQuestion}
                  onChange={(e) => setMoreInfoQuestion(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-xl text-cocoa-900 focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loading}
                    onClick={() => handleAction('MORE_INFORMATION_REQUIRED')}
                  >
                    Send Clarification Request
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReviewMode(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Actions Footer */}
          {!reviewMode && (
            <div className="p-4 sm:p-5 border-t border-biscuit-100 bg-cream-50 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReviewMode('MORE_INFO')}
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Ask More Info
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setReviewMode('REJECT')}
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setReviewMode('APPROVE')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Claim
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

