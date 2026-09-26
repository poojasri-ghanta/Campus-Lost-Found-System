import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, User, Trophy, Calendar, MapPin, Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ConfidenceBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DisputeComparisonModal = ({
  isOpen,
  onClose,
  disputeData, // { item, claims }
  onResolved
}) => {
  const { showToast } = useToast();
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!disputeData) return null;
  const { item, claims = [] } = disputeData;

  const handleResolve = async () => {
    if (!selectedWinnerId) {
      showToast('Please select a verified legitimate owner before resolving the dispute.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/admin/disputes/${item._id}/resolve`, {
        winningClaimId: selectedWinnerId,
        resolutionNotes
      });

      if (res.data.success) {
        showToast('Dispute resolved successfully! Winning claim approved.', 'success');
        if (onResolved) onResolved(res.data.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resolve dispute.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Claimant Dispute Resolution"
      subtitle={`Comparing ${claims.length} competing claims for item: "${item.title}"`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 py-2">
        {/* Dispute Summary Warning */}
        <div className="p-4 rounded-2xl bg-rust-50 border border-rust-200/80 text-xs text-rust-950 flex items-start gap-3 shadow-warm-sm">
          <AlertOctagon className="w-5 h-5 text-rust-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rust-900 font-display">Conflicting Ownership Claims Detected</p>
            <p className="mt-0.5 text-rust-800/90 leading-relaxed">
              Multiple students have claimed this found item. As an administrator, evaluate the side-by-side
              verification answers, specific identifiers, and match confidence scores to determine the rightful owner.
            </p>
          </div>
        </div>

        {/* Private Item Truth Data for Admin */}
        {item.privateDetails && (
          <div className="p-5 rounded-2xl bg-charcoal-900 text-cream-100 space-y-3 text-xs border border-charcoal-800 shadow-warm">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-terracotta-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-300 font-display">
                Official Private Ground Truth (Registered by Finder)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-cream-300/80 bg-charcoal-800/60 p-3.5 rounded-xl border border-charcoal-700/50">
              <div>
                <strong className="text-cream-100 block font-medium">Brand/Model:</strong>
                <span>{item.privateDetails.brand} {item.privateDetails.model || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-cream-100 block font-medium">Scratches/Marks:</strong>
                <span>{item.privateDetails.scratches || 'None registered'}</span>
              </div>
              <div>
                <strong className="text-cream-100 block font-medium">Unique Stickers/Cover:</strong>
                <span>{item.privateDetails.caseDetails || item.privateDetails.uniqueMarks || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-cream-100 block font-medium">Contents:</strong>
                <span>{item.privateDetails.specificContents || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-cream-100 block font-medium">Serial/Identifier:</strong>
                <span className="font-mono text-terracotta-300">{item.privateDetails.serialNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Claim Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cocoa-500 font-display">
            Compare Competing Claimants ({claims.length}):
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((c) => {
              const isSelected = selectedWinnerId === c._id;
              const claimant = c.claimantId || {};

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedWinnerId(c._id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-terracotta-600 bg-terracotta-50/40 shadow-warm ring-2 ring-terracotta-600/20'
                      : 'border-biscuit-200/80 bg-cream-50/60 hover:border-terracotta-300 hover:bg-cream-100/50'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Claimant Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            claimant.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              claimant.name || 'Claimant'
                            )}&background=d96237&color=fff`
                          }
                          alt={claimant.name}
                          className="w-11 h-11 rounded-xl object-cover border border-biscuit-200 shadow-warm-sm"
                        />
                        <div>
                          <h5 className="text-sm font-bold text-charcoal-900 font-display">{claimant.name}</h5>
                          <p className="text-xs text-cocoa-600">{claimant.email}</p>
                          <span className="text-[10px] text-cocoa-400 font-medium">ID: {claimant.studentId || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                        <span className="text-[10px] text-cocoa-400 block mt-1">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Answers Provided */}
                    <div className="space-y-2 border-t border-biscuit-200/60 pt-3">
                      <span className="text-[11px] font-bold text-charcoal-800 block uppercase tracking-wider">
                        Claimant's Answers:
                      </span>
                      {c.answers && c.answers.length > 0 ? (
                        c.answers.map((ans, aIdx) => (
                          <div
                            key={ans.questionId || aIdx}
                            className="p-2.5 rounded-xl bg-biscuit-100/60 border border-biscuit-200/70 text-xs"
                          >
                            <p className="text-[11px] text-cocoa-600 font-medium">Q: {ans.question}</p>
                            <p className="text-charcoal-900 font-semibold mt-0.5">
                              A: "{ans.claimantAnswer || 'N/A'}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-cocoa-400 italic">No structured answers provided.</p>
                      )}
                    </div>

                    {c.additionalEvidence && (
                      <p className="text-xs text-cocoa-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                        <strong>Evidence:</strong> {c.additionalEvidence}
                      </p>
                    )}
                  </div>

                  {/* Winner Select Button */}
                  <div className="mt-4 pt-3 border-t border-biscuit-200/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWinnerId(c._id);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-terracotta-600 text-white shadow-warm'
                          : 'bg-biscuit-100 text-charcoal-700 hover:bg-biscuit-200'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      {isSelected ? 'Selected as Rightful Owner' : 'Select as Rightful Owner'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-xs font-bold text-charcoal-800 mb-1.5 font-display">
            Dispute Resolution Justification Notes (Required for Audit Trail)
          </label>
          <textarea
            rows={2}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="State why this claimant was chosen (e.g. Verified exact serial number and matching case sticker)..."
            className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-biscuit-200 rounded-xl focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 focus:outline-none transition text-charcoal-900 placeholder:text-cocoa-400"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-biscuit-200/70">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            disabled={!selectedWinnerId}
            onClick={handleResolve}
          >
            <CheckCircle2 className="w-4 h-4" />
            Resolve Dispute & Award Item
          </Button>
        </div>
      </div>
    </Modal>
  );
};
