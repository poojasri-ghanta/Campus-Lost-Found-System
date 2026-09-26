import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const VerificationModal = ({
  isOpen,
  onClose,
  foundItem,
  onClaimSubmitted,
  userLostItems = []
}) => {
  const { showToast } = useToast();
  const [answers, setAnswers] = useState({});
  const [selectedLostItemId, setSelectedLostItemId] = useState('');
  const [additionalEvidence, setAdditionalEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!foundItem) return null;

  const questions = foundItem.verificationQuestions || [];

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one question answered
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      claimantAnswer: answers[q.id] || '',
      fieldKey: q.fieldKey,
      maxScore: q.weight || 20
    }));

    const answeredCount = formattedAnswers.filter((a) => a.claimantAnswer.trim().length > 0).length;
    if (answeredCount === 0) {
      showToast('Please answer at least one verification question to verify ownership.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/claims', {
        foundItemId: foundItem._id,
        lostItemId: selectedLostItemId || undefined,
        answers: formattedAnswers,
        additionalEvidence
      });

      if (res.data.success) {
        setResult(res.data.claim);
        showToast('Claim submitted! The finder has been notified to review your answers.', 'success');
        if (onClaimSubmitted) onClaimSubmitted(res.data.claim);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit claim. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setAnswers({});
    setResult(null);
    setAdditionalEvidence('');
    setSelectedLostItemId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={result ? 'Ownership Claim Evaluated' : 'Verified Ownership Claim'}
      subtitle={
        result
          ? 'Your answers have been analyzed by the verification engine'
          : `Item: "${foundItem.title}" • Found at ${foundItem.location}`
      }
      maxWidth="max-w-2xl"
    >
      {result ? (
        <div className="space-y-6 py-2">
          {/* Result Score Banner */}
          <div
            className={`p-6 rounded-3xl border text-center ${
              result.confidenceRating === 'STRONG_MATCH'
                ? 'bg-olive-50/90 border-olive-200 text-olive-950'
                : result.confidenceRating === 'NEEDS_REVIEW'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : 'bg-rust-50/90 border-rust-200 text-rust-950'
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-3 border border-biscuit-200">
              <span className="text-2xl font-black font-mono text-cocoa-900">
                {result.verificationScore}%
              </span>
            </div>
            <h4 className="text-lg font-bold font-heading">
              {result.confidenceRating === 'STRONG_MATCH'
                ? 'Strong Ownership Match Detected'
                : result.confidenceRating === 'NEEDS_REVIEW'
                ? 'Moderate Match – Manual Review Needed'
                : 'Low Confidence Verification'}
            </h4>
            <p className="mt-1 text-xs opacity-85 max-w-md mx-auto">
              Your claim reference has been routed to the reporting finder for review.
              Once approved, you will be invited to schedule a secure campus handover.
            </p>
          </div>

          {/* Factor Breakdown */}
          {result.scoreBreakdown && (
            <div className="bg-cream-100 p-4 sm:p-5 rounded-2xl border border-biscuit-200 space-y-2.5 text-xs">
              <span className="font-extrabold text-cocoa-700 block uppercase tracking-wider text-[10px]">
                Rule-Based Verification Factors:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-biscuit-200">
                  <span className="text-cocoa-400 block text-[10px] font-bold">Category Match</span>
                  <span className="font-bold text-cocoa-900 font-mono">
                    {result.scoreBreakdown.categoryScore} / 25 pts
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-biscuit-200">
                  <span className="text-cocoa-400 block text-[10px] font-bold">Location Proximity</span>
                  <span className="font-bold text-cocoa-900 font-mono">
                    {result.scoreBreakdown.locationScore} / 20 pts
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-biscuit-200">
                  <span className="text-cocoa-400 block text-[10px] font-bold">Date Proximity</span>
                  <span className="font-bold text-cocoa-900 font-mono">
                    {result.scoreBreakdown.dateScore} / 15 pts
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-biscuit-200">
                  <span className="text-cocoa-400 block text-[10px] font-bold">Color Match</span>
                  <span className="font-bold text-cocoa-900 font-mono">
                    {result.scoreBreakdown.colorScore} / 10 pts
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-biscuit-200">
                  <span className="text-cocoa-400 block text-[10px] font-bold">Brand / Model</span>
                  <span className="font-bold text-cocoa-900 font-mono">
                    {result.scoreBreakdown.brandScore} / 10 pts
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-terracotta-200 bg-terracotta-50/40">
                  <span className="text-terracotta-600 block text-[10px] font-bold">Private Identifier Keys</span>
                  <span className="font-bold text-terracotta-700 font-mono">
                    {result.scoreBreakdown.uniqueFeaturesScore} / 20 pts
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" onClick={resetAndClose}>
              Done / Return to Item
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-biscuit-300 text-xs text-cocoa-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Progressive Security Verification in Effect</p>
              <p className="mt-0.5 text-cocoa-600 leading-relaxed">
                To prevent fraudulent claims, the finder registered private identifying features
                (scratches, stickers, serials, wallpapers, or compartment contents). Answer the
                following questions accurately to prove ownership.
              </p>
            </div>
          </div>

          {/* Optional: Link an existing lost report */}
          {userLostItems.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-cocoa-800 mb-1.5">
                Link one of your existing Lost Item Reports (Optional)
              </label>
              <select
                value={selectedLostItemId}
                onChange={(e) => setSelectedLostItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-cream-100 border border-biscuit-200 rounded-2xl text-cocoa-900 focus:ring-2 focus:ring-terracotta-500 focus:outline-none"
              >
                <option value="">-- Select a lost item to link --</option>
                {userLostItems.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title} ({l.category} - {l.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Verification Questions List */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cocoa-400">
              Ownership Verification Questions
            </h4>

            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 sm:p-5 rounded-2xl bg-cream-100 border border-biscuit-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <label className="text-xs font-bold text-cocoa-900">
                    <span className="text-terracotta-600 mr-1 font-mono font-bold">Q{idx + 1}.</span> {q.question}
                  </label>
                  <span className="text-[10px] font-bold text-cocoa-500 bg-white px-2 py-0.5 rounded-lg border border-biscuit-200">
                    Max {q.weight || 20} pts
                  </span>
                </div>
                {q.hint && <p className="text-[11px] text-cocoa-500 italic">{q.hint}</p>}
                <textarea
                  rows={2}
                  required={idx === 0}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your precise answer here..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-biscuit-200 rounded-xl text-cocoa-900 focus:ring-2 focus:ring-terracotta-500 focus:outline-none placeholder-cocoa-400"
                />
              </div>
            ))}
          </div>

          {/* Additional Evidence or Proof */}
          <div>
            <label className="block text-xs font-bold text-cocoa-800 mb-1.5">
              Additional Evidence / Purchase Receipt Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={additionalEvidence}
              onChange={(e) => setAdditionalEvidence(e.target.value)}
              placeholder="e.g. Can provide original retail receipt, unlock device passcode in person, or describe secondary stickers..."
              className="w-full px-3.5 py-2.5 text-xs bg-cream-100 border border-biscuit-200 rounded-2xl text-cocoa-900 focus:ring-2 focus:ring-terracotta-500 focus:outline-none placeholder-cocoa-400"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-biscuit-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              <ShieldCheck className="w-4 h-4" />
              Submit Verification Claim
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

