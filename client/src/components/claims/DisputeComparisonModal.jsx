import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, User, Trophy, Calendar, MapPin } from 'lucide-react';
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
      title="Multi-Claimant Dispute Resolution Workbench"
      subtitle={`Comparing ${claims.length} competing claims for item: "${item.title}"`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 py-2">
        {/* Dispute Summary Warning */}
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Conflicting Ownership Claims Detected</p>
            <p className="mt-0.5 text-red-800 leading-relaxed">
              Multiple students have claimed this found item. As an administrator, evaluate the side-by-side
              verification answers, specific identifiers, and match scores to determine the rightful owner.
            </p>
          </div>
        </div>

        {/* Private Item Truth Data for Admin */}
        {item.privateDetails && (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              Official Private Record Registered by Finder:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
              <div>
                <strong className="text-white block">Brand/Model:</strong>
                <span>{item.privateDetails.brand} {item.privateDetails.model || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-white block">Scratches/Marks:</strong>
                <span>{item.privateDetails.scratches || 'None registered'}</span>
              </div>
              <div>
                <strong className="text-white block">Unique Stickers/Cover:</strong>
                <span>{item.privateDetails.caseDetails || item.privateDetails.uniqueMarks || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-white block">Contents:</strong>
                <span>{item.privateDetails.specificContents || 'N/A'}</span>
              </div>
              <div>
                <strong className="text-white block">Serial/Identifier:</strong>
                <span>{item.privateDetails.serialNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Claim Cards */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Compare Competing Claimants:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((c, index) => {
              const isSelected = selectedWinnerId === c._id;
              const claimant = c.claimantId || {};

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedWinnerId(c._id)}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Claimant Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            claimant.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              claimant.name || 'Claimant'
                            )}&background=4f46e5&color=fff`
                          }
                          alt={claimant.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{claimant.name}</h5>
                          <p className="text-xs text-slate-500">{claimant.email}</p>
                          <span className="text-[10px] text-slate-400">ID: {claimant.studentId || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <ConfidenceBadge rating={c.confidenceRating} score={c.verificationScore} />
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Answers Provided */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Claimant's Answers:
                      </span>
                      {c.answers && c.answers.length > 0 ? (
                        c.answers.map((ans, aIdx) => (
                          <div
                            key={ans.questionId || aIdx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <p className="text-[11px] text-slate-500 font-medium">Q: {ans.question}</p>
                            <p className="text-slate-900 font-semibold mt-0.5">
                              A: "{ans.claimantAnswer || 'N/A'}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No structured answers provided.</p>
                      )}
                    </div>

                    {c.additionalEvidence && (
                      <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        <strong>Evidence:</strong> {c.additionalEvidence}
                      </p>
                    )}
                  </div>

                  {/* Winner Select Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWinnerId(c._id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
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
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Dispute Resolution Audit Justification Notes (Required)
          </label>
          <textarea
            rows={2}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="State why this claimant was chosen (e.g. Verified exact serial number and matching case sticker)..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button
            variant="accent"
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
