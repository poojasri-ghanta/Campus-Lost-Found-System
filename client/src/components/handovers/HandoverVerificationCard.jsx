import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const HandoverVerificationCard = ({
  handover,
  currentUser,
  onHandoverCompleted
}) => {
  const { showToast } = useToast();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!handover) return null;

  const isOwner = currentUser?._id === handover.ownerId?._id || currentUser?._id === handover.ownerId;
  const isFinder = currentUser?._id === handover.finderId?._id || currentUser?._id === handover.finderId;
  const isCompleted = handover.status === 'COMPLETED';

  const copyCode = () => {
    navigator.clipboard.writeText(handover.verificationCode);
    setCopied(true);
    showToast('Verification PIN copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!inputCode || inputCode.length < 6) {
      showToast('Please enter the 6-digit verification code.', 'warning');
      return;
    }

    try {
      setVerifying(true);
      const res = await api.put(`/handovers/${handover._id}/confirm`, {
        verificationCode: inputCode.trim()
      });

      if (res.data.success) {
        showToast('Verification PIN confirmed! Item successfully marked as RETURNED.', 'success');
        if (onHandoverCompleted) onHandoverCompleted(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code. Please double check.';
      showToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 shadow-warm overflow-hidden transition-all">
      {/* Header Banner */}
      <div className={`p-5 flex items-center justify-between ${
        isCompleted
          ? 'bg-olive-50 border-b border-olive-200/60'
          : 'bg-terracotta-50/60 border-b border-terracotta-200/60'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-display">
              Ref: {handover.handoverReference}
            </span>
            <StatusBadge status={handover.status} type="item" />
          </div>
          <h4 className="text-base font-bold text-charcoal-900 font-display mt-1">
            {isCompleted ? 'Item Handover Completed & Verified' : 'Scheduled Handover in Progress'}
          </h4>
        </div>

        {isCompleted && (
          <div className="w-10 h-10 rounded-2xl bg-olive-100 flex items-center justify-center text-olive-700 shadow-warm-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Verification Code Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-cocoa-900 text-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm border border-charcoal-700/50">
          <div>
            <span className="text-xs font-semibold text-terracotta-300 uppercase tracking-wider block font-display">
              6-Digit Handover Verification PIN
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-3xl font-black font-mono tracking-widest text-olive-300">
                {handover.verificationCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream-200 hover:text-white transition"
                title="Copy PIN"
              >
                {copied ? <Check className="w-4 h-4 text-olive-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-cocoa-300 mt-1">
              {isOwner
                ? 'Show this PIN to the finder when receiving your item in person.'
                : 'Enter this PIN after receiving confirmation from the owner.'}
            </p>
          </div>

          {!isCompleted && isFinder && (
            <form onSubmit={handleVerifyCode} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter PIN"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                className="w-32 px-3.5 py-2.5 text-center text-charcoal-900 font-mono font-bold text-sm bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-400 border border-biscuit-300"
              />
              <Button variant="accent" size="sm" type="submit" loading={verifying}>
                Verify & Complete
              </Button>
            </form>
          )}
        </div>

        {/* Schedule & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-cream-100/60 border border-biscuit-200/80">
            <span className="text-cocoa-500 font-medium flex items-center gap-1.5 mb-1 font-display">
              <MapPin className="w-3.5 h-3.5 text-terracotta-500" /> Meetup Location
            </span>
            <strong className="text-charcoal-900 text-sm font-semibold">{handover.location}</strong>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100/60 border border-biscuit-200/80">
            <span className="text-cocoa-500 font-medium flex items-center gap-1.5 mb-1 font-display">
              <Calendar className="w-3.5 h-3.5 text-terracotta-500" /> Scheduled Date
            </span>
            <strong className="text-charcoal-900 text-sm font-semibold">
              {formatDate(handover.scheduledDate)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-cream-100/60 border border-biscuit-200/80">
            <span className="text-cocoa-500 font-medium flex items-center gap-1.5 mb-1 font-display">
              <Clock className="w-3.5 h-3.5 text-terracotta-500" /> Scheduled Time
            </span>
            <strong className="text-charcoal-900 text-sm font-semibold">{handover.scheduledTime}</strong>
          </div>
        </div>

        {/* Two-Party Confirmation Badges */}
        <div className="p-4 rounded-2xl bg-biscuit-100/40 border border-biscuit-200/80">
          <span className="text-xs font-bold text-charcoal-800 block mb-2.5 font-display">
            Two-Party Confirmation Status:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream-50 border border-biscuit-200/70">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  handover.finderConfirmed || isCompleted
                    ? 'bg-olive-100 text-olive-700'
                    : 'bg-biscuit-200 text-cocoa-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-cocoa-700">
                Finder ({handover.finderId?.name || 'Finder'}):{' '}
                <strong className={handover.finderConfirmed || isCompleted ? 'text-olive-700' : 'text-cocoa-500'}>
                  {handover.finderConfirmed || isCompleted ? 'Confirmed' : 'Awaiting confirmation'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream-50 border border-biscuit-200/70">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  handover.ownerConfirmed || isCompleted
                    ? 'bg-olive-100 text-olive-700'
                    : 'bg-biscuit-200 text-cocoa-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-cocoa-700">
                Owner ({handover.ownerId?.name || 'Owner'}):{' '}
                <strong className={handover.ownerConfirmed || isCompleted ? 'text-olive-700' : 'text-cocoa-500'}>
                  {handover.ownerConfirmed || isCompleted ? 'Confirmed' : 'Awaiting confirmation'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {handover.notes && (
          <p className="text-xs text-cocoa-600 italic bg-cream-100/50 p-3 rounded-xl border border-biscuit-200/60">
            <strong>Notes:</strong> {handover.notes}
          </p>
        )}
      </div>
    </div>
  );
};
